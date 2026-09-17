import { defineField } from 'sanity';

/**
 * L'en-tête que partagent toutes les pages de la maquette : un surtitre en
 * capitales mono, un grand titre Anton, et parfois un chapô.
 */
export const champsEntete = (options?: { avecIntro?: boolean }) => [
  defineField({
    name: 'surtitre',
    title: 'Surtitre',
    type: 'string',
    description: 'La petite ligne en capitales au-dessus du titre. Par exemple « Le club ».',
    group: 'entete',
  }),
  defineField({
    name: 'titre',
    title: 'Titre',
    type: 'string',
    description: 'Le grand titre de la page. Affiché en capitales.',
    group: 'entete',
    validation: (r) => r.required(),
  }),
  ...(options?.avecIntro === false
    ? []
    : [
        defineField({
          name: 'intro',
          title: 'Chapô',
          type: 'text',
          rows: 3,
          description: 'Deux à trois phrases sous le titre.',
          group: 'entete',
        }),
      ]),
];

export const groupesPage = [
  { name: 'entete', title: 'En-tête', default: true },
  { name: 'contenu', title: 'Contenu' },
  { name: 'seo', title: 'Référencement' },
];

export const champSeo = defineField({
  name: 'seo',
  title: 'Référencement',
  type: 'seo',
  group: 'seo',
});
