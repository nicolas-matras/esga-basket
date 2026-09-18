/**
 * Rapproche les équipes saisies à la main des engagements FFBB.
 *
 *   node tools/ffbb/migration.ts --dry-run   rapport seul, n'écrit rien
 *   node tools/ffbb/migration.ts             pose les identifiants FFBB
 *
 * À lancer UNE FOIS, avant la première vraie synchronisation. Sans ce
 * rattachement, la synchro créerait un second jeu d'équipes à côté de celles
 * déjà saisies : deux « SM1 » dans le Studio, et les photos, coachs et
 * créneaux restés sur la mauvaise.
 *
 * Le script ne touche QUE les identifiants de synchronisation. Il ne renomme
 * rien, ne supprime rien, et laisse intact tout ce qui est éditorial.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ClientFfbb } from './client.ts';
import { ClientSanity, type Mutation } from './sanity.ts';
import { libelleChampionnat, rapprocher, versEquipe, type EquipeExistante } from './transformer.ts';

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
const simulation = process.argv.includes('--dry-run');
const journal = (m: string) => console.log(m);

const projectId = env.PUBLIC_SANITY_PROJECT_ID ?? env.SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? env.SANITY_DATASET ?? 'production';
const jetonSanity = env.SANITY_WRITE_TOKEN;
const codeClub = env.FFBB_CODE_CLUB ?? 'ARA0069090';

if (!projectId || !jetonSanity) {
  console.error('Il manque PUBLIC_SANITY_PROJECT_ID ou SANITY_WRITE_TOKEN.');
  process.exit(1);
}

const ffbb = new ClientFfbb(() => {});
const sanity = new ClientSanity(projectId, dataset, jetonSanity, simulation);

console.log('');
console.log(simulation ? '── MIGRATION (simulation) ──' : '── MIGRATION ──');
console.log('');

// --- 1. Les équipes déjà en base --------------------------------------------
const equipes = await sanity.interroger<EquipeExistante[]>(
  '*[_type == "equipe"]{_id, nom, championnat, ffbbEngagementId} | order(nom asc)',
);
journal(`${equipes.length} équipes déjà saisies dans Sanity.`);

// --- 2. Les engagements FFBB -------------------------------------------------
await ffbb.authentifier();
const club = await ffbb.club(codeClub);
const engagements = await ffbb.engagements(club.id);
if (engagements.length === 0) {
  console.error('Aucun engagement renvoyé par la FFBB : on ne migre rien.');
  process.exit(1);
}
journal(`${engagements.length} engagements chez la FFBB.`);
journal('');

// --- 3. Rapprochement --------------------------------------------------------
// On résout les poules d'abord : le libellé de championnat en dépend.
const resolus: { id: string; championnat: string; code?: string; nom: string }[] = [];
for (const engagement of engagements) {
  let championnat = '';
  let code: string | undefined;
  if (engagement.idPoule) {
    try {
      const poule = await ffbb.poule(engagement.idPoule);
      const equipe = versEquipe(engagement, poule);
      championnat = equipe.championnat ?? '';
      code = equipe.ffbbCompetitionCode;
    } catch {
      championnat = libelleChampionnat(engagement.codeAbrege, null);
      code = engagement.codeAbrege ?? undefined;
    }
  }
  resolus.push({
    id: engagement.id,
    championnat,
    code,
    nom: engagement.nomUsuel ?? engagement.nomOfficiel ?? '—',
  });
}

const dejaPrises = new Set<string>();
const rapprochements = resolus.map((r) => {
  // Une équipe ne peut recevoir qu'un engagement : on retire au fur et à mesure.
  const disponibles = equipes.filter((e) => !dejaPrises.has(e._id));
  const resultat = rapprocher(r, disponibles);
  if (resultat.equipeId) dejaPrises.add(resultat.equipeId);
  return resultat;
});

// --- 4. Rapport ---------------------------------------------------------------
const apparies = rapprochements.filter((r) => r.equipeId);
const orphelins = rapprochements.filter((r) => !r.equipeId);
const equipesSansEngagement = equipes.filter((e) => !dejaPrises.has(e._id));

const largeur = Math.max(...rapprochements.map((r) => r.championnat.length), 24);
journal('RAPPROCHÉES');
for (const r of apparies) {
  journal(`  ✓ ${r.championnat.padEnd(largeur)} → ${r.equipeNom ?? r.equipeId}   (par ${r.motif})`);
}

if (orphelins.length > 0) {
  journal('');
  journal('SANS ÉQUIPE EXISTANTE — seront créées à la première synchronisation');
  for (const r of orphelins) {
    journal(`  + ${r.championnat.padEnd(largeur)} (${r.code ?? '?'})`);
  }
}

if (equipesSansEngagement.length > 0) {
  journal('');
  journal('ÉQUIPES SANS ENGAGEMENT FFBB — à relier à la main dans le Studio');
  for (const e of equipesSansEngagement) {
    journal(`  ? ${(e.championnat ?? '—').padEnd(largeur)} ${e.nom ?? e._id}`);
  }
}

journal('');
journal(
  `${apparies.length} rapprochées · ${orphelins.length} à créer · ${equipesSansEngagement.length} à relier à la main`,
);

// --- 5. Écriture --------------------------------------------------------------
const mutations: Mutation[] = apparies
  .filter((r) => r.motif !== 'engagement') // déjà rattachées : rien à écrire
  .map((r) => ({
    patch: {
      id: r.equipeId as string,
      set: { ffbbEngagementId: r.engagementId, syncSource: 'ffbb' },
    },
  }));

if (mutations.length === 0) {
  journal('');
  journal('Rien à écrire : tout est déjà rattaché.');
  process.exit(0);
}

if (simulation) {
  journal('');
  journal(`${mutations.length} rattachements à poser. Relancer sans --dry-run pour écrire.`);
  process.exit(0);
}

await sanity.muter(mutations);
journal('');
journal(`${mutations.length} rattachements posés.`);
journal('La synchronisation mettra désormais à jour ces équipes au lieu d’en créer d’autres.');
