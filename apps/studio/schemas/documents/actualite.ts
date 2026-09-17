import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineField, defineType } from 'sanity';

export const actualite = defineType({
  name: 'actualite',
  title: 'Actualité',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({ name: 'titre', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Identifiant d’URL',
      type: 'slug',
      options: { source: 'titre', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'rubrique',
      title: 'Rubrique',
      type: 'string',
      description: 'Par exemple « École de basket », « Seniors », « Tournoi », « Club ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description: '1200×800 pour une une, 600×360 dans la liste.',
      fields: [
        defineField({ name: 'alt', title: 'Description de l’image', type: 'string' }),
      ],
    }),
    defineField({
      name: 'extrait',
      title: 'Extrait',
      type: 'text',
      rows: 3,
      description: 'Deux phrases maximum, affichées dans la liste et sur l’accueil.',
      validation: (r) => r.max(220).warning('Au-delà de 220 caractères, l’extrait déborde de la carte.'),
    }),
    defineField({
      name: 'corps',
      title: 'Article',
      type: 'array',
      of: [
        { type: 'block', styles: [{ title: 'Normal', value: 'normal' }, { title: 'Intertitre', value: 'h2' }] },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({
      name: 'aLaUne',
      title: 'À la une',
      type: 'boolean',
      initialValue: false,
      description: 'Affiche l’article en grand en haut de la page Actualités.',
    }),
    defineField({ name: 'seo', title: 'Référencement', type: 'seo' }),
  ],
  orderings: [{ name: 'recent', title: 'Plus récent', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'titre', date: 'date', rubrique: 'rubrique', media: 'image' },
    prepare: ({ title, date, rubrique, media }) => ({
      title,
      subtitle: [date?.split('-').reverse().join('/'), rubrique].filter(Boolean).join(' · '),
      media,
    }),
  },
});
