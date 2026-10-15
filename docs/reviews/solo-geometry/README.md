# SOLO — première correction de géométrie

Branche `fix/solo-geometry`, depuis `main` (`b5971c8`). Référence :
`docs/references/Lobby_Solo_v1.png` (1536 × 1024).

## Composition

Le groupe des deux colonnes est limité à 1147 px, avec le rapport 596:537
mesuré dans la maquette et un espacement de 14 px. Sa hauteur s’adapte à la
fenêtre (58,6 vh, limitée entre 440 et 600 px). Les cartes de gauche partagent
quatre rangées égales et restent indépendantes de l’état du panneau droit.
Le panneau de sauvegardes défile intérieurement sur ordinateur ; les quatre
cartes restent fixes pendant ce défilement. Continuer occupe la largeur intérieure.

La maquette 3:2 est adaptée à des fenêtres plus larges, sans étirer l’image de
référence. La zone libérée à droite laisse davantage de place au personnage.
Les vignettes, portraits, informations et pictogrammes absents ne sont pas ajoutés.

| À 1837 × 856 | Avant | Après |
| --- | --- | --- |
| Départ des colonnes | x149, y171 | x65, y178 |
| Largeur gauche / droite | 761 / 761 px | 596 / 537 px |
| Hauteur des cartes | 88 à 148 px suivant le panneau | environ 116 px dans les quatre états |
| Hauteur du panneau | 382 à 620 px | environ 502 px dans les quatre états |
| Bord droit du groupe | x1688 | x1212 |
| Largeur du bouton Continuer | 278 px | 495 px |

À 1366 × 768, les colonnes mesurent environ 530 et 478 px et le panneau 450 px
de hauteur. Sur téléphone, les cartes font toujours 88 px de hauteur, en une
colonne, puis le panneau retrouve une hauteur naturelle et un défilement de page.

## Correction mobile limitée au SOLO

La navigation existante débordait d’un en-tête haut de 76 px : logo 75 px,
navigation 45 px, profil 75 px. Le SOLO réserve désormais 196 px à cet ensemble,
bordure comprise. Les positions et dimensions de la navigation et du profil
restent identiques à leur état précédent (navigation y75, profil y120 à 390 px).
Le titre et la première carte se placent après cet ensemble. Aucun fichier de
navigation partagée n’est modifié, et ces règles ne ciblent que `data-bg="solo"`.

## Captures

| Résolution | Avant | Après |
| --- | --- | --- |
| 1837 × 856 | [Avant](before-1837x856.png) | [Après](after-1837x856.png) |
| 1366 × 768 | [Avant](before-1366x768.png) | [Après](after-1366x768.png) |
| 390 × 844 | [Avant](before-390x844.png) | [Après](after-390x844.png) |

Compléments : [sauvegardes sur ordinateur](after-saves-1837x856.png) et
[panneau Continuer après défilement mobile](after-detail-390x844.png).
`measurements.json` contient les mesures des quatre états, aux trois tailles.
Les captures avant proviennent du diagnostic de l’état `b5971c8`.

## Périmètre conservé et validation

- Aucun fichier image modifié, ni règle de fond, de personnage ou de cadrage
  `center/cover`. L’illustration intérieure conserve sa hauteur de 175 px ; la
  réduction de largeur du panneau change mécaniquement la partie visible.
- Couleurs, typographie, pictogrammes et libellés inchangés. Les textes et
  boutons déjà incrustés dans `solo-background.jpg` restent visibles : leur
  correction appartient à une étape de ressources graphiques distincte.
- Seuls l’import CSS, les classes/attributs du panneau SOLO et la nouvelle
  feuille locale sont modifiés dans les fichiers de production. Les événements
  et confirmations simulées sont conservés, sans ajout de fonction de jeu réelle.
- Les fichiers de l’Accueil, des autres pages, les styles partagés, les images
  et les artefacts de release v0.5.0 sont inchangés.

Les nouveaux tests couvrent les quatre parcours par de vrais clics, les hauteurs
stables, le bouton pleine largeur, les couleurs/polices/fonds comparés à V0.4.3,
la sélection, l’annulation et la suppression simulée des sauvegardes, et le
retour à Continuer après défilement mobile. Chaque cas est exercé dans Vite
et dans l’export avec le réseau désactivé. Les anciens tests conservent les
comparaisons des autres rubriques ; seule la géométrie SOLO n’est plus comparée
à l’ancienne disposition. Ses comportements restent comparés à V0.4.3.

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
npm run format:check
# Après lancement de Vite :
node docs/reviews/solo-geometry/capture.mjs
```

La validation hors ligne charge le HTML compilé dans Chromium avec `setContent()`.
L’ouverture manuelle par double-clic n’est pas incluse, l’environnement bloquant
`file://`. La comparaison avec les trois résolutions vise cette étape de géométrie,
pas une validation des futures illustrations ou finitions. Aucune fusion automatique.

Résultats : 36 tests distincts validés. La suite complète a été exécutée
(28 réussis au premier passage), puis les deux contrôles à 1024 × 600 et les
six nouveaux cas SOLO ont été relancés après correction du pilotage de la
référence monolithique et du calcul des limites d’un panneau défilant. Les
dernières relances passent respectivement à 2/2 et 6/6. Aucun changement de
production n’a été nécessaire après la compilation.

Formatage et contrôle du diff réussis. La compilation génère uniquement
`dist/index.html` (10 501 603 octets), avec CSS, JavaScript et les 27 images
intégrés. Les empreintes SHA-256 de l’HTML v0.5.0 et de ses notes de version
sont identiques à celles relevées avant cette intervention.
