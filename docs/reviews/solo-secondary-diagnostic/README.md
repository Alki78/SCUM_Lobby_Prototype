# SOLO — diagnostic des parcours secondaires

Diagnostic uniquement, réalisé à **1837 × 856**, depuis `main` au commit
`5dd61923be6df5eb6e9b0cf28eb0f1c9e02d4985` : fusion de la PR #9 confirmée
sur GitHub. Branche de documentation : `review/solo-secondary-diagnostic`.
Aucun fichier de production, style, ressource ou comportement n'est modifié.
Aucune PR, fusion, compilation ou modification de release n'est effectuée.

## Captures prioritaires — Charger une sauvegarde

| État observé | Capture 1837 × 856 |
| --- | --- |
| Ouverture, Alki sélectionné | [03 — Liste en haut du panneau](03-sauvegardes-haut.png) |
| Sélection de Prisonnier 02 | [04 — Sélection](04-sauvegardes-selection.png) |
| Après défilement pour atteindre l'action | [05 — Bas du panneau et bouton Charger](05-sauvegardes-bas.png) |
| Chargement simulé | [06 — Message de démonstration](06-sauvegardes-chargement.png) |
| Demande de suppression de Survivante 03 | [07 — Confirmation nommée](07-confirmer-suppression.png) |
| Validation de la suppression simulée | [08 — Message de simulation](08-suppression-simulee.png) |
| Retour après simulation | [09 — Trois personnages toujours présents](09-sauvegardes-apres-suppression.png) |

## Autres captures

| Parcours | Panneau | Fenêtre après action |
| --- | --- | --- |
| Continuer | [01 — Dernière session](01-continuer.png) | [02 — Chargement de la partie solo](02-continuer-demonstration.png) |
| Nouvelle partie | [10 — Panneau](10-nouvelle-partie.png) | [11 — Création non reproduite](11-creation-demonstration.png) |
| Tutoriel | [12 — Panneau](12-tutoriel.png) | [13 — Lancement simulé](13-tutoriel-demonstration.png) |

## Fonctionnement commun

Le clic sur chaque carte conserve les quatre cartes à gauche, applique l'état
rouge de sélection et remplace le contenu du panneau de droite. Il n'ouvre pas
directement une partie ou une fenêtre : un second clic sur le bouton du panneau
déclenche l'action. Ce fonctionnement est défini dans `src/pages/solo.js`.

Les quatre parcours utilisent les dialogues communs de
`src/components/dialogs.js`, affichés au-dessus d'un voile sombre. Le fond, les
illustrations des cartes et la présentation principale validés dans la PR #9
restent en place dans tous les états.

## Inventaire fonctionnel

| Action | Au clic sur la carte / bouton du panneau | Simulation existante | Fonctionnalités absentes |
| --- | --- | --- | --- |
| CONTINUER | Carte → Dernière session SOLO : bannière, portrait Alki, descriptif, durée et secteur. `▶ CONTINUER LA PARTIE` → fenêtre `MODE DÉMONSTRATION` affichant « Chargement de la partie solo », puis `FERMER`. | Dernière session fictive fixe et fenêtre de retour d'action. Pas de confirmation avant chargement. | Recherche d'une sauvegarde, état sans dernière session, validation de disponibilité, chargement réel, progression ou erreur de chargement. |
| CHARGER UNE SAUVEGARDE | Carte → trois lignes : Alki, Prisonnier 02, Survivante 03. Clic sur un nom → sélection rouge et libellé mis à jour. `CHARGER CETTE SAUVEGARDE` → « Chargement de la sauvegarde » + `FERMER`. `✕` → confirmation nommée avec `ANNULER` et `SIMULER LA SUPPRESSION`, puis « Suppression simulée » + `FERMER`. | Sélection en mémoire, annulation, confirmation sur le personnage ciblé et messages de chargement/suppression. | Données propres aux personnages, portrait/aperçu associé, dates/durées/secteurs par sauvegarde, liste vide, création/import, état incompatible/corrompu, persistance et chargement réel. Même la liste fictive n'est pas modifiée après suppression. |
| NOUVELLE PARTIE | Carte → titre, illustration, paragraphe explicatif et `CRÉER UN PERSONNAGE`. Bouton → « Création de personnage — écran du jeu non reproduit » + `FERMER`. | Entrée vers la création représentée par un message explicite. | Écran de création, saisie de nom, choix d'apparence/règles/difficulté, validation, création d'une sauvegarde et premier lancement. Pas de confirmation d'écrasement : aucune sauvegarde n'est créée ou écrasée. |
| TUTORIEL | Carte → titre, illustration, description et `LANCER LE TUTORIEL`. Bouton → « Tutoriel — lancement simulé » + `FERMER`. | Entrée de tutoriel et message de lancement. | Contenu pédagogique, étapes/progression, reprise/recommencement, chargement réel et validation de fin. Aucun effet sur les sauvegardes. |

