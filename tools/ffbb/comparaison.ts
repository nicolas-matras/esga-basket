/**
 * Confronte les calendriers saisis à la main aux données de la FFBB.
 *
 *   node tools/ffbb/comparaison.ts
 *
 * Contrôle croisé avant de supprimer la saisie manuelle : les 56 rencontres
 * transcrites depuis les feuilles FFBB photographiées doivent se retrouver à
 * l'identique dans l'API. Toute divergence signale une erreur — soit dans la
 * transcription, soit dans le parsing de l'API — et il vaut mieux la trouver
 * ici qu'après avoir effacé le point de comparaison.
 *
 * Lecture seule, aucun accès Sanity nécessaire.
 */
import { ClientFfbb } from './client.ts';
import { dateDebut, versEquipe } from './transformer.ts';
import { SF1, SM1, SM2, versMatchs } from '../seed/calendriers.mjs';

const CODE_CLUB = process.env.FFBB_CODE_CLUB ?? 'ARA0069090';

/** Nos trois calendriers saisis, et le code de compétition correspondant. */
const SAISIS = [
  { equipe: 'SM1', code: 'PRM', lignes: SM1, prefixe: 'sm1' },
  { equipe: 'SM2', code: 'DM3', lignes: SM2, prefixe: 'sm2' },
  { equipe: 'SF1', code: 'DF2', lignes: SF1, prefixe: 'sf1' },
];

/** Compare deux noms de club en ignorant casse, accents et ponctuation. */
function noyau(valeur: string): string {
  return valeur
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(basket|club|basketball|ie|ctc|entente)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Deux noms désignent-ils le même club ? Tolérant, mais jamais aveugle. */
function memeClub(a: string, b: string): boolean {
  const x = noyau(a);
  const y = noyau(b);
  if (!x || !y) return false;
  if (x === y) return true;
  // L'un contient l'autre : « falcons de pusignan 2 » vs « falcons de pusignan ».
  if (x.includes(y) || y.includes(x)) return true;
  // Sinon, au moins deux mots significatifs en commun.
  const motsX = new Set(x.split(' ').filter((m) => m.length > 3));
  const communs = [...new Set(y.split(' ').filter((m) => m.length > 3))].filter((m) => motsX.has(m));
  return communs.length >= 2;
}

const ffbb = new ClientFfbb(() => {});
await ffbb.authentifier();
const club = await ffbb.club(CODE_CLUB);
const engagements = await ffbb.engagements(club.id);

console.log('');
console.log('── Contrôle croisé : saisie manuelle vs FFBB ──');
console.log('');

let totalSaisis = 0;
let totalConcordants = 0;
const divergences: string[] = [];
const absents: string[] = [];

for (const bloc of SAISIS) {
  // On retrouve l'engagement par son code de compétition.
  let cible: { idPoule: string } | null = null;
  for (const e of engagements) {
    if (!e.idPoule) continue;
    const poule = await ffbb.poule(e.idPoule);
    const code = versEquipe(e, poule).ffbbCompetitionCode;
    if (code === bloc.code) {
      cible = { idPoule: e.idPoule };
      break;
    }
  }
  if (!cible) {
    console.log(`${bloc.equipe} (${bloc.code}) : engagement introuvable côté FFBB.`);
    continue;
  }

  const brutes = await ffbb.rencontres(cible.idPoule);
  const nôtres = brutes.filter(
    (r) =>
      String(r.idOrganismeEquipe1 ?? '') === club.id || String(r.idOrganismeEquipe2 ?? '') === club.id,
  );

  const saisis = versMatchs(bloc.lignes, {
    equipe: 'x',
    competition: 'y',
    prefixe: bloc.prefixe,
  }) as { journee: number; debut: string; domicile: boolean; adversaire: string }[];

  console.log(`${bloc.equipe} (${bloc.code}) — ${saisis.length} saisis, ${nôtres.length} chez la FFBB`);

  for (const s of saisis) {
    totalSaisis += 1;
    const f = nôtres.find((r) => Number(r.numeroJournee) === s.journee);
    if (!f) {
      absents.push(`${bloc.equipe} J${s.journee} — absent de la FFBB`);
      continue;
    }

    const debutFfbb = dateDebut(f);
    const domicileFfbb = String(f.idOrganismeEquipe1 ?? '') === club.id;
    const adversaireFfbb = (domicileFfbb ? f.nomEquipe2 : f.nomEquipe1) ?? '';

    const ecarts: string[] = [];
    if (debutFfbb !== s.debut) ecarts.push(`date saisie ${s.debut} ≠ FFBB ${debutFfbb}`);
    if (domicileFfbb !== s.domicile) {
      ecarts.push(`lieu saisi ${s.domicile ? 'domicile' : 'extérieur'} ≠ FFBB ${domicileFfbb ? 'domicile' : 'extérieur'}`);
    }
    if (!memeClub(s.adversaire, adversaireFfbb)) {
      ecarts.push(`adversaire saisi « ${s.adversaire} » ≠ FFBB « ${adversaireFfbb} »`);
    }

    if (ecarts.length === 0) totalConcordants += 1;
    else divergences.push(`${bloc.equipe} J${s.journee} : ${ecarts.join(' · ')}`);
  }
}

console.log('');
if (divergences.length > 0) {
  console.log(`DIVERGENCES (${divergences.length})`);
  for (const d of divergences) console.log(`  ⚠ ${d}`);
  console.log('');
}
if (absents.length > 0) {
  console.log(`ABSENTS DE LA FFBB (${absents.length})`);
  for (const a of absents) console.log(`  ? ${a}`);
  console.log('');
}

const taux = totalSaisis > 0 ? Math.round((totalConcordants / totalSaisis) * 100) : 0;
console.log(`${totalConcordants}/${totalSaisis} rencontres concordantes (${taux} %).`);
console.log(
  taux === 100
    ? 'La saisie manuelle et la FFBB disent exactement la même chose : la suppression est sans risque.'
    : 'Écarts à examiner avant de supprimer la saisie manuelle.',
);
