/**
 * Orchestration de la synchronisation FFBB → Sanity.
 *
 * Trois principes, dans cet ordre de priorité :
 *
 *  1. NE JAMAIS DÉGRADER. Si la FFBB répond mal, répond vide, ou répond
 *     quelque chose d'aberrant, on n'écrit rien et on le signale. Un site qui
 *     affiche des données d'hier est infiniment préférable à un site qui
 *     affiche des données effacées.
 *  2. NE RIEN ÉCRASER D'ÉDITORIAL. Photos, coachs, créneaux, visibilité et
 *     scores saisis à la main appartiennent au club : la synchro ne les touche
 *     sous aucun prétexte.
 *  3. N'ÉCRIRE QUE SI ÇA CHANGE. Chaque document porte une empreinte de son
 *     contenu synchronisé ; à empreinte identique, on passe. Sinon l'historique
 *     Sanity se remplit de versions identiques et le site se reconstruit
 *     plusieurs fois par jour pour rien.
 */
import { ClientFfbb, ErreurFfbb, type PouleFfbb } from './client.ts';
import { ClientSanity, type Mutation } from './sanity.ts';
import {
  calculerForme,
  empreinte,
  versEquipe,
  versLignesClassement,
  versMatch,
  type MatchSanity,
} from './transformer.ts';

export type Options = {
  codeClub: string;
  simulation: boolean;
  journal: (message: string) => void;
};

export type Rapport = {
  statut: 'ok' | 'avertissement' | 'erreur';
  dureeMs: number;
  engagementsTraites: number;
  classementsMisAJour: number;
  rencontresMisesAJour: number;
  equipesMisesAJour: number;
  aChange: boolean;
  saison?: string;
  messages: string[];
  erreurs: string[];
};

/** Un classement qui disparaît alors qu'il existait est le signal d'alerte n°1. */
type EtatPrecedent = {
  classements: Map<string, number>; // ffbbPouleId → nombre de lignes
  empreintes: Map<string, string>; // _id → empreinte
  /** engagement FFBB → identifiant du document équipe, posé par la migration. */
  equipesParEngagement: Map<string, string>;
};

