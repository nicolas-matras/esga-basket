# Maquette — sources en lecture seule

Bundle Claude Design fourni par le client, décompacté.

| Fichier | Contenu |
| --- | --- |
| `bundle-original.html` | Le bundle tel que reçu (561 Ko, auto-décompressant) |
| `template.html` | Le DOM extrait de `<script type="__bundler/template">` |
| `contenu.txt` | Le texte de la maquette, découpé par page |
| `assets/logo.png` | Le logo du club, 400×400 |

Ces fichiers ne sont **jamais modifiés** : ils servent de référence pour vérifier
le rendu et retrouver un contenu d'origine. Pour les régénérer :

    node tools/extraire-maquette.mjs maquette/bundle-original.html /tmp/sortie

La maquette est une page à état unique : ses 10 pages coexistent et sont
basculées par des attributs `sc-if`. Ce n'est pas du routage, on ne le reproduit pas.
Elle n'a aucune media query, mais elle est largement fluide par construction
(39 `minmax()`, `clamp()` sur toute la typographie).
