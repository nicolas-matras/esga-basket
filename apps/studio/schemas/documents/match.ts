import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineField, defineType } from 'sanity';

/**
 * Un match. C'est le document pivot du site : il alimente le bandeau de scores,
 * le « prochain match » de l'accueil, l'agenda de la semaine et les derniers
 * résultats. Un seul endroit à tenir à jour.
 */
export const match = defineType({
  name: 'match',
  title: 'Match',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    { name: 'quand', title: 'Quand et où', default: true },
    { name: 'score', title: 'Score' },
    { name: 'mise-en-avant', title: 'Mise en avant' },
  ],
  fields: [
    defineField({
      name: 'equipe',
      title: 'Équipe de l’ESGA',
      type: 'reference',
      to: [{ type: 'equipe' }],
      group: 'quand',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'adversaire',
      title: 'Adversaire',
      type: 'string',
      group: 'quand',
      description: 'Par exemple « Beaumarchais Lyon Métropole ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logoAdversaire',
      title: 'Logo de l’adversaire',
      type: 'image',
      group: 'quand',
      description: 'Facultatif. Un placeholder s’affiche si absent.',
    }),
    defineField({
      name: 'debut',
      title: 'Date et heure',
      type: 'datetime',
      group: 'quand',
      options: { dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', timeStep: 15 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'domicile',
      title: 'Match à domicile',
      type: 'boolean',
      group: 'quand',
      initialValue: true,
      description: 'Décoché = déplacement.',
    }),
    defineField({
      name: 'lieu',
      title: 'Lieu',
      type: 'string',
      group: 'quand',
      initialValue: 'Gonzales',
      description: 'Le gymnase. « Gonzales » à domicile, le nom de la ville en déplacement.',
    }),
    defineField({
      name: 'competition',
      title: 'Compétition',
      type: 'reference',
      to: [{ type: 'competition' }],
      group: 'quand',
      description: 'Facultatif. Sert à regrouper les rencontres.',
    }),
    defineField({
      name: 'nature',
      title: 'Nature',
      type: 'string',
      group: 'quand',
      options: {
        list: [
          { title: 'Championnat', value: 'championnat' },
          { title: 'Plateau', value: 'plateau' },
          { title: 'Coupe', value: 'coupe' },
          { title: 'Amical', value: 'amical' },
          { title: 'Tournoi', value: 'tournoi' },
        ],
      },
      initialValue: 'championnat',
    }),

    defineField({
      name: 'statut',
      title: 'Statut',
      type: 'string',
      group: 'score',
      options: {
        list: [
          { title: 'À venir', value: 'a-venir' },
          { title: 'En cours', value: 'en-cours' },
          { title: 'Terminé', value: 'termine' },
          { title: 'Reporté', value: 'reporte' },
        ],
        layout: 'radio',
      },
      initialValue: 'a-venir',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'scoreEsga',
      title: 'Score ESGA',
      type: 'number',
      group: 'score',
      hidden: ({ parent }) => parent?.statut === 'a-venir' || parent?.statut === 'reporte',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'scoreAdverse',
      title: 'Score adverse',
      type: 'number',
      group: 'score',
      hidden: ({ parent }) => parent?.statut === 'a-venir' || parent?.statut === 'reporte',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'periode',
      title: 'Période',
      type: 'string',
      group: 'score',
      description: 'Uniquement pour un match en cours : « Q3 », « MT »…',
      hidden: ({ parent }) => parent?.statut !== 'en-cours',
    }),

    defineField({
      name: 'afficheDeLaSemaine',
      title: 'Affiche de la semaine',
      type: 'boolean',
      group: 'mise-en-avant',
      initialValue: false,
      description: 'Met la rencontre en avant dans l’agenda. Une seule par week-end.',
    }),
    defineField({
      name: 'dansLeBandeau',
      title: 'Afficher dans le bandeau défilant',
      type: 'boolean',
      group: 'mise-en-avant',
      initialValue: true,
      description: 'Le bandeau de scores en haut du site.',
    }),
    defineField({
      name: 'note',
      title: 'Précision',
      type: 'string',
      group: 'mise-en-avant',
      description: 'Par exemple « 3 clubs invités ».',
    }),
  ],
  orderings: [
    { name: 'prochains', title: 'Prochains d’abord', by: [{ field: 'debut', direction: 'asc' }] },
    { name: 'recents', title: 'Récents d’abord', by: [{ field: 'debut', direction: 'desc' }] },
  ],
  preview: {
    select: {
      equipe: 'equipe.nom',
      adversaire: 'adversaire',
      debut: 'debut',
      domicile: 'domicile',
      statut: 'statut',
      se: 'scoreEsga',
      sa: 'scoreAdverse',
    },
    prepare({ equipe, adversaire, debut, domicile, statut, se, sa }) {
      const date = debut
        ? new Date(debut).toLocaleString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'date à définir';
      const score = statut === 'termine' && se != null && sa != null ? ` · ${se}–${sa}` : '';
      return {
        title: `${equipe ?? '?'} ${domicile ? 'reçoit' : 'se déplace à'} ${adversaire ?? '?'}`,
        subtitle: `${date}${score}`,
      };
    },
  },
});
