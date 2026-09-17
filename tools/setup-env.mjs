// Copie .env.example vers chaque app, sans jamais écraser un .env existant.
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const modele = join(racine, '.env.example');

if (!existsSync(modele)) {
  console.error('.env.example introuvable.');
  process.exit(1);
}

const cibles = [join(racine, '.env'), join(racine, 'apps/web/.env'), join(racine, 'apps/studio/.env')];

for (const cible of cibles) {
  if (existsSync(cible)) {
    console.log(`  = ${cible.replace(racine + '/', '')} existe déjà, laissé en place`);
    continue;
  }
  copyFileSync(modele, cible);
  console.log(`  + ${cible.replace(racine + '/', '')} créé`);
}

console.log('\nRenseignez PUBLIC_SANITY_PROJECT_ID et SANITY_STUDIO_PROJECT_ID pour démarrer.');
