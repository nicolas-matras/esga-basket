import { BarChartIcon } from '@sanity/icons/BarChart';
import { BasketIcon } from '@sanity/icons/Basket';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { StarIcon } from '@sanity/icons/Star';
import { UsersIcon } from '@sanity/icons/Users';
import { defineField, defineType } from 'sanity';
import { champSeo, champsEntete, groupesPage } from './_entete';

/** Pages dont tout le contenu vient d'autres documents : seul l'en-tête est éditable. */

export const pageEquipes = defineType({
  name: 'pageEquipes',
  title: 'Page — Équipes',
  type: 'document',
  icon: UsersIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'mentionAttente',
      title: 'Mention d’attente',
      type: 'string',
      group: 'contenu',
      description: 'Affichée sous la grille tant que créneaux et coachs ne sont pas tous saisis.',
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Équipes' }) },
});

export const pageResultats = defineType({
  name: 'pageResultats',
  title: 'Page — Résultats',
  type: 'document',
  icon: BarChartIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'titreDerniersResultats',
      title: 'Titre de la section résultats',
      type: 'string',
      group: 'contenu',
      initialValue: 'Derniers résultats',
    }),
    defineField({
      name: 'nombreResultats',
      title: 'Nombre de résultats affichés',
      type: 'number',
      group: 'contenu',
      initialValue: 6,
      validation: (r) => r.integer().min(1).max(20),
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Résultats' }) },
});

export const pageAgenda = defineType({
  name: 'pageAgenda',
  title: 'Page — Agenda',
  type: 'document',
  icon: CalendarIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'blocConvocations',
      title: 'Bloc convocations',
      type: 'object',
      group: 'contenu',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre', type: 'string' }),
        defineField({ name: 'titre', title: 'Titre', type: 'string' }),
        defineField({ name: 'texte', title: 'Texte', type: 'text', rows: 2 }),
        defineField({ name: 'libelleBouton', title: 'Libellé du bouton', type: 'string' }),
        defineField({ name: 'url', title: 'Lien', type: 'url' }),
      ],
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Agenda' }) },
});

export const pageActus = defineType({
  name: 'pageActus',
  title: 'Page — Actualités',
  type: 'document',
  icon: DocumentTextIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'blocNewsletter',
      title: 'Bloc newsletter',
      type: 'object',
      group: 'contenu',
      fields: [
        defineField({ name: 'titre', title: 'Titre', type: 'string' }),
        defineField({ name: 'texte', title: 'Texte', type: 'string' }),
        defineField({ name: 'libelleBouton', title: 'Libellé du bouton', type: 'string' }),
        defineField({
          name: 'actif',
          title: 'Afficher le bloc',
          type: 'boolean',
          initialValue: false,
          description: 'Ne l’activer qu’une fois le service d’emailing branché.',
        }),
      ],
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Actualités' }) },
});

export const pagePartenaires = defineType({
  name: 'pagePartenaires',
  title: 'Page — Partenaires',
  type: 'document',
  icon: StarIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'titrePartenaires',
      title: 'Titre de la galerie de logos',
      type: 'string',
      group: 'contenu',
      initialValue: 'Ils nous soutiennent',
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Partenaires' }) },
});

export const pageBoutique = defineType({
  name: 'pageBoutique',
  title: 'Page — Boutique',
  type: 'document',
  icon: BasketIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'commandeGroupee',
      title: 'Prochaine commande groupée',
      type: 'object',
      group: 'contenu',
      description: 'Il n’y a pas de paiement en ligne : le club commande, le licencié retire au gymnase.',
      fields: [
        defineField({ name: 'surtitre', title: 'Surtitre', type: 'string' }),
        defineField({
          name: 'cloture',
          title: 'Date de clôture',
          type: 'date',
          options: { dateFormat: 'DD/MM/YYYY' },
        }),
        defineField({ name: 'texte', title: 'Texte', type: 'text', rows: 2 }),
        defineField({ name: 'libelleBouton', title: 'Libellé du bouton', type: 'string' }),
      ],
    }),
    defineField({
      name: 'mentionAttente',
      title: 'Mention d’attente',
      type: 'string',
      group: 'contenu',
      description: 'Affichée tant que prix et tailles ne sont pas renseignés.',
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Boutique' }) },
});

export const pageContact = defineType({
  name: 'pageContact',
  title: 'Page — Contact',
  type: 'document',
  icon: EnvelopeIcon,
  groups: groupesPage,
  fields: [
    ...champsEntete(),
    defineField({
      name: 'titreFormulaire',
      title: 'Titre du formulaire',
      type: 'string',
      group: 'contenu',
      initialValue: 'Écrire au club',
    }),
    defineField({
      name: 'motifs',
      title: 'Motifs de contact',
      type: 'array',
      group: 'contenu',
      of: [{ type: 'string' }],
      description: 'Les choix de la liste déroulante du formulaire.',
    }),
    champSeo,
  ],
  preview: { prepare: () => ({ title: 'Page — Contact' }) },
});
