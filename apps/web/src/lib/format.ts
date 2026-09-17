/** Mise en forme des dates, scores et libellés. Tout en français. */

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** « Sam. 26 sept » */
export function dateCourte(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${capital(JOURS[d.getDay()].slice(0, 3))}. ${d.getDate()} ${MOIS_COURT[d.getMonth()]}`;
}

/** « Samedi 26 septembre » */
export function dateLongue(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${capital(JOURS[d.getDay()])} ${d.getDate()} ${MOIS[d.getMonth()]}`;
}

/** « 20h30 » */
export function heure(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const h = d.getHours();
  const m = d.getMinutes();
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

/** « 12 SEPT » pour les étiquettes mono des actualités. */
export function dateEtiquette(iso: string | undefined | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${MOIS_COURT[d.getMonth()].replace('.', '').toUpperCase()}`;
}

/** Jours restants avant une échéance. Négatif si passée. */
export function joursAvant(iso: string | undefined | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const cible = new Date(d);
  cible.setHours(0, 0, 0, 0);
  return Math.round((cible.getTime() - aujourdhui.getTime()) / 86_400_000);
}

/** « J-3 », « Aujourd'hui », « Demain ». Null si la date est passée. */
export function compteARebours(iso: string | undefined | null): string | null {
  const j = joursAvant(iso);
  if (j === null || j < 0) return null;
  if (j === 0) return "Aujourd'hui";
  if (j === 1) return 'Demain';
  return `J-${j}`;
}

/** Montant en euros, ou la mention d'attente si le club ne l'a pas encore fixé. */
export function euros(montant: number | null | undefined, attente = 'à définir'): string {
  if (montant === null || montant === undefined || Number.isNaN(montant)) return attente;
  return `${montant.toLocaleString('fr-FR')} €`;
}

export type Match = {
  statut?: string;
  scoreEsga?: number | null;
  scoreAdverse?: number | null;
};

/**
 * Le signal que la maquette n'exprimait pas : l'écart.
 *
 * « 78—64 » et « 78—76 » se ressemblent en chiffres alors qu'ils racontent deux
 * matchs opposés. On représente le TOTAL des points marqués par le rail, et on
 * le partage entre les deux équipes. La position de la césure dit d'un coup
 * d'œil qui a gagné et de combien.
 *
 * Le rail porte le total : aucun segment ne peut déborder, donc rien n'est rogné.
 */
export function partageScore(m: Match): {
  jouable: boolean;
  partEsga: number;
  partAdverse: number;
  ecart: number;
  total: number;
  gagne: boolean;
} {
  const se = m.scoreEsga;
  const sa = m.scoreAdverse;
  const renseigne =
    m.statut === 'termine' &&
    typeof se === 'number' &&
    typeof sa === 'number' &&
    Number.isFinite(se) &&
    Number.isFinite(sa) &&
    se >= 0 &&
    sa >= 0;

  if (!renseigne) {
    return { jouable: false, partEsga: 0, partAdverse: 0, ecart: 0, total: 0, gagne: false };
  }

  const total = se + sa;
  // 0—0 : match non joué ou forfait double. Pas de division par zéro.
  if (total === 0) {
    return { jouable: false, partEsga: 0, partAdverse: 0, ecart: 0, total: 0, gagne: false };
  }

  return {
    jouable: true,
    partEsga: (se / total) * 100,
    partAdverse: (sa / total) * 100,
    ecart: se - sa,
    total,
    gagne: se > sa,
  };
}