L'absence de chargement réel ou de connexion au jeu relève du périmètre actuel
du prototype. Pour finaliser un parcours de maquettage, une simulation plus
complète peut suffire ; l'implémentation du jeu ne constitue pas un prérequis.

### Observations propres aux sauvegardes

- Alki est sélectionné au premier chargement. Les trois noms sont codés en dur,
  répétés dans le template ; seul `state.saveIndex` identifie le choix.
- Seul le bouton portant le nom sélectionne la ligne. Le clic au milieu de
  l'espace vide de la ligne ne sélectionne pas le personnage.
- La confirmation de suppression désigne bien la ligne ciblée, même quand elle
  n'est pas sélectionnée : test effectué avec Prisonnier 02 sélectionné et
  suppression demandée pour Survivante 03.
- `ANNULER` conserve la sélection et les trois lignes. `SIMULER LA SUPPRESSION`
  ne retire aucune ligne et n'effectue aucune écriture.
- Le message de chargement ne rappelle pas le nom choisi. Après simulation du
  chargement de Prisonnier 02, le parcours Continuer affiche toujours Alki.
  Les deux écrans ne partagent pas de modèle de dernière session simulée.
- Le choix est conservé lors d'une navigation hors de SOLO puis retour. Un
  rechargement de page réinitialise le prototype à Accueil, Continuer et Alki.
  Aucune persistance de sauvegardes n'est implémentée.

## Géométrie, lisibilité et ressources

Les mesures exactes et les textes affichés sont dans
[observations.json](observations.json). Le cadre extérieur reste identique
dans les quatre parcours : panneau droit à x = 675, y ≈ 178,1,
largeur 537 px et hauteur ≈ 501,6 px ; les cartes de gauche restent fixes.

| Élément | Constat mesuré ou observé | Conséquence pour la revue |
| --- | --- | --- |
| Sauvegardes : contenu vertical | `scrollHeight = 592`, `clientHeight = 500`, soit 92 px de défilement interne. Le bouton commence à y ≈ 695,1 alors que le panneau se termine à y ≈ 679,7. | Le bouton Charger est entièrement masqué à l'ouverture ; le libellé de sélection est partiellement coupé. Au bas du panneau, son titre disparaît. Revoir la composition interne sans redimensionner le cadre validé. |
| Sauvegardes : boutons | Charger mesure ≈ 330,3 × 56 px, aligné à gauche ; Continuer mesure 495 × 57 px et occupe toute la largeur intérieure. | Hiérarchie et largeur des actions différentes. Ce comportement préexiste ; aucune maquette secondaire ne permet d'imposer une nouvelle largeur. |
| Nouvelle partie / Tutoriel | Aucun débordement vertical observé à cette résolution. Boutons respectivement ≈ 272,1 × 56 et 244,1 × 56 px, avec un grand espace libre entre description et action. | Composition peu informative, actions de largeur variable ; à définir dans une proposition secondaire sans changer les cadres. |
| Illustration des trois panneaux secondaires | Tous utilisent `assets/images/solo-background.jpg` (1100 × 780), via la règle commune `.illustration` de `src/styles/base.css`. Affichage dans une boîte de 495 × 175 px, en `cover`. | Cette ressource est une ancienne capture complète d'interface : personnage, portrait Alki, titres et métadonnées sont visibles dans l'image. Le cadrage panoramique coupe la capture et rend les petits textes incrustés flous et incohérents avec la sélection. |
| Dernière session | Bannière propre `solo-derniere-session.png` (444 × 159), portrait `avatar.png` (65 × 64), et présentation validée conservés. | Aucun nouveau défaut de géométrie constaté. Durée et secteur fixes ; les informations ne suivent pas la sauvegarde choisie. |
| Lisibilité | Les noms et descriptions HTML sont lisibles à 1837 × 856. Les lignes non sélectionnées sont transparentes sur le décor ; la sélection rouge est perceptible. | Les éléments les plus confus sont les textes intégrés à l'ancienne illustration et le libellé de sélection coupé dans Sauvegardes. Aucun contraste chiffré n'est revendiqué. |
| Pictogrammes | `▶` du bouton Continuer et `✕` des suppressions sont des caractères Unicode. `✕` n'a pas de libellé accessible indiquant le personnage à supprimer. | Rendu dépendant de la police/système ; la capture montre un triangle orange de type emoji dans Continuer. Des SVG SOLO et des noms accessibles demanderaient une validation dédiée. |

