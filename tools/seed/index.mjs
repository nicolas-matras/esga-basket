/**
 * Injecte le contenu initial dans Sanity.
 *
 * Idempotent : tous les documents ont un identifiant fixe et sont écrits en
 * `createOrReplace`. Rejouer le script remet le dataset dans l'état de départ
 * sans créer de doublon.
 *
 *   pnpm seed
 *
 * Nécessite SANITY_WRITE_TOKEN (droits Editor) dans le .env de la racine.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as contenu from './contenu.mjs';

const racine = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Lit le .env sans dépendance externe. */
function lireEnv() {
  const env = {};
  try {
    const texte = readFileSync(join(racine, '.env'), 'utf8');
    for (const ligne of texte.split('\n')) {
      const m = ligne.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    // pas de .env : on se rabat sur process.env
  }
  return { ...env, ...process.env };
}

const env = lireEnv();
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const jeton = env.SANITY_WRITE_TOKEN;
const apiVersion = '2021-06-07';

if (!projectId || !jeton) {
  console.error(
    'Il manque PUBLIC_SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN.\n' +
      'Lancez `pnpm setup:env` puis renseignez le fichier .env à la racine.',
  );
  process.exit(1);
}

const base = `https://${projectId}.api.sanity.io/v${apiVersion}`;
const entetes = { Authorization: `Bearer ${jeton}` };

/** Envoie un lot de mutations. */
async function muter(mutations) {
  const r = await fetch(`${base}/data/mutate/${dataset}?returnIds=true`, {
    method: 'POST',
    headers: { ...entetes, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  const corps = await r.json();
  if (!r.ok) {
    throw new Error(`Sanity a refusé la mutation (${r.status}) : ${JSON.stringify(corps).slice(0, 500)}`);
  }
  return corps;
}

/** Téléverse un fichier image et renvoie son identifiant d'asset. */
async function televerserImage(chemin, nomFichier) {
  const donnees = readFileSync(chemin);
  const r = await fetch(`${base}/assets/images/${dataset}?filename=${encodeURIComponent(nomFichier)}`, {
    method: 'POST',
    headers: { ...entetes, 'Content-Type': 'image/png' },
    body: donnees,
  });
  const corps = await r.json();
  if (!r.ok) throw new Error(`Téléversement refusé (${r.status}) : ${JSON.stringify(corps).slice(0, 300)}`);
  return corps.document._id;
}

async function principal() {
  console.log(`Projet ${projectId}, dataset ${dataset}.\n`);

  // 1. Le logo, seule image réelle fournie par la maquette.
  let idLogo = null;
  try {
    idLogo = await televerserImage(join(racine, 'maquette/assets/logo.png'), 'logo-esga.png');
    console.log(`  logo téléversé : ${idLogo}`);
  } catch (e) {
    console.warn(`  ! logo non téléversé : ${e.message}`);
  }

  const parametres = idLogo
    ? {
        ...contenu.parametres,
        logo: { _type: 'image', asset: { _type: 'reference', _ref: idLogo }, alt: 'ESGA Genas Azieu' },
      }
    : contenu.parametres;

  // 2. Les documents, dans l'ordre des dépendances : les références doivent exister.
  const lots = [
    ['Catégories', contenu.categories],
    ['Équipes', contenu.equipes],
    ['Compétitions', contenu.competitions],
    ['Classements', contenu.classements],
    ['Matchs', contenu.matchs],
    ['Actualités', contenu.actualites],
    ['Bureau', contenu.bureau],
    ['Tarifs', contenu.tarifs],
    ['Packs partenaires', contenu.packs],
    ['Pages', contenu.pages],
    ['Réglages', [parametres]],
  ];

  let total = 0;
  for (const [titre, documents] of lots) {
    await muter(documents.map((doc) => ({ createOrReplace: doc })));
    total += documents.length;
    console.log(`  ${titre.padEnd(20)} ${String(documents.length).padStart(2)} document(s)`);
  }

  console.log(`\n${total} documents écrits.`);
  console.log('Ouvrez le Studio : pnpm dev:studio');
}

principal().catch((e) => {
  console.error(`\nÉchec : ${e.message}`);
  process.exit(1);
});
