import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';

/** Les catégories d'âge officielles du club (U7 → Séniors, Loisirs). */
export const categorie = defineType({
  name: 'categorie',
  title: "Catégorie d'âge",
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'libelle',
      title: 'Libellé',
      type: 'string',
      description: 'Par exemple « U13 » ou « Séniors ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant d’URL',
      type: 'slug',
      options: { source: 'libelle', maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'ordre',
      title: 'Ordre d’affichage',
      type: 'number',
      description: 'Du plus jeune au plus âgé. Sert à trier les filtres.',
      validation: (r) => r.required().integer(),
    }),
    defineField({
      name: 'anneesNaissance',
      title: 'Années de naissance',
      type: 'string',
      description: 'Par exemple « 2014 & 2015 ». Affiché dans la grille des tarifs.',
    }),
    defineField({
      name: 'regroupement',
      title: 'Regroupement page d’accueil',
      type: 'string',
      description: "Bloc « Trouve ton équipe » : U9—U11, U13—U15, U18, SR. Laisser vide pour ne pas l'afficher.",
    }),
    defineField({
      name: 'accroche',
      title: 'Accroche',
      type: 'string',
      description: 'Par exemple « École de basket » ou « Compétition départementale ».',
    }),
    defineField({
      name: 'detail',
      title: 'Détail',
      type: 'string',
      description: 'Par exemple « Mercredi après-midi · plateaux le samedi ».',
    }),
  ],
  orderings: [
    { name: 'ordre', title: 'Ordre officiel', by: [{ field: 'ordre', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'libelle', subtitle: 'anneesNaissance', ordre: 'ordre' },
    prepare: ({ title, subtitle, ordre }) => ({
      title: `${ordre != null ? String(ordre).padStart(2, '0') + ' · ' : ''}${title}`,
      subtitle,
    }),
  },
});
