# SCUM / Community Rework — Lobby

Prototype interactif communautaire de refonte du lobby de SCUM, basé sur la
**V0.4.3**. Les parcours du jeu, serveurs, sauvegardes et achats sont simulés.

Cette réorganisation conserve le design, les proportions, les textes, les
interactions et les ressources originales, y compris les Crédits. Le fichier
`SCUM_Lobby_Prototype_Interactif_v0.4.3.html` reste inchangé et sert de référence
aux tests. Les visuels de la V0.4.4 ne sont pas utilisés.

## Prérequis

- Node.js **22.12 ou supérieur** (version proposée dans `.nvmrc`).
- npm ; aucune dépendance d'exécution ni service backend.

## Installation et développement

```sh
npm ci
npm run dev
```

Vite sert l'application sur le port 5173 par défaut, avec rechargement lors des
modifications. Le serveur écoute sur toutes les interfaces pour permettre le
développement dans un environnement cloud. Sur une machine personnelle, ouvrir
l'adresse locale affichée par Vite.

Si le cache npm par défaut n'est pas accessible dans un environnement cloud :

```sh
npm ci --cache /tmp/scum-npm-cache
```

## Compiler le HTML autonome

```sh
npm run build
```

Le résultat est **`dist/index.html`**, seul fichier nécessaire à partager.
Les styles, le JavaScript compilé et les images y sont intégrés. Ce fichier
peut être ouvert directement dans un navigateur, sans installation, serveur ni
connexion Internet. Les liens externes Steam restent des actions explicites
nécessitant Internet ; aucune connexion au jeu SCUM n'est effectuée.

Les fichiers sources utilisent des modules JavaScript natifs : pour développer,
utiliser Vite plutôt qu'ouvrir le `index.html` source via `file://`.

Pour servir localement la compilation :

```sh
npm run preview
```

`dist/` est généré et n'est pas versionné. Ne pas modifier directement son HTML.

## Organisation

```text
index.html                   Racine HTML et entrée module
src/main.js                  Chargement des styles et démarrage
src/state.js                 État en mémoire et valeurs initiales
src/navigation.js            Changement de rubrique et rendu
src/assets.js                Résolution des images pour Vite
src/components/              Boutons, structure commune et dialogues
src/pages/                   Accueil, Solo, Multijoueur, Options,
                             Boutique, Infos et Crédits
src/data/                    Navigation, serveurs, actualités, options, DLC
src/runtime/                 Compatibilité des événements V0.4.3
src/utils/                   Sélection DOM et échappement HTML
src/styles/base.css          Styles communs et responsive initial
src/styles/components/       Navigation commune
src/styles/pages/            Styles et correctifs historiques Accueil/Shop
assets/images/               Images originales, sans réencodage
tests/                       Comparaison à V0.4.3 et parcours interactifs
docs/                        Périmètre de migration et limitations conservées
```

Les identifiants de navigation (`home`, `multiplayer`, `credits`, etc.) sont
indépendants des libellés français dans `src/data/navigation.js`. Les
sous-rubriques Solo, Multijoueur, serveurs, Infos et Options suivent le même
principe. Modifier un libellé n'impose pas de changer la logique de navigation.

Le registre `src/assets.js` est utilisé par les templates et les données.
Les CSS utilisent des chemins relatifs vers `assets/images/`. Vite intègre les
deux dans le HTML autonome. `assets/images/manifest.json` documente les empreintes
SHA-256 des 22 images uniques extraites de la référence.

### Migration progressive

Pour préserver exactement les interactions, les templates gardent leurs
attributs d'événement historiques (`onclick`, `oninput`, etc.). Toute la logique
est importée/exportée dans des modules natifs. Un adaptateur explicite,
`src/runtime/legacy-handlers.js`, expose l'état et les gestionnaires nécessaires
à ces attributs. Ce fichier est la frontière de compatibilité ; sa suppression
au profit d'écouteurs DOM constitue une étape ultérieure.

Le rendu complet par `innerHTML` et l'ordre de cascade des styles sont
également conservés. Les styles spécifiques restent importés après les styles
communs ; les anciens correctifs ne sont pas réinterprétés pendant cette étape.

## Vérifications

Installer Chromium pour Playwright une fois :

```sh
npx playwright install chromium
npm test
```

Si Chromium est déjà installé, il peut être réutilisé :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

Les tests compilent l'application puis vérifient :

- le rendu des autres rubriques pixel par pixel face au HTML V0.4.3, dans le
  même navigateur, à 1837 × 856, 1366 × 768, 1024 × 600 et 390 × 844 ;
- la géométrie de l’Accueil selon la maquette validée, avec conservation des
  polices, couleurs, ressources et interactions ;
- toutes les rubriques et leurs sous-écrans, y compris Crédits ;
- les parcours de navigation, filtres, favoris, options, dialogues,
  matchmaking simulé et boutique ;
- le serveur Vite et le HTML compilé, ce dernier dans un contexte hors ligne ;
- l'absence de requêtes réseau nécessaires à l'export et la préservation des
  empreintes des images originales.

Les images de comparaison sont jointes au rapport Playwright en cas d'écart.
Les rapports générés sont ignorés par Git.

```sh
npm run format:check
npm run format
```

Les [limitations de la référence](docs/migration-v043.md) sont conservées pour
éviter de mêler réorganisation technique et corrections fonctionnelles ou
visuelles.

La [première correction de géométrie de l’Accueil](docs/reviews/home-geometry/README.md)
contient les mesures et captures avant/après. Les finitions graphiques restent
à traiter séparément.
