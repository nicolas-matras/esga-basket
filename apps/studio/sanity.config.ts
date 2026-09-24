import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { presentationTool } from 'sanity/presentation';
import { structureTool } from 'sanity/structure';
import { schemaTypes, TYPES_UNIQUES } from './schemas';
import { actionsDocument, structure } from './structure';

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production';
const urlPreview = process.env.SANITY_STUDIO_PREVIEW_URL ?? 'http://localhost:4321';

if (!projectId) {
  throw new Error(
    'SANITY_STUDIO_PROJECT_ID manquant. Lancez `pnpm setup:env` puis renseignez le fichier .env.',
  );
}

export default defineConfig({
  name: 'esga',
  title: 'ESGA Basket',
  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    presentationTool({
      /*
        Pas de `previewMode` : il appelle une route serveur pour basculer le
        site en mode brouillon, or le site est statique (`output: 'static'`,
        sans adaptateur) et n'expose aucune route. L'onglet Presentation
        affiche donc le site PUBLIE a cote de l'edition, ce qui est utile,
        mais ne rend pas les brouillons non publies.
      */
      previewUrl: { origin: urlPreview, preview: '/' },
    }),
    visionTool({ defaultApiVersion: '2025-02-19' }),
  ],

  schema: {
    types: schemaTypes,
    // Les documents uniques n'apparaissent pas dans le menu « créer ».
    templates: (prev) =>
      prev.filter((t) => !(TYPES_UNIQUES as readonly string[]).includes(t.schemaType)),
  },

  document: {
    actions: actionsDocument,
  },
});
