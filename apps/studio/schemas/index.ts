import type { SchemaTypeDefinition } from 'sanity';

// Objets réutilisables
import { creneau } from './objets/creneau';
import { etape } from './objets/etape';
import { lienReseau } from './objets/lienReseau';
import { ligneClassement } from './objets/ligneClassement';
import { questionReponse } from './objets/questionReponse';
import { seo } from './objets/seo';

// Documents
import { actualite } from './documents/actualite';
import { categorie } from './documents/categorie';
import { classement } from './documents/classement';
import { competition } from './documents/competition';
import { equipe } from './documents/equipe';
import { match } from './documents/match';
import { membreBureau } from './documents/membreBureau';
import { packPartenaire } from './documents/packPartenaire';
import { partenaire } from './documents/partenaire';
import { produit } from './documents/produit';
import { tarif } from './documents/tarif';

// Pages (documents uniques)
import { pageAccueil } from './singletons/pageAccueil';
import { pageClub } from './singletons/pageClub';
import { pageInscriptions } from './singletons/pageInscriptions';
import {
  pageActus,
  pageAgenda,
  pageBoutique,
  pageContact,
  pageEquipes,
  pagePartenaires,
  pageResultats,
} from './singletons/pagesSimples';
import { parametres } from './singletons/parametres';

/** Les types dont il n'existe qu'un seul document : pas de bouton « créer ». */
export const TYPES_UNIQUES = [
  'parametres',
  'pageAccueil',
  'pageClub',
  'pageEquipes',
  'pageResultats',
  'pageAgenda',
  'pageActus',
  'pageInscriptions',
  'pagePartenaires',
  'pageBoutique',
  'pageContact',
] as const;

export const schemaTypes: SchemaTypeDefinition[] = [
  // objets
  seo,
  lienReseau,
  creneau,
  ligneClassement,
  etape,
  questionReponse,
  // documents
  categorie,
  equipe,
  competition,
  classement,
  match,
  actualite,
  membreBureau,
  produit,
  packPartenaire,
  partenaire,
  tarif,
  // pages
  parametres,
  pageAccueil,
  pageClub,
  pageEquipes,
  pageResultats,
  pageAgenda,
  pageActus,
  pageInscriptions,
  pagePartenaires,
  pageBoutique,
  pageContact,
];
