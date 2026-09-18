/**
 * Tests du parsing et de la logique de diff.
 *
 *   node --test tools/ffbb/
 *
 * Aucun réseau : on teste les règles, pas la FFBB. Les jeux de données
 * viennent de réponses réelles relevées pendant l'exploration.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  calculerForme,
  dateDebut,
  decalageParis,
  deduireCategorie,
  empreinte,
  libelleChampionnat,
  nombre,
  versLignesClassement,
  versMatch,
  normaliser,
  rapprocher,
  type MatchSanity,
} from './transformer.ts';

test('les nombres de la FFBB sont des chaînes', () => {
  assert.equal(nombre('0'), 0);
  assert.equal(nombre('42'), 42);
  assert.equal(nombre('-7'), -7);
  assert.equal(nombre(''), undefined);
  assert.equal(nombre(null), undefined);
  assert.equal(nombre(undefined), undefined);
  assert.equal(nombre('abc'), undefined);
  // Zéro est une valeur, pas une absence : la distinction compte pour un
  // classement de pré-saison, où tout est à zéro mais valide.
  assert.notEqual(nombre('0'), undefined);
});

test('déduction de la catégorie depuis le code de compétition', () => {
  const cas: [string, string, string, boolean][] = [
    // code, catégorie, genre, coupe
    ['PRM', 'seniors', 'M', false],
    ['DM3', 'seniors', 'M', false],
    ['DF2', 'seniors', 'F', false],
    ['DMU18-2', 'u18', 'M', false],
    ['DMU18-6', 'u18', 'M', false],
    ['DFU15', 'u15', 'F', false],
    ['DMU15-3', 'u15', 'M', false],
    ['DFU13-2', 'u13', 'F', false],
    ['DFU11-3', 'u11', 'F', false],
    ['DFU9-2', 'u9', 'F', false],
    ['DMU9-3', 'u9', 'M', false],
    // Coupes du Rhône — la FFBB écrit CRML et CMRL selon les équipes.
    ['CRMLSF', 'seniors', 'F', true],
    ['CRMLSM', 'seniors', 'M', true],
    ['CRMLU18F', 'u18', 'F', true],
    ['CMRLU13M', 'u13', 'M', true],
  ];
  for (const [code, categorie, genre, estCoupe] of cas) {
    const r = deduireCategorie(code);
    assert.equal(r.categorie, categorie, `catégorie de ${code}`);
    assert.equal(r.genre, genre, `genre de ${code}`);
    assert.equal(r.estCoupe, estCoupe, `coupe pour ${code}`);
  }
});

test('un code inconnu ne fait pas planter', () => {
  const r = deduireCategorie(null);
  assert.equal(r.categorie, 'seniors');
  assert.equal(r.genre, 'X');
});

test('libellé de championnat', () => {
  assert.equal(libelleChampionnat('PRM', 'Poule A2'), 'PRM Poule A2');
  assert.equal(libelleChampionnat('DF2', null), 'DF2');
  assert.equal(libelleChampionnat(null, null), '');
});

test('le décalage de Paris suit l’heure d’été', () => {
  assert.equal(decalageParis(2026, 9, 20), '+02:00', 'septembre : heure d’été');
  assert.equal(decalageParis(2026, 12, 12), '+01:00', 'décembre : heure d’hiver');
  assert.equal(decalageParis(2027, 1, 9), '+01:00', 'janvier : heure d’hiver');
  // Bascules 2026 : 29 mars et 25 octobre.
  assert.equal(decalageParis(2026, 3, 28), '+01:00', 'la veille du passage');
  assert.equal(decalageParis(2026, 3, 29), '+02:00', 'le jour du passage');
  assert.equal(decalageParis(2026, 10, 24), '+02:00', 'la veille du retour');
  assert.equal(decalageParis(2026, 10, 25), '+01:00', 'le jour du retour');
});

test('la date FFBB est une heure locale, pas de l’UTC', () => {
  // Relevé réel : la PRM joue à 10h45 le 20 septembre.
  const d = dateDebut({ id: '1', date_rencontre: '2026-09-20T10:45:00' });
  assert.equal(d, '2026-09-20T10:45:00+02:00');
  // La lire comme de l'UTC donnerait 12h45 à l'affichage : c'est le bug qu'on évite.
  assert.equal(new Date(d as string).getUTCHours(), 8);
});

test('une rencontre sans horaire retombe sur la date seule', () => {
  assert.equal(dateDebut({ id: '1', date: '2027-01-09' }), '2027-01-09T00:00:00+01:00');
  assert.equal(dateDebut({ id: '1' }), null);
});

test('seules nos rencontres sont retenues', () => {
  const base = {
    id: '999',
    numeroJournee: '1',
    date_rencontre: '2026-09-20T10:45:00',
    idPoule: 'P1',
    nomEquipe1: 'VAULX EN VELIN - 4',
    nomEquipe2: 'AUTRE CLUB',
  };
  // Rencontre entre deux clubs tiers : ignorée.
  assert.equal(versMatch({ ...base, idOrganismeEquipe1: '11214', idOrganismeEquipe2: '11167' }, '11150', { idPoule: 'P1' }), null);

  // À domicile.
  const dom = versMatch(
    { ...base, idOrganismeEquipe1: '11150', idOrganismeEquipe2: '11167', nomEquipe1: 'ESGA', nomEquipe2: 'ADVERSAIRE' },
    '11150',
    { idPoule: 'P1' },
  );
  assert.equal(dom?.domicile, true);
  assert.equal(dom?.adversaire, 'ADVERSAIRE');
  assert.equal(dom?._id, 'rencontre-999');

  // À l'extérieur : l'adversaire est l'équipe 1.
  const ext = versMatch(
    { ...base, idOrganismeEquipe1: '11167', idOrganismeEquipe2: '11150', nomEquipe1: 'ADVERSAIRE', nomEquipe2: 'ESGA' },
    '11150',
    { idPoule: 'P1' },
  );
  assert.equal(ext?.domicile, false);
  assert.equal(ext?.adversaire, 'ADVERSAIRE');
});

test('le score est rapporté du point de vue du club', () => {
  const base = {
    id: '1',
    date_rencontre: '2026-09-20T20:30:00',
    idOrganismeEquipe1: '11167',
    idOrganismeEquipe2: '11150',
    nomEquipe1: 'ADVERSAIRE',
    nomEquipe2: 'ESGA',
    resultatEquipe1: '49',
    resultatEquipe2: '52',
  };
  const m = versMatch(base, '11150', { idPoule: 'P1' });
  assert.equal(m?.statut, 'termine');
  assert.equal(m?.scoreEsga, 52, 'notre score, même en étant équipe 2');
  assert.equal(m?.scoreAdverse, 49);
});

test('une rencontre sans score reste à venir', () => {
  const m = versMatch(
    { id: '1', date_rencontre: '2026-09-20T20:30:00', idOrganismeEquipe1: '11150', idOrganismeEquipe2: '1', nomEquipe2: 'X' },
    '11150',
    { idPoule: 'P1' },
  );
  assert.equal(m?.statut, 'a-venir');
  assert.equal(m?.scoreEsga, undefined);
});

test('un score 0-0 compte comme joué', () => {
  // Forfait double : les deux scores existent, la rencontre a bien eu lieu.
  const m = versMatch(
    {
      id: '1',
      date_rencontre: '2026-09-20T20:30:00',
      idOrganismeEquipe1: '11150',
      idOrganismeEquipe2: '1',
      nomEquipe2: 'X',
      resultatEquipe1: '0',
      resultatEquipe2: '0',
    },
    '11150',
    { idPoule: 'P1' },
  );
  assert.equal(m?.statut, 'termine');
  assert.equal(m?.scoreEsga, 0);
});

test('lignes de classement : tri, conversion, repérage du club', () => {
  // Extrait réel de la poule A2 de PRM, en pré-saison : tout à zéro.
  const lignes = versLignesClassement(
    [
      { id: 'a', position: '3', organisme: '11150', organisme_nom: 'EVEIL SPORTIF GENAS AZIEU', points: '0', matchJoues: '0', difference: '0' },
      { id: 'b', position: '1', organisme: '11214', organisme_nom: 'VAULX EN VELIN - 4', points: '0', matchJoues: '0', difference: '0' },
      { id: 'c', position: '2', organisme: '11167', organisme_nom: 'AUTRE', points: '0', matchJoues: '0', difference: '0' },
    ],
    '11150',
  );
  assert.deepEqual(lignes.map((l) => l.rang), [1, 2, 3], 'trié par rang');
  assert.equal(lignes[2].estESGA, true);
  assert.equal(lignes[0].estESGA, false);
  assert.equal(lignes[2].points, 0, 'zéro est une valeur');
  assert.equal(lignes[2].joues, 0);
});

test('matchJoues a deux orthographes côté FFBB', () => {
  const [a] = versLignesClassement([{ id: 'a', position: '1', match_joues: '7' }], '11150');
  assert.equal(a.joues, 7);
  const [b] = versLignesClassement([{ id: 'b', position: '1', matchJoues: '5', match_joues: '9' }], '11150');
  assert.equal(b.joues, 5, 'matchJoues prime');
});

test('forme récente, du plus ancien au plus récent', () => {
  const m = (debut: string, nous: number, eux: number): MatchSanity => ({
    _id: debut,
    _type: 'match',
    adversaire: 'X',
    debut,
    domicile: true,
    statut: 'termine',
    scoreEsga: nous,
    scoreAdverse: eux,
    syncSource: 'ffbb',
  });
  const matchs = [
    m('2026-10-03T20:30:00+02:00', 60, 70), // D
    m('2026-09-19T20:30:00+02:00', 80, 70), // V
    m('2026-09-27T20:30:00+02:00', 65, 65), // N
  ];
  assert.equal(calculerForme(matchs), 'VND');
  assert.equal(calculerForme(matchs, 2), 'ND', 'on ne garde que les derniers');
  assert.equal(calculerForme([]), '', 'aucun match : chaîne vide');
});

test('l’empreinte ne change que si le contenu change', () => {
  const a = { rang: 1, points: 4 };
  assert.equal(empreinte(a), empreinte({ rang: 1, points: 4 }));
  assert.notEqual(empreinte(a), empreinte({ rang: 1, points: 5 }));
  // Idempotence : c'est tout l'intérêt, ne pas réécrire ni rebuild pour rien.
  assert.equal(empreinte([1, 2, 3]), empreinte([1, 2, 3]));
});

test('normalisation des libellés de championnat', () => {
  assert.equal(normaliser('DMU18-6 poule préligue F'), 'dmu18 6 poule preligue f');
  assert.equal(normaliser('PRM Poule A2'), 'prm poule a2');
  assert.equal(normaliser('PRM  poule   A2'), 'prm poule a2');
  assert.equal(normaliser(null), '');
});

test('rapprochement : l’identifiant déjà posé prime', () => {
  const r = rapprocher(
    { id: 'E1', championnat: 'PRM Poule A2', code: 'PRM' },
    [{ _id: 'eq-sm1', nom: 'SM1', championnat: 'Autre chose', ffbbEngagementId: 'E1' }],
  );
  assert.equal(r.motif, 'engagement');
  assert.equal(r.equipeId, 'eq-sm1');
});

test('rapprochement par libellé complet, malgré casse et accents', () => {
  const r = rapprocher(
    { id: 'E2', championnat: 'DMU18-6 Poule Préligue F', code: 'DMU18-6' },
    [
      { _id: 'eq-u18m2', nom: 'U18M 2', championnat: 'DMU18-6 poule préligue F' },
      { _id: 'eq-u18m1', nom: 'U18M 1', championnat: 'DMU18-2 poule A' },
    ],
  );
  assert.equal(r.motif, 'championnat');
  assert.equal(r.equipeId, 'eq-u18m2');
});

test('rapprochement par code quand la poule a changé en cours de saison', () => {
  const r = rapprocher(
    { id: 'E3', championnat: 'DMU15-2 Poule H', code: 'DMU15-2' },
    [{ _id: 'eq-u15m1', nom: 'U15M 1', championnat: 'DMU15-2 poule D' }],
  );
  assert.equal(r.motif, 'code', 'la poule a bougé, le code non');
  assert.equal(r.equipeId, 'eq-u15m1');
});

test('rapprochement : aucune correspondance plutôt qu’une mauvaise', () => {
  // Deux équipes partagent le même code : on refuse de trancher.
  const ambigu = rapprocher(
    { id: 'E4', championnat: 'DMU13-3 Poule E', code: 'DMU13-3' },
    [
      { _id: 'a', nom: 'U13M 2', championnat: 'DMU13-3 poule E' },
      { _id: 'b', nom: 'U13M 3', championnat: 'DMU13-3 poule E' },
    ],
  );
  assert.equal(ambigu.motif, 'aucun', 'ambigu : on laisse l’humain trancher');

  // Une coupe n'a pas d'équivalent saisi à la main.
  const coupe = rapprocher({ id: 'E5', championnat: 'CRMLSM Poule A', code: 'CRMLSM' }, [
    { _id: 'eq-sm1', nom: 'SM1', championnat: 'PRM poule A2' },
  ]);
  assert.equal(coupe.motif, 'aucun');
  assert.equal(coupe.equipeId, undefined);
});

test('rapprochement : une équipe déjà rattachée n’est pas reprise', () => {
  const r = rapprocher(
    { id: 'E6', championnat: 'PRM Poule A2', code: 'PRM' },
    [{ _id: 'eq-sm1', nom: 'SM1', championnat: 'PRM poule A2', ffbbEngagementId: 'AUTRE' }],
  );
  assert.equal(r.motif, 'aucun', 'déjà prise par un autre engagement');
});

test('rapprochement par code : DMU11 ne doit pas capter DMU11-3', () => {
  const equipes = [
    { _id: 'a', nom: 'U11M 1', championnat: 'DMU11 poule C' },
    { _id: 'b', nom: 'U11M 2', championnat: 'DMU11-3 poule C' },
  ];
  // Le code court est ambigu par préfixe : on refuse de trancher.
  const court = rapprocher({ id: 'E1', championnat: 'DMU11 Poule Z', code: 'DMU11' }, equipes);
  assert.equal(court.motif, 'aucun');
  // Le code complet, lui, ne désigne qu'une équipe.
  const long = rapprocher({ id: 'E2', championnat: 'DMU11-3 Poule Z', code: 'DMU11-3' }, equipes);
  assert.equal(long.motif, 'code');
  assert.equal(long.equipeId, 'b');
});

test('les identifiants n’utilisent jamais le point', () => {
  // Sanity réserve le point comme séparateur de chemin : une mutation portant
  // un identifiant « rencontre.123 » est acceptée (200) mais jamais appliquée.
  const m = versMatch(
    { id: '42', date_rencontre: '2026-09-20T20:30:00', idOrganismeEquipe1: '11150', idOrganismeEquipe2: '1', nomEquipe2: 'X' },
    '11150',
    { idPoule: 'P1' },
  );
  assert.ok(m);
  assert.ok(!m._id.includes('.'), `identifiant interdit : ${m._id}`);
  assert.equal(m._id, 'rencontre-42');
});
