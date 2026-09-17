import { HeartIcon } from '@sanity/icons/Heart';
import { defineField, defineType } from 'sanity';

export const partenaire = defineType({
  name: 'partenaire',
  title: 'Partenaire',
  type: 'document',
  icon: HeartIcon,
  fields: [
    defineField({ name: 'nom', title: 'Nom', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      description: '240×120, fond transparent de préférence.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
    }),
    defineField({ name: 'url', title: 'Site web', type: 'url' }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', validation: (r) => r.integer() }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', media: 'logo' } },
});
