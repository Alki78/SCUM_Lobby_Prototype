# SOLO → TUTORIEL — simulation graphique v1

Simulation à valider, sans intégration en production. Branche `review/solo-tutorial-v1`, issue de `origin/main` au commit `d2f1928325c0376af9af67c1695218b236309c71` (fusion de la PR #11, après les PR #9 et #10).

Seul ce dossier de revue est ajouté. Aucun fichier de production, asset existant, dialogue, état ou comportement n'est modifié. Aucune PR d'intégration ni fusion n'est effectuée.

## Diagnostic et choix de l'illustration

Le panneau actuel affiche le titre TUTORIEL, une illustration provenant de `assets/images/solo-background.jpg`, la description et le bouton de démonstration. Cette ancienne capture contient de l'interface incrustée : elle est écartée pour la proposition. À 1837 × 856, son illustration occupe 495 × 175 px ; son bouton mesure environ 244 × 56 px.

Texte conservé : « Apprenez les bases de la survie dans un mode de jeu dédié avant de vous lancer sur l'île. » Le bouton ouvre toujours MODE DÉMONSTRATION avec « Tutoriel — lancement simulé ». FERMER retourne au même panneau.

| Ressource existante | Définition native | Diagnostic |
| --- | --- | --- |
| `assets/images/home-battleground.png` | 694 × 320 px | **Proposée** : forêt brumeuse, reliefs, tour et survivants équipés. Illustration propre, sans texte ni interface. Définition suffisante sans agrandissement. |
| `assets/images/solo-tutoriel.png` | 264 × 121 px | Cabane propre déjà utilisée sur la carte gauche ; trop petite pour une bannière de 495 px de large (agrandissement ×1,875). Non agrandie. |
| `assets/images/home-communaute.png` | 693 × 320 px | Intérieur avec survivant ; définition suffisante, mais moins proche de la nature sauvage et du campement recherchés. |
| `assets/images/solo-nouvelle-partie-banniere.png` | 640 × 240 px | Paysage propre déjà utilisé dans NOUVELLE PARTIE ; alternative possible mais répétition immédiate de l'autre parcours. |
| `assets/images/solo-background.jpg` | 1100 × 780 px | Ancienne capture composée avec interface : exclue malgré sa définition. |
| `docs/references/Lobby_Solo_Illustrations_Proposition_v1.png` | 1836 × 856 px | Proposition composée avec interface. Ne fournit pas de version autonome suffisamment définie de la petite cabane. Non réutilisée comme fond. |

L'image retenue est une illustration déjà présente dans le dépôt, également utilisée pour Battleground et la carte SOLO de chargement. **Ce choix artistique reste soumis à validation** : le groupe de survivants et la tour donnent une orientation plus militaire qu'une cabane isolée. Il ne s'agit pas d'une nouvelle photographie authentifiée ni d'une nouvelle illustration générée.

L'image complète est réutilisée, sans découpe, retouche colorimétrique, interpolation destinée à augmenter sa définition, ni nouvel asset. Ses dimensions natives et empreintes sont consignées dans [resources.json](resources.json). Le navigateur la réduit pour l'affichage, dans son rapport d'origine.

Aucune version autonome haute définition de la même cabane n'a été trouvée. Si une cabane reste indispensable, demander une capture SCUM propre sans HUD, texte ni logo, idéalement au moins **1000 × 460 px** pour cette bannière, ou une autre illustration propre dont la provenance et les droits seront vérifiés avant validation. La petite cabane ne peut pas devenir une véritable source haute définition par agrandissement.

## Composition proposée

Le titre reste en haut. Une grande bannière horizontale et la description existante occupent la zone centrale ; le bouton prend toute la largeur intérieure et reste ancré en bas. Les couleurs, bordures et textes du prototype sont repris. Aucun contenu pédagogique, formulaire, progression ou fonction supplémentaire n'est ajouté.

La simulation applique uniquement [simulation.css](simulation.css) et [simulation.js](simulation.js) au navigateur, sur le panneau Tutoriel. Le script conserve les nœuds et l'action du bouton existants et mémorise la hauteur du panneau original avant de recomposer son intérieur. Ces fichiers ne sont importés par aucun fichier de production.

## Captures

| Résolution / état | Production avant | Simulation |
| --- | --- | --- |
| 1837 × 856 | [Avant](avant-1837x856.png) | [Tutoriel complet](tutoriel-1837x856.png) |
| 1366 × 768 | [Avant](avant-1366x768.png) | [Tutoriel complet](tutoriel-1366x768.png) |
| 390 × 844 — vue initiale | [Avant](avant-390x844.png) | [Vue initiale](tutoriel-390x844.png) |
| 390 × 844 — après défilement | [Avant](avant-detail-390x844.png) | [Panneau complet](tutoriel-detail-390x844.png) |

- [Comparaison avant/après — captures complètes à 1837 × 856](comparaison-avant-apres-1837x856.png) : assemblage côte à côte, sans réduction des captures.
- [Comparaison rapprochée des panneaux](comparaison-panneaux.png) : découpes littérales des captures, sans redimensionnement.
- [Message de démonstration inchangé](message-demonstration-1837x856.png).

## Vérifications

Les mesures et assertions sont conservées dans [verification.json](verification.json).

| Résolution | Cadre extérieur : x, y ; largeur × hauteur | Bannière affichée | Largeur du bouton | Défilement interne nécessaire |
| --- | --- | --- | --- | --- |
| 1837 × 856 | 675, 178,09 ; 537 × 501,61 px | 495 × 228,23 px | 495 px | Aucun |
| 1366 × 768 | 592,45, 174,48 ; 477,66 × 450,05 px | 443,66 × 204,56 px | 443,66 px | Aucun |
| 390 × 844 | 12, 652 ; 366 × 480 px | 332 × 153,08 px | 332 px | Aucun |

Coordonnées verticales mesurées dans le document, avant défilement. Le cadre extérieur est exactement identique avant/après aux trois résolutions. L'illustration est réduite à environ 71 %, 64 % et 48 % de sa largeur native : aucun agrandissement ni déformation. La forêt, la tour et les survivants restent lisibles à la taille d'affichage ; la définition n'est pas celle d'une source haute résolution pour impression ou zoom.

Résultats du contrôle automatisé Chromium/Playwright et de la revue des captures :

- Titre, description et libellé du bouton identiques ; texte lisible aux trois résolutions.
- Bouton de même largeur intérieure que CONTINUER, entièrement contenu dans le panneau.
- À 1837 et 1366 px, panneau et bouton visibles sans défilement de page.
- À 390 px, le panneau suit les quatre cartes : un défilement **de page** est nécessaire, de 368 px dans la capture détaillée. Le bouton est alors entièrement visible au-dessus du footer. Il n'est pas fixé à la fenêtre dans la vue initiale.
- Aucun débordement horizontal ; aucun défilement interne nécessaire avec ce contenu.
- Géométrie du header, du profil, du footer, des cartes et du panneau inchangée.
- Comparaison des captures avant/après : **zéro pixel modifié hors du panneau droit**, aux trois résolutions, y compris la vue mobile détaillée.
- Captures des parcours CONTINUER, CHARGER UNE SAUVEGARDE et NOUVELLE PARTIE identiques avant/après injection de la simulation.
- Clic LANCER LE TUTORIEL : même message et même HTML de dialogue qu'avant ; fermeture et retour au panneau fonctionnels.
- Aucune erreur JavaScript détectée pendant les parcours contrôlés. Aucun champ ou nouvelle interaction ajouté.

### Reproduction

Avec les dépendances installées et Vite lancé à la racine du dépôt (`npm run dev -- --host 127.0.0.1`), exécuter :

```sh
node docs/reviews/solo-tutorial-v1/capture.mjs
```

Le script utilise `/usr/bin/chromium` et `http://127.0.0.1:5173` (surcharge possible via `SCUM_REVIEW_URL`). Il injecte la simulation uniquement dans le navigateur et régénère les captures et mesures du dossier. Les deux planches de comparaison sont des assemblages des captures, distincts de l'interface.

La suite de production, la compilation et l'export autonome ne sont pas relancés pour cette revue : aucune intégration en production n'est effectuée. Les contrôles décrits ici concernent exclusivement la simulation. Toute intégration et sa validation hors ligne attendent l'approbation visuelle.
