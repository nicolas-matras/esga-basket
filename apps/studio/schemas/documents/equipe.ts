import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';

/** Une équipe engagée. Le club en annonce 15. */
export const equipe = defineType({
  name: 'equipe',
  title: 'Équipe',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom',
      type: 'string',
      description: 'Par exemple « SM1 », « U15M » ou « SF1 ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant d’URL',
      type: 'slug',
      options: { source: 'nom', maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categorie',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'categorie' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'championnat',
      title: 'Championnat',
      type: 'string',
      description: 'Par exemple « Pré-régionale » ou « DM3 poule B ».',
    }),
    defineField({
      name: 'coach',
      title: 'Coach',
      type: 'string',
      description: 'À confirmer auprès du club.',
    }),
    defineField({
      name: 'creneaux',
      title: 'Créneaux d’entraînement',
      type: 'array',
      of: [{ type: 'creneau' }],
    }),
    defineField({
      name: 'photo',
      title: 'Photo d’équipe',
      type: 'image',
      options: { hotspot: true },
      description: '600×340 minimum.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Description de l’image',
          type: 'string',
          description: 'Indispensable pour les lecteurs d’écran.',
        }),
      ],
    }),
    defineField({
      name: 'ordre',
      title: 'Ordre d’affichage',
      type: 'number',
      validation: (r) => r.integer(),
    }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: {
    select: { title: 'nom', subtitle: 'championnat', media: 'photo' },
  },
});
