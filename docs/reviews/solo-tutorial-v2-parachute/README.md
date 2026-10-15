# SOLO → TUTORIEL v2 — simulation du largage

**Simulation uniquement, à valider visuellement.** Branche `review/solo-tutorial-v2-parachute`, créée depuis le dernier `main`, commit `1d77987` (ajout de la capture via PR #12, après les PR #9, #10 et #11).

Aucun fichier de production n'est modifié. Seul `docs/reviews/solo-tutorial-v2-parachute/` est ajouté. Aucune PR d'intégration ni fusion. Les images et styles de ce dossier ne sont importés par aucun composant du prototype.

## Composition approuvée, illustration remplacée

La composition est reprise de `review/solo-tutorial-v1`, commit `8ff99b7bf218a3f50afc76c2e113fe7aa149c316` :

- `simulation.js` est identique au script de revue v1 ; il décore le panneau uniquement dans le navigateur, en conservant ses nœuds et événements existants.
- `reference-v1.css` est une copie exacte du CSS v1. Dans `simulation.css`, **seule l'URL de la bannière change**. Le rapport 694:320, les dimensions, espacements, couleurs, transparences, bordures et typographie sont inchangés.
- Titre TUTORIEL et description conservés : « Apprenez les bases de la survie dans un mode de jeu dédié avant de vous lancer sur l'île. »
- Bouton LANCER LE TUTORIEL pleine largeur en bas, action actuelle conservée : « Tutoriel — lancement simulé ». Aucune progression, étape, sauvegarde ou autre fonction ajoutée.

La v1 présentée dans les comparaisons est reconstituée avec son CSS et son script approuvés **sur le même dernier main et dans le même navigateur** que la v2. Le seul changement v1/v2 est donc la bannière, et non la base de production ou l'environnement de capture.

## Illustration et cadrage proposés

| Information | Valeur vérifiée |
| --- | --- |
| Source exclusive | `docs/references/SCUM_Tutoriel_Largage_Reference.png` |
| Provenance | Capture fournie par l'utilisateur et ajoutée à `main` ; aucune image de substitution |
| Dimensions réelles de la source | **1650 × 928 px** |
| Coordonnées de découpe | **x = 131 à 1519 exclus ; y = 140 à 780 exclus** |
| Fichier obtenu | [tutoriel-largage-banniere.png](tutoriel-largage-banniere.png) |
| Dimensions réelles de la bannière | **1388 × 640 px**, même rapport 694:320 que la v1 |
| Affichage à 1837 × 856 | **495 × 228,23 px**, environ 36 % de la largeur native |
| Traitement | Découpe rectangulaire de pixels uniquement ; aucun redimensionnement enregistré, retouche, accentuation, étirement ou traitement génératif |

Le cadrage conserve entièrement le prisonnier orange, son sac et ses membres visibles dans la source. Le personnage reste le sujet central ; les champs, routes, bois et le reflet sur l'eau transmettent l'altitude et la découverte de l'île. La barre d'inventaire commence vers y = 867 dans l'original : la découpe s'arrête à y = 780, en l'écartant ainsi que le petit texte au bord inférieur. Aucun HUD, logo ou texte n'est visible dans la bannière inspectée.

Un seul cadrage est proposé : le format permet de conserver le sujet et le paysage tout en reprenant exactement le rapport de la v1. Aucune variante supplémentaire n'est nécessaire pour éviter une coupe du personnage.

**Limite de qualité :** le paysage possède déjà un flou de mouvement et des détails adoucis dans la capture source. Ils sont conservés, sans prétendre les restaurer. À la taille d'affichage, la silhouette, la tenue orange et le sac restent identifiables ; la bannière est réduite, jamais agrandie. Ce rendu est à juger sur les captures réelles, notamment sur mobile.

Les SHA-256, coordonnées et dimensions sont enregistrés dans [illustration.json](illustration.json). [prepare_image.py](prepare_image.py) reproduit la découpe et vérifie que les pixels du PNG obtenu sont exactement ceux de la zone source.

## Captures de validation

| Vue | Capture v2 | Référence v1 au même format |
| --- | --- | --- |
| 1837 × 856 — panneau complet | [V2 grand écran](tutoriel-1837x856.png) | [V1 grand écran](v1-1837x856.png) |
| 1366 × 768 — panneau complet | [V2 ordinateur](tutoriel-1366x768.png) | [V1 ordinateur](v1-1366x768.png) |
| 390 × 844 — vue initiale | [V2 mobile initiale](tutoriel-390x844.png) | [V1 mobile initiale](v1-390x844.png) |
| 390 × 844 — après défilement | [V2 panneau et bouton](tutoriel-detail-390x844.png) | [V1 panneau et bouton](v1-detail-390x844.png) |

- [Comparaison rapprochée TUTORIEL v1 / v2](comparaison-panneaux-v1-v2.png), découpes des captures à 1837 × 856 conservées à leur échelle réelle.
- [Comparaison complète v1 / v2 à 1837 × 856](comparaison-v1-v2-1837x856.png), deux captures côte à côte sans réduction.
- [Message de démonstration conservé](message-demonstration-1837x856.png).

Les planches de comparaison sont des assemblages littéraux des captures ; elles ne sont jamais utilisées comme fond de l'interface.

## Vérifications

Mesures et résultats automatisés : [verification.json](verification.json).

| Résolution | Cadre extérieur : x, y ; largeur × hauteur | Bannière affichée | Largeur du bouton |
| --- | --- | --- | --- |
| 1837 × 856 | 675, 178,09 ; 537 × 501,61 px | 495 × 228,23 px | 495 px |
| 1366 × 768 | 592,45, 174,48 ; 477,66 × 450,05 px | 443,66 × 204,56 px | 443,66 px |
| 390 × 844 | 12, 652 ; 366 × 480 px | 332 × 153,08 px | 332 px |

Coordonnées verticales mesurées dans le document, avant défilement. Les légers arrondis proviennent du calcul CSS sous-pixel.

Contrôles exécutés avec Chromium/Playwright :

- Cadre extérieur identique à la production et à la v1 aux trois résolutions ; dimensions et positions du titre, de la bannière et du bouton conservées par rapport à la v1.
- Source chargée par le navigateur à sa définition native **1388 × 640 px**, proportions conservées, aucun agrandissement.
- Textes inchangés, bouton de même largeur intérieure que CONTINUER, intégralement contenu dans le panneau.
- Aucun débordement horizontal ni défilement interne nécessaire. Sur ordinateur, panneau et bouton visibles sans défilement de page.
- Sur mobile, le panneau se trouve après les quatre cartes : défilement de **page** nécessaire. Après 368 px de défilement dans la capture détaillée, le bouton est entièrement visible au-dessus du footer. Il n'est pas fixé à la fenêtre dans la vue initiale.
- Comparaisons v1/v2 : **zéro pixel modifié hors de la bannière**, aux trois résolutions et dans la vue mobile après défilement. Comparaisons production/v2 : **zéro pixel modifié hors du panneau droit** aux trois résolutions. Résultats chiffrés dans le JSON.
- Captures des trois autres parcours SOLO et de l'Accueil **identiques** avant/après injection de la simulation.
- Clic LANCER LE TUTORIEL : texte et HTML du dialogue identiques à la production ; fermeture fonctionnelle. Aucun champ ni interaction supplémentaire.
- Aucune erreur JavaScript détectée pendant les contrôles.

Inspection visuelle des captures : prisonnier entier, orange et sac identifiables, absence de HUD dans l'illustration, texte et bouton lisibles. Les quatre cartes, le chalet, le personnage de fond, le header et le footer sont conservés.

La suite de tests de production, la compilation et l'export autonome ne sont pas relancés pour cette simulation sans modification de production. Les contrôles ci-dessus ne constituent pas une intégration ni une validation d'un nouvel export hors ligne.

## Reproduction

Depuis la racine du dépôt, avec les dépendances installées, Python/Pillow et Chromium disponibles :

```sh
python docs/reviews/solo-tutorial-v2-parachute/prepare_image.py
npm run dev -- --host 127.0.0.1
# Dans un autre terminal :
node docs/reviews/solo-tutorial-v2-parachute/capture.mjs
python docs/reviews/solo-tutorial-v2-parachute/compare.py
```

Le script utilise `/usr/bin/chromium` avec le GPU désactivé pour stabiliser les comparaisons de pixels, et `http://127.0.0.1:5173` (modifiable via `SCUM_REVIEW_URL`). Le curseur est écarté de la navigation avant de comparer le retour à l'Accueil, afin de conserver le même état de survol. Il applique les styles et le script de revue uniquement au navigateur. La source originale et tous les fichiers de production restent intacts. L'intégration attend la validation visuelle de cette simulation.
