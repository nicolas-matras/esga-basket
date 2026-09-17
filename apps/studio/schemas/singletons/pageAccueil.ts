import { HomeIcon } from '@sanity/icons/Home';
import { defineField, defineType } from 'sanity';
import { champSeo } from './_entete';

export const pageAccueil = defineType({
  name: 'pageAccueil',
  title: 'Page — Accueil',
  type: 'document',
  icon: HomeIcon,
  groups: [
    { name: 'heros', title: 'Héros', default: true },
    { name: 'chiffres', title: 'Chiffres clés' },
    { name: 'blocs', title: 'Blocs de bas de page' },
    { name: 'seo', title: 'Référencement' },
  ],
  fields: [
    defineField({
      name: 'surtitre',
      title: 'Surtitre',
      type: 'string',
      group: 'heros',
      description: 'La pastille au-dessus du titre. Par exemple « Inscriptions ouvertes · dès 6 ans ».',
    }),
    defineField({
      name: 'titre',
      title: 'Titre',
      type: 'string',
      group: 'heros',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'motAccentue',
      title: 'Mot mis en couleur',
      type: 'string',
      group: 'heros',
      description:
        'Un mot du titre à afficher en orange, comme « maillot » dans « On joue tous pour le même maillot ». Laisser vide pour un titre d’une seule couleur.',
    }),
    defineField({ name: 'intro', title: 'Chapô', type: 'text', rows: 3, group: 'heros' }),
    defineField({
      name: 'ctaPrincipal',
      title: 'Bouton principal',
      type: 'object',
      group: 'heros',
      fields: [
        defineField({ name: 'libelle', title: 'Libellé', type: 'string' }),
        defineField({ name: 'url', title: 'Destination', type: 'string' }),
      ],
    }),
    defineField({
      name: 'ctaVideo',
      title: 'Bouton vidéo',
      type: 'object',
      group: 'heros',
      description: 'Laisser vide pour ne pas l’afficher.',
      fields: [
        defineField({ name: 'libelle', title: 'Libellé', type: 'string' }),
        defineField({ name: 'url', title: 'Lien de la vidéo', type: 'url' }),
      ],
    }),
    defineField({
      name: 'photo',
      title: 'Photo du héros',
      type: 'image',
      group: 'heros',
      options: { hotspot: true },
      description: 'Portrait 900×1200. La maquette suggère une photo d’équipe au Gonzales.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
    }),

    defineField({
      name: 'chiffres',
      title: 'Chiffres clés',
      type: 'array',
      group: 'chiffres',
      description: 'Trois au maximum, sous le héros.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'valeur',
              title: 'Valeur',
              type: 'string',
              description: 'Par exemple « 15 » ou « 5·6·7 juin ».',
            }),
            defineField({ name: 'libelle', title: 'Libellé', type: 'string' }),
          ],
          preview: { select: { title: 'valeur', subtitle: 'libelle' } },
        },
      ],
      validation: (r) => r.max(3).warning('La maquette n’en affiche que trois.'),
    }),
    defineField({
      name: 'badgeProchainMatch',
      title: 'Badge sur le prochain match',
      type: 'string',
      group: 'chiffres',
      description: 'Par exemple « 1er entraînement offert ». Vide = pas de badge.',
    }),
    defineField({
      name: 'classementMisEnAvant',
      title: 'Classement affiché sur l’accueil',
      type: 'reference',
      to: [{ type: 'competition' }],
      group: 'chiffres',
      description: 'Le classement de cette compétition est repris sur l’accueil.',
    }),

    defineField({
      name: 'blocBenevole',
      title: 'Bloc bénévolat',
      type: 'object',
      group: 'blocs',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre', type: 'string' }),
        defineField({ name: 'titre', title: 'Titre', type: 'string' }),
        defineField({ name: 'texte', title: 'Texte', type: 'text', rows: 2 }),
        defineField({ name: 'libelleBouton', title: 'Libellé du bouton', type: 'string' }),
      ],
    }),
    defineField({
      name: 'blocInscription',
      title: 'Bloc inscription',
      type: 'object',
      group: 'blocs',
      fields: [
        defineField({ name: 'titre', title: 'Titre', type: 'string' }),
        defineField({ name: 'texte', title: 'Texte', type: 'text', rows: 2 }),
        defineField({ name: 'libelleBouton', title: 'Libellé du bouton', type: 'string' }),
        defineField({
          name: 'etapes',
          title: 'Étapes',
          type: 'array',
          of: [{ type: 'etape' }],
          validation: (r) => r.max(3).warning('La maquette n’en affiche que trois.'),
        }),
      ],
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Accueil' }) },
});
