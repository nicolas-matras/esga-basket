# Mise en ligne

Le site est **entièrement statique** : tout le contenu est lu dans Sanity au
moment du build, et le résultat est un dossier de fichiers. Pas de serveur, pas
d'adaptateur, pas de fonction. C'est ce qui rend l'hébergement simple et gratuit.

Le Studio Sanity, lui, ne s'héberge pas avec le site : il se déploie chez Sanity.

## Comment ça marche

Le site n'est **pas** construit par l'hébergeur. Il est construit par GitHub
Actions, qui envoie ensuite les fichiers à Cloudflare Pages.

```
push sur main ─┐
synchro FFBB ──┼─→ .github/workflows/deployer.yml ─→ Cloudflare Pages
webhook Sanity ┘      (pnpm build, puis wrangler)
```

Deux raisons à ce choix plutôt que de laisser l'hébergeur construire :

1. **Une seule source de vérité pour l'outillage.** La version de pnpm vient du
   champ `packageManager` du `package.json`, celle de Node du `.nvmrc`.
   L'image de build de Cloudflare ne sait pas déduire pnpm du lockfile et
   aurait demandé une variable `PNPM_VERSION` de plus à tenir à jour.

2. **Un échec se voit.** L'ancien montage appelait un *build hook* et se
   contentait du code HTTP 200 — qui signifie « demande reçue », pas « site en
   ligne ». Netlify a bloqué les déploiements plusieurs jours en répondant 200
   à chaque appel, pendant que le site servait une version périmée. Ici, un
   déploiement raté fait passer le job au rouge.

## 1. Créer le projet Cloudflare Pages

