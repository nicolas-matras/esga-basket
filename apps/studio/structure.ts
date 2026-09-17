import { AddUserIcon } from '@sanity/icons/AddUser';
import { BarChartIcon } from '@sanity/icons/BarChart';
import { BasketIcon } from '@sanity/icons/Basket';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { ChartUpwardIcon } from '@sanity/icons/ChartUpward';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { HeartIcon } from '@sanity/icons/Heart';
import { HomeIcon } from '@sanity/icons/Home';
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline';
import { StarIcon } from '@sanity/icons/Star';
import { UserIcon } from '@sanity/icons/User';
import { UsersIcon } from '@sanity/icons/Users';
import type { DocumentActionComponent, DocumentActionsContext } from 'sanity';
import type { StructureResolver } from 'sanity/structure';
import { TYPES_UNIQUES } from './schemas';

/** Un document unique : on ouvre directement la fiche, sans liste intermédiaire. */
const unique = (S: Parameters<StructureResolver>[0], type: string, titre: string) =>
  S.listItem()
    .title(titre)
    .id(type)
    .child(S.document().schemaType(type).documentId(type).title(titre));

/**
 * Le menu du Studio, rangé comme le club pense son site :
 * ce qui change chaque semaine en haut, les réglages en bas.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('ESGA Basket')
    .items([
      S.listItem()
        .title('La semaine')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('La semaine')
            .items([
              S.documentTypeListItem('match').title('Matchs').icon(CalendarIcon),
              S.documentTypeListItem('classement').title('Classements').icon(BarChartIcon),
              S.documentTypeListItem('actualite').title('Actualités').icon(DocumentTextIcon),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title('Le club')
        .icon(UsersIcon)
        .child(
          S.list()
            .title('Le club')
            .items([
              S.documentTypeListItem('equipe').title('Équipes').icon(UsersIcon),
              S.documentTypeListItem('categorie').title("Catégories d'âge").icon(UsersIcon),
              S.documentTypeListItem('competition').title('Compétitions').icon(ChartUpwardIcon),
              S.documentTypeListItem('membreBureau').title('Bureau').icon(UserIcon),
            ]),
        ),

      S.listItem()
        .title('Inscriptions & boutique')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Inscriptions & boutique')
            .items([
              S.documentTypeListItem('tarif').title('Tarifs').icon(AddUserIcon),
              S.documentTypeListItem('produit').title('Articles').icon(BasketIcon),
            ]),
        ),

      S.listItem()
        .title('Partenaires')
        .icon(HeartIcon)
        .child(
          S.list()
            .title('Partenaires')
            .items([
              S.documentTypeListItem('packPartenaire').title('Packs').icon(StarIcon),
              S.documentTypeListItem('partenaire').title('Ils nous soutiennent').icon(HeartIcon),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title('Textes des pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Textes des pages')
            .items([
              unique(S, 'pageAccueil', 'Accueil').icon(HomeIcon),
              unique(S, 'pageClub', 'Le club').icon(InfoOutlineIcon),
              unique(S, 'pageEquipes', 'Équipes').icon(UsersIcon),
              unique(S, 'pageResultats', 'Résultats').icon(BarChartIcon),
              unique(S, 'pageAgenda', 'Agenda').icon(CalendarIcon),
              unique(S, 'pageActus', 'Actualités').icon(DocumentTextIcon),
              unique(S, 'pageInscriptions', 'Inscriptions').icon(AddUserIcon),
              unique(S, 'pagePartenaires', 'Partenaires').icon(StarIcon),
              unique(S, 'pageBoutique', 'Boutique').icon(BasketIcon),
              unique(S, 'pageContact', 'Contact').icon(EnvelopeIcon),
            ]),
        ),

      S.divider(),

      unique(S, 'parametres', 'Réglages du club').icon(CogIcon),
    ]);

/**
 * Sur un document unique, dupliquer ou supprimer n'a pas de sens : il n'en
 * existe qu'un, et le site le cherche par un identifiant fixe.
 */
export const actionsDocument = (
  prev: DocumentActionComponent[],
  { schemaType }: DocumentActionsContext,
): DocumentActionComponent[] =>
  (TYPES_UNIQUES as readonly string[]).includes(schemaType)
    ? prev.filter((a) => !['duplicate', 'delete', 'unpublish'].includes(a.action ?? ''))
    : prev;
