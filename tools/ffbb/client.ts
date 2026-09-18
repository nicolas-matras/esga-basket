/**
 * Client HTTP de l'API FFBB.
 *
 * Deux particularités découvertes en exploration (voir docs/ffbb-api.md) :
 *
 *  1. Un appel sans en-tête `Referer` vers competitions.ffbb.com reçoit 403.
 *     `Origin` seul ne suffit pas, et un `User-Agent` vide est refusé aussi.
 *  2. Les jetons ne sont pas des secrets à stocker : ils sont publiés sur
 *     `/items/configuration` et tournent. On les relit à chaque exécution.
 *
 * Politique de gentillesse : une requête par seconde, un User-Agent qui dit
 * qui nous sommes et comment nous joindre, et un repli exponentiel sur 429/5xx.
 */

const API = 'https://api.ffbb.com';
const REFERER = 'https://competitions.ffbb.com/';

/** Le club se présente : si la FFBB veut nous joindre, elle sait où. */
const USER_AGENT =
  'ESGA-Basket-Sync/1.0 (site du club Eveil Sportif Genas Azieu; +https://esga-genas.netlify.app; president.esgabasket@gmail.com)';

const DELAI_ENTRE_REQUETES_MS = 1000;
const TENTATIVES_MAX = 4;

export class ErreurFfbb extends Error {
  statut?: number;

  constructor(message: string, statut?: number) {
    super(message);
    this.name = 'ErreurFfbb';
    this.statut = statut;
  }
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Journal = (message: string) => void;

export class ClientFfbb {
  private jeton: string | null = null;
  private derniereRequete = 0;
  private readonly journal: Journal;
  /** Nombre d'appels réseau émis — sert au reporting et aux tests. */
  appels = 0;

  constructor(journal: Journal = () => {}) {
    this.journal = journal;
  }

  /** Récupère le jeton Directus publié par la FFBB. À refaire à chaque exécution. */
  async authentifier(): Promise<void> {
    const reponse = await this.brut('/items/configuration');
    const jeton = (reponse as { data?: { key_dh?: string } }).data?.key_dh;
    if (!jeton) {
      throw new ErreurFfbb("L'endpoint de configuration n'a pas renvoyé de jeton Directus.");
    }
    this.jeton = jeton;
    this.journal(`Jeton FFBB obtenu (${jeton.slice(0, 6)}…).`);
  }

  /** Un appel, en respectant la cadence et en réessayant sur erreur transitoire. */
  private async brut(chemin: string, parametres: Record<string, string> = {}): Promise<unknown> {
    const url = new URL(API + chemin);
    for (const [cle, valeur] of Object.entries(parametres)) url.searchParams.set(cle, valeur);

    for (let tentative = 1; tentative <= TENTATIVES_MAX; tentative += 1) {
      // Cadence : jamais deux requêtes à moins d'une seconde d'intervalle.
      const attente = DELAI_ENTRE_REQUETES_MS - (Date.now() - this.derniereRequete);
      if (attente > 0) await dormir(attente);
      this.derniereRequete = Date.now();
      this.appels += 1;

      const entetes: Record<string, string> = {
        'User-Agent': USER_AGENT,
        Referer: REFERER,
        Accept: 'application/json',
      };
      if (this.jeton) entetes.Authorization = `Bearer ${this.jeton}`;

      let reponse: Response;
      try {
        reponse = await fetch(url, { headers: entetes });
      } catch (cause) {
        if (tentative === TENTATIVES_MAX) {
          throw new ErreurFfbb(`Réseau injoignable pour ${chemin} : ${(cause as Error).message}`);
        }
        await this.reculer(tentative, `réseau (${(cause as Error).message})`);
        continue;
      }

      // 429 et 5xx sont transitoires : on recule et on réessaie.
      if (reponse.status === 429 || reponse.status >= 500) {
        if (tentative === TENTATIVES_MAX) {
          throw new ErreurFfbb(`${chemin} répond ${reponse.status} après ${TENTATIVES_MAX} tentatives.`, reponse.status);
        }
        await this.reculer(tentative, `HTTP ${reponse.status}`, reponse.headers.get('retry-after'));
        continue;
      }

      if (!reponse.ok) {
        const corps = (await reponse.text()).slice(0, 200);
        throw new ErreurFfbb(`${chemin} répond ${reponse.status} : ${corps}`, reponse.status);
      }

      try {
        return await reponse.json();
      } catch {
        throw new ErreurFfbb(`${chemin} n'a pas renvoyé du JSON.`);
      }
    }
    throw new ErreurFfbb(`Échec inattendu sur ${chemin}.`);
  }

  private async reculer(tentative: number, motif: string, retryAfter?: string | null) {
    const indique = retryAfter ? Number(retryAfter) * 1000 : 0;
    const delai = Math.max(indique, 2 ** tentative * 500);
    this.journal(`  ${motif} — nouvelle tentative dans ${Math.round(delai / 1000)}s.`);
    await dormir(delai);
  }

