import { defineField, type ConditionalPropertyCallbackContext } from 'sanity';

/**
 * Champs et règles partagés par les documents alimentés depuis la FFBB.
 *
 * Principe : un document porte `syncSource`. À « ffbb », les champs issus de la
 * fédération deviennent lecture seule dans le Studio — non pas pour brider les
 * dirigeants, mais parce qu'une correction manuelle y serait effacée à la
 * synchronisation suivante, ce qui est pire que de ne pas pouvoir la saisir.
 *
 * À « manuel », tout redevient modifiable : c'est le repli si la FFBB ferme
 * l'accès, et il ne demande aucun redéploiement.
 */

export const groupeSync = { name: 'sync', title: 'Synchronisation FFBB' };

/** Vrai quand le document est piloté par la synchronisation. */
export const estSynchronise = ({ document }: ConditionalPropertyCallbackContext) =>
  (document as { syncSource?: string } | undefined)?.syncSource === 'ffbb';

type Options = {
  /** Ajoute les identifiants d'engagement (documents « équipe » uniquement). */
  avecEngagement?: boolean;
  /** Texte d'aide affiché sur le premier champ d'identifiant. */
  aide?: string;
};

export function champsSync({ avecEngagement = false, aide }: Options = {}) {
  return [
    defineField({
      name: 'syncSource',
      title: 'Origine des données',
      type: 'string',
      group: 'sync',
      options: {
        list: [
          { title: 'Synchronisée depuis la FFBB', value: 'ffbb' },
          { title: 'Saisie à la main', value: 'manuel' },
        ],
        layout: 'radio',
      },
      initialValue: 'manuel',
      description:
        'Passer sur « saisie à la main » déverrouille les champs et exclut le document de la synchronisation. À utiliser si la FFBB devient indisponible.',
      validation: (r) => r.required(),
    }),

    ...(avecEngagement
      ? [
          defineField({
            name: 'ffbbEngagementId',
            title: 'Identifiant d’engagement FFBB',
            type: 'string',
            group: 'sync',
            description: aide,
            readOnly: estSynchronise,
          }),
        ]
      : []),

    defineField({
      name: 'ffbbPouleId',
      title: 'Identifiant de poule FFBB',
      type: 'string',
      group: 'sync',
      readOnly: estSynchronise,
    }),
    defineField({
      name: 'ffbbCompetitionId',
      title: 'Identifiant de compétition FFBB',
      type: 'string',
      group: 'sync',
      readOnly: estSynchronise,
    }),
    defineField({
      name: 'ffbbCompetitionCode',
      title: 'Code de compétition',
      type: 'string',
      group: 'sync',
      description: 'Par exemple « DMU15-2 ».',
      readOnly: estSynchronise,
    }),

    defineField({
      name: 'derniereSync',
      title: 'Dernière synchronisation',
      type: 'datetime',
      group: 'sync',
      readOnly: true,
    }),
    defineField({
      name: 'syncStatut',
      title: 'Statut',
      type: 'string',
      group: 'sync',
      options: {
        list: [
          { title: 'À jour', value: 'ok' },
          { title: 'Inchangé', value: 'inchange' },
          { title: 'En erreur', value: 'erreur' },
        ],
      },
      readOnly: true,
    }),
    defineField({
      name: 'syncErreur',
      title: 'Dernière erreur',
      type: 'text',
      rows: 2,
      group: 'sync',
      readOnly: true,
      hidden: ({ document }) => (document as { syncStatut?: string } | undefined)?.syncStatut !== 'erreur',
    }),
    /**
     * Empreinte du contenu synchronisé. Elle permet de ne patcher que si
     * quelque chose a réellement changé : sans elle, chaque exécution
     * réécrirait les documents, polluerait l'historique Sanity et
     * déclencherait un build inutile.
     */
    defineField({
      name: 'syncEmpreinte',
      title: 'Empreinte du contenu',
      type: 'string',
      group: 'sync',
      readOnly: true,
      hidden: true,
    }),
  ];
}
