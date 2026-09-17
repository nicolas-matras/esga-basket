import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

const site = process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  // Site statique : tout le contenu vient de Sanity au build.
  output: 'static',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
  vite: {
    build: { cssMinify: 'lightningcss' },
  },
});
