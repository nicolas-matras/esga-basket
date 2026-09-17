import { CogIcon } from '@sanity/icons/Cog';
import { defineField, defineType } from 'sanity';

/** Identité du club. Un seul document, repris dans l'en-tête et le pied de page. */
export const parametres = defineType({
  name: 'parametres',
  title: 'Réglages du club',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identite', title: 'Identité', default: true },
    { name: 'contact', title: 'Contact & accès' },
    { name: 'bandeau', title: 'Bandeau défilant' },
    { name: 'pied', title: 'Pied de page' },
  ],
  fields: [
    defineField({
      name: 'nom',
      title: 'Nom du club',
      type: 'string',
      group: 'identite',
      initialValue: 'ESGA Basket',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'nomComplet',
      title: 'Raison sociale',
      type: 'string',
      group: 'identite',
      initialValue: 'Éveil Sportif Genas Azieu',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'identite',
      description: 'Fond transparent, format carré.',
      fields: [defineField({ name: 'alt', title: 'Description de l’image', type: 'string' })],
    }),
    defineField({
      name: 'numeroFFBB',
      title: 'Numéro d’affiliation FFBB',
      type: 'string',
      group: 'identite',
      initialValue: 'ARA0069090',
    }),
    defineField({
      name: 'mentionAffiliation',
      title: 'Mention d’affiliation',
      type: 'string',
      group: 'identite',
      initialValue: 'Club affilié FFBB — Comité du Rhône & Métropole de Lyon',
    }),

    defineField({
      name: 'salle',
      title: 'Nom de la salle',
      type: 'string',
      group: 'contact',
      initialValue: 'Complexe Sportif Marcel Gonzales',
    }),
    defineField({
      name: 'adresse',
      title: 'Adresse',
      type: 'string',
      group: 'contact',
      initialValue: '2 rue de la Fraternité, 69740 Genas',
    }),
    defineField({
      name: 'email',
      title: 'Email principal',
      type: 'string',
      group: 'contact',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'emailLicences',
      title: 'Email licences',
      type: 'string',
      group: 'contact',
      description: 'Facultatif. Affiché sur la page Inscriptions si renseigné.',
    }),
    defineField({ name: 'telephone', title: 'Téléphone', type: 'string', group: 'contact' }),
    defineField({
      name: 'lienPlan',
      title: 'Lien vers le plan d’accès',
      type: 'url',
      group: 'contact',
      description: 'Lien Google Maps ou OpenStreetMap.',
    }),
    defineField({
      name: 'reseaux',
      title: 'Réseaux sociaux',
      type: 'array',
      of: [{ type: 'lienReseau' }],
      group: 'contact',
    }),

    defineField({
      name: 'bandeauActif',
      title: 'Afficher le bandeau défilant',
      type: 'boolean',
      group: 'bandeau',
      initialValue: true,
      description: 'Le ruban de scores en haut du site. Il se remplit tout seul depuis les matchs.',
    }),
    defineField({
      name: 'bandeauMessages',
      title: 'Messages fixes',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'bandeau',
      description: 'Ajoutés aux scores. Par exemple « Tournoi ESGA 5-6-7 juin ».',
    }),

    defineField({
      name: 'accrochePied',
      title: 'Phrase du pied de page',
      type: 'string',
      group: 'pied',
    }),
    defineField({
      name: 'lienMentions',
      title: 'Mentions légales',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'libelle', title: 'Libellé', type: 'string' }),
            defineField({ name: 'url', title: 'Adresse', type: 'string' }),
          ],
          preview: { select: { title: 'libelle', subtitle: 'url' } },
        },
      ],
      group: 'pied',
    }),
  ],
  preview: { prepare: () => ({ title: 'Réglages du club' }) },
});
