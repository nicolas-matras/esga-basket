import { CreditCardIcon } from '@sanity/icons/CreditCard';
import { defineField, defineType } from 'sanity';

/**
 * Le tarif d'une catégorie pour la saison. La maquette les laisse tous
 * « à définir » : le champ montant est donc volontairement facultatif, et le
 * site affiche la mention d'attente tant qu'il est vide.
 */
export const tarif = defineType({
  name: 'tarif',
  title: 'Tarif',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'libelle',
      title: 'Libellé',
      type: 'string',
      description: 'Par exemple « École de basket (U7—U9) ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Catégories concernées',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'categorie' }] }],
    }),
    defineField({
      name: 'montant',
      title: 'Cotisation annuelle',
      type: 'number',
      description: 'En euros. Vide = « à définir » s’affiche sur le site.',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'mutationIncluse',
      title: 'Mutation incluse',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', validation: (r) => r.integer() }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: {
    select: { title: 'libelle', montant: 'montant' },
    prepare: ({ title, montant }) => ({
      title,
      subtitle: montant != null ? `${montant} €` : 'à définir',
    }),
  },
});
