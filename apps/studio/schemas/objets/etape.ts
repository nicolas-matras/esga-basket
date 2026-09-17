import { defineField, defineType } from 'sanity';

/** Une étape numérotée : « 01 Essai gratuit », « 02 Dossier en ligne »… */
export const etape = defineType({
  name: 'etape',
  title: 'Étape',
  type: 'object',
  fields: [
    defineField({ name: 'titre', title: 'Titre', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'texte', title: 'Texte', type: 'text', rows: 2, validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'titre', subtitle: 'texte' } },
});
