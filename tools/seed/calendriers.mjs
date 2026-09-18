/**
 * Calendriers réels de la saison 2026/2027, relevés sur les feuilles FFBB
 * fournies par le club.
 *
 * Aucun match n'a encore été joué : tous sont « à venir » et sans score.
 * Les scores se saisissent dans le Studio après chaque rencontre ; le site
 * bascule alors tout seul la rencontre de l'agenda vers les résultats.
 *
 * Format d'une ligne : [journée, 'JJ/MM', 'HHhMM', domicile, adversaire]
 * Les mois de septembre à décembre sont en 2026, janvier à avril en 2027.
 */

/** SM1 — PRM poule A2 */
export const SM1 = [
  [1, '19/09', '20h30', true, 'AL Gerland Mouche Lyon - 2'],
  [2, '27/09', '10h30', false, "Cercle Sportif de l'Ozon - 3"],
  [3, '03/10', '20h30', true, 'Les Falcons de Pusignan - 2'],
  [4, '11/10', '16h30', false, 'Éveil de Lyon - 2'],
  [5, '17/10', '20h30', true, 'ASC Mionnay'],
  [6, '07/11', '21h00', false, 'IE - CTC Envol - Patronage Laïque de Craponne'],
  [7, '15/11', '08h30', false, 'Vaulx en Velin Basket Club - 4'],
  [8, '21/11', '18h30', false, 'AL Gerland Mouche Lyon - 2'],
  [9, '28/11', '20h30', true, "Cercle Sportif de l'Ozon - 3"],
  [10, '06/12', '14h00', false, 'Les Falcons de Pusignan - 2'],
  [11, '12/12', '20h30', true, 'Éveil de Lyon - 2'],
  [12, '19/12', '20h30', false, 'ASC Mionnay'],
  [13, '09/01', '20h30', true, 'IE - CTC Envol - Patronage Laïque de Craponne'],
  [14, '16/01', '20h30', true, 'Vaulx en Velin Basket Club - 4'],
];

/** SM2 — DM3 Poule B. Les journées 6 et 17 sont des exemptions. */
export const SM2 = [
  [1, '19/09', '18h30', true, 'Amicale Laïque Irigny Vernaison Basket'],
  [2, '27/09', '10h30', false, 'Bron Basket Club - 4'],
  [3, '03/10', '18h30', true, 'IE - CTC SORB - ES Saint Jean Touslas - 2'],
  [4, '11/10', '11h30', false, 'Les Falcons de Pusignan - 3'],
  [5, '17/10', '18h30', true, 'Basket Club Arbreslois - 3'],
  [7, '14/11', '18h30', true, 'AL Mixte Rambertoise - 2'],
  [8, '22/11', '15h30', false, 'Blees Lentilly - 2'],
  [9, '28/11', '18h30', true, 'BC Mions'],
  [10, '06/12', '10h15', false, 'AL Trollsports - 1'],
  [11, '12/12', '18h30', true, "Patronage Laïque d'Oullins - 3"],
  [12, '19/12', '20h30', false, 'Amicale Laïque Irigny Vernaison Basket'],
  [13, '09/01', '18h30', false, 'Bron Basket Club - 4'],
  [14, '17/01', '08h30', false, 'IE - CTC SORB - ES Saint Jean Touslas - 2'],
  [15, '30/01', '20h30', true, 'Les Falcons de Pusignan - 3'],
  [16, '07/02', '09h00', false, 'Basket Club Arbreslois - 3'],
  [18, '06/03', '18h00', false, 'AL Mixte Rambertoise - 2'],
  [19, '14/03', '13h30', true, 'Blees Lentilly - 2'],
  [20, '21/03', '09h00', false, 'BC Mions'],
  [21, '03/04', '18h30', true, 'AL Trollsports - 1'],
  [22, '11/04', '09h00', false, "Patronage Laïque d'Oullins - 3"],
];

