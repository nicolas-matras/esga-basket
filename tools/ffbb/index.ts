/**
 * Point d'entrée de la synchronisation FFBB.
 *
 *   node tools/ffbb/index.ts --dry-run   affiche ce qui changerait, n'écrit rien
 *   node tools/ffbb/index.ts             synchronise et déclenche un build si besoin
 *
 * Variables attendues (voir .env.example) :
 *   PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, SANITY_WRITE_TOKEN
 *   NETLIFY_BUILD_HOOK_URL   facultatif — sans lui, le site n'est pas reconstruit
 *   FFBB_CODE_CLUB           défaut : ARA0069090
 *
 * Aucun jeton FFBB n'est nécessaire : ils sont publics et récupérés à chaud.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ClientFfbb } from './client.ts';
import { ClientSanity, declencherBuild } from './sanity.ts';
import { synchroniser, type Rapport } from './sync.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Lit le .env local s'il existe ; en Action GitHub, tout vient de l'environnement. */
function lireEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    for (const ligne of readFileSync(join(racine, '.env'), 'utf8').split('\n')) {
      const m = ligne.match(/^([A-Z_][A-Z0-9_]*)="?([^"]*)"?\s*$/);
      if (m) env[m[1]] = m[2];
    }
  } catch {
    /* pas de .env : normal en CI */
  }
  return { ...env, ...(process.env as Record<string, string>) };
}

const env = lireEnv();
const simulation = process.argv.includes('--dry-run');
const horodater = () => new Date().toLocaleTimeString('fr-FR');
const journal = (m: string) => console.log(`[${horodater()}] ${m}`);

const projectId = env.PUBLIC_SANITY_PROJECT_ID ?? env.SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? env.SANITY_DATASET ?? 'production';
const jetonSanity = env.SANITY_WRITE_TOKEN;
const codeClub = env.FFBB_CODE_CLUB ?? 'ARA0069090';

if (!projectId || !jetonSanity) {
  console.error(
    'Il manque PUBLIC_SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN.\n' +
      'En local : pnpm setup:env puis renseigner .env.\n' +
      'En CI : les définir en secrets du dépôt.',
  );
  process.exit(1);
}

const ffbb = new ClientFfbb(journal);
const sanity = new ClientSanity(projectId, dataset, jetonSanity, simulation);

console.log('');
journal(
  simulation
    ? '── SIMULATION — aucune écriture dans Sanity, aucun build ──'
    : '── Synchronisation FFBB ──',
);

let rapport: Rapport;
try {
  rapport = await synchroniser(ffbb, sanity, { codeClub, simulation, journal });
} catch (cause) {
  const message = (cause as Error).message;
  journal(`ÉCHEC : ${message}`);

  /*
    Même en échec on écrit le journal : c'est précisément le cas où quelqu'un
    doit pouvoir constater, depuis le Studio, que la synchro ne tourne plus.
    Une panne silencieuse laisserait le site figé sans que personne ne le voie.
  */
  if (!simulation) {
    await sanity
      .muter([
        {
          createOrReplace: {
            _id: 'syncStatus',
            _type: 'syncStatus',
            derniereExecution: new Date().toISOString(),
            statut: 'erreur',
            erreurs: [message],
            messages: [],
          },
        },
      ])
      .catch((e) => journal(`Journal non écrit : ${(e as Error).message}`));
  }
  process.exit(1);
}

// --- Compte rendu ------------------------------------------------------------
console.log('');
journal(`Engagements traités   : ${rapport.engagementsTraites}`);
journal(`Équipes mises à jour  : ${rapport.equipesMisesAJour}`);
journal(`Classements           : ${rapport.classementsMisAJour}`);
journal(`Rencontres            : ${rapport.rencontresMisesAJour}`);
journal(`Appels FFBB           : ${ffbb.appels}`);
journal(`Durée                 : ${(rapport.dureeMs / 1000).toFixed(1)}s`);
if (rapport.erreurs.length > 0) {
  console.log('');
  journal(`${rapport.erreurs.length} avertissement(s) :`);
  for (const e of rapport.erreurs) journal(`  • ${e}`);
}

if (simulation) {
  console.log('');
  journal('Simulation terminée. Relancer sans --dry-run pour écrire.');
  process.exit(0);
}

// --- Journal dans le Studio --------------------------------------------------
const precedent = await sanity
  .interroger<{ derniereReussite?: string } | null>('*[_id == "syncStatus"][0]{derniereReussite}')
  .catch(() => null);

await sanity.muter([
  {
    createOrReplace: {
      _id: 'syncStatus',
      _type: 'syncStatus',
      derniereExecution: new Date().toISOString(),
      derniereReussite: new Date().toISOString(),
      statut: rapport.statut,
      dureeMs: rapport.dureeMs,
      engagementsTraites: rapport.engagementsTraites,
      classementsMisAJour: rapport.classementsMisAJour,
      rencontresMisesAJour: rapport.rencontresMisesAJour,
      buildDeclenche: false,
      saison: rapport.saison,
      messages: rapport.messages.slice(-60),
      erreurs: rapport.erreurs,
      ...(precedent?.derniereReussite ? {} : {}),
    },
  },
]);

// --- Build, uniquement si quelque chose a bougé ------------------------------
if (!rapport.aChange) {
  journal('Rien n’a changé : pas de build.');
  process.exit(0);
}

const hook = env.NETLIFY_BUILD_HOOK_URL;
if (!hook) {
  journal('NETLIFY_BUILD_HOOK_URL absent : Sanity est à jour mais le site ne sera pas reconstruit.');
  process.exit(0);
}

const ok = await declencherBuild(hook, 'Synchronisation FFBB');
journal(ok ? 'Build Netlify déclenché.' : 'Le build hook a refusé la demande.');
await sanity
  .muter([{ patch: { id: 'syncStatus', set: { buildDeclenche: ok } } }])
  .catch(() => {});
process.exit(ok ? 0 : 1);
