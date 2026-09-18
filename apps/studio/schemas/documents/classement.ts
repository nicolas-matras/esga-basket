import { BarChartIcon } from '@sanity/icons/BarChart';
import { defineField, defineType } from 'sanity';
import { champsSync, estSynchronise, groupeSync } from '../sync';

/**
 * Le classement d'une compétition, à une date donnée.
 *
 * Saisi à la main : la FFBB n'expose pas d'API publique. Le champ `source` et
 * `misAJourLe` sont prêts pour un import automatique ultérieur — on ne perd
 * rien en attendant, et l'affichage indique honnêtement la date du relevé.
 */
export const classement = defineType({
  name: 'classement',
  title: 'Classement',
  type: 'document',
  icon: BarChartIcon,
  groups: [
    { name: 'contenu', title: 'Classement', default: true },
    groupeSync,
  ],
  fields: [
    defineField({
      name: 'competition',
      group: 'contenu',
      title: 'Compétition',
      type: 'reference',
      to: [{ type: 'competition' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'misAJourLe',
      group: 'contenu',
      title: 'Relevé du',
      type: 'date',
      options: { dateFormat: 'DD/MM/YYYY' },
      description: 'Date à laquelle ce classement a été relevé. Affichée sous le tableau.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'lignes',
      group: 'contenu',
      title: 'Lignes',
      type: 'array',
      of: [{ type: 'ligneClassement' }],
      readOnly: estSynchronise,
      validation: (r) => r.min(1).error('Un classement vide ne sert à rien.'),
    }),
    ...champsSync(),
  ],
  orderings: [
    { name: 'recent', title: 'Plus récent', by: [{ field: 'misAJourLe', direction: 'desc' }] },
  ],
  preview: {
    select: { competition: 'competition.libelle', date: 'misAJourLe', lignes: 'lignes' },
    prepare({ competition, date, lignes }) {
      const n = Array.isArray(lignes) ? lignes.length : 0;
      return {
        title: competition ?? 'Compétition non liée',
        subtitle: `${n} équipe${n > 1 ? 's' : ''}${date ? ' · relevé du ' + date.split('-').reverse().join('/') : ''}`,
      };
    },
  },
});
