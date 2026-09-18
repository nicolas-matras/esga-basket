/** Formes de données partagées par les composants et les pages. */
import type { SourceImage } from './sanity';

export type Match = {
  _id: string;
  journee?: number;
  adversaire?: string;
  debut?: string;
  domicile?: boolean;
  lieu?: string;
  nature?: string;
  statut?: string;
  scoreEsga?: number | null;
  scoreAdverse?: number | null;
  afficheDeLaSemaine?: boolean;
  note?: string;
  logoAdversaire?: SourceImage;
  equipe?: { _id?: string; nom?: string; championnat?: string };
  competition?: { libelle?: string };
};

export type Actualite = {
  _id?: string;
  titre: string;
  slug?: string;
  date?: string;
  rubrique?: string;
  extrait?: string;
  aLaUne?: boolean;
  image?: SourceImage;
};

export type LigneClassement = {
  _key?: string;
  rang?: number;
  equipe?: string;
  estESGA?: boolean;
  points?: number;
  joues?: number;
  gagnes?: number;
  perdus?: number;
  pointsMarques?: number;
  pointsEncaisses?: number;
  difference?: number;
  horsClassement?: boolean;
  forme?: string;
};

export type Classement = {
  _id?: string;
  misAJourLe?: string;
  syncSource?: string;
  derniereSync?: string;
  ffbbPouleId?: string;
  ffbbCompetitionCode?: string;
  /** L'équipe du club qui joue dans cette poule. Un classement sans elle n'est pas affichable. */
  equipe?: {
    _id?: string;
    nom?: string;
    slug?: string;
    championnat?: string;
    poule?: string;
    genre?: string;
    position?: number;
    categorie?: { libelle?: string; ordre?: number };
  };
  lignes?: LigneClassement[];
};

export type Categorie = {
  _id: string;
  libelle?: string;
  slug?: string;
  ordre?: number;
  anneesNaissance?: string;
  regroupement?: string;
  accroche?: string;
  detail?: string;
};

export type Equipe = {
  _id: string;
  nom?: string;
  slug?: string;
  championnat?: string;
  poule?: string;
  genre?: string;
  position?: number;
  coach?: string;
  creneaux?: { _key?: string; jour?: string; debut?: string; fin?: string; lieu?: string }[];
  photo?: SourceImage;
  categorie?: Categorie;
};

export type EntetePage = {
  surtitre?: string;
  titre?: string;
  intro?: string;
  seo?: { titre?: string; description?: string; image?: SourceImage };
};
