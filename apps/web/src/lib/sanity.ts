/**
 * Accès au contenu Sanity.
 *
 * Le site est statique : tout est lu au build. Le client n'utilise que le
 * dataset public en lecture, sans jeton — rien de sensible ne part au navigateur.
 */
import { createClient, type SanityClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? '2025-02-19';

if (!projectId) {
  throw new Error(
    'PUBLIC_SANITY_PROJECT_ID manquant. Lancez `pnpm setup:env` puis renseignez apps/web/.env.',
  );
}

export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // au build, on veut la dernière version publiée
  perspective: 'published',
});

const constructeur = createImageUrlBuilder(client);

export type SourceImage = {
  asset?: { _ref?: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
};

/**
 * Construit l'URL d'une image Sanity.
 * Renvoie null si l'image n'est pas renseignée : l'appelant affiche alors
 * son propre cadre d'attente plutôt qu'une image cassée.
 */
export function urlImage(
  source: SourceImage | undefined | null,
  largeur: number,
  hauteur?: number,
): string | null {
  if (!source?.asset?._ref) return null;
  let u = constructeur.image(source).width(largeur).auto('format').fit('crop');
  if (hauteur) u = u.height(hauteur);
  return u.url();
}

/** Raccourci de requête, typé côté appelant. */
export async function interroger<T>(requete: string, parametres: Record<string, unknown> = {}): Promise<T> {
  return client.fetch<T>(requete, parametres);
}
