# Illustrations de l’Accueil — proposition v1

Revue préparée depuis `main` (`5d3b773`), sur la branche `review/home-illustrations-v1`.
Source : `docs/references/Lobby_Accueil_Illustrations_Proposition_v1.png`, 2129 × 738 px.
Référence de composition : `docs/references/Lobby_Accueil_v1.png`, 1837 × 856 px.

Les quatre PNG sont des découpes à résolution native, sans redimensionnement,
déformation, retouche, génération ni extraction de la maquette de composition.
Les séparateurs et leurs franges sont exclus. Quelques pixels de bordure sont
écartés sur les scènes inférieures pour préserver une découpe propre.

| Illustration | Fichier | Dimensions | Rapport largeur/hauteur |
| --- | --- | --- | --- |
| Communication officielle | `communication-officielle.png` | 2129 × 405 px | 5,257 |
| Battleground | `battleground.png` | 694 × 320 px | 2,169 |
| DLC | `dlc.png` | 695 × 320 px | 2,172 |
| Communauté | `communaute.png` | 693 × 320 px | 2,166 |

## Comparaison et adaptation

`comparaison-1837x856.png` présente les découpes entières en haut, puis une
simulation proportionnelle du cadrage obtenu avec les règles `cover` actuelles
en bas. C’est une planche de comparaison, pas une capture d’une application
modifiée. Les textes et dégradés de l’interface ne sont pas simulés.

Mesures relevées dans Chromium sur l’application à 1837 × 856 : le fond de la
communication occupe 732 × 252,375 px, et chaque carte 236 × 148,234375 px,
bordures exclues. Leurs rapports sont respectivement 2,901 et 1,592.

- **Communication officielle** : tour à gauche, lac central et soleil à droite
  conservés dans le fichier. Le format très panoramique convient à la bande
  illustrée visible dans la maquette (environ 734 × 140 px). Cependant, le
  `cover` actuel porte sur le panneau complet : il ne conserve que 55,2 % de
  la largeur de l’image et rapproche la tour du bord gauche. Recommandation :
  valider lors de l’intégration une présentation panoramique dans la partie
  illustrée du panneau, sans changer ses dimensions extérieures.
- **Battleground** : tour, brume, groupe et personnage au premier plan
  conservés. Le `cover` actuel conserve 73,4 % de la largeur ; tour et sujet
  principal restent visibles, tandis que les arbres latéraux sont rognés.
- **DLC** : groupe, paysage et coucher de soleil conservés. Le `cover` actuel
  conserve 73,3 % de la largeur et coupe les personnages latéraux. Ce cadrage
  demande une validation attentive : la composition complète ne tient pas
  dans le panneau actuel sans marges ou traitement spécifique ultérieur.
- **Communauté** : personnage central et intérieur du chalet conservés.
  Le `cover` actuel conserve 73,5 % de la largeur ; le personnage reste
  visible, mais une partie du décor latéral disparaît.

La proposition présente des scènes plus larges que les panneaux, contrairement
à un fichier préparé exactement au rapport des panneaux. Les fichiers de revue
conservent donc les compositions intégrales plutôt qu’un recadrage destructif.
Toute adaptation de leur affichage reste à valider avant intégration.

## Vérifications

- Chaque PNG a été rouvert et comparé pixel par pixel à sa région source.
- La planche a été inspectée visuellement ; aucune ligne de séparation n’est
  visible dans les quatre images.
- Le manifeste contient coordonnées de découpe, dimensions et empreintes SHA-256.
- Aucun fichier existant de l’application, de `assets/images/`, des tests ou
  des références n’a été modifié. Les six communications et les interactions
  ne sont pas affectées.
- Aucun test complet de l’application ni nouvel export n’a été exécuté pour
  cette livraison limitée aux ressources de revue.

Reproduction facultative avec Python et Pillow, sans dépendance ajoutée au projet :

```sh
python docs/reviews/home-illustrations/prepare.py
```

Les rééchantillonnages de la planche concernent uniquement les aperçus ; les
quatre PNG livrés restent aux dimensions natives des découpes.
