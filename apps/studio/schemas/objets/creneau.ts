import { defineField, defineType } from 'sanity';

/** Un créneau d'entraînement. Plusieurs par équipe. */
export const creneau = defineType({
  name: 'creneau',
  title: "Créneau d'entraînement",
  type: 'object',
  fields: [
    defineField({
      name: 'jour',
      title: 'Jour',
      type: 'string',
      options: {
        list: [
          { title: 'Lundi', value: 'lundi' },
          { title: 'Mardi', value: 'mardi' },
          { title: 'Mercredi', value: 'mercredi' },
          { title: 'Jeudi', value: 'jeudi' },
          { title: 'Vendredi', value: 'vendredi' },
          { title: 'Samedi', value: 'samedi' },
          { title: 'Dimanche', value: 'dimanche' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'debut',
      title: 'Début',
      type: 'string',
      description: 'Format 18h30.',
      validation: (r) =>
        r.required().regex(/^\d{1,2}h\d{2}$/, { name: 'heure', invert: false }).error('Format attendu : 18h30'),
    }),
    defineField({
      name: 'fin',
      title: 'Fin',
      type: 'string',
      description: 'Format 20h00.',
      validation: (r) =>
        r.regex(/^\d{1,2}h\d{2}$/, { name: 'heure', invert: false }).error('Format attendu : 20h00'),
    }),
    defineField({ name: 'lieu', title: 'Lieu', type: 'string', initialValue: 'Gonzales' }),
  ],
  preview: {
    select: { jour: 'jour', debut: 'debut', fin: 'fin', lieu: 'lieu' },
    prepare({ jour, debut, fin, lieu }) {
      return {
        title: `${jour ?? '—'} ${debut ?? ''}${fin ? ' – ' + fin : ''}`.trim(),
        subtitle: lieu,
      };
    },
  },
});
