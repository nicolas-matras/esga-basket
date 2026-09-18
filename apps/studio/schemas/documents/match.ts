import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineField, defineType } from 'sanity';
import { champsSync, estSynchronise, groupeSync } from '../sync';

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
    groupeSync,
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
      name: 'journee',
      readOnly: estSynchronise,
      title: 'Journée',
      type: 'number',
      group: 'quand',
      description: 'Le numéro de journée du championnat, tel qu’il figure sur la feuille FFBB.',
      validation: (r) => r.integer().positive(),
    }),
    defineField({
      name: 'adversaire',
      readOnly: estSynchronise,
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
      readOnly: estSynchronise,
      title: 'Date et heure',
      type: 'datetime',
      group: 'quand',
      options: { dateFormat: 'DD/MM/YYYY', timeFormat: 'HH:mm', timeStep: 15 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'domicile',
      readOnly: estSynchronise,
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
      description: 'Le gymnase. « Gonzales » à domicile, le nom de la salle ou « Extérieur » en déplacement.',
    }),
    defineField({
      name: 'salle',
      title: 'Salle',
      type: 'string',
      group: 'quand',
      description: 'Nom officiel du gymnase, repris de la FFBB.',
      readOnly: estSynchronise,
    }),
    defineField({
      name: 'lienFeuilleDeMatch',
      title: 'Feuille de match',
      type: 'url',
      group: 'score',
      description: 'Lien vers la feuille de match officielle, quand la FFBB la publie.',
      readOnly: estSynchronise,
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
          { title: 'Terminé', value: 'termine' },
          { title: 'Reporté', value: 'reporte' },
        ],
        layout: 'radio',
      },
      initialValue: 'a-venir',
      description:
        'Passez sur « Terminé » après la rencontre, puis saisissez le score. Les scores ne remontent pas automatiquement : la FFBB ne les expose pas.',
      validation: (r) => r.required(),
    }),
    /*
      Les scores restent toujours visibles, même sur un match « à venir ».
      Les saisir se fait forcément après coup, souvent plusieurs jours plus
      tard : obliger à changer le statut d'abord pour faire apparaître les
      champs ajoute une étape que personne ne devine.
    */
    defineField({
      name: 'scoreEsga',
      title: 'Score ESGA',
      type: 'number',
      group: 'score',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'scoreAdverse',
      title: 'Score adverse',
      type: 'number',
      group: 'score',
      validation: (r) =>
        r.integer().min(0).custom((valeur, contexte) => {
          const d = contexte.document as { scoreEsga?: number; statut?: string } | undefined;
          const unSeul =
            (valeur === undefined) !== (d?.scoreEsga === undefined);
          if (unSeul) return 'Renseignez les deux scores, ou aucun des deux.';
          if (valeur !== undefined && d?.statut !== 'termine') {
            return 'Un score est saisi : passez le statut sur « Terminé » pour qu’il s’affiche.';
          }
          return true;
        }),
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
    ...champsSync(),
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
      const joue = se != null && sa != null;
      const passe = debut ? new Date(debut).getTime() < Date.now() : false;
      // Le rappel le plus utile de la liste : ce match est passé, son score manque.
      const etat = joue
        ? ` · ${se}–${sa}`
        : statut === 'reporte'
          ? ' · reporté'
          : passe
            ? ' · ⚠ score à saisir'
            : '';
      return {
        title: `${equipe ?? '?'} ${domicile ? 'reçoit' : 'se déplace à'} ${adversaire ?? '?'}`,
        subtitle: `${date}${etat}`,
      };
    },
  },
});