  private async items<T>(chemin: string, parametres: Record<string, string> = {}): Promise<T> {
    const reponse = (await this.brut(chemin, parametres)) as { data?: T; errors?: unknown[] };
    if (reponse.errors) {
      throw new ErreurFfbb(`${chemin} : ${JSON.stringify(reponse.errors).slice(0, 200)}`);
    }
    if (reponse.data === undefined) throw new ErreurFfbb(`${chemin} : réponse sans champ « data ».`);
    return reponse.data;
  }

  /** Le club, par son code d'affiliation. C'est le seul identifiant stable. */
  async club(codeClub: string): Promise<OrganismeFfbb> {
    const resultats = await this.items<OrganismeFfbb[]>('/items/ffbbserver_organismes', {
      'filter[code][_eq]': codeClub,
      fields: 'id,code,nom,nom_simple',
      limit: '2',
    });
    if (resultats.length === 0) throw new ErreurFfbb(`Aucun club pour le code ${codeClub}.`);
    if (resultats.length > 1) throw new ErreurFfbb(`Plusieurs clubs pour le code ${codeClub}.`);
    return resultats[0];
  }

  /**
   * Tous les engagements du club pour la saison en cours.
   * Rien n'est codé en dur : les identifiants de poule changent chaque saison,
   * on les redécouvre depuis le club à chaque exécution.
   */
  async engagements(idClub: string): Promise<EngagementFfbb[]> {
    const club = await this.items<{ engagements?: EngagementFfbb[] }>(
      `/items/ffbbserver_organismes/${idClub}`,
      {
        fields:
          'engagements.id,engagements.idPoule,engagements.idCompetition,engagements.nomUsuel,engagements.nomOfficiel,engagements.numeroEquipe,engagements.position,engagements.niveau,engagements.codeAbrege',
      },
    );
    return club.engagements ?? [];
  }

  /** Une poule, avec sa compétition et son classement complet. */
  async poule(idPoule: string): Promise<PouleFfbb> {
    return this.items<PouleFfbb>(`/items/ffbbserver_poules/${idPoule}`, {
      fields:
        'id,nom,id_competition.id,id_competition.code,id_competition.nom,id_competition.sexe,id_competition.typeCompetition,id_competition.categorie,classements.*',
    });
  }

  /** Les rencontres d'une poule — toutes équipes confondues, à filtrer ensuite. */
  async rencontres(idPoule: string): Promise<RencontreFfbb[]> {
    return this.items<RencontreFfbb[]>('/items/ffbbserver_rencontres', {
      'filter[idPoule][_eq]': idPoule,
      limit: '200',
      sort: 'date',
    });
  }

  /** La saison active, pour détecter le changement de saison en juillet. */
  async saison(): Promise<SaisonFfbb | null> {
    const saisons = await this.items<SaisonFfbb[]>('/items/ffbbserver_saisons', {
      'filter[enCours][_eq]': 'true',
      limit: '1',
    });
    return saisons[0] ?? null;
  }
}

// --- Formes renvoyées par la FFBB -------------------------------------------
// Tout est chaîne côté FFBB, y compris les nombres : ne pas « corriger » ces
// types, c'est la réalité de l'API.

export type OrganismeFfbb = {
  id: string;
  code: string;
  nom: string;
  nom_simple?: string;
};

export type EngagementFfbb = {
  id: string;
  idPoule: string | null;
  idCompetition: string | null;
  nomUsuel?: string | null;
  nomOfficiel?: string | null;
  numeroEquipe?: string | null;
  position?: string | null;
  niveau?: string | null;
  codeAbrege?: string | null;
};

export type CompetitionFfbb = {
  id?: string;
  code?: string | null;
  nom?: string | null;
  sexe?: string | null;
  typeCompetition?: string | null;
  categorie?: string | null;
};

export type LigneClassementFfbb = {
  id?: string;
  organisme?: string | null;
  organisme_nom?: string | null;
  idEngagement?: string | null;
  position?: string | null;
  points?: string | null;
  matchJoues?: string | null;
  match_joues?: string | null;
  gagnes?: string | null;
  perdus?: string | null;
  nuls?: string | null;
  paniersMarques?: string | null;
  paniersEncaisses?: string | null;
  difference?: string | null;
  horsClassement?: boolean | null;
};

export type PouleFfbb = {
  id: string;
  nom?: string | null;
  id_competition?: CompetitionFfbb | null;
  classements?: LigneClassementFfbb[] | null;
};

export type RencontreFfbb = {
  id: string;
  numeroJournee?: string | null;
  date?: string | null;
  date_rencontre?: string | null;
  horaire?: string | null;
  idPoule?: string | null;
  idOrganismeEquipe1?: string | null;
  idOrganismeEquipe2?: string | null;
  nomEquipe1?: string | null;
  nomEquipe2?: string | null;
  resultatEquipe1?: string | number | null;
  resultatEquipe2?: string | number | null;
  salle?: string | null;
  forfaitEquipe1?: boolean | null;
  forfaitEquipe2?: boolean | null;
};

export type SaisonFfbb = {
  id: string;
  code?: string | null;
  libelle?: string | null;
  debut?: string | null;
  fin?: string | null;
};
