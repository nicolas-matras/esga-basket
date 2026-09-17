import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// PUBLIC_SITE_URL est saisie à la main chez l'hébergeur : on ne lui fait pas
// confiance. Astro refuse de démarrer si `site` n'est pas une URL valide.
function siteValide(brute) {
  try {
    const u = new URL(brute ?? '');
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.origin : null;
  } catch {
    return null;
  }
}

const brute = process.env.PUBLIC_SITE_URL;
const site = siteValide(brute) ?? 'http://localhost:4321';
if (brute && !siteValide(brute)) {
  console.warn(
    `[astro.config] PUBLIC_SITE_URL vaut ${JSON.stringify(brute)}, qui n'est pas une URL absolue. Repli sur ${site}.`,
  );
}

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
