/**
 * Branche « publier dans le Studio » sur « reconstruire le site ».
 *
 *   node tools/webhook-sanity.mjs
 *
 * Le site est statique : publier dans Sanity n'a aucun effet tant que les
 * pages ne sont pas refabriquées. Ce script crée le webhook qui prévient
 * GitHub, lequel reconstruit et redéploie.
 *
 * Il demande le jeton GitHub sur l'entrée standard plutôt qu'en argument :
 * un argument se retrouve dans l'historique du shell.
 *
 * Le jeton Sanity, lui, vient de la session du CLI (`sanity login`).
 */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const PROJET = 'cftz7b5y';
const DEPOT = 'nicolas-matras/esga-basket';
const NOM = 'Publication → reconstruction du site';

/*
  Les types écrits par la synchronisation FFBB sont volontairement absents :
  `match`, `classement` et `syncStatus`. La synchro déclenche déjà son propre
  déploiement ; les inclure ici en provoquerait un second par-dessus, et
  consommerait le quota de builds pour rien.
*/
const FILTRE =
  '_type in ["actualite","categorie","competition","equipe","membreBureau",' +
  '"packPartenaire","parametres","tarif"] || _type match "page*"';

function jetonSanity() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  try {
    const c = JSON.parse(readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'));
    if (c.authToken) return c.authToken;
  } catch {
    /* pas de session locale */
  }
  console.error('Aucune session Sanity. Lancer d’abord : npx sanity login');
  process.exit(1);
}

const base = `https://${PROJET}.api.sanity.io/v2021-10-04/hooks/projects/${PROJET}`;

async function sanity(chemin, options = {}) {
  const r = await fetch(`${base}${chemin}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${jetonSanity()}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`${r.status} — ${texte.slice(0, 400)}`);
  return texte ? JSON.parse(texte) : null;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const jetonGitHub = (
  await rl.question(
    'Jeton GitHub (Contents: Read and write sur ce dépôt)\n' +
      'À créer sur https://github.com/settings/personal-access-tokens/new\n> ',
  )
).trim();
rl.close();

if (!/^(github_pat_|ghp_)/.test(jetonGitHub)) {
  console.error('\nCe n’est pas un jeton GitHub (attendu : github_pat_… ou ghp_…).');
  process.exit(1);
}

// On vérifie le jeton AVANT de le confier à Sanity : un webhook qui échoue en
// silence est exactement ce qu'on cherche à éviter.
const essai = await fetch(`https://api.github.com/repos/${DEPOT}`, {
  headers: { Authorization: `Bearer ${jetonGitHub}`, Accept: 'application/vnd.github+json' },
});
if (!essai.ok) {
  console.error(`\nGitHub refuse ce jeton (${essai.status}). Vérifier le dépôt et la permission Contents.`);
  process.exit(1);
}
console.log(`\nJeton accepté par GitHub pour ${DEPOT}.`);

const corps = {
  type: 'document',
  name: NOM,
  description:
    'Le site est statique : publier ne change rien tant qu’il n’est pas ' +
    'reconstruit. Ce webhook prévient GitHub, qui reconstruit et redéploie. ' +
    'Les types écrits par la synchro FFBB sont exclus : elle déclenche déjà ' +
    'son propre déploiement.',
  url: `https://api.github.com/repos/${DEPOT}/dispatches`,
  dataset: 'production',
  rule: { on: ['create', 'update', 'delete'], filter: FILTRE, projection: '{"event_type": "contenu-publie"}' },
  apiVersion: 'v2021-03-25',
  httpMethod: 'POST',
  includeDrafts: false,
  headers: { Authorization: `Bearer ${jetonGitHub}`, Accept: 'application/vnd.github+json' },
  isDisabledByUser: false,
};

const existants = await sanity('');
const deja = (Array.isArray(existants) ? existants : []).find((h) => h.name === NOM);

const resultat = deja
  ? await sanity(`/${deja.id}`, { method: 'PUT', body: JSON.stringify(corps) })
  : await sanity('', { method: 'POST', body: JSON.stringify(corps) });

console.log(deja ? 'Webhook mis à jour.' : 'Webhook créé.');
console.log(`  identifiant : ${resultat?.id ?? deja?.id}`);
console.log('');
console.log('Pour vérifier : publier n’importe quoi dans le Studio, puis');
console.log(`  https://github.com/${DEPOT}/actions`);
console.log('Un job « Déploiement » doit démarrer dans les secondes qui suivent.');
