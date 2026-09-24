/**
 * Accès en lecture/écriture à Sanity pour la synchronisation.
 *
 * Écrit sans dépendance : l'API HTTP de Sanity suffit largement pour des
 * mutations en lot, et le script doit rester exécutable dans une Action
 * GitHub sans étape d'installation.
 */

export type Mutation =
  | { createOrReplace: Record<string, unknown> }
  | { patch: { id: string; set?: Record<string, unknown>; unset?: string[] } }
  | { createIfNotExists: Record<string, unknown> }
  | { delete: { id: string } };

export class ErreurSanity extends Error {}

export class ClientSanity {
  private readonly base: string;
  private readonly dataset: string;
  private readonly jeton: string;
  /** En simulation, aucune écriture n'est envoyée. */
  readonly simulation: boolean;

  constructor(projectId: string, dataset: string, jeton: string, simulation = false) {
    this.base = `https://${projectId}.api.sanity.io/v2021-06-07`;
    this.dataset = dataset;
    this.jeton = jeton;
    this.simulation = simulation;
  }

  async interroger<T>(requete: string, parametres: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.base}/data/query/${this.dataset}`);
    url.searchParams.set('query', requete);
    for (const [cle, valeur] of Object.entries(parametres)) {
      url.searchParams.set(`$${cle}`, JSON.stringify(valeur));
    }
    const reponse = await fetch(url, { headers: { Authorization: `Bearer ${this.jeton}` } });
    const corps = (await reponse.json()) as { result?: T; error?: unknown };
    if (!reponse.ok) {
      throw new ErreurSanity(`Requête refusée (${reponse.status}) : ${JSON.stringify(corps.error).slice(0, 200)}`);
    }
    return corps.result as T;
  }

  /**
   * Applique des mutations, par lots, dans des transactions successives.
   *
   * Deux précautions apprises à mes dépens :
   *
   *  - on LIT la réponse. Sanity acquitte chaque mutation dans `results` ;
   *    se contenter du code HTTP laisse passer une écriture qui n'a rien
   *    écrit, et le script annonce alors fièrement un succès imaginaire.
   *  - on découpe. Une transaction de plusieurs centaines de mutations avec
   *    des documents complets dépasse les limites de l'API, qui répond 200
   *    sans rien appliquer.
   */
  async muter(mutations: Mutation[], taillePaquet = 50): Promise<number> {
    if (mutations.length === 0) return 0;
    if (this.simulation) return 0;

    let acquittes = 0;
    for (let i = 0; i < mutations.length; i += taillePaquet) {
      const paquet = mutations.slice(i, i + taillePaquet);
      const reponse = await fetch(`${this.base}/data/mutate/${this.dataset}?returnIds=true`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.jeton}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ mutations: paquet }),
      });
      const texte = await reponse.text();
      if (!reponse.ok) {
        throw new ErreurSanity(
          `Mutation refusée (${reponse.status}) sur le lot ${i / taillePaquet + 1} : ${texte.slice(0, 300)}`,
        );
      }
      let corps: { results?: unknown[] };
      try {
        corps = JSON.parse(texte) as { results?: unknown[] };
      } catch {
        throw new ErreurSanity(`Réponse de mutation illisible : ${texte.slice(0, 200)}`);
      }
      const n = corps.results?.length ?? 0;
      if (n === 0) {
        throw new ErreurSanity(
          `Sanity a accepté ${paquet.length} mutations mais n'en a appliqué aucune. ` +
            `Réponse : ${texte.slice(0, 300)}`,
        );
      }
      acquittes += n;
    }
    return acquittes;
  }
}

