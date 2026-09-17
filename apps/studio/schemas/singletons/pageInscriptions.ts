import { AddUserIcon } from '@sanity/icons/AddUser';
import { defineField, defineType } from 'sanity';
import { champSeo, champsEntete, groupesPage } from './_entete';

export const pageInscriptions = defineType({
  name: 'pageInscriptions',
  title: 'Page — Inscriptions',
  type: 'document',
  icon: AddUserIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'etapes',
      title: 'Les étapes',
      type: 'array',
      group: 'contenu',
      of: [{ type: 'etape' }],
    }),
    defineField({
      name: 'titreTarifs',
      title: 'Titre de la grille tarifaire',
      type: 'string',
      group: 'contenu',
      initialValue: 'Tarifs par catégorie',
    }),
    defineField({
      name: 'mentionTarifs',
      title: 'Mention sous la grille',
      type: 'string',
      group: 'contenu',
      description: 'Par exemple les modalités de paiement.',
    }),
    defineField({
      name: 'faq',
      title: 'Questions fréquentes',
      type: 'array',
      group: 'contenu',
      of: [{ type: 'questionReponse' }],
    }),
    defineField({
      name: 'blocContact',
      title: 'Bloc « une question ? »',
      type: 'object',
      group: 'contenu',
      fields: [
        defineField({ name: 'titre', title: 'Titre', type: 'string' }),
        defineField({ name: 'texte', title: 'Texte', type: 'string' }),
        defineField({ name: 'libelleBouton', title: 'Libellé du bouton', type: 'string' }),
      ],
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Inscriptions' }) },
});
