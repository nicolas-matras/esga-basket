# Source de données FFBB — conclusions d'exploration

> Phase 1 du chantier de synchronisation. **Aucun code applicatif n'a été écrit**
> avant ce document. Tout ce qui figure ici a été exécuté et vérifié le
> 18 septembre 2026 ; ce qui n'a pas été vérifié est signalé comme tel.

## 1. État du dépôt

| | |
| --- | --- |
| Site | Astro 7, `output: 'static'`, **pas d'adaptateur** — tout est lu au build |
| Studio | Sanity 6, projet `cftz7b5y`, dataset `production` (public) |
| Requêtes | GROQ regroupées dans `apps/web/src/lib/requetes.ts`, client `@sanity/client` (`useCdn: false`, `perspective: 'published'`) |
| Déploiement | Netlify, projet `esga-genas`, build `pnpm --filter @esga/web build` |

**Saisie manuelle actuelle**, à migrer sans casser les pages :

- `equipe` — nom, catégorie (ref), championnat (texte libre : « PRM poule A2 »), coach, créneaux, photo
- `competition` — libellé, équipe liée
- `classement` — compétition (ref), `misAJourLe`, `source` (`manuelle` | `ffbb`), `lignes[]`
- `match` — équipe (ref), adversaire, `debut`, `domicile`, `lieu`, `journee`, `statut`, `scoreEsga`, `scoreAdverse`

Le champ `source` et `misAJourLe` de `classement` ont été posés dès le départ
en prévision d'un import : ils n'ont pas besoin de migration.

⚠️ **Conséquence de l'architecture statique** : synchroniser Sanity ne suffit
pas à changer le site. Il faut déclencher un build. C'est déjà prévu dans
[MISE-EN-LIGNE.md](../MISE-EN-LIGNE.md) mais le build hook **n'existe pas encore**.

## 2. Les trois pistes, évaluées dans l'ordre demandé

### a. Paquet npm `ffbb-api-ts` — écarté comme dépendance

- Le dépôt `Fimeo/ffbb-api-ts` **existe** : TypeScript, MIT, mis à jour le
  2026-04-02, **1 étoile**, sans dépendance runtime.
- Il **n'est pas publié sur npm** (`registry.npmjs.org/ffbb-api-ts` → *Not found*).
  L'installer signifierait pointer sur un commit Git.
- npm ne propose que quatre paquets FFBB, tous marginaux : `ffbb-api-client`
  v0.1.0, `ffbb-api` v0.0.2 (scraper), `bbffbb-scraper` v0.0.4,
  `stats-fr-emarque-basketball-extractor`.

**Verdict** : dépendre d'un dépôt à 1 étoile, non publié, pour un projet
associatif qui doit tenir plusieurs saisons sans mainteneur, est un risque plus
grand que d'écrire nous-mêmes les quelques appels HTTP nécessaires. **En
revanche sa lecture a été décisive** : c'est lui qui documente le mécanisme
d'authentification et les noms de collections, introuvables autrement.

### b. API Directus `api.ffbb.com` — **retenue**

Vérifiée de bout en bout. Voir section 3.

### c. Parsing du payload Next.js — écartée, gardée en secours

`competitions.ffbb.com` est une application Next.js **entièrement rendue côté
serveur** : en chargeant la page du club, le navigateur n'émet **aucun appel
XHR** vers `api.ffbb.com` (seul `/api/islive`, une route interne). Les données
sont donc dans le flux RSC.

C'est exploitable mais fragile : le format du flux change à chaque déploiement
de leur front. À garder comme plan B si l'API se ferme.

## 3. L'API retenue — ce qui a été vérifié

### 3.1 Authentification : les jetons sont publics et tournent

```
GET https://api.ffbb.com/items/configuration
```

Répond sans aucune authentification :

```json
{ "data": {
  "key_dh": "bvBdsqADOnQmvFNzDRQnzYYw2g2J1ad6",
  "key_ms": "98f07e4d3869853c218a0f65edce2ae5…",
  "key_directus_website": "bvBdsqADOnQmvFNzDRQnzYYw2g2J1ad6",
  "date_updated": "2026-09-17T23:44:01.372Z"
}}
```

`key_dh` est le jeton Directus (en-tête `Authorization: Bearer`), `key_ms` le
jeton Meilisearch.

**`date_updated` était la veille de l'exploration : ces jetons tournent.** Ils
doivent être récupérés à chaque exécution, jamais figés en variable
d'environnement. C'est la raison d'être de ce endpoint.

### 3.2 Le filtrage qui fait échouer tout appel naïf

Un `curl` nu reçoit **403 Forbidden** (BunnyCDN). Résultats mesurés :

| Requête | Code |
| --- | --- |
| `curl` sans en-tête | 403 |
| + `User-Agent` de navigateur | 403 |
| + `Origin` seul | **403** |
| + `Referer: https://competitions.ffbb.com/` seul | **200** |

**Seul `Referer` débloque, et il faut un `User-Agent` non vide.** C'est le
piège qui fait conclure trop vite que l'API est fermée.

Depuis un navigateur, l'ajout de `Authorization` déclenche un préflight CORS
que l'API refuse : **la synchro doit tourner côté serveur**, jamais dans la page.

### 3.3 La chaîne de données, à partir du seul code club

```
GET /items/ffbbserver_organismes?filter[code][_eq]=ARA0069090
    → id interne 11150, nom « EVEIL SPORTIF GENAS AZIEU »

GET /items/ffbbserver_organismes/11150?fields=engagements.*
    → 28 engagements
```

**28 engagements trouvés**, ce qui correspond exactement aux 20 championnats
et 8 Coupes du Rhône annoncés. Aucun identifiant de poule ou d'équipe n'a été
nécessaire : la contrainte de la phase 2 est tenable telle quelle.

