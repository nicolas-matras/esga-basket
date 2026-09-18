import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';
import { champsSync, estSynchronise, groupeSync } from '../sync';

/**
 * Une équipe engagée.
 *
 * Deux natures de champs cohabitent :
 *  - ceux qui viennent de la FFBB (nom officiel, championnat, poule, position),
 *    verrouillés dès que la synchro pilote la fiche — les réécrire à la main
 *    ne servirait à rien, la prochaine synchro les remplacerait ;
 *  - ceux qui appartiennent au club (photo, coach, créneaux, ordre d'affichage,
 *    visibilité), que la synchro ne touche JAMAIS.
 */
export const equipe = defineType({
  name: 'equipe',
  title: 'Équipe',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'identite', title: 'Identité', default: true },
    { name: 'club', title: 'Infos du club' },
    groupeSync,
  ],
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom',
      type: 'string',
      group: 'identite',
      description: 'Le nom court employé sur le site : « SM1 », « U15M 1 », « SF1 ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Identifiant d’URL',
      type: 'slug',
      group: 'identite',
      options: { source: 'nom', maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'categorie',
      title: 'Catégorie',
      type: 'reference',
      group: 'identite',
      to: [{ type: 'categorie' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'genre',
      title: 'Genre',
      type: 'string',
      group: 'identite',
      options: {
        list: [
          { title: 'Masculin', value: 'M' },
          { title: 'Féminin', value: 'F' },
          { title: 'Mixte', value: 'X' },
        ],
        layout: 'radio',
      },
      readOnly: estSynchronise,
    }),

    // --- Renseigné par la FFBB quand la synchro est active ---
    defineField({
      name: 'championnat',
      title: 'Championnat',
      type: 'string',
      group: 'identite',
      description: 'Par exemple « PRM poule A2 ». Repris de la FFBB si la synchro est active.',
      readOnly: estSynchronise,
    }),
    defineField({
      name: 'poule',
      title: 'Poule',
      type: 'string',
      group: 'identite',
      readOnly: estSynchronise,
    }),
    defineField({
      name: 'niveau',
      title: 'Niveau',
      type: 'string',
      group: 'identite',
      readOnly: estSynchronise,
    }),
    defineField({
      name: 'position',
      title: 'Position au classement',
      type: 'number',
      group: 'identite',
      description: 'Dernière position connue. Le classement complet vit dans son propre document.',
      readOnly: estSynchronise,
    }),

    // --- Le club décide ---
    defineField({
      name: 'visibleSurSite',
      title: 'Afficher sur le site',
      type: 'boolean',
      group: 'club',
      initialValue: true,
      description:
        'Décochez pour retirer l’équipe du site sans la supprimer. La synchro continue de la mettre à jour en arrière-plan.',
    }),
    defineField({
      name: 'coach',
      title: 'Coach',
      type: 'string',
      group: 'club',
      description: 'Jamais écrasé par la synchronisation.',
    }),
    defineField({
      name: 'creneaux',
      title: 'Créneaux d’entraînement',
      type: 'array',
      group: 'club',
      of: [{ type: 'creneau' }],
      description: 'Jamais écrasés par la synchronisation.',
    }),
    defineField({
      name: 'photo',
      title: 'Photo d’équipe',
      type: 'image',
      group: 'club',
      options: { hotspot: true },
      description: '600×340 minimum. Jamais écrasée par la synchronisation.',
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
      group: 'club',
      validation: (r) => r.integer(),
    }),

    ...champsSync({
      avecEngagement: true,
      aide: 'Identifiants FFBB de l’engagement. Ils changent à chaque saison : la synchro les redécouvre seule à partir du code club.',
    }),
  ],
  orderings: [{ name: 'ordre', title: 'Ordre', by: [{ field: 'ordre', direction: 'asc' }] }],
  preview: {
    select: {
      title: 'nom',
      championnat: 'championnat',
      media: 'photo',
      visible: 'visibleSurSite',
      source: 'syncSource',
    },
    prepare: ({ title, championnat, media, visible, source }) => ({
      title: `${title}${visible === false ? ' · masquée' : ''}`,
      subtitle: [championnat, source === 'ffbb' ? 'FFBB' : null].filter(Boolean).join(' · '),
      media,
    }),
  },
});
