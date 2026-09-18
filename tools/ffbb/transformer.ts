/**
 * Transformation des données FFBB en documents Sanity.
 *
 * Ce module est volontairement PUR : aucune entrée/sortie, aucun appel réseau.
 * C'est ce qui le rend testable sans toucher à la FFBB ni à Sanity, et c'est
 * là que vivent les règles délicates (catégories, dates, empreintes).
 */
import { createHash } from 'node:crypto';
import type {
  EngagementFfbb,
  LigneClassementFfbb,
  PouleFfbb,
  RencontreFfbb,
} from './client.ts';

/** Les valeurs numériques de la FFBB sont des chaînes. Parfois nulles. */
export function nombre(valeur: unknown): number | undefined {
  if (valeur === null || valeur === undefined || valeur === '') return undefined;
  const n = Number(valeur);
  return Number.isFinite(n) ? n : undefined;
}

export type CategorieDeduite = {
  /** Clé de catégorie : u7 → u20, seniors. */
  categorie: string;
  /** M, F ou X. */
  genre: string;
  /** true pour une coupe ou un plateau : pas de classement attendu. */
  estCoupe: boolean;
};

/**
 * Déduit catégorie et genre du code de compétition.
 *
 * On ne se sert pas du champ `categorie` de la FFBB, qui est un code interne
 * opaque (« 1005 »). Le code de compétition, lui, est lisible et stable :
 *   PRM, DM3, DF2          → seniors
 *   DMU15-2, DFU9-2        → U15, U9
 *   CRMLU18M, CRMLSF       → coupes
 */
export function deduireCategorie(code: string | null | undefined): CategorieDeduite {
  const c = (code ?? '').toUpperCase().trim();
  const estCoupe = c.startsWith('CRML') || c.startsWith('CMRL'); // la FFBB écrit les deux

  // Coupes : « CRMLU18F », « CRMLSM ».
  if (estCoupe) {
    const reste = c.replace(/^C[RM]{2}L/, '');
    const jeunes = reste.match(/^U(\d{1,2})([MF])?$/);
    if (jeunes) {
      return { categorie: `u${jeunes[1]}`, genre: jeunes[2] ?? 'X', estCoupe: true };
    }
    const seniors = reste.match(/^S([MF])$/);
    return { categorie: 'seniors', genre: seniors?.[1] ?? 'X', estCoupe: true };
  }

  // Championnats jeunes : « DMU15-2 », « DFU9-2 », « DFU15 ».
  const jeunes = c.match(/^D([MF])U(\d{1,2})/);
  if (jeunes) return { categorie: `u${jeunes[2]}`, genre: jeunes[1], estCoupe: false };

  // Championnats seniors : « DM3 », « DF2 », « PRM », « PRF ».
  const seniors = c.match(/^(?:D|PR)([MF])/);
  if (seniors) return { categorie: 'seniors', genre: seniors[1], estCoupe: false };

  return { categorie: 'seniors', genre: 'X', estCoupe: false };
}

