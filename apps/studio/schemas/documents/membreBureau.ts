import { UserIcon } from '@sanity/icons/User';
import { defineField, defineType } from 'sanity';

export const membreBureau = defineType({
  name: 'membreBureau',
  title: 'Membre du bureau',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'nom', title: 'Nom et prénom', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'role',
      title: 'Rôle',
      type: 'string',
      description: 'Par exemple « Président », « Correspondante », « Trésorier ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
    }),
    defineField({
      name: 'email',
      title: 'Email de contact',
      type: 'string',
      description: 'Facultatif. Affiché uniquement si renseigné.',
    }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', validation: (r) => r.integer() }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: { select: { title: 'nom', subtitle: 'role', media: 'portrait' } },
});
