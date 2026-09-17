/**
 * URL publique du site.
 *
 * Elle vient d'une variable d'environnement saisie à la main dans l'interface
 * de l'hébergeur : elle peut donc être absente, ou contenir un texte qui n'est
 * pas une URL. Astro exige une URL valide pour `site`, et un `new URL()` qui
 * lève fait échouer le build entier sur toutes les pages à la fois — pour une
 * balise canonique, ce qui est disproportionné.
 *
 * On valide, on prévient bruyamment, et on retombe sur une valeur utilisable.
 */
const SECOURS = 'http://localhost:4321';

export function urlSite(brute: string | undefined | null): string {
  if (!brute) return SECOURS;
  try {
    const u = new URL(brute);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('protocole');
    return u.origin;
  } catch {
    console.warn(
      `[site] PUBLIC_SITE_URL vaut ${JSON.stringify(brute)}, qui n'est pas une URL absolue. ` +
        `Repli sur ${SECOURS}. Les balises canoniques et le sitemap seront faux : ` +
        `corrigez la variable dans l'interface de l'hébergeur.`,
    );
    return SECOURS;
  }
}
