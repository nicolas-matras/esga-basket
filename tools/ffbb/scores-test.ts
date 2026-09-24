/**
 * Pose des scores FICTIFS sur la 1re journée, pour voir le rendu du site.
 *
 *   node tools/ffbb/scores-test.ts            pose les scores
 *   node tools/ffbb/scores-test.ts --retirer  les enlève
 *
 * La saison n'a pas commencé : aucune rencontre n'a de score, donc les blocs
 * « résultats », « forme » et « classement » du site ne se montrent jamais.
 * Ce script simule un week-end joué pour vérifier que chaque élément apparaît
 * au bon endroit.
 *
 * À RETIRER avant l'ouverture au public. Les scores posés ici sont marqués
 * d'une note explicite, et la prochaine synchro les remplacera dès que la
 * FFBB publiera les vrais.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ClientSanity, type Mutation } from './sanity.ts';

const racine = join(dirname(fileURLToPath(import.meta.url)), '../..');

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
const retirer = process.argv.includes('--retirer');
const projectId = env.PUBLIC_SANITY_PROJECT_ID ?? env.SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? env.SANITY_DATASET ?? 'production';
const jeton = env.SANITY_WRITE_TOKEN;

if (!projectId || !jeton) {
  console.error('Il manque PUBLIC_SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN.');
  process.exit(1);
}

const sanity = new ClientSanity(projectId, dataset, jeton);
const NOTE = 'Score de test — la saison n’a pas commencé';

/** Le week-end de la 1re journée. */
const DEBUT = '2026-09-19T00:00:00Z';
const FIN = '2026-09-22T00:00:00Z';

type Rencontre = { _id: string; adversaire?: string; domicile?: boolean; debut?: string; equipe?: { nom?: string } };

const rencontres = await sanity.interroger<Rencontre[]>(
  `*[_type == "match" && debut >= "${DEBUT}" && debut < "${FIN}"] | order(debut asc){
     _id, adversaire, domicile, debut, equipe->{nom}
   }`,
);

console.log('');
console.log(`${rencontres.length} rencontres sur le week-end du 19 au 21 septembre.`);
console.log('');

if (retirer) {
  const mutations: Mutation[] = rencontres.map((r) => ({
    patch: { id: r._id, unset: ['scoreEsga', 'scoreAdverse', 'note'], set: { statut: 'a-venir' } },
  }));
  const n = await sanity.muter(mutations);
  console.log(`Scores de test retirés (${n} mutations acquittées).`);
  process.exit(0);
}

/**
 * Scores plausibles et déterministes.
 *
 * Déterministes pour que rejouer le script donne le même résultat, et variés
 * pour que la carte de match montre ce qu'elle sait faire : une large victoire,
 * un match serré, une défaite, un écart moyen. Un tirage aléatoire donnerait
 * souvent quatre scores qui se ressemblent et ne prouverait rien.
 */
const MOTIFS: [number, number][] = [
  [78, 64], // victoire nette
  [67, 65], // victoire d'un souffle
  [59, 72], // défaite
  [81, 55], // démonstration
  [70, 70], // égalité — cas limite du rail
  [62, 68], // défaite serrée
];

const mutations: Mutation[] = rencontres.map((r, i) => {
  const [a, b] = MOTIFS[i % MOTIFS.length];
  return {
    patch: {
      id: r._id,
      set: { scoreEsga: a, scoreAdverse: b, statut: 'termine', note: NOTE },
    },
  };
});

for (const [i, r] of rencontres.entries()) {
  const [a, b] = MOTIFS[i % MOTIFS.length];
  const issue = a > b ? 'V' : a < b ? 'D' : 'N';
  console.log(
    `  ${issue} ${String(a).padStart(3)}–${String(b).padEnd(3)} ${(r.equipe?.nom ?? '—').padEnd(8)} ${r.domicile ? 'reçoit' : 'à     '} ${(r.adversaire ?? '').slice(0, 40)}`,
  );
}

const acquittes = await sanity.muter(mutations);
console.log('');
console.log(`${acquittes} mutations acquittées par Sanity.`);

// La mise en ligne est enchaînée par le workflow, pas appelée d'ici :
// voir .github/workflows/ffbb-scores-test.yml.
console.log('Sanity est à jour. Le déploiement suit dans le job suivant.');
