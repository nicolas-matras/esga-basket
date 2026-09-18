import { ActivityIcon } from '@sanity/icons/Activity';
import { defineField, defineType } from 'sanity';

/**
 * Journal de la synchronisation FFBB, visible dans le Studio.
 *
 * Sans ce document, une synchro qui meurt meurt en silence : le site continue
 * d'afficher les dernières données récupérées, correctes mais figées, et
 * personne ne s'en aperçoit avant plusieurs semaines. C'est le mode de panne
 * le plus probable et le plus coûteux.
 */
export const syncStatus = defineType({
  name: 'syncStatus',
  title: 'État de la synchronisation',
  type: 'document',
  icon: ActivityIcon,
  // Entièrement écrit par le script : rien n'est modifiable à la main.
  fields: [
    defineField({
      name: 'derniereExecution',
      title: 'Dernière exécution',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'derniereReussite',
      title: 'Dernière exécution réussie',
      type: 'datetime',
      readOnly: true,
      description:
        'Si cette date s’éloigne de la précédente, la synchronisation échoue en boucle.',
    }),
    defineField({
      name: 'statut',
      title: 'Statut',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          { title: 'Réussie', value: 'ok' },
          { title: 'Réussie avec avertissements', value: 'avertissement' },
          { title: 'Échec', value: 'erreur' },
        ],
      },
    }),
    defineField({ name: 'dureeMs', title: 'Durée (ms)', type: 'number', readOnly: true }),
    defineField({
      name: 'engagementsTraites',
      title: 'Engagements traités',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'classementsMisAJour',
      title: 'Classements mis à jour',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'rencontresMisesAJour',
      title: 'Rencontres mises à jour',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'buildDeclenche',
      title: 'Build déclenché',
      type: 'boolean',
      readOnly: true,
      description: 'Le site n’est reconstruit que si quelque chose a changé.',
    }),
    defineField({
      name: 'messages',
      title: 'Journal',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'erreurs',
      title: 'Erreurs',
      type: 'array',
      of: [{ type: 'string' }],
      readOnly: true,
    }),
    defineField({
      name: 'saison',
      title: 'Saison détectée',
      type: 'string',
      readOnly: true,
    }),
  ],
  preview: {
    select: { statut: 'statut', quand: 'derniereExecution', n: 'engagementsTraites' },
    prepare({ statut, quand, n }) {
      const icone = statut === 'ok' ? '✓' : statut === 'erreur' ? '✕' : '!';
      const date = quand
        ? new Date(quand).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'jamais exécutée';
      return {
        title: `${icone} Synchronisation FFBB`,
        subtitle: `${date}${n != null ? ` · ${n} engagements` : ''}`,
      };
    },
  },
});
