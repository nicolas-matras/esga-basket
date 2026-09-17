import { BasketIcon } from '@sanity/icons/Basket';
import { defineField, defineType } from 'sanity';

/**
 * Un article de la boutique. Pas de paiement en ligne : la maquette décrit une
 * commande groupée deux fois par saison, retrait au gymnase.
 */
export const produit = defineType({
  name: 'produit',
  title: 'Article de la boutique',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({ name: 'nom', title: 'Nom', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'detail',
      title: 'Détail',
      type: 'string',
      description: 'Par exemple « Coton bio · floquage prénom offert ».',
    }),
    defineField({
      name: 'prix',
      title: 'Prix',
      type: 'number',
      description: 'En euros. Laisser vide tant que le tarif n’est pas arrêté.',
      validation: (r) => r.min(0),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      description: '800×800.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
    }),
    defineField({
      name: 'tailles',
      title: 'Tailles disponibles',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'disponible',
      title: 'Disponible',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({ name: 'ordre', title: 'Ordre d’affichage', type: 'number', validation: (r) => r.integer() }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: {
    select: { title: 'nom', prix: 'prix', media: 'photo', dispo: 'disponible' },
    prepare: ({ title, prix, media, dispo }) => ({
      title,
      subtitle: [prix != null ? `${prix} €` : 'prix à définir', dispo ? null : 'indisponible']
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
});
