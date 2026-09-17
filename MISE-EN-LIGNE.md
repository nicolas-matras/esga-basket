# Mise en ligne

Le site est **entièrement statique** : tout le contenu est lu dans Sanity au
moment du build, et le résultat est un dossier de fichiers. Pas de serveur, pas
d'adaptateur, pas de fonction. C'est ce qui rend l'hébergement simple et gratuit.

Le Studio Sanity, lui, ne s'héberge pas sur Netlify : il se déploie chez Sanity.

## 1. Créer le site sur Netlify

**Add new site → Import an existing project → GitHub → `nicolas-matras/esga-basket`.**

Les réglages de build sont déjà dans `netlify.toml`, Netlify les reprend seul :

| Réglage | Valeur |
| --- | --- |
| Build command | `pnpm install --frozen-lockfile && pnpm --filter @esga/web build` |
| Publish directory | `apps/web/dist` |
| Node | 22.12.0 |

Ne pas indiquer de « base directory » : la commande part de la racine du dépôt.

## 2. Saisir les variables d'environnement

**Site configuration → Environment variables.** Ces quatre-là suffisent :

| Variable | Valeur |
| --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` | `cftz7b5y` |
| `PUBLIC_SANITY_DATASET` | `production` |
| `PUBLIC_SITE_URL` | l'URL définitive, par exemple `https://esgabasket.fr` |
| `PUBLIC_ENV` | `production` |

⚠️ **`PUBLIC_ENV` conditionne l'indexation.** Toute valeur autre que
`production` ajoute `noindex` sur chaque page et bloque le `robots.txt`. C'est
voulu : les déploiements de préversion ne doivent pas se retrouver dans Google.
Laisser la variable vide sur les branches de préversion, la renseigner
uniquement en production.

`PUBLIC_SITE_URL` sert au canonical, au sitemap et aux balises de partage : une
valeur fausse produit un sitemap qui pointe ailleurs.

Aucun jeton Sanity n'est nécessaire pour le build : le dataset `production` est
public et le site ne lit que le contenu publié.

## 3. Reconstruire quand le contenu change

Le site étant statique, publier une actualité dans le Studio ne change rien tant
qu'aucun build n'est relancé. Deux réglages à faire :

1. **Netlify** → Build & deploy → Build hooks → *Add build hook*, nommé
   `sanity-publication`. Copier l'URL produite.
2. **Sanity** → sanity.io/manage → projet ESGA → API → Webhooks → *Create webhook* :
   - URL : celle du build hook
   - Dataset : `production`
   - Trigger on : `Create`, `Update`, `Delete`
   - Filter : `_type in ["match","classement","actualite","equipe","categorie","competition","membreBureau","tarif","produit","packPartenaire","partenaire"] || _type match "page*" || _type == "parametres"`

Sans ce webhook, il faudra cliquer « Trigger deploy » à chaque saisie — ce qui
sera vite abandonné par les bénévoles.

## 4. Déployer le Studio

```bash
pnpm --filter @esga/studio deploy
```

Il sera servi sur `https://<nom-choisi>.sanity.studio`. Penser ensuite à mettre
`PUBLIC_SANITY_STUDIO_URL` et `SANITY_STUDIO_PREVIEW_URL` à jour dans les `.env`
et dans Netlify.

## 5. Le domaine

Le domaine définitif n'est pas encore arrêté. Une fois choisi :
Netlify → Domain management → Add a domain, puis pointer les DNS. Netlify
fournit le certificat TLS automatiquement.

## Coût

Le plan gratuit de Netlify (Starter) couvre largement un site de club :
100 Go de bande passante et 300 minutes de build par mois, pour un site de
500 Ko qui se construit en 5 secondes.

Attention toutefois : **les conditions des hébergeurs changent, et le plan
gratuit de Vercel interdit explicitement l'usage commercial** — ce n'est pas le
cas ici puisqu'il s'agit d'une association, mais c'est à vérifier avant tout
changement d'hébergeur.

## Avant d'ouvrir au public

- [ ] Remplacer le classement d'exemple par le relevé réel
- [ ] Saisir les 9 équipes manquantes, les créneaux et les coachs
- [ ] Renseigner les tarifs (le site affiche « à définir » en attendant)
- [ ] Charger les photos (chaque cadre affiche sa mention « photo à fournir »)
- [ ] Brancher le formulaire de contact sur Brevo
- [ ] Créer les pages mentions légales et confidentialité (SIRET/RNA nécessaires)
- [ ] Révoquer les jetons Sanity créés en phase de développement