Champs utiles d'un engagement :

| Champ | Exemple / rôle |
| --- | --- |
| `id` | `200000005335262` — identifiant d'engagement |
| `idCompetition`, `idPoule`, `pouleId` | identifiants à croiser |
| `nomUsuel`, `nomOfficiel`, `numeroEquipe`, `codeAbrege` | nommage de l'équipe |
| `position`, `positionVariation`, `positions` | classement courant |
| `classement` | **tableau** de lignes de classement |
| `rencontres_domiciles`, `rencontres_exterieur` | relations vers les matchs |
| `logo`, `url_competition`, `niveau` | affichage |

**Sur les 28 engagements, 3 seulement ont un classement non vide** — les trois
équipes déjà classées sur le site officiel (PRM 3ᵉ, DM3 7ᵉ, DF2 10ᵉ). Les 25
autres renvoient un tableau **vide, sans erreur** : le cas « coupe sans
classement » se gère nativement, il n'y a rien à contourner.

### 3.4 La chaîne complète, vérifiée

```
/items/configuration                            → jetons (tournent)
/items/ffbbserver_organismes?filter[code][_eq]=ARA0069090   → id 11150
/items/ffbbserver_organismes/11150?fields=engagements.*     → 28 engagements
   chaque engagement porte idPoule et idCompetition
/items/ffbbserver_poules/{idPoule}
   ?fields=id,nom,id_competition.*,classements.*            → classement
/items/ffbbserver_rencontres?filter[idPoule][_eq]={idPoule} → rencontres
/items/ffbbserver_saisons?filter[enCours][_eq]=true         → saison active
```

**Piège** : le champ `classement` d'un engagement **n'est pas le classement**.
C'est une chaîne `"{idPoule}-{position}"`, donc une clé étrangère. Le vrai
classement se lit sur la **poule**, via sa relation `classements`. Et
`ffbbserver_classements` répond **403 en accès direct** : le passage par la
poule n'est pas un détour, c'est le seul chemin.

#### Forme d'une ligne de classement

Relevée sur la poule A2 de la PRM (8 lignes) :

| Champ FFBB | Vers notre schéma |
| --- | --- |
| `position` | rang |
| `organisme_nom` | nom de l'équipe |
| `organisme` | id club — `=== "11150"` donne `estNotreClub` |
| `matchJoues` | joués |
| `gagnes`, `perdus`, `nuls` | — |
| `points` | points |
| `paniersMarques`, `paniersEncaisses` | points marqués / encaissés |
| `difference`, `quotient` | différence |
| `horsClassement`, `penalites`, `pointsInitiaux` | cas particuliers |
| `idEngagement` | rattachement à notre équipe |

⚠️ Les valeurs sont des **chaînes** (`"0"`, `"3"`), pas des nombres :
conversion obligatoire. Au 18 septembre, les 8 lignes sont à zéro — le
championnat n'a pas commencé, seule la `position` initiale est renseignée.
C'est ce qui explique le « 3ᵉ » affiché sur le site officiel sans aucun match
joué, et c'est un cas à ne pas confondre avec une réponse vide.

#### Forme d'une rencontre

`id`, `numeroJournee`, `date` (`2026-09-20`), `date_rencontre`
(`2026-09-20T10:45:00`, heure locale), `horaire` (`"1045"`), `idPoule`,
`idOrganismeEquipe1` / `idOrganismeEquipe2`, `nomEquipe1` / `nomEquipe2`,
plus `forfaitEquipe1/2` et `defautEquipe1/2`.

Le filtre porte sur la **poule**, donc on récupère les rencontres de toutes les
équipes de la poule : il faut filtrer sur `idOrganisme* === "11150"` pour ne
garder que les nôtres.

#### Saison

`ffbbserver_saisons` expose `enCours`, `actif`, `debut`, `fin`, `code`,
`libelle` : le basculement de saison en juillet se détecte sans intervention.

## 4. Réserves à porter à ta connaissance

1. **API non documentée et non contractuelle.** Ce sont les mêmes données que
   celles affichées publiquement sur competitions.ffbb.com, obtenues par le
   même chemin que leur propre site. Mais rien n'engage la FFBB : elle peut
   fermer, changer ou exiger une authentification du jour au lendemain. Le
   dispositif doit donc **dégrader proprement**, jamais casser le site.
2. **Les jetons publiés ne sont pas « à nous ».** Les réutiliser est ce que
   fait toute application tierce, mais cela reste un usage non prévu.
   Recommandation : `User-Agent` identifiant explicitement le club et un
   contact, cadence d'une requête par seconde, respect des 429.
3. **Point juridique, hors de ma compétence.** Les CGU de la FFBB peuvent
   encadrer la réutilisation de ces données. Pour un club affilié republiant
   ses propres résultats le risque paraît faible, mais je ne peux pas le
   trancher : à vérifier auprès du comité si tu veux être couvert.
4. **Cette approche remplace une saisie manuelle qui fonctionne.** Le plan de
   repli n'est pas théorique : garder `syncSource: "manuel"` opérationnel sur
   chaque document permet de revenir à la saisie sans redéploiement.

## 5. Ce que je propose, et ce sur quoi j'attends ton arbitrage

**Approche retenue** : appels HTTP directs à l'API Directus, écrits chez nous,
sans dépendance. Jetons récupérés à chaque exécution depuis
`/items/configuration`, en-tête `Referer` obligatoire, découverte partant du
seul code `ARA0069090`.

Décisions qui t'appartiennent, listées dans la question qui accompagne ce
document : hébergement du script, cadence, périmètre, et sort de la saisie
manuelle existante.
