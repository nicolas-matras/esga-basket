import { defineField, defineType } from 'sanity';

/** Une ligne de classement. Saisie à la main tant qu'il n'y a pas d'import FFBB. */
export const ligneClassement = defineType({
  name: 'ligneClassement',
  title: 'Ligne de classement',
  type: 'object',
  fields: [
    defineField({
      name: 'rang',
      title: 'Rang',
      type: 'number',
      validation: (r) => r.required().integer().positive(),
    }),
    defineField({
      name: 'equipe',
      title: 'Équipe',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'estESGA',
      title: 'C’est une équipe de l’ESGA',
      type: 'boolean',
      description: 'Met la ligne en évidence dans le tableau.',
      initialValue: false,
    }),
    defineField({
      name: 'points',
      title: 'Points',
      type: 'number',
      validation: (r) => r.required().integer(),
    }),
    defineField({
      name: 'joues',
      title: 'Matchs joués',
      type: 'number',
      validation: (r) => r.integer().min(0),
    }),
    defineField({ name: 'gagnes', title: 'Gagnés', type: 'number', validation: (r) => r.integer().min(0) }),
    defineField({ name: 'perdus', title: 'Perdus', type: 'number', validation: (r) => r.integer().min(0) }),
    defineField({ name: 'nuls', title: 'Nuls', type: 'number', validation: (r) => r.integer().min(0) }),
    defineField({
      name: 'pointsMarques',
      title: 'Points marqués',
      type: 'number',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'pointsEncaisses',
      title: 'Points encaissés',
      type: 'number',
      validation: (r) => r.integer().min(0),
    }),
    defineField({
      name: 'difference',
      title: 'Différence de points',
      type: 'number',
      description: 'Peut être négative.',
      validation: (r) => r.integer(),
    }),
    defineField({
      name: 'horsClassement',
      title: 'Hors classement',
      type: 'boolean',
      description: 'Équipe engagée mais non classée (forfait général, équipe réserve).',
      initialValue: false,
    }),
    defineField({
      name: 'forme',
      title: 'Forme récente',
      type: 'string',
      description: 'Les derniers résultats, du plus ancien au plus récent : « VVDVN ». Calculé par la synchronisation.',
      readOnly: true,
    }),
  ],
  preview: {
    select: { rang: 'rang', equipe: 'equipe', points: 'points', esga: 'estESGA' },
    prepare({ rang, equipe, points, esga }) {
      return {
        title: `${rang ?? '?'}. ${equipe ?? '—'}${esga ? ' ★' : ''}`,
        subtitle: points != null ? `${points} pts` : undefined,
      };
    },
  },
});
