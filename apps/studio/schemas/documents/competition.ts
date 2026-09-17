import { ChartUpwardIcon } from '@sanity/icons/ChartUpward';
import { defineField, defineType } from 'sanity';

/** Une compétition suivie : sert d'en-tête aux classements. */
export const competition = defineType({
  name: 'competition',
  title: 'Compétition',
  type: 'document',
  icon: ChartUpwardIcon,
  fields: [
    defineField({
      name: 'libelle',
      title: 'Libellé',
      type: 'string',
      description: 'Par exemple « PRM poule A2 » ou « DM3 poule B ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant d’URL',
      type: 'slug',
      options: { source: 'libelle', maxLength: 50 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'equipe',
      title: 'Équipe concernée',
      type: 'reference',
      to: [{ type: 'equipe' }],
    }),
    defineField({
      name: 'ordre',
      title: 'Ordre d’affichage',
      type: 'number',
      validation: (r) => r.integer(),
    }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'libelle', subtitle: 'equipe.nom' } },
});
