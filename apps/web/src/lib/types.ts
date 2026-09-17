/** Formes de données partagées par les composants et les pages. */
import type { SourceImage } from './sanity';

export type Match = {
  _id: string;
  adversaire?: string;
  debut?: string;
  domicile?: boolean;
  lieu?: string;
  nature?: string;
  statut?: string;
  periode?: string;
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
  difference?: number;
};

export type Classement = {
  _id?: string;
  misAJourLe?: string;
  source?: string;
  competition?: { _id?: string; libelle?: string; slug?: string; equipe?: { nom?: string } };
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
