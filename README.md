# ESGA Basket — site du club

Site public de l'**Éveil Sportif Genas Azieu**, club de basket affilié FFBB
(`ARA0069090`), au Complexe Sportif Marcel Gonzales à Genas.

Monorepo pnpm : un site Astro statique et un back-office Sanity.

```
apps/web      Site public (Astro 7, TypeScript strict, CSS natif)
apps/studio   Back-office Sanity 6
design/       Jetons de design extraits de la maquette + planche de validation
maquette/     Sources de la maquette Claude Design, en lecture seule
tools/        Scripts d'injection de contenu et de configuration
```

## Démarrer

```bash
pnpm install
pnpm setup:env     # copie .env.example vers chaque app
```

Renseigner ensuite dans les trois `.env` créés :

| Variable | Où la trouver |
| --- | --- |
| `PUBLIC_SANITY_PROJECT_ID` / `SANITY_STUDIO_PROJECT_ID` | sanity.io/manage (`cftz7b5y`) |
| `SANITY_WRITE_TOKEN` | API → Tokens, droits **Editor**. Sert uniquement à `pnpm seed`. |
| `SANITY_READ_TOKEN` | API → Tokens, droits **Viewer**. Sert à la preview des brouillons. |
| `BREVO_API_KEY` | app.brevo.com, quand les formulaires seront branchés. |

Puis :

```bash
pnpm dev           # site sur http://localhost:4321
pnpm dev:studio    # back-office sur http://localhost:3333
pnpm dev:all       # les deux
pnpm seed          # injecte le contenu initial (idempotent)
pnpm check         # types + lint + format, sur les deux apps
```

## Le back-office

Le menu du Studio est rangé par fréquence d'usage, pas par type technique :

- **La semaine** — matchs, classements, actualités. Ce qui bouge chaque week-end.
- **Le club** — équipes, catégories, compétitions, bureau.
- **Inscriptions & boutique** — tarifs, articles.
- **Partenaires** — packs et logos.
- **Textes des pages** — un document par page, sans possibilité d'en créer un second.
- **Réglages du club** — identité, contact, réseaux, bandeau.

Le document **Match** est le pivot : il alimente à lui seul le bandeau défilant,
le « prochain match » de l'accueil, l'agenda et les derniers résultats. Une seule
saisie, quatre affichages.

## Décisions structurantes

- **Pas de scraper FFBB.** La fédération n'expose pas d'API publique ; un scraper
  de `resultats.ffbb.com` casserait à la première refonte. Classements et
  résultats se saisissent dans le Studio. Le champ `source` et la date de relevé
  sont déjà là pour accueillir un import automatique plus tard, sans migration.
- **Pas de paiement en ligne.** La maquette décrit une commande groupée avec
  retrait au gymnase : la boutique liste, elle n'encaisse pas.
- **CSS natif et custom properties**, pas de Tailwind. La maquette est
  intégralement en styles inline, sans aucune classe : on en a déduit un système
  de jetons (`design/tokens.css`) plutôt que de recopier le markup.
- **Polices hébergées en local.** Les six `.woff2` viennent du bundle de la
  maquette, ce sont les fichiers exacts. Aucun appel à un CDN tiers.
- **Menu burger** sous 900 px : la maquette n'a aucune media query.

## Le signal visuel

Un score affiché « 78—64 » et « 78—76 » s'écrit pareil mais raconte deux matchs
opposés. Sur la carte de match, le **rail représente le total des points marqués**
et les deux équipes se le partagent : la position de la césure dit qui a gagné et
de combien, sans lire les chiffres.

Le rail portant le total, aucun segment ne peut déborder de son conteneur — c'est
le piège classique des barres de dépassement, évité par construction plutôt que
par un `overflow: hidden`.

Cas dégénérés traités : score absent, match non joué, `0—0` (pas de division par
zéro), forfait.

## Accessibilité

Deux corrections assumées par rapport à la maquette :

- `#F26A24` sur blanc plafonne à **3.06:1**, insuffisant pour du texte alors qu'il
  y sert 87 fois. Le petit texte utilise `#CA4D0C` (**4.59:1**), même teinte et
  même saturation. L'orange d'origine reste pour les aplats et les gros titres.
- Le vert de victoire `#4ADE80` tombe à **1.74:1** sur blanc. Une variante foncée
  le remplace pour le texte, et une couleur de défaite a été ajoutée — la maquette
  n'en avait aucune.

Thème sombre construit par inversion des rôles, via `prefers-color-scheme` plus
une surcharge `[data-theme]`. `prefers-reduced-motion` coupe le bandeau défilant
et les transitions.

## Reste à faire

| Sujet | État |
| --- | --- |
| Formulaire de contact | Bascule vers un `mailto:` pré-rempli. À brancher sur Brevo. |
| Déploiement | Cloudflare Pages, construit par GitHub Actions. Voir [MISE-EN-LIGNE.md](MISE-EN-LIGNE.md). |
| Photos | Tous les cadres affichent leur mention « photo à fournir ». |
| Tarifs | Montants vides : le site affiche « à définir », comme la maquette. |
| Équipes | 6 des 15 saisies — seules celles que la maquette nomme. |
| Classements | Un relevé d'exemple, à remplacer par le vrai. |
| Mentions légales | Pages à créer, SIRET/RNA à obtenir. |
