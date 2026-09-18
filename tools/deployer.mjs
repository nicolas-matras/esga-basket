/**
 * Déploie le site DÉJÀ CONSTRUIT sur Netlify, sans déclencher de build.
 *
 *   pnpm build && node tools/deployer.mjs
 *
 * Pourquoi : le plan gratuit de Netlify facture les minutes de build en
 * crédits, et le compte peut les épuiser — les déploiements sont alors
 * « skipped », silencieusement, pendant que le site continue de servir
 * l'ancienne version.
 *
 * Ici le build a lieu sur la machine qui lance le script ; Netlify ne reçoit
 * que des fichiers. C'est un dépannage, pas le fonctionnement normal : la
 * synchronisation FFBB automatique, elle, a besoin d'un build Netlify.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const dossier = join(racine, 'apps/web/dist');

function lireEnv() {
  const env = {};
  try {
    for (const ligne of readFileSync(join(racine, '.env'), 'utf8').split('\n')) {
      const m = ligne.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    /* pas de .env */
  }
  return { ...env, ...process.env };
}

const env = lireEnv();
const jeton = env.NETLIFY_AUTH_TOKEN;
const siteId = env.NETLIFY_SITE_ID;

if (!jeton || !siteId) {
  console.error('NETLIFY_AUTH_TOKEN ou NETLIFY_SITE_ID manquant dans .env');
  process.exit(1);
}

/** Tous les fichiers du dossier, indexés par leur chemin web. */
function parcourir(base, courant = base, acc = new Map()) {
  for (const entree of readdirSync(courant)) {
    const chemin = join(courant, entree);
    if (statSync(chemin).isDirectory()) parcourir(base, chemin, acc);
    else acc.set('/' + relative(base, chemin).split(sep).join('/'), chemin);
  }
  return acc;
}

const fichiers = parcourir(dossier);
const empreintes = {};
const parEmpreinte = new Map();
for (const [url, chemin] of fichiers) {
  const contenu = readFileSync(chemin);
  const sha = createHash('sha1').update(contenu).digest('hex');
  empreintes[url] = sha;
  // Plusieurs URL peuvent partager un contenu : Netlify ne le demande qu'une fois.
  if (!parEmpreinte.has(sha)) parEmpreinte.set(sha, chemin);
}
console.log(`${fichiers.size} fichiers, ${parEmpreinte.size} contenus distincts.`);

async function netlify(chemin, options = {}) {
  const r = await fetch(`https://api.netlify.com/api/v1${chemin}`, {
    ...options,
    headers: { Authorization: `Bearer ${jeton}`, ...(options.headers ?? {}) },
  });
  const texte = await r.text();
  if (!r.ok) throw new Error(`${chemin} → ${r.status} : ${texte.slice(0, 300)}`);
  return texte ? JSON.parse(texte) : null;
}

// 1. On annonce l'arborescence ; Netlify répond ce qui lui manque.
const deploiement = await netlify(`/sites/${siteId}/deploys`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ files: empreintes, draft: false }),
});
const requis = deploiement.required ?? [];
console.log(`Déploiement ${deploiement.id} créé — ${requis.length} fichiers à téléverser.`);

// 2. On n'envoie que ce qui manque.
let envoyes = 0;
for (const sha of requis) {
  const chemin = parEmpreinte.get(sha);
  if (!chemin) continue;
  const url = [...fichiers.entries()].find(([, c]) => c === chemin)?.[0];
  await netlify(`/deploys/${deploiement.id}/files${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: readFileSync(chemin),
  });
  envoyes += 1;
  if (envoyes % 10 === 0) console.log(`  ${envoyes}/${requis.length}`);
}
console.log(`${envoyes} fichiers téléversés.`);

// 3. On attend l'état final. Un 200 à la création ne veut pas dire « en ligne ».
for (let i = 0; i < 40; i += 1) {
  const etat = await netlify(`/deploys/${deploiement.id}`);
  if (etat.state === 'ready') {
    console.log(`\nEn ligne : ${etat.ssl_url ?? etat.deploy_ssl_url}`);
    process.exit(0);
  }
  if (etat.state === 'error') {
    console.error(`\nÉchec : ${etat.error_message}`);
    process.exit(1);
  }
  await new Promise((r) => setTimeout(r, 3000));
}
console.error('\nLe déploiement n’a pas abouti dans le temps imparti.');
process.exit(1);
