# SOLO — intégration des illustrations approuvées

Branche `feat/solo-illustrations`, créée depuis `main` (`f97ab29`).
Référence approuvée : branche `review/solo-illustrations-v1`, commit
`f4ad0f04ca6fb0e4756352057c4895808f24e17e`.
La validation visuelle explicite porte sur 1837 × 856. Les références aux deux
autres résolutions proviennent de la même simulation ; leurs rendus intégrés
sont fournis pour vérification finale dans cette PR.

## Captures de l'intégration

| Résolution | Application Vite | HTML autonome hors ligne | Simulation approuvée |
| --- | --- | --- | --- |
| 1837 × 856 | [Intégration](development-1837x856.png) | [Export](offline-1837x856.png) | [Référence](approved-1837x856.png) |
| 1366 × 768 | [Intégration](development-1366x768.png) | [Export](offline-1366x768.png) | [Référence](approved-1366x768.png) |
| 390 × 844 | [Haut de page](development-390x844.png) | [Export](offline-390x844.png) | [Référence](approved-390x844.png) |

Sur mobile, le panneau Dernière session se trouve sous les quatre cartes :
[après défilement](development-detail-390x844.png),
[export hors ligne après défilement](offline-detail-390x844.png).

## Fichiers de production

- `src/styles/pages/solo-illustrations.css` : styles de la simulation, limités à
  `.app[data-bg="solo"]`, avec chemins de ressources résolus par Vite.
- `src/main.js` : import de cette feuille après la géométrie SOLO.
- `src/pages/solo.js` : attribut `data-solo-action` issu des identifiants de
  navigation existants pour associer les images aux parcours. Aucun texte ou
  gestionnaire d'événement n'est changé.
- `assets/images/solo-nouvelle-partie.png` : 264 × 118 px, lac et forêt.
- `assets/images/solo-tutoriel.png` : 264 × 121 px, cabane de survie.
- `assets/images/solo-derniere-session.png` : 444 × 159 px, panorama de la tour.

Ces trois PNG sont identiques octet pour octet aux découpes approuvées.
Leur provenance, leurs coordonnées et leurs empreintes figurent dans
[approved-crops.json](approved-crops.json), copié sans modification depuis la revue.

Ressources réutilisées directement, sans duplication ni réencodage :

| Usage | Ressource existante | Dimensions natives |
| --- | --- | --- |
| Chalet et personnage | `docs/references/SCUM_Lobby_Original.png.png` | 1836 × 856 |
| Carte Continuer | `assets/images/home-communication-officielle.png` | 2129 × 405 |
| Carte Charger une sauvegarde | `assets/images/home-battleground.png` | 694 × 320 |
| Portrait Alki | `assets/images/avatar.png` | 65 × 64 |

Le portrait s'affiche dans un emplacement de 48 × 48 px, ou 32 × 32 px sur mobile,
sans étirement. Les illustrations des cartes restent dans leur moitié droite,
en `cover`, avec les fondus approuvés. La sélection applique la teinte rouge
en CSS selon l'état actif. La bannière est limitée au panneau Dernière session ;
les illustrations internes des trois autres parcours ne sont pas remplacées.

## Vérifications reproductibles

Résultats de cette intégration : **40 tests réussis, aucun échec ou test ignoré**.
La suite a été exécutée en deux groupes complémentaires :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
  SCUM_CAPTURE_DIR=docs/reviews/solo-illustrations-integration \
  npx playwright test tests/solo-illustrations.spec.js tests/solo-geometry.spec.js
# 10 réussis : SOLO, développement et hors ligne.

PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test -- --grep-invert SOLO
# Compilation puis 30 réussis : tous les autres tests de la suite.

npm run format:check
# Réussi.
```

Les PNG de développement, hors ligne et de la simulation sont **strictement
identiques octet pour octet** aux trois résolutions : aucune variation de pixel
n'a été constatée lors de cette exécution.

`dist/` contient uniquement `index.html` (16 921 650 octets). Ses 30 images uniques,
son CSS et son JavaScript sont embarqués ; aucun script ou fichier CSS externe
n'est requis. Les parcours hors ligne passent sans requête réseau nécessaire.
Les empreintes des captures et de l'export sont dans
[verification.json](verification.json).

Les captures `approved-*`, les mesures [approved-layout.json](approved-layout.json)
et le manifeste de découpe sont des références figées de la revue approuvée.
Les tests ne les régénèrent pas.

`tests/solo-illustrations.spec.js` vérifie les octets et dimensions des nouveaux
PNG, les rendus de développement et d'export face aux captures approuvées, les
mesures et textes des quatre états aux trois résolutions, le fond identique à
celui de l'Accueil et l'absence de requêtes nécessaires dans un contexte hors ligne.
La comparaison des pixels ne tolère que les petites variations déjà connues
de Chromium sur le bord arrondi de l'avatar du profil (64 pixels maximum,
écart de 2 niveaux par canal maximum) ; aucune tolérance sur les illustrations.

Le contrôle existant de l'export dans `tests/v043-parity.spec.js` est étendu aux
trois nouveaux PNG. Les contrôles d'intégrité des ressources historiques restent
actifs, ainsi que les tests des interactions SOLO et des autres rubriques.

Pour compiler et exécuter les tests :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
npm run format:check
```

Pour réenregistrer uniquement les captures de l'intégration après compilation :

```sh
SCUM_CAPTURE_DIR=docs/reviews/solo-illustrations-integration \
  PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
  npx playwright test tests/solo-illustrations.spec.js
```

## Limites conservées de la simulation

- Le lac et la cabane restent de petite définition : léger agrandissement sur
  grand écran (environ 12,5 %), sans amélioration artificielle.
- Sur mobile, Continuer privilégie la tour ; le disque solaire est hors champ.
- Le toit de la cabane est déjà partiellement hors champ dans la proposition.
- Les pictogrammes SOLO, les textes et les confirmations simulées restent inchangés.

Les sources du décor, de l'Accueil, des autres rubriques et de la géométrie
`src/styles/pages/solo.css` ne sont pas modifiées. Aucun fichier de la release
v0.5.0 n'est modifié. `dist/index.html` reste un export de travail non versionné ;
aucun tag ou release n'est créé par cette intégration.
