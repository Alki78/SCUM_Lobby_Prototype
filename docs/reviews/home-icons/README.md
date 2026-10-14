# Pictogrammes SVG — Accueil uniquement

Branche : `fix/home-svg-icons`, depuis `main` après fusion de PR #5 (`0cdd97a`).

Huit emplacements sont remplacés : quatre flèches diagonales (trois cartes et
Voir les détails), localisation, joueurs, calendrier et triangle CONTINUER.
`src/components/icons.js` fournit cinq SVG réutilisables intégrés dans le HTML,
avec `currentColor`, `aria-hidden="true"` et `focusable="false"`.
Le triangle hérite du blanc existant du bouton. Aucune police d’icônes, aucun
CDN, aucune référence SVG externe ni ressource graphique supplémentaire.

`src/pages/home.js` est la seule page modifiée. Les libellés sont conservés,
les anciens caractères décoratifs sont retirés, et les actions restent identiques.
Les flèches précédente/suivante, les six communications et leurs six indicateurs
restent inchangés. Les logos Steam/Twitch ne sont pas modifiés.

`src/styles/pages/home-icons.css`, importé dans `src/main.js`, réserve les
emplacements des anciens glyphes. Les hauteurs des lignes de métadonnées sont
conservées malgré la suppression des métriques des polices de remplacement.
Les illustrations, leurs cadrages, Dernière session, le décor et les fichiers
de géométrie existants ne sont pas modifiés.

## Captures

| Résolution | Avant | Après |
| --- | --- | --- |
| 1837 × 856 | [Avant](avant-1837x856.png) | [Après](apres-1837x856.png) |
| 1366 × 768 | [Avant](avant-1366x768.png) | [Après](apres-1366x768.png) |
| 390 × 844 | [Avant](avant-390x844.png) | [Après](apres-390x844.png) |

Les fichiers `before-layout.json` et `after-layout.json` enregistrent les
mesures. Panneaux, boutons, lignes de métadonnées, emplacements des flèches,
titres et sous-titres des cartes, et rangée des indicateurs sont identiques
avant/après aux trois résolutions.

Sur mobile, la navigation et les cartes gardent leur présentation existante ;
aucune nouvelle modification responsive n’est incluse.

## Validation et portée des tests

- Six cas de `tests/home-icons.spec.js` : géométrie exacte aux trois tailles,
  SVG intégrés et décoratifs, libellés conservés, triangle blanc, réseau coupé
  pour l’export, et absence de ces SVG dans Solo.
- Les parcours existants conservent le carrousel, les dialogues et les raccourcis.
- Les rendus des autres rubriques restent comparés pixel par pixel à V0.4.3.
- Les PNG et leurs empreintes dans l’export restent vérifiés, avec le décor
  authentique et les 22 images originales.
- La comparaison à la simulation d’illustrations validée exclut seulement les
  huit conteneurs dont le pictogramme change. Leur géométrie et leurs libellés
  sont vérifiés séparément. La comparaison Vite/export conserve tous les pixels,
  avec la tolérance existante limitée au bord arrondi de l’avatar.
- La comparaison des comportements à V0.4.3 retire uniquement les cinq anciens
  caractères décoratifs de l’Accueil ; les textes des autres rubriques restent
  comparés sans normalisation supplémentaire.

Commandes depuis la racine :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
npm run format:check
# Après démarrage de Vite, pour reproduire les captures après :
node docs/reviews/home-icons/capture.mjs
```

La validation hors ligne charge le contenu de `dist/index.html` dans Chromium
avec le réseau désactivé. Une ouverture manuelle par double-clic n’est pas
incluse dans ces vérifications. Aucune fusion automatique.

Résultats : 30 tests réussis en 5,7 minutes ; formatage et contrôle du diff
réussis. La compilation produit uniquement `dist/index.html` (10 499 244 octets),
avec les 27 images uniques existantes et les SVG intégrés. Aucun ajout de
dépendance ni changement de configuration de compilation.
