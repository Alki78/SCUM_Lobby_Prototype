# SOLO → TUTORIEL v2 — intégration pour validation

Branche `feat/solo-tutorial-composition`, issue de `main` au commit `1d77987` : PR #9, #10, #11 et ajout de la capture par la PR #12 intégrés. L'intégration reproduit la simulation approuvée `review/solo-tutorial-v2-parachute` au commit `23142a24ae7006d3048d3d4ec89830eb6f5065a2`.

## Modification du prototype

- `assets/images/solo-tutoriel-largage-banniere.png` : asset dédié, identique au fichier de la simulation et à la découpe des pixels source.
- `src/pages/solo.js` : seul le contenu TUTORIEL est enveloppé dans `.solo-tutorial-intro`, pour centrer la bannière et le paragraphe. Texte, titre, bouton et action conservés.
- `src/styles/pages/solo-tutorial.css` : composition dédiée au Tutoriel ; grille, grande bannière horizontale, bouton pleine largeur ancré en bas. La hauteur est fournie par la géométrie SOLO existante, sans mesure ni injection DOM au runtime.
- `src/main.js` : import de la feuille dédiée.

La source originale, les cartes de gauche, le chalet, le personnage, les autres parcours, la navigation, l'état, les dialogues partagés et la release v0.5.0 restent inchangés. Aucun système pédagogique, lancement de jeu, sauvegarde ni persistance ajouté. L'application charge l'asset dans `assets/images/` ; aucun chemin de revue, marqueur `data-review-tutorial` ou script d'injection de la simulation n'est présent dans l'export.

Les tests ajoutés sont dans `tests/solo-tutorial.spec.js`. Trois fichiers de tests existants sont ajustés : `solo-geometry.spec.js` et `solo-illustrations.spec.js` comparent la nouvelle illustration via sa référence approuvée, en conservant les assertions de palette, de cadre extérieur et de géométrie ; `v043-parity.spec.js` ajoute le nouveau PNG à l'ensemble exact des images attendues dans l'export. Aucun ancien contrôle fonctionnel n'est supprimé.

Le dossier `docs/reviews/solo-tutorial-v2-parachute/` est conservé à l'identique depuis la branche approuvée et ajouté à cette branche d'intégration pour rendre la comparaison reproductible. Les autres dossiers de revue existants ne sont pas modifiés.

## Provenance de la bannière

| Information | Valeur vérifiée |
| --- | --- |
| Source utilisateur | `docs/references/SCUM_Tutoriel_Largage_Reference.png` |
| Définition native | **1650 × 928 px** |
| Découpe, origine en haut à gauche | **x = 131 à 1519 exclus ; y = 140 à 780 exclus** |
| Asset obtenu | **1388 × 640 px**, rapport 694:320 |
| Affichage grand écran | **495 × 228,23 px**, sans agrandissement |
| Traitement | Découpe rectangulaire seule ; aucun étirement, accentuation, recolorisation, interpolation enregistrée ou retouche générative |

Les 640 lignes de pixels RGBA de la bannière sont comparées à la zone correspondante de la source. Les octets PNG et SHA-256 sont également identiques à la bannière approuvée. Source, coordonnées et empreintes sont consignées dans [verification.json](verification.json) et dans le manifeste de la simulation conservée.

Le prisonnier, ses membres visibles et son sac sont conservés intégralement. La barre d'inventaire et le texte au bord inférieur sont exclus par le cadrage, sans retouche. Le flou de mouvement du paysage appartient à la capture source et reste présent.

## Captures définitives

Les huit captures de développement et d'export autonome sont identiques, pixel par pixel, aux captures de la simulation approuvée :

| Résolution / vue | Développement | Export sans réseau |
| --- | --- | --- |
| 1837 × 856 | [Panneau complet](development-1837x856.png) | [Hors ligne](offline-1837x856.png) |
| 1366 × 768 | [Panneau complet](development-1366x768.png) | [Hors ligne](offline-1366x768.png) |
| 390 × 844 — initiale | [Vue initiale](development-390x844.png) | [Hors ligne](offline-390x844.png) |
| 390 × 844 — après défilement | [Panneau et bouton](development-detail-390x844.png) | [Hors ligne](offline-detail-390x844.png) |

