import { defineField, defineType } from 'sanity';

export const lienReseau = defineType({
  name: 'lienReseau',
  title: 'Réseau social',
  type: 'object',
  fields: [
    defineField({
      name: 'plateforme',
      title: 'Plateforme',
      type: 'string',
      options: {
        list: [
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'YouTube', value: 'youtube' },
          { title: 'TikTok', value: 'tiktok' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'libelle',
      title: 'Libellé affiché',
      type: 'string',
      description: 'Par exemple « @esgagenas ».',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'url',
      title: 'Adresse',
      type: 'url',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: 'libelle', subtitle: 'plateforme' },
  },
});
