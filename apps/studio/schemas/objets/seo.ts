import { defineField, defineType } from 'sanity';

/** Surcharges de référencement. Laissé vide, le site retombe sur le titre de la page. */
export const seo = defineType({
  name: 'seo',
  title: 'Référencement',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'titre',
      title: 'Titre dans Google',
      type: 'string',
      description: '60 caractères maximum. Vide = le titre de la page est repris.',
      validation: (r) => r.max(60).warning('Au-delà de 60 caractères, Google tronque.'),
    }),
    defineField({
      name: 'description',
      title: 'Description dans Google',
      type: 'text',
      rows: 3,
      description: '155 caractères maximum.',
      validation: (r) => r.max(155).warning('Au-delà de 155 caractères, Google tronque.'),
    }),
    defineField({
      name: 'image',
      title: 'Image de partage',
      type: 'image',
      description: "S'affiche quand la page est partagée sur Facebook ou WhatsApp. 1200×630.",
    }),
  ],
});
