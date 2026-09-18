/**
 * Tests de mise en forme des dates.
 *
 *   TZ=UTC node --test apps/web/src/lib/format.test.ts
 *
 * Ils sont exécutés sous un fuseau VOLONTAIREMENT différent de celui de Paris.
 * C'est tout l'intérêt : le site est construit sur une machine distante, en
 * UTC, et un formatage qui s'appuie sur l'heure locale de cette machine
 * affichait un match de 20h30 à 18h30 en production. Une vérification faite
 * depuis un poste français n'aurait rien vu.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dateCourte, dateEtiquette, dateLongue, heure, partageScore } from './format.ts';

const FUSEAU_DU_TEST = Intl.DateTimeFormat().resolvedOptions().timeZone;

test('le fuseau d’exécution n’est pas celui de Paris', () => {
  // Si ce test échoue, les suivants ne prouvent plus rien : ils passeraient
  // par coïncidence. Lancer avec TZ=UTC.
  assert.notEqual(FUSEAU_DU_TEST, 'Europe/Paris', 'lancer les tests avec TZ=UTC');
});

test('l’heure affichée est celle de Paris, pas celle de la machine', () => {
  // Heure d'été : +02:00.
  assert.equal(heure('2026-09-19T20:30:00+02:00'), '20h30', 'match du samedi soir');
  assert.equal(heure('2026-09-19T10:30:00+02:00'), '10h30', 'plateau du matin');
  // Heure d'hiver : +01:00.
  assert.equal(heure('2027-01-09T20:30:00+01:00'), '20h30', 'janvier');
  // Minute pile : on n'écrit pas « 14h00 ».
  assert.equal(heure('2026-10-11T16:00:00+02:00'), '16h');
});

test('une heure exprimée en UTC est convertie, pas recopiée', () => {
  // 18h30 UTC en septembre = 20h30 à Paris.
  assert.equal(heure('2026-09-19T18:30:00Z'), '20h30');
  // 19h30 UTC en janvier = 20h30 à Paris.
  assert.equal(heure('2027-01-09T19:30:00Z'), '20h30');
});

test('le jour reste le bon de part et d’autre de minuit', () => {
  // 23h00 à Paris le 19 = 21h00 UTC le 19 : même jour partout.
  assert.equal(dateCourte('2026-09-19T23:00:00+02:00'), 'Sam. 19 sept.');
  // 00h30 à Paris le 20 = 22h30 UTC le 19 : c'est bien le 20 pour le club.
  assert.equal(dateCourte('2026-09-20T00:30:00+02:00'), 'Dim. 20 sept.');
  assert.equal(dateLongue('2026-09-20T00:30:00+02:00'), 'Dimanche 20 septembre');
});

test('jour de la semaine et libellés', () => {
  assert.equal(dateCourte('2026-09-19T20:30:00+02:00'), 'Sam. 19 sept.');
  assert.equal(dateLongue('2026-09-19T20:30:00+02:00'), 'Samedi 19 septembre');
  assert.equal(dateEtiquette('2026-09-12T10:00:00+02:00'), '12 SEPT');
  assert.equal(dateCourte(null), '');
  assert.equal(heure(undefined), '');
});

test('un score seul suffit à considérer la rencontre jouée', () => {
  // Les deux sources écrivent score et statut indépendamment : exiger les deux
  // faisait disparaître des résultats pourtant présents en base.
  const p = partageScore({ scoreEsga: 78, scoreAdverse: 64 });
  assert.equal(p.jouable, true);
  assert.equal(p.gagne, true);
  assert.equal(p.ecart, 14);
  assert.equal(Math.round(p.partEsga + p.partAdverse), 100, 'les deux parts remplissent le rail');
});

test('cas limites du rail de score', () => {
  assert.equal(partageScore({ scoreEsga: 0, scoreAdverse: 0 }).jouable, false, 'pas de division par zéro');
  assert.equal(partageScore({ scoreEsga: 70, scoreAdverse: 70 }).ecart, 0, 'égalité');
  assert.equal(partageScore({}).jouable, false, 'sans score');
  assert.equal(partageScore({ scoreEsga: 50 }).jouable, false, 'un seul score');
});