/** Libellé lisible d'un championnat : « PRM poule A2 ». */
export function libelleChampionnat(
  code: string | null | undefined,
  nomPoule: string | null | undefined,
): string {
  const parts = [code?.trim(), nomPoule?.trim()].filter(Boolean);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Empreinte du contenu synchronisé.
 *
 * Elle sert à ne patcher que si quelque chose a réellement changé. Sans elle,
 * chaque exécution réécrirait tous les documents : historique Sanity pollué et
 * build déclenché pour rien, plusieurs fois par jour.
 */
export function empreinte(valeur: unknown): string {
  return createHash('sha256').update(JSON.stringify(valeur)).digest('hex').slice(0, 16);
}

// --- Classement --------------------------------------------------------------

export type LigneSanity = {
  _key: string;
  _type: 'ligneClassement';
  rang?: number;
  equipe?: string;
  estESGA: boolean;
  points?: number;
  joues?: number;
  gagnes?: number;
  perdus?: number;
  nuls?: number;
  pointsMarques?: number;
  pointsEncaisses?: number;
  difference?: number;
  horsClassement?: boolean;
};

export function versLignesClassement(
  lignes: LigneClassementFfbb[],
  idClub: string,
): LigneSanity[] {
  return lignes
    .map((l, index) => ({
      _key: l.id ?? `l${index}`,
      _type: 'ligneClassement' as const,
      rang: nombre(l.position),
      equipe: l.organisme_nom ?? undefined,
      estESGA: String(l.organisme ?? '') === String(idClub),
      points: nombre(l.points),
      joues: nombre(l.matchJoues ?? l.match_joues),
      gagnes: nombre(l.gagnes),
      perdus: nombre(l.perdus),
      nuls: nombre(l.nuls),
      pointsMarques: nombre(l.paniersMarques),
      pointsEncaisses: nombre(l.paniersEncaisses),
      difference: nombre(l.difference),
      horsClassement: l.horsClassement ?? false,
    }))
    .sort((a, b) => (a.rang ?? 999) - (b.rang ?? 999));
}

// --- Rencontres --------------------------------------------------------------

export type MatchSanity = {
  _id: string;
  _type: 'match';
  journee?: number;
  adversaire: string;
  debut: string;
  domicile: boolean;
  lieu?: string;
  salle?: string;
  statut: 'a-venir' | 'termine';
  scoreEsga?: number;
  scoreAdverse?: number;
  ffbbPouleId?: string;
  /** Identifiant FFBB de l'adversaire, pour retrouver son logo. */
  idAdversaire?: string;
  logoAdversaireUrl?: string;
  syncSource: 'ffbb';
};

/**
 * Construit la date de début à partir des champs FFBB.
 *
 * `date_rencontre` est une heure LOCALE sans fuseau (« 2026-09-20T10:45:00 »).
 * L'interpréter comme de l'UTC décalerait tous les horaires d'une ou deux
 * heures — le piège classique, et invisible tant qu'on ne compare pas à la
 * feuille de match. On pose donc explicitement le décalage de Paris.
 */
export function dateDebut(r: RencontreFfbb): string | null {
  const brut = r.date_rencontre ?? (r.date ? `${r.date}T00:00:00` : null);
  if (!brut) return null;
  const m = brut.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return null;
  const [, annee, mois, jour, heures, minutes] = m;
  const decalage = decalageParis(Number(annee), Number(mois), Number(jour));
  return `${annee}-${mois}-${jour}T${heures}:${minutes}:00${decalage}`;
}

/** Heure d'été européenne : du dernier dimanche de mars au dernier d'octobre. */
export function decalageParis(annee: number, mois: number, jour: number): string {
  const dernierDimanche = (m: number) => {
    const d = new Date(Date.UTC(annee, m, 0)); // dernier jour du mois m
    return d.getUTCDate() - d.getUTCDay();
  };
  const debutEte = { mois: 3, jour: dernierDimanche(3) };
  const finEte = { mois: 10, jour: dernierDimanche(10) };
  const apres = (a: { mois: number; jour: number }) =>
    mois > a.mois || (mois === a.mois && jour >= a.jour);
  const avant = (a: { mois: number; jour: number }) =>
    mois < a.mois || (mois === a.mois && jour < a.jour);
  return apres(debutEte) && avant(finEte) ? '+02:00' : '+01:00';
}

export function versMatch(
  r: RencontreFfbb,
  idClub: string,
  contexte: { idPoule: string },
): MatchSanity | null {
  const domicile = String(r.idOrganismeEquipe1 ?? '') === String(idClub);
  const exterieur = String(r.idOrganismeEquipe2 ?? '') === String(idClub);
  // Une poule contient les rencontres de toutes ses équipes : on ne garde que les nôtres.
  if (!domicile && !exterieur) return null;

  const debut = dateDebut(r);
  if (!debut) return null;

  const scoreNous = nombre(domicile ? r.resultatEquipe1 : r.resultatEquipe2);
  const scoreEux = nombre(domicile ? r.resultatEquipe2 : r.resultatEquipe1);
  const joue = scoreNous !== undefined && scoreEux !== undefined;

  return {
    /*
      Tiret et non point : Sanity réserve le point comme séparateur de chemin
      (« drafts. »). Un identifiant « rencontre.123 » est accepté par l'API de
      mutation, qui répond 200, mais le document n'est jamais créé — panne
      silencieuse coûteuse à diagnostiquer.
    */
    _id: `rencontre-${r.id}`,
    _type: 'match',
    journee: nombre(r.numeroJournee),
    adversaire: (domicile ? r.nomEquipe2 : r.nomEquipe1) ?? 'Adversaire à confirmer',
    debut,
    domicile,
    lieu: domicile ? 'Gonzales' : 'Extérieur',
    salle: r.salle ?? undefined,
    statut: joue ? 'termine' : 'a-venir',
    ...(joue ? { scoreEsga: scoreNous, scoreAdverse: scoreEux } : {}),
    ffbbPouleId: contexte.idPoule,
    idAdversaire: String((domicile ? r.idOrganismeEquipe2 : r.idOrganismeEquipe1) ?? '') || undefined,
    syncSource: 'ffbb',
  };
}

/**
 * Forme récente d'une équipe : « VDVVN », du plus ancien au plus récent.
 * La FFBB ne l'expose pas, on la calcule depuis les rencontres jouées.
 */
export function calculerForme(matchs: MatchSanity[], nombreMax = 5): string {
  return matchs
    .filter((m) => m.statut === 'termine' && m.scoreEsga !== undefined)
    .sort((a, b) => a.debut.localeCompare(b.debut))
    .slice(-nombreMax)
    .map((m) => {
      const nous = m.scoreEsga as number;
      const eux = m.scoreAdverse as number;
      return nous > eux ? 'V' : nous < eux ? 'D' : 'N';
    })
    .join('');
}

// --- Équipe ------------------------------------------------------------------

export type EquipeSynchro = {
  ffbbEngagementId: string;
  ffbbPouleId?: string;
  ffbbCompetitionId?: string;
  ffbbCompetitionCode?: string;
  championnat?: string;
  poule?: string;
  genre: string;
  niveau?: string;
  position?: number;
  categorieCle: string;
  estCoupe: boolean;
  nomPropose: string;
};

export function versEquipe(engagement: EngagementFfbb, poule: PouleFfbb | null): EquipeSynchro {
  const competition = poule?.id_competition ?? null;
  const code = competition?.code ?? engagement.codeAbrege ?? null;
  const { categorie, genre, estCoupe } = deduireCategorie(code);

  return {
    ffbbEngagementId: engagement.id,
    ffbbPouleId: engagement.idPoule ?? undefined,
    ffbbCompetitionId: engagement.idCompetition ?? undefined,
    ffbbCompetitionCode: code ?? undefined,
    championnat: libelleChampionnat(code, poule?.nom),
    poule: poule?.nom ?? undefined,
    genre,
    niveau: engagement.niveau ?? undefined,
    position: nombre(engagement.position),
    categorieCle: categorie,
    estCoupe,
    nomPropose:
      engagement.nomUsuel?.trim() ||
      engagement.nomOfficiel?.trim() ||
      `${code ?? 'Équipe'} ${engagement.numeroEquipe ?? ''}`.trim(),
  };
}

// --- Rapprochement avec les équipes déjà saisies ------------------------------

/**
 * Normalise un libellé de championnat pour le comparer.
 * « DMU18-6 poule préligue F » et « DMU18-6 Poule Préligue F » doivent se
 * rapprocher : on ignore la casse, les accents et les espaces multiples.
 */
export function normaliser(valeur: string | null | undefined): string {
  return (valeur ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export type EquipeExistante = {
  _id: string;
  nom?: string;
  championnat?: string;
  ffbbEngagementId?: string;
};

export type Rapprochement = {
  engagementId: string;
  code?: string;
  championnat: string;
  /** L'équipe déjà saisie à laquelle rattacher l'engagement, si trouvée. */
  equipeId?: string;
  equipeNom?: string;
  motif: 'engagement' | 'championnat' | 'code' | 'aucun';
};

/**
 * Rapproche un engagement FFBB d'une équipe déjà saisie à la main.
 *
 * Trois passes, de la plus sûre à la plus permissive :
 *  1. l'identifiant d'engagement est déjà posé — rien à faire ;
 *  2. le libellé de championnat complet correspond (« PRM poule A2 ») ;
 *  3. à défaut, le seul code de compétition (« DMU15-2 »), qui est unique
 *     par engagement au sein d'un club.
 *
 * Aucune correspondance approximative sur les noms d'équipe : « U13F 1 » et
 * « U13F 2 » se ressemblent trop pour qu'une distance de chaînes tranche sans
 * risque, et se tromper d'équipe mélangerait deux calendriers.
 */
export function rapprocher(
  engagement: { id: string; championnat: string; code?: string },
  equipes: EquipeExistante[],
): Rapprochement {
  const base = {
    engagementId: engagement.id,
    code: engagement.code,
    championnat: engagement.championnat,
  };

  const parEngagement = equipes.find((e) => e.ffbbEngagementId === engagement.id);
  if (parEngagement) {
    return { ...base, equipeId: parEngagement._id, equipeNom: parEngagement.nom, motif: 'engagement' };
  }

  const cible = normaliser(engagement.championnat);
  if (cible) {
    const parChampionnat = equipes.filter(
      (e) => !e.ffbbEngagementId && normaliser(e.championnat) === cible,
    );
    if (parChampionnat.length === 1) {
      return { ...base, equipeId: parChampionnat[0]._id, equipeNom: parChampionnat[0].nom, motif: 'championnat' };
    }
  }

  /*
    Comparaison par préfixe et non par premier mot : la normalisation coupe
    « DMU15-2 » en « dmu15 2 », donc découper sur l'espace perdrait le numéro
    de division et confondrait DMU11 avec DMU11-3.
    L'unicité exigée juste après protège des préfixes ambigus.
  */
  const code = normaliser(engagement.code);
  if (code) {
    const parCode = equipes.filter((e) => {
      if (e.ffbbEngagementId) return false;
      const n = normaliser(e.championnat);
      return n === code || n.startsWith(`${code} `);
    });
    if (parCode.length === 1) {
      return { ...base, equipeId: parCode[0]._id, equipeNom: parCode[0].nom, motif: 'code' };
    }
  }

  return { ...base, motif: 'aucun' };
}
