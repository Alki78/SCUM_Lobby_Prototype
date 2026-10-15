# SOLO → TUTORIEL v2 — besoin d'une illustration supplémentaire

**Conclusion : aucune illustration existante ne satisfait simultanément le sujet demandé, la propreté de la source et la définition nécessaire. Aucune simulation v2 avec image de remplacement n'est donc produite.** La composition v1 est validée et reste la référence ; son illustration militaire est écartée, conformément à la demande.

## Base de travail et périmètre

- Branche de revue : `review/solo-tutorial-v2`, créée depuis le dernier `main`, commit `d2f1928325c0376af9af67c1695218b236309c71`. La PR #11 y est fusionnée, après les PR #9 et #10.
- Composition approuvée : branche `review/solo-tutorial-v1`, commit `8ff99b7bf218a3f50afc76c2e113fe7aa149c316`, dossier `docs/reviews/solo-tutorial-v1/`.
- Aucun fichier de production, asset, autre parcours, dialogue, état, texte ou comportement n'est modifié. Aucun remplacement de l'illustration n'est appliqué, même provisoirement. Aucune PR ni fusion.
- Ce dossier contient uniquement le diagnostic et des planches d'inventaire, pas une proposition graphique de remplacement.

## Ressources examinées

L'inventaire comprend les **30 images de production**, les **12 références graphiques** et les **31 occurrences d'images embarquées** dans le HTML V0.4.3. Les 31 images embarquées sont toutes identiques, par SHA-256, à des assets de production existants : aucune source haute définition supplémentaire n'est cachée dans l'ancien HTML.

Les dimensions natives, tailles de fichiers et empreintes sont disponibles dans [inventaire-ressources.json](inventaire-ressources.json). Les planches [production](inventaire-production.jpg) et [références](inventaire-references.jpg) montrent les fichiers entiers réduits en vignettes, avec leurs dimensions natives indiquées. Ces planches servent uniquement à l'inventaire ; elles ne sont ni des assets candidats ni des fonds d'interface.

| Image / groupe | Dimensions natives | Sujet et limite | Décision |
| --- | --- | --- | --- |
| `assets/images/solo-tutoriel.png` | 264 × 121 px | Cabane en forêt avec cibles ; sujet le plus proche. Toit déjà partiellement hors champ. À 495 px de large, il faudrait agrandir ×1,875. | Sujet intéressant, définition insuffisante. Aucun agrandissement. |
| `docs/references/Lobby_Solo_Illustrations_Proposition_v1.png` | 1836 × 856 px | Interface composée où figure la petite cabane, avec masque sombre et titres. Le nombre de pixels de la planche complète n'est pas celui de cette scène. | Ne fournit pas une cabane autonome de 700 px ; aucune extraction supplémentaire. |
| `assets/images/home-battleground.png` | 694 × 320 px | Forêt brumeuse, survivants équipés et tour. Illustration de la v1 refusée pour son orientation militaire. | Exclue ; ne sera pas réutilisée automatiquement. |
| `assets/images/home-dlc.png` | 695 × 320 px | Groupe de survivants équipés, tour et coucher de soleil. | Hors direction artistique, exclue. |
| `assets/images/home-communaute.png` | 693 × 320 px | Intérieur de chalet dominé par un survivant équipé. Pas une scène d'abri rudimentaire ou d'apprentissage dans la nature. | Ne remplace pas automatiquement une illustration militaire par une autre. |
| `assets/images/home-communication-officielle.png` | 2129 × 405 px | Grand panorama de vallée, forêt, tours et soleil. Source de la bannière NOUVELLE PARTIE. | Pas de réemploi automatique du paysage de NOUVELLE PARTIE. Aucun nouveau recadrage proposé. |
| `assets/images/solo-nouvelle-partie-banniere.png` | 640 × 240 px | Vallée et lac, bannière déjà validée pour NOUVELLE PARTIE. | Exclue pour éviter le remplacement explicitement refusé par la demande. |
| `assets/images/solo-nouvelle-partie.png` | 264 × 118 px | Petit paysage lac/forêt. | Trop petit, et sujet de NOUVELLE PARTIE. |
| `assets/images/solo-derniere-session.png` | 444 × 159 px | Tour dans un paysage au coucher du soleil. | Trop petit pour la bannière v1, et pas le sujet recherché. |
| `assets/images/last-session.jpg` | 342 × 193 px | Tour au-dessus d'une vallée boisée. | Définition insuffisante pour une largeur de 495 px. |
| `assets/images/shop-hero.jpg` | 985 × 277 px | Pêcheur et lac, mais texte partiel à gauche, bouton Steam, flèches et indicateurs incrustés. | Capture d'interface exclue ; aucune extraction ou suppression de son interface. |
| `assets/images/shop-detail.jpg` | 494 × 280 px | Même univers de pêche avec personnage équipé et grand logo SCUM intégré. | Logo incrusté, largeur insuffisante ; exclue. |
| `assets/images/shop-angler.jpg`, `shop-stalker.jpg`, `shop-apex.jpg`, `shop-supporter.jpg` | 331 × 124 à 126 px | Vignettes commerciales avec logos, textes et personnages. | Trop petites et composées ; exclues. |
| `assets/images/promo-battleground.jpg`, `promo-dlc.jpg`, `promo-community.jpg` | 228 à 230 × 85 px | Anciennes petites vignettes des scènes déjà inventoriées. | Aucune définition supplémentaire ; exclues. |
| `assets/images/home-news.jpg` | 670 × 63 px | Bande très basse avec texte incrusté. | Inadaptée à une bannière d'environ 228 px de haut. |
| `assets/images/*-background.jpg` | 1100 × 780 px pour les anciennes vues ; 1837 × 715 px pour `home-background.jpg` | Captures de panneaux, menus et/ou lobby composés ; `solo-background.jpg` contient notamment l'ancien panneau SOLO. | Aucune capture composée utilisée pour fabriquer l'illustration. |
| Autres références de `docs/references/` | Dimensions individuelles dans l'inventaire | Maquettes d'interface, planche des illustrations Accueil et capture du chalet. Aucune scène autonome de cabane/campement répondant à la définition demandée. | Pas de découpe dans une interface, pas de prélèvement du décor validé. |