Créer un compte sur [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
— gratuit, sans carte bancaire.

Puis **Compute (Workers) → Workers & Pages → Create → Pages → Upload assets**.

| Réglage | Valeur |
| --- | --- |
| Project name | `esga-basket` |

Le nom compte : il est écrit en dur dans `.github/workflows/deployer.yml` et
détermine l'adresse `https://esga-basket.pages.dev`.

Cloudflare demande de déposer des fichiers pour créer le projet. Déposer
n'importe quoi (un fichier `index.html` vide suffit) : le premier vrai
déploiement écrasera ce contenu. **Ne pas** choisir « Connect to Git » — c'est
GitHub qui construit, Cloudflare ne fait que servir.

## 2. Créer le jeton d'API

**[My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens) →
Create Token → modèle « Edit Cloudflare Workers » → Use template.**

Ce modèle donne exactement les droits nécessaires au déploiement, et rien de
plus. Laisser les réglages proposés, valider, **copier le jeton** : Cloudflare
ne le réaffichera jamais.

Relever aussi l'**Account ID**, visible dans l'URL du tableau de bord :
`dash.cloudflare.com/`**`<account-id>`**`/...`

## 3. Saisir les secrets GitHub

**Dépôt → Settings → Secrets and variables → Actions → New repository secret.**

| Secret | Valeur |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | le jeton de l'étape 2 |
| `CLOUDFLARE_ACCOUNT_ID` | l'identifiant de compte de l'étape 2 |
| `PUBLIC_SITE_URL` | `https://esga-basket.pages.dev` — puis le domaine définitif |

`SANITY_PROJECT_ID` et `SANITY_DATASET` sont déjà en place et ne changent pas.
Ni le projet Sanity ni l'adresse du site ne sont réellement secrets — ils
figurent dans le HTML servi — mais ils vivent là pour que tout se règle au même
endroit.

Le secret `NETLIFY_BUILD_HOOK_URL` ne sert plus : il peut être supprimé.

⚠️ `PUBLIC_SITE_URL` sert au canonical, au sitemap et aux balises de partage.
Une valeur absente ou mal saisie ne casse plus le build — il retombe
silencieusement sur `http://localhost:4321`, ce qui produit un sitemap faux sur
tout le site. Le workflow vérifie donc le résultat et échoue si `localhost`
se retrouve dans les pages produites.

## 4. Premier déploiement

**Dépôt → Actions → Déploiement → Run workflow.**

Le job construit puis envoie le site. À la fin, il affiche l'adresse du
déploiement. Vérifier que `https://esga-basket.pages.dev` répond, et que les
horaires des matchs sont corrects (un match du samedi soir doit afficher
**20h30**, pas 18h30 — c'est le symptôme d'un build servi depuis un fuseau qui
n'est pas celui de Paris).

Ensuite, chaque push sur `main` redéploie tout seul.

## 5. Reconstruire quand le contenu change

Le site étant statique, publier une actualité dans le Studio ne change rien
tant qu'aucun déploiement n'est relancé. La synchro FFBB nocturne redéploie
déjà quand les résultats bougent, mais une actualité publiée à 14h n'apparaîtra
que le lendemain. Pour la voir tout de suite :

1. **GitHub** → Settings → Developer settings → Personal access tokens →
   *Fine-grained tokens* → un jeton limité à ce dépôt, permission
   **Contents : Read and write**.
2. **Sanity** → [sanity.io/manage](https://sanity.io/manage) → projet ESGA →
   API → Webhooks → *Create webhook* :
   - URL : `https://api.github.com/repos/nicolas-matras/esga-basket/dispatches`
   - Méthode : `POST`
   - Dataset : `production`
   - Trigger on : `Create`, `Update`, `Delete`
   - Filter : `_type in ["match","classement","actualite","equipe","categorie","competition","membreBureau","tarif","produit","packPartenaire","partenaire"] || _type match "page*" || _type == "parametres"`
   - HTTP Headers :
     `Authorization: Bearer <le jeton GitHub>`
     `Accept: application/vnd.github+json`
   - Projection : `{"event_type": "contenu-publie"}`

Sans ce webhook, il faut lancer « Déploiement » à la main après chaque saisie —
ce qui sera vite abandonné par les bénévoles.

## 6. Déployer le Studio

```bash
pnpm --filter @esga/studio deploy
```

Il sera servi sur `https://<nom-choisi>.sanity.studio`. Penser ensuite à mettre
`PUBLIC_SANITY_STUDIO_URL` et `SANITY_STUDIO_PREVIEW_URL` à jour dans les `.env`.

## 7. Le domaine

Une fois le domaine choisi : **Workers & Pages → esga-basket → Custom domains
→ Set up a custom domain**. Cloudflare fournit le certificat TLS
automatiquement et ne facture rien pour le domaine personnalisé.

Penser alors à mettre `PUBLIC_SITE_URL` à jour dans les secrets GitHub, puis à
relancer un déploiement — sinon le sitemap et les canoniques continuent de
pointer vers `pages.dev`.

## Coût

| Poste | Coût |
| --- | --- |
| Cloudflare Pages | 0 € — bande passante et requêtes illimitées |
| GitHub Actions | 0 € — illimité sur un dépôt public |
| Sanity | 0 € sur le plan gratuit |
| Nom de domaine | ~10 €/an, chez le registrar |

Les limites du plan gratuit Cloudflare sont **fixes**, pas des crédits : 500
builds par mois, 20 000 fichiers par site, 25 Mio par fichier. Le site fait
28 fichiers et 544 Ko — les photos étant servies depuis `cdn.sanity.io`, ce
nombre ne grossira pas avec le contenu. La synchro ne déploie que lorsque les
données ont changé, soit une quarantaine de builds par mois.

C'est précisément ce qui a motivé le départ de Netlify : son plan gratuit
compte désormais en crédits (300/mois, non reportables), et la bande passante,
les builds et l'agent IA puisent dans la même réserve. Une fois épuisée, les
déploiements sont bloqués.

**Les conditions des hébergeurs changent.** Celles de Vercel, par exemple,
interdisent explicitement l'usage commercial du plan gratuit — sans objet ici
puisqu'il s'agit d'une association, mais à revérifier avant tout changement.

## Avant d'ouvrir au public

- [ ] Renommer les 4 équipes au code FFBB (`DMU11 1`, `DMU11-3 2`, `DMU9-2 1`, `DMU9-3 2`)
- [ ] Saisir les équipes manquantes, les créneaux et les coachs
- [ ] Renseigner les tarifs (le site affiche « à définir » en attendant)
- [ ] Remplacer les photos de démonstration
- [ ] Brancher le formulaire de contact sur Brevo
- [ ] Créer les pages mentions légales et confidentialité (SIRET/RNA nécessaires)
- [ ] Révoquer les jetons Sanity créés en phase de développement
- [ ] Révoquer le jeton Netlify et supprimer le site Netlify
