import { defineField, defineType } from 'sanity';

export const questionReponse = defineType({
  name: 'questionReponse',
  title: 'Question fréquente',
  type: 'object',
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'reponse', title: 'Réponse', type: 'text', rows: 3, validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'question', subtitle: 'reponse' } },
});
