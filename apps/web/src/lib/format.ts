/**
 * Mise en forme des dates, scores et libellés. Tout en français.
 *
 * TOUTES les dates sont formatées dans le fuseau de Paris, explicitement.
 *
 * Le site est construit sur une machine distante — Netlify et GitHub tournent
 * en UTC — et `Date.getHours()` rend l'heure du fuseau de cette machine. Un
 * match à 20h30 s'affichait donc 18h30 en production, et 14h30 sur une machine
 * de développement en Amérique. Le club joue à Genas : l'heure de Paris est la
 * seule qui ait un sens, quel que soit l'endroit d'où le site est généré.
 */

const FUSEAU = 'Europe/Paris';

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Décompose une date dans le fuseau de Paris, sans dépendre de la machine. */
function aParis(iso: string | undefined | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const parties = new Intl.DateTimeFormat('fr-FR', {
    timeZone: FUSEAU,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(d);
  const lire = (type: string) => parties.find((p) => p.type === type)?.value ?? '';
  // Le jour de la semaine se déduit d'une date construite en UTC à midi :
  // à cette heure-là, aucun décalage de fuseau ne peut changer de jour.
  const annee = Number(lire('year'));
  const mois = Number(lire('month'));
  const jour = Number(lire('day'));
  const jourSemaine = new Date(Date.UTC(annee, mois - 1, jour, 12)).getUTCDay();
  return {
    annee,
    mois,
    jour,
    heures: Number(lire('hour')) % 24,
    minutes: Number(lire('minute')),
    jourSemaine,
  };
}

/** « Sam. 26 sept. » */
export function dateCourte(iso: string | undefined | null): string {
  const d = aParis(iso);
  if (!d) return '';
  return `${capital(JOURS[d.jourSemaine].slice(0, 3))}. ${d.jour} ${MOIS_COURT[d.mois - 1]}`;
}

/** « Samedi 26 septembre » */
export function dateLongue(iso: string | undefined | null): string {
  const d = aParis(iso);
  if (!d) return '';
  return `${capital(JOURS[d.jourSemaine])} ${d.jour} ${MOIS[d.mois - 1]}`;
}

/** « 20h30 » */
export function heure(iso: string | undefined | null): string {
  const d = aParis(iso);
  if (!d) return '';
  return d.minutes === 0 ? `${d.heures}h` : `${d.heures}h${String(d.minutes).padStart(2, '0')}`;
}

/** « 12 SEPT » pour les étiquettes mono des actualités. */
export function dateEtiquette(iso: string | undefined | null): string {
  const d = aParis(iso);
  if (!d) return '';
  return `${String(d.jour).padStart(2, '0')} ${MOIS_COURT[d.mois - 1].replace('.', '').toUpperCase()}`;
}

/** Jours restants avant une échéance, comptés en jours de Paris. */
export function joursAvant(iso: string | undefined | null): number | null {
  const cible = aParis(iso);
  const aujourdhui = aParis(new Date().toISOString());
  if (!cible || !aujourdhui) return null;
  const a = Date.UTC(cible.annee, cible.mois - 1, cible.jour);
  const b = Date.UTC(aujourdhui.annee, aujourdhui.mois - 1, aujourdhui.jour);
  return Math.round((a - b) / 86_400_000);
}

/** « J-3 », « Aujourd\'hui », « Demain ». Null si la date est passée. */
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
  /*
    Un score présent suffit : on ne demande pas en plus que `statut` vaille
    « terminé ». Les deux sources écrivent ces champs indépendamment — la FFBB
    remet le statut à « à venir » tant qu'elle ne publie pas de résultat, et un
    dirigeant peut saisir le score du samedi soir sans penser au statut. Exiger
    les deux faisait disparaître le score de l'affichage.
  */
  const renseigne =
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