/** SF1 — DF2 Poule B */
export const SF1 = [
  [1, '20/09', '16h00', false, 'Club Sportif de Décines Basket'],
  [2, '26/09', '20h30', true, 'Ouest Lyonnais Basket - 3'],
  [3, '04/10', '13h30', false, 'IE - CTC Cap Basket 69 - Blees Lentilly'],
  [4, '10/10', '20h30', true, 'Association Basket St Pierre Savigny'],
  [5, '17/10', '20h30', false, 'Union Sportive Azergoise - 2'],
  [6, '07/11', '20h30', true, 'Ampuis Vienne Saint Romain Reventin Basket - 2'],
  [7, '14/11', '20h30', false, "Patronage Laïque d'Oullins"],
  [8, '22/11', '11h30', false, 'Les Falcons de Pusignan - Entente'],
  [9, '28/11', '18h00', true, 'IE - CTC SORB - ES Saint Jean Touslas'],
  [10, '05/12', '20h30', true, 'Amicale Laïque Irigny Vernaison Basket'],
  [11, '13/12', '11h00', true, 'AS Rhodanienne'],
  [12, '19/12', '20h30', true, 'Club Sportif de Décines Basket'],
  // La feuille FFBB affiche 00h00 pour cette journée : horaire non encore fixé.
  [13, '09/01', '00h00', false, 'Ouest Lyonnais Basket - 3', 'horaire à confirmer'],
  [14, '16/01', '18h30', false, 'IE - CTC Cap Basket 69 - Blees Lentilly'],
  [15, '30/01', '21h00', false, 'Association Basket St Pierre Savigny'],
  [16, '06/02', '18h30', true, 'Union Sportive Azergoise - 2'],
  [17, '28/02', '17h00', false, 'Ampuis Vienne Saint Romain Reventin Basket - 2'],
  [18, '06/03', '21h00', true, "Patronage Laïque d'Oullins"],
  [19, '13/03', '20h30', true, 'Les Falcons de Pusignan - Entente'],
  [20, '20/03', '20h30', true, 'IE - CTC SORB - ES Saint Jean Touslas'],
  [21, '03/04', '18h30', false, 'Amicale Laïque Irigny Vernaison Basket'],
  [22, '11/04', '11h00', false, 'AS Rhodanienne'],
];

/**
 * Transforme une ligne de calendrier en document Sanity.
 * L'heure est exprimée en heure de Paris : la stocker en UTC ferait afficher
 * 22h30 au lieu de 20h30 une bonne partie de la saison.
 */
export function versMatchs(lignes, { equipe, competition, prefixe, lieuDomicile = 'Gonzales' }) {
  return lignes.map(([journee, date, heureFr, domicile, adversaire, note]) => {
    const [jour, mois] = date.split('/').map(Number);
    const annee = mois >= 8 ? 2026 : 2027;
    const [h, min] = heureFr.replace('h', ':').split(':').map(Number);
    // Septembre à fin octobre et fin mars à avril : heure d'été (+02:00).
    // Le reste de la saison : heure d'hiver (+01:00).
    const t = new Date(Date.UTC(annee, mois - 1, jour));
    const ete =
      t >= new Date(Date.UTC(2026, 2, 29)) && t < new Date(Date.UTC(2026, 9, 25))
        ? true
        : t >= new Date(Date.UTC(2027, 2, 28)) && t < new Date(Date.UTC(2027, 9, 31));
    const decalage = ete ? '+02:00' : '+01:00';
    const p = (n) => String(n).padStart(2, '0');

    return {
      _id: `${prefixe}-j${journee}`,
      _type: 'match',
      journee,
      equipe: { _type: 'reference', _ref: equipe },
      competition: { _type: 'reference', _ref: competition },
      adversaire,
      debut: `${annee}-${p(mois)}-${p(jour)}T${p(h)}:${p(min)}:00${decalage}`,
      domicile,
      lieu: domicile ? lieuDomicile : 'Extérieur',
      nature: 'championnat',
      statut: 'a-venir',
      dansLeBandeau: true,
      syncSource: 'manuel',
      ...(note ? { note } : {}),
    };
  });
}