[Comparaison rapprochée simulation approuvée / intégration définitive](comparaison-simulation-integration.png) : panneaux découpés dans les captures à 1837 × 856 et assemblés sans redimensionnement.

## Géométrie et interactions

| Résolution | Panneau : x, y ; largeur × hauteur | Bannière | Bouton |
| --- | --- | --- | --- |
| 1837 × 856 | 675, 178,09 ; 537 × 501,61 px | 495 × 228,23 px | Largeur 495 px |
| 1366 × 768 | 592,45, 174,48 ; 477,66 × 450,05 px | 443,66 × 204,56 px | Largeur 443,66 px |
| 390 × 844 | 12, 652 ; 366 × 480 px | 332 × 153,08 px | Largeur 332 px |

- Cadre extérieur et pixels de l'ensemble de la page identiques à la simulation approuvée ; aucun changement visuel hors du panneau Tutoriel.
- Texte et bouton lisibles, aucune barre d'inventaire ni HUD dans la bannière.
- Aucun débordement horizontal ni défilement interne nécessaire aux trois résolutions.
- Sur ordinateur, panneau et bouton entièrement visibles sans défilement de page.
- Sur mobile, défilement de page de 368 px pour la capture détaillée, comme dans la simulation ; bouton intégralement visible au-dessus du footer. La vue initiale ne montre pas encore le bouton.
- Bouton LANCER LE TUTORIEL : « Tutoriel — lancement simulé ». FERMER ferme le dialogue et retourne au panneau, sans autre fonction.
- **27 vues hors Tutoriel identiques pixel par pixel à `main`** : Accueil, les trois autres parcours SOLO, Multijoueur, Options, Shop, Infos et Crédits, aux trois résolutions. Empreintes dans [unchanged-views.json](unchanged-views.json), résultat dans [unchanged-views-result.json](unchanged-views-result.json). Les animations du générique sont désactivées uniquement pendant ces comparaisons de captures pour éliminer les différences temporelles ; le code de production reste intact.

La référence `main` de cette comparaison a été servie depuis une copie locale des fichiers du commit `1d77987` sur le port 5174, sans changer les fichiers de la branche d'intégration ni créer de worktree Git.

## Tests et export autonome

Commandes exécutées :

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
  SCUM_TUTORIAL_CAPTURE_DIR=docs/reviews/solo-tutorial-integration npm test -- --workers=4
npm run format:check
node docs/reviews/solo-tutorial-integration/verify-unchanged.mjs
node docs/reviews/solo-tutorial-integration/verify-file-offline.mjs
```

`npm test` compile la production puis exécute la suite complète. La relance finale utilise quatre workers via la ligne de commande, sans modifier la configuration du projet. Les tests ciblés du Tutoriel vérifient les pixels de l'asset, les proportions, la géométrie, les captures approuvées, le dialogue et sa fermeture aux trois résolutions, en développement puis avec les octets de `dist/index.html` chargés dans un contexte hors ligne. Aucune requête externe ni erreur JavaScript n'est détectée pendant ces vérifications.

L'export contient la bannière exacte sous forme de `data:image/png;base64,…`, avec le CSS et le JavaScript intégrés. Le contrôle de parité vérifie que `dist/` contient seulement `index.html` et l'ensemble exact des images originales et ajoutées, sans ressource externe requise.

**Limite de vérification de cet environnement :** l'ouverture directe de `file:///…/dist/index.html` est bloquée par la politique du navigateur cloud (`ERR_BLOCKED_BY_ADMINISTRATOR`). Cette interdiction n'est pas contournée. Le contrôle complémentaire charge les mêmes octets HTML dans un document en contexte hors ligne, vérifie les sept rubriques, le décodage de la bannière embarquée et le dialogue Tutoriel, avec zéro requête externe. L'ouverture directe par double-clic reste donc à confirmer sur une machine autorisant `file://`. Détails, empreinte et taille exacte de l'export dans [offline-file-result.json](offline-file-result.json).

**Résultat final : 51 tests réussis, zéro échec ; compilation et contrôle de formatage réussis.** Les résultats définitifs sont consignés dans [checks.json](checks.json). Aucune nouvelle release ni aucun tag n'est créé ; la fusion de la PR attend la validation finale.
