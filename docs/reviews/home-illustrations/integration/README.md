# Intégration des illustrations de l’Accueil

Branche : `review/home-illustrations-v1`, PR destinée à `main` sans fusion automatique.
La simulation `../accueil-simulation-1837x856.png` constitue la référence validée.

## Fichiers de production

| Fichier ajouté | Dimensions | Affichage |
| --- | --- | --- |
| `assets/images/home-communication-officielle.png` | 2129 × 405 px | Largeur complète, hauteur proportionnelle, bas du panneau |
| `assets/images/home-battleground.png` | 694 × 320 px | Cover centré |
| `assets/images/home-dlc.png` | 695 × 320 px | Hauteur proportionnelle sur 80 % du panneau, en haut, fondu derrière les textes |
| `assets/images/home-communaute.png` | 693 × 320 px | Cover centré |

Les quatre fichiers sont identiques, octet par octet, aux PNG préparés pour revue.
Les ressources V0.4.3 sont conservées, dont `last-session.jpg` et les anciennes
illustrations. Le manifeste V0.4.3 reste un inventaire des originaux.

`src/styles/pages/home-illustrations.css` contient uniquement les fonds et les
cadrages approuvés, avec des sélecteurs limités à l’Accueil. `src/main.js` importe
cette feuille après `home.css`. Aucun fichier de composant, donnée, navigation,
gestionnaire d’interaction ou géométrie CSS n’est modifié.

## Captures de validation

- [1837 × 856](accueil-1837x856.png)
- [1366 × 768](accueil-1366x768.png)
- [390 × 844](accueil-390x844.png)

À 1837 × 856, les illustrations intégrées sont identiques pixel par pixel à la
simulation validée. La comparaison de l’écran complet et de l’export tolère
uniquement des écarts d’au plus deux niveaux par canal sur le bord arrondi de l’avatar
(13 pixels observés à 1837 × 856, limite de 64 pixels). Aucun autre écart n’est accepté.
Cette tolérance couvre une variation d’anticrénelage de Chromium ; l’avatar et
son style restent inchangés. Les captures des deux autres résolutions conservent les règles de
cadrage approuvées et la géométrie existante : les cartes étroites rognent davantage
les côtés des illustrations. Sur mobile, la navigation conserve son défilement
horizontal et le contenu son défilement vertical ; aucune refonte responsive
supplémentaire n’a été appliquée.

## Vérifications

`tests/home-illustrations.spec.js` vérifie les PNG identiques à la revue, la
géométrie aux trois résolutions, la fidélité à la simulation validée à 1837 × 856,
et l’égalité des rendus Vite/export autonome aux trois tailles, avec la seule
tolérance de bord d’avatar décrite ci-dessus.
L’export est chargé avec le réseau désactivé ; aucune requête n’est autorisée.

`tests/home-geometry.spec.js` conserve les comparaisons typographiques et de
couleurs, et les parcours des six communications et raccourcis. Seules la taille
et la position du fond de communication sont retirées de la comparaison à
V0.4.3 : elles sont intentionnellement différentes et couvertes par la comparaison
à la simulation validée.

`tests/v043-parity.spec.js` ajoute les empreintes des quatre PNG à la liste exacte
des ressources attendues dans l’export. Les assertions concernant les 22 images
originales et le décor authentique restent actives. Les autres rubriques et
leurs interactions restent comparées à V0.4.3.

Commandes :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
npm run format:check
```

Résultats : les 20 tests préexistants ont réussi pendant la suite complète
(23/24 au premier passage). Après ajustement du contrôle d’anticrénelage de
l’avatar, les quatre tests des illustrations ont été relancés ensemble : 4/4
réussis. Les 24 tests distincts sont ainsi vérifiés ; formatage et contrôle du
diff réussis. Aucun changement de production n’a été nécessaire après la
compilation.

La compilation génère uniquement `dist/index.html` : 10 497 509 octets, avec
les 27 ressources graphiques uniques intégrées. Les PNG natifs expliquent
l’augmentation de taille ; aucun réencodage destructif n’a été appliqué.
Le dossier `dist/` reste ignoré par Git. La validation hors ligne utilise
Chromium et `setContent()` ; une ouverture manuelle par double-clic n’est pas
incluse dans ces vérifications.