Les copies et captures de revue déjà produites ne constituent pas une nouvelle source haute définition : elles documentent les mêmes illustrations et leurs mises en page. Aucun élément de la maquette complète n'est présenté comme une image autonome propre.

## Composition conservée pour la suite

La v2 doit reprendre sans changement le titre TUTORIEL, la zone horizontale centrale, le paragraphe et le bouton pleine largeur ancré en bas. La composition CSS de la v1 n'a pas été retouchée.

Description à préserver : « Apprenez les bases de la survie dans un mode de jeu dédié avant de vous lancer sur l'île. »

Action à préserver : LANCER LE TUTORIEL → message « Tutoriel — lancement simulé », via le dialogue partagé actuel.

Dimensions relevées et contrôlées dans la v1 approuvée, **pas remesurées dans une nouvelle simulation v2** :

| Résolution | Panneau extérieur | Bannière v1 | Largeur intérieure |
| --- | --- | --- | --- |
| 1837 × 856 | 537 × 501,61 px | 495 × 228,23 px | 495 px |
| 1366 × 768 | 477,66 × 450,05 px | 443,66 × 204,56 px | 443,66 px |
| 390 × 844 | 366 × 480 px | 332 × 153,08 px | 332 px |

## Recommandation et options concrètes

**Option recommandée : fournir une nouvelle image source propre.** Une capture SCUM originale d'une cabane, d'un petit campement ou d'une clairière, sans HUD, menu, texte, logo ni groupe militaire, permettrait de conserver l'identité du projet. Prévoir de l'espace autour du sujet pour le cadrage horizontal.

- Cible pratique : **1000 × 462 px ou davantage**, rapport proche de **2,17:1** ; environ 2 pixels source par pixel affiché à la largeur de 495 px.
- Minimum souhaitable pour cette composition : **700 × 323 px** après découpe. Une source de 700 px de large mais trop basse ne suffit pas pour remplir le cadre sans agrandissement.
- Un original 1920 × 1080 convient aussi si le sujet supporte une découpe horizontale d'environ 2,17:1 ; conserver l'original et valider le cadrage avant intégration.
- Fournir le fichier original et son origine (capture personnelle ou ressource avec autorisation), plutôt qu'une capture de la maquette ou un aperçu compressé.

Autres possibilités à décider : retrouver auprès de l'auteur le **véritable original haute définition de la cabane** ; ou faire créer une nouvelle illustration explicitement provisoire pour le maquettage. Dans ce dernier cas, sa méthode de création, sa provenance et sa définition réelle devront être déclarées et son résultat validé. Aucune nouvelle image n'est créée ou recherchée sur un service externe dans cette étape.

Une nouvelle source doit donc être **fournie ou créée**. Il n'est pas nécessaire de modifier la composition approuvée, de générer de nouvelles fonctions ou de reconstruire le prototype pour résoudre ce besoin.

## Vérifications et limites de livraison

- Dernier `main` confirmé et branche de revue dédiée créée.
- Dimensions réelles lues depuis les fichiers, SHA-256 enregistrés ; inspection visuelle des ressources de production et des références.
- Ancien HTML contrôlé : 31 images embarquées, zéro image absente des assets existants.
- Aucun agrandissement, retouche, nouvelle découpe ou substitution d'illustration.
- Diff de la branche limité à `docs/reviews/solo-tutorial-v2/` ; production et composition v1 inchangées.
- **Captures v2, comparaison v1/v2 et vérifications interactives v2 non réalisées**, puisqu'aucune illustration n'est proposée. Les vérifications de la v1 ne sont pas annoncées comme de nouveaux résultats v2.
- Tests de production, compilation et export autonome non relancés : aucune intégration réalisée et aucun fichier de production modifié.

Après validation d'une nouvelle source, réaliser la simulation et les captures à 1837 × 856, 1366 × 768, puis 390 × 844 avant/après défilement, avec contrôle du cadre extérieur, des pixels hors panneau, du défilement et du message de démonstration. Aucune intégration n'est entreprise avant cette revue visuelle.