Les illustrations des cartes de gauche restent les quatre ressources approuvées.
Le problème d'image concerne uniquement l'illustration **interne du panneau droit**
de Sauvegardes, Nouvelle partie et Tutoriel. Aucune ressource n'est remplacée
pendant ce diagnostic.

### Ressources propres déjà disponibles pour une future proposition

| Usage envisagé, sous réserve de validation | Fichier existant | Dimensions |
| --- | --- | --- |
| Aperçu Sauvegardes, forêt/survivants | `assets/images/home-battleground.png` | 694 × 320 |
| Aperçu Nouvelle partie, lac/forêt | `assets/images/solo-nouvelle-partie.png` | 264 × 118 |
| Aperçu Tutoriel, cabane | `assets/images/solo-tutoriel.png` | 264 × 121 |
| Portrait Alki | `assets/images/avatar.png` | 65 × 64 |

Les petites découpes de Nouvelle partie et Tutoriel ont été approuvées pour les
demi-cartes. Dans une illustration de panneau de 493 px de large hors bordure,
leur largeur serait multipliée par environ 1,87 : leur usage à cette taille
demande une nouvelle revue de netteté ou une source plus définie. Aucun portrait
distinct de Prisonnier 02 ou Survivante 03 n'est identifié dans les ressources
de production ; réutiliser Alki pour ces deux personnages risquerait de créer
une confusion. Une vignette neutre ou une ressource fournie pourrait être proposée.

## Fenêtres et confirmations

- Fenêtres centrées, largeur maximale 510 px, texte lisible à la résolution
  examinée. La suppression identifie le personnage et affiche explicitement
  qu'aucun fichier ne sera modifié.
- Il existe une confirmation avant suppression, puis un message de simulation.
  Continuer, Charger, Créer et Tutoriel ouvrent directement un message informatif.
- Le rendu complet recrée le panneau à chaque sélection/action/fermeture : son
  défilement repart en haut. C'est particulièrement gênant après avoir atteint
  le bouton Charger en bas du panneau.
- Le focus passe au `BODY` à l'ouverture ; la première tabulation atteint le
  bouton Accueil derrière le voile, sans être retenue dans la fenêtre.
- Aucun `role="dialog"`, `aria-modal`, association de titre ou gestion de
  restitution du focus n'est prévu dans le composant actuel.
- Échap et le clic sur le voile ne ferment pas la fenêtre dans le parcours
  testé. Seuls ses boutons ferment ou enchaînent les messages.

Ces comportements viennent du composant de dialogue partagé. Une correction
future doit expliciter son périmètre afin de respecter l'interdiction de
modifier les autres rubriques sans validation.

## Comparaison aux références présentes

Deux références SOLO sont présentes :

- `docs/references/Lobby_Solo_v1.png` : **1536 × 1024**, maquette initiale.
- `docs/references/Lobby_Solo_Illustrations_Proposition_v1.png` : **1836 × 856**,
  proposition graphique ultérieure.

**Les deux montrent uniquement Continuer / Dernière session SOLO. Aucun écran
détaillé Sauvegardes, Création, Tutoriel ou confirmation de suppression n'est
fourni dans `docs/references/`.** Leurs compositions secondaires ne peuvent donc
pas être qualifiées conformes ou non conformes à une maquette dédiée.

