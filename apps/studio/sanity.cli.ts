import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  /*
    Nom d'hote du Studio en ligne : https://esga-basket.sanity.studio
    Il vit dans un espace de noms mondial, partage par tous les projets
    Sanity — d'ou le prefixe du club. Le changer donne une nouvelle URL.
  */
  studioHost: 'esga-basket',
  deployment: {
    // Sans cet identifiant, `sanity deploy` redemande a quelle application
    // publier — ce qui bloque un deploiement non interactif.
    appId: 'w7yv92halitz3n0id5r5578s',
  },
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  autoUpdates: true,
});
