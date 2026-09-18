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
  | { createIfNotExists: Record<string, unknown> };

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
   * Applique un lot de mutations dans UNE transaction.
   * Sanity garantit l'atomicité : soit tout passe, soit rien. C'est ce qui
   * évite de laisser un classement à moitié écrit si le réseau lâche.
   */
  async muter(mutations: Mutation[]): Promise<void> {
    if (mutations.length === 0) return;
    if (this.simulation) return;

    const reponse = await fetch(`${this.base}/data/mutate/${this.dataset}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.jeton}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutations }),
    });
    if (!reponse.ok) {
      const corps = await reponse.text();
      throw new ErreurSanity(`Mutation refusée (${reponse.status}) : ${corps.slice(0, 300)}`);
    }
  }
}

/** Déclenche un build Netlify. Appelé uniquement si quelque chose a changé. */
export async function declencherBuild(url: string, motif: string): Promise<boolean> {
  const reponse = await fetch(`${url}?trigger_title=${encodeURIComponent(motif)}`, {
    method: 'POST',
  });
  return reponse.ok;
}