| Aspect | Références | Prototype après PR #9 / interprétation |
| --- | --- | --- |
| Structure de navigation SOLO | Quatre choix à gauche et panneau de détail à droite. | Les quatre choix existent et restent stables ; les parcours secondaires utilisent le même cadre. |
| Dernière session | Nom, portrait, bannière et quatre informations : mode de jeu, dernière session datée, temps de jeu, localisation. | Bannière et portrait présents. Mode indiqué dans le descriptif, durée et secteur présents ; date/heure de dernière session absentes, mode sans ligne dédiée. Écart documentaire existant, pas une régression de la PR #9. |
| Pictogrammes | La maquette initiale présente des icônes pour les métadonnées et des chevrons de cartes. La proposition ultérieure simplifie plusieurs de ces éléments. | Pictogrammes de métadonnées absents, triangle Unicode conservé. La géométrie et les illustrations de la version intégrée sont approuvées ; ces éléments ne sont pas corrigés ici. |
| Illustrations internes des états secondaires | Aucune illustration de panneau secondaire précisément spécifiée. | L'ancienne capture d'interface ne constitue pas une scène propre ; des ressources indépendantes sont nécessaires pour une proposition cohérente. |
| Liste et gestion de sauvegardes | Aucun état détaillé dans les deux images. | Trois noms et deux actions par ligne, sans fiches riches. Métadonnées et composition finale restent à concevoir puis à valider. |
| Décor et présentation principale | La première maquette possède un décor extérieur, la proposition ultérieure un chalet. | Le chalet et les quatre cartes de la PR #9 sont approuvés. Ce diagnostic ne remet pas en chantier le décor, le personnage, les cartes ou la navigation. |

Les différences de ratio entre les références ne permettent pas une superposition
à l'identique de la maquette initiale sur la capture 1837 × 856. Les dimensions
actuelles des cadres sont celles déjà validées dans la PR #7.

## Ordre de travail proposé, à valider

1. **Sauvegardes — composition et illustrations.** Définir une proposition du
   contenu interne rendant la sélection et le bouton Charger accessibles sans
   le défilement actuel, en gardant les cadres validés. Remplacer dans une
   simulation la capture d'interface par une ressource propre et présenter les
   informations utiles du personnage sélectionné. Faire valider cette composition
   avant intégration, puisqu'aucune maquette secondaire n'existe.
2. **Sauvegardes — cohérence de la simulation.** Définir quelles données doivent
   suivre la sélection, si la suppression doit retirer une entrée fictive et si
   le chargement doit mettre à jour Dernière session. Prévoir les états vide,
   annulation et retour. Décider séparément d'une éventuelle persistance locale.
3. **Nouvelle partie et Tutoriel.** Préparer des illustrations internes propres et
   une proposition de contenu plus précis. Décider si le périmètre attendu reste
   le message de démonstration ou comprend des étapes interactives supplémentaires.
   Vérifier la définition des petites découpes avant toute réutilisation en grand.
4. **Fenêtres, accessibilité et finitions.** Valider un traitement du focus, des
   libellés de suppression, de la fermeture au clavier et du maintien du
   défilement. Définir le périmètre SOLO des changements au dialogue partagé.
   Les pictogrammes et métadonnées manquantes de Dernière session constituent
   une éventuelle intervention distincte sur la page principale, à autoriser.

## Méthode et limites du diagnostic

[capture.mjs](capture.mjs) utilise l'application Vite du dernier `main`, avec de
vrais clics. Il attend les images et les polices, sans injection CSS, modification
DOM ou altération des états pour changer le rendu. Les sélections et dialogues
sont ceux du prototype. Treize captures ont été réalisées, sans erreur JavaScript.
Le JSON consigne aussi le retour après navigation et après rechargement.

Ce diagnostic couvre **1837 × 856 uniquement** ; aucune nouvelle vérification
mobile, compilation, batterie de tests ou validation d'export n'est revendiquée.
Les tests et l'export de la PR #9 ont été validés lors de son intégration.
Les actions de lancement, de création et de suppression ne sont jamais reliées
à des données de jeu réelles dans ce prototype.

Pour reproduire les captures avec Vite déjà lancé :

```sh
node docs/reviews/solo-secondary-diagnostic/capture.mjs
```

Attente des instructions de revue avant toute correction.