export async function synchroniser(
  ffbb: ClientFfbb,
  sanity: ClientSanity,
  options: Options,
): Promise<Rapport> {
  const debut = Date.now();
  const messages: string[] = [];
  const erreurs: string[] = [];
  const noter = (m: string) => {
    messages.push(m);
    options.journal(m);
  };

  const rapport: Rapport = {
    statut: 'ok',
    dureeMs: 0,
    engagementsTraites: 0,
    classementsMisAJour: 0,
    rencontresMisesAJour: 0,
    equipesMisesAJour: 0,
    aChange: false,
    messages,
    erreurs,
  };

  // --- 1. Ce que nous avons déjà, pour pouvoir détecter une régression -------
  const precedent = await lireEtatPrecedent(sanity);

  // --- 2. Découverte, en partant du seul code club --------------------------
  await ffbb.authentifier();

  const saison = await ffbb.saison();
  if (saison?.libelle) {
    rapport.saison = saison.libelle;
    noter(`Saison FFBB en cours : ${saison.libelle}.`);
  }

  const club = await ffbb.club(options.codeClub);
  noter(`Club ${club.code} → identifiant interne ${club.id} (${club.nom}).`);

  const engagements = await ffbb.engagements(club.id);

  // GARDE-FOU : zéro engagement est toujours une anomalie pour un club actif.
  if (engagements.length === 0) {
    throw new ErreurFfbb(
      "La FFBB ne renvoie aucun engagement pour le club. C'est anormal : on n'écrit rien.",
    );
  }
  noter(`${engagements.length} engagements découverts.`);
  rapport.engagementsTraites = engagements.length;

  const mutations: Mutation[] = [];
  const maintenant = new Date().toISOString();

  // --- 3. Un passage par engagement -----------------------------------------
  for (const engagement of engagements) {
    if (!engagement.idPoule) {
      noter(`  engagement ${engagement.id} sans poule — ignoré.`);
      continue;
    }

    let poule: PouleFfbb | null = null;
    try {
      poule = await ffbb.poule(engagement.idPoule);
    } catch (cause) {
      // Une poule qui échoue ne doit pas faire tomber les 27 autres.
      const message = `poule ${engagement.idPoule} illisible : ${(cause as Error).message}`;
      erreurs.push(message);
      noter(`  ⚠ ${message}`);
      continue;
    }

    const equipe = versEquipe(engagement, poule);
    const etiquette = `${equipe.ffbbCompetitionCode ?? '?'} ${equipe.poule ?? ''}`.trim();

    // --- 3a. Les rencontres de la poule, filtrées sur notre club ------------
    let nosMatchs: MatchSanity[] = [];
    try {
      const brutes = await ffbb.rencontres(engagement.idPoule);
      nosMatchs = brutes
        .map((r) => versMatch(r, club.id, { idPoule: engagement.idPoule as string }))
        .filter((m): m is MatchSanity => m !== null);
    } catch (cause) {
      const message = `rencontres de ${etiquette} illisibles : ${(cause as Error).message}`;
      erreurs.push(message);
      noter(`  ⚠ ${message}`);
    }

    // --- 3b. Le classement --------------------------------------------------
    const lignesBrutes = poule.classements ?? [];
    const idPoule = engagement.idPoule;
    const avaitUnClassement = precedent.classements.get(idPoule) ?? 0;

    if (lignesBrutes.length === 0) {
      // Attendu pour une coupe. Suspect pour un championnat qui en avait un.
      if (equipe.estCoupe) {
        noter(`  ${etiquette} : coupe, pas de classement (normal).`);
      } else if (avaitUnClassement > 0) {
        const message = `${etiquette} : classement vide alors qu'il en existait un de ${avaitUnClassement} lignes — conservé tel quel.`;
        erreurs.push(message);
        noter(`  ⚠ ${message}`);
      } else {
        noter(`  ${etiquette} : pas encore de classement.`);
      }
    } else {
      const lignes = versLignesClassement(lignesBrutes, club.id);
      const forme = calculerForme(nosMatchs);
      const avecForme = lignes.map((l) => (l.estESGA && forme ? { ...l, forme } : l));

      const idDoc = `classement.${idPoule}`;
      const marque = empreinte(avecForme);
      if (precedent.empreintes.get(idDoc) !== marque) {
        mutations.push({
          createOrReplace: {
            _id: idDoc,
            _type: 'classement',
            misAJourLe: maintenant.slice(0, 10),
            lignes: avecForme,
            syncSource: 'ffbb',
            ffbbPouleId: idPoule,
            ffbbCompetitionId: equipe.ffbbCompetitionId,
            ffbbCompetitionCode: equipe.ffbbCompetitionCode,
            derniereSync: maintenant,
            syncStatut: 'ok',
            syncEmpreinte: marque,
          },
        });
        rapport.classementsMisAJour += 1;
        noter(`  ${etiquette} : classement mis à jour (${avecForme.length} lignes).`);
      }
    }

    // --- 3c. Les rencontres -------------------------------------------------
    for (const match of nosMatchs) {
      const marque = empreinte(match);
      if (precedent.empreintes.get(match._id) === marque) continue;

      /*
        `patch` + `createIfNotExists`, jamais `createOrReplace` : une rencontre
        porte aussi des champs éditoriaux (note, affiche de la semaine, bandeau)
        et un score éventuellement saisi à la main avant que la FFBB ne le
        publie. Les remplacer effacerait le travail des dirigeants.
      */
      const { _id, _type, ...champs } = match;
      mutations.push({ createIfNotExists: { _id, _type, ...champs, dansLeBandeau: true } });
      mutations.push({
        patch: {
          id: _id,
          set: { ...champs, derniereSync: maintenant, syncStatut: 'ok', syncEmpreinte: marque },
        },
      });
      rapport.rencontresMisesAJour += 1;
    }

    // --- 3d. L'équipe --------------------------------------------------------
    /*
      On réutilise le document que la migration a rattaché à cet engagement.
      Sans cette résolution, la synchro créerait une seconde équipe à côté de
      celle saisie à la main : deux « SM1 » dans le Studio, et les photos,
      coachs et créneaux restés sur la mauvaise.
    */
    const idEquipe = precedent.equipesParEngagement.get(engagement.id) ?? `equipe.${engagement.id}`;
    const donneesEquipe = {
      championnat: equipe.championnat,
      poule: equipe.poule,
      genre: equipe.genre,
      niveau: equipe.niveau,
      position: equipe.position,
      ffbbEngagementId: equipe.ffbbEngagementId,
      ffbbPouleId: equipe.ffbbPouleId,
      ffbbCompetitionId: equipe.ffbbCompetitionId,
      ffbbCompetitionCode: equipe.ffbbCompetitionCode,
    };
    const marqueEquipe = empreinte(donneesEquipe);
    if (precedent.empreintes.get(idEquipe) !== marqueEquipe) {
      // À la création seulement : le nom et la visibilité appartiennent ensuite
      // au club, la synchro ne les réécrit plus jamais.
      mutations.push({
        createIfNotExists: {
          _id: idEquipe,
          _type: 'equipe',
          nom: equipe.nomPropose,
          slug: { _type: 'slug', current: idEquipe },
          visibleSurSite: true,
          ordre: 999,
        },
      });
      mutations.push({
        patch: {
          id: idEquipe,
          set: {
            ...donneesEquipe,
            syncSource: 'ffbb',
            derniereSync: maintenant,
            syncStatut: 'ok',
            syncEmpreinte: marqueEquipe,
          },
        },
      });
      rapport.equipesMisesAJour += 1;
    }
  }

  // --- 4. Écriture, en une transaction --------------------------------------
  rapport.aChange = mutations.length > 0;
  if (rapport.aChange) {
    noter(
      `${mutations.length} mutations à appliquer${options.simulation ? ' (simulation, rien n’est écrit)' : ''}.`,
    );
    await sanity.muter(mutations);
  } else {
    noter('Aucun changement : rien à écrire, pas de build.');
  }

  rapport.dureeMs = Date.now() - debut;
  rapport.statut = erreurs.length > 0 ? 'avertissement' : 'ok';
  return rapport;
}

async function lireEtatPrecedent(sanity: ClientSanity): Promise<EtatPrecedent> {
  const documents = await sanity.interroger<
    {
      _id: string;
      _type: string;
      syncEmpreinte?: string;
      ffbbPouleId?: string;
      ffbbEngagementId?: string;
      nbLignes?: number;
    }[]
  >(
    `*[defined(syncEmpreinte) || defined(ffbbEngagementId) || _type == "classement"]{
       _id, _type, syncEmpreinte, ffbbPouleId, ffbbEngagementId, "nbLignes": count(lignes)
     }`,
  );
  const classements = new Map<string, number>();
  const empreintes = new Map<string, string>();
  const equipesParEngagement = new Map<string, string>();
  for (const d of documents) {
    if (d.syncEmpreinte) empreintes.set(d._id, d.syncEmpreinte);
    if (d._type === 'classement' && d.ffbbPouleId && typeof d.nbLignes === 'number') {
      classements.set(d.ffbbPouleId, d.nbLignes);
    }
    if (d._type === 'equipe' && d.ffbbEngagementId) {
      equipesParEngagement.set(d.ffbbEngagementId, d._id);
    }
  }
  return { classements, empreintes, equipesParEngagement };
}
