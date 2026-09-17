import { StarIcon } from '@sanity/icons/Star';
import { defineField, defineType } from 'sanity';

export const packPartenaire = defineType({
  name: 'packPartenaire',
  title: 'Pack partenaire',
  type: 'document',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom',
      type: 'string',
      description: 'Par exemple « Supporter », « Club », « Maillot ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'avantages',
      title: 'Ce qui est inclus',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: 'montant',
      title: 'Montant',
      type: 'number',
      description: 'En euros. Laisser vide affiche « montant à définir ».',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'mentionFiscale',
      title: 'Mention fiscale',
      type: 'string',
      description: 'Par exemple « Reçu fiscal mécénat ».',
    }),
    defineField({
      name: 'misEnAvant',
      title: 'Mis en avant',
      type: 'boolean',
      initialValue: false,
      description: 'Affiche le bandeau « Le plus choisi ». Un seul pack à la fois.',
    }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', validation: (r) => r.integer() }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: {
    select: { title: 'nom', montant: 'montant', avant: 'misEnAvant' },
    prepare: ({ title, montant, avant }) => ({
      title: `${title}${avant ? ' ★' : ''}`,
      subtitle: montant != null ? `${montant} €` : 'montant à définir',
    }),
  },
});
