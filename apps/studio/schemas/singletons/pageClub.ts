import { InfoOutlineIcon } from '@sanity/icons/InfoOutline';
import { defineField, defineType } from 'sanity';
import { champSeo, champsEntete, groupesPage } from './_entete';

export const pageClub = defineType({
  name: 'pageClub',
  title: 'Page — Le club',
  type: 'document',
  icon: InfoOutlineIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'valeurs',
      title: 'Les valeurs du club',
      type: 'array',
      group: 'contenu',
      of: [{ type: 'etape' }],
      description: 'Numérotées automatiquement 01, 02, 03.',
    }),
    defineField({
      name: 'photos',
      title: 'Photos d’ambiance',
      type: 'array',
      group: 'contenu',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
        },
      ],
      description: 'Deux photos côte à côte, 900×700.',
      validation: (r) => r.max(2).warning('La maquette en affiche deux.'),
    }),
    defineField({
      name: 'titreBureau',
      title: 'Titre de la section bureau',
      type: 'string',
      group: 'contenu',
      initialValue: 'Le bureau',
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Le club' }) },
});
