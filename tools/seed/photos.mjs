/**
 * Injecte des PHOTOS DE DÉMONSTRATION pour projeter le rendu du site.
 *
 *   pnpm seed:photos          pose les photos
 *   pnpm seed:photos --retirer  les enlève
 *
 * Ce sont des images libres d'Unsplash et des portraits de substitution : elles
 * ne montrent ni le club, ni ses licenciés, ni son gymnase. Leur texte
 * alternatif le dit explicitement, pour que personne ne les prenne pour des
 * photos du club et qu'un `grep` les retrouve toutes le jour du remplacement.
 *
 * Volontairement séparé de `pnpm seed` : le contenu réel et le décor de
 * démonstration n'ont pas la même durée de vie.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = join(dirname(fileURLToPath(import.meta.url)), '../..');

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
const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || 'production';
const jeton = env.SANITY_WRITE_TOKEN;

if (!projectId || !jeton) {
  console.error('PUBLIC_SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN manquant dans .env');
  process.exit(1);
}

const base = `https://${projectId}.api.sanity.io/v2021-06-07`;
const entetes = { Authorization: `Bearer ${jeton}` };
const MENTION = 'Photo de démonstration — à remplacer par une photo du club';

/** Les images retenues, après inspection visuelle de chacune. */
const UNSPLASH = {
  match: 'photo-1577471488278-16eec37ffcc2', // rencontre en salle, joueurs
  dunk: 'photo-1608245449230-4ac19066d2d0', // dunk, ambiance sombre
  tribunes: 'photo-1504450758481-7338eba7524a', // salle et tribunes
  panier: 'photo-1546519638-68e109498ffc', // ballon qui entre
  ballons: 'photo-1574623452334-1e0ac2b3ccb4', // ballons alignés
  ballon: 'photo-1627627256672-027a4613d028', // gros plan
  exterieur: 'photo-1519861531473-9200262188bf', // playground
};

const PORTRAITS = ['men/32', 'women/44', 'men/76', 'women/68', 'men/51'];

async function muter(mutations) {
  const r = await fetch(`${base}/data/mutate/${dataset}`, {
    method: 'POST',
    headers: { ...entetes, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  });
  const corps = await r.json();
  if (!r.ok) throw new Error(`mutation refusée (${r.status}) ${JSON.stringify(corps).slice(0, 300)}`);
  return corps;
}

async function interroger(requete) {
  const r = await fetch(`${base}/data/query/${dataset}?query=${encodeURIComponent(requete)}`, {
    headers: entetes,
  });
  const c = await r.json();
  if (!r.ok) throw new Error(`requête refusée (${r.status})`);
  return c.result;
}

/** Télécharge une URL et la téléverse comme asset Sanity. Renvoie son _id. */
async function televerser(url, nom) {
  const reponse = await fetch(url);
  if (!reponse.ok) throw new Error(`téléchargement ${reponse.status} pour ${nom}`);
  const octets = Buffer.from(await reponse.arrayBuffer());
  const r = await fetch(`${base}/assets/images/${dataset}?filename=${encodeURIComponent(nom)}`, {
    method: 'POST',
    headers: { ...entetes, 'Content-Type': 'image/jpeg' },
    body: octets,
  });
  const c = await r.json();
  if (!r.ok) throw new Error(`téléversement ${r.status} pour ${nom}`);
  return c.document._id;
}

const image = (ref, alt) => ({
  _type: 'image',
  asset: { _type: 'reference', _ref: ref },
  alt: `${alt} — ${MENTION}`,
});

async function poser() {
  console.log('Téléversement des photos de démonstration…\n');

  const assets = {};
  for (const [cle, id] of Object.entries(UNSPLASH)) {
    assets[cle] = await televerser(
      `https://images.unsplash.com/${id}?w=1600&q=75&fm=jpg`,
      `demo-${cle}.jpg`,
    );
    console.log(`  ${cle.padEnd(10)} ${assets[cle]}`);
  }

  const portraits = [];
  for (const p of PORTRAITS) {
    portraits.push(
      await televerser(
        `https://randomuser.me/api/portraits/${p}.jpg`,
        `demo-portrait-${p.replace('/', '-')}.jpg`,
      ),
    );
  }
  console.log(`  portraits  ${portraits.length}\n`);

  const mutations = [
    { patch: { id: 'pageAccueil', set: { photo: image(assets.match, "Rencontre à domicile") } } },
    {
      patch: {
        id: 'pageClub',
        set: {
          photos: [
            { _key: 'p1', ...image(assets.dunk, 'Action de jeu') },
            { _key: 'p2', ...image(assets.tribunes, 'Tribunes du gymnase') },
          ],
        },
      },
    },
    { patch: { id: 'act-reprise-ecole', set: { image: image(assets.ballons, "École de basket") } } },
    { patch: { id: 'act-sm1-pre-regionale', set: { image: image(assets.match, 'Séniors masculins') } } },
    { patch: { id: 'act-tournoi', set: { image: image(assets.panier, 'Tournoi du club') } } },
    { patch: { id: 'act-textile', set: { image: image(assets.ballon, 'Collection du club') } } },
    { patch: { id: 'act-arbitres', set: { image: image(assets.exterieur, 'Formation arbitrage') } } },
    { patch: { id: 'eq-sm1', set: { photo: image(assets.dunk, 'Équipe SM1') } } },
    { patch: { id: 'eq-sm2', set: { photo: image(assets.match, 'Équipe SM2') } } },
    { patch: { id: 'eq-sf1', set: { photo: image(assets.tribunes, 'Équipe SF1') } } },
    { patch: { id: 'eq-u18m1', set: { photo: image(assets.exterieur, 'Équipe U18M 1') } } },
    { patch: { id: 'eq-u15f', set: { photo: image(assets.ballons, 'Équipe U15F') } } },
  ];

  const bureau = await interroger('*[_type == "membreBureau"] | order(ordre asc)._id');
  bureau.forEach((id, i) => {
    if (portraits[i]) {
      mutations.push({ patch: { id, set: { portrait: image(portraits[i], 'Portrait') } } });
    }
  });

  await muter(mutations);
  console.log(`${mutations.length} documents illustrés.`);
  console.log('\nToutes les légendes portent la mention « photo de démonstration ».');
  console.log('Pour les retirer : pnpm seed:photos --retirer');
}

async function retirer() {
  const cibles = [
    ...(await interroger('*[_type == "actualite"]._id')),
    ...(await interroger('*[_type == "equipe"]._id')),
    ...(await interroger('*[_type == "membreBureau"]._id')),
  ];
  const mutations = [
    { patch: { id: 'pageAccueil', unset: ['photo'] } },
    { patch: { id: 'pageClub', unset: ['photos'] } },
    ...cibles.map((id) => ({ patch: { id, unset: ['image', 'photo', 'portrait'] } })),
  ];
  await muter(mutations);
  console.log(`Photos de démonstration retirées de ${mutations.length} documents.`);
}

const action = process.argv.includes('--retirer') ? retirer : poser;
action().catch((e) => {
  console.error(`\nÉchec : ${e.message}`);
  process.exit(1);
});
