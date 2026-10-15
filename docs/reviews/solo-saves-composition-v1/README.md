# CHARGER UNE SAUVEGARDE — proposition de composition v1

**Simulation de revue uniquement**, sur `review/solo-saves-composition-v1`, issue
du dernier `main` (`5dd6192`, PR #9 fusionnée). Aucun fichier de production,
ressource, dialogue commun ou comportement du prototype n'est modifié.
Aucune PR d'intégration ou fusion n'est créée.

## Captures de la proposition

| Résolution | Alki sélectionné | Prisonnier 02 sélectionné | Composition précédente |
| --- | --- | --- | --- |
| 1837 × 856 | [Proposition Alki](alki-1837x856.png) | [Proposition Prisonnier 02](prisonnier-02-1837x856.png) | [Avant](avant-1837x856.png) |
| 1366 × 768 | [Proposition Alki](alki-1366x768.png) | [Proposition Prisonnier 02](prisonnier-02-1366x768.png) | [Avant](avant-1366x768.png) |
| 390 × 844 | [Vue initiale Alki](alki-390x844.png) | [Vue initiale Prisonnier 02](prisonnier-02-390x844.png) | [Avant](avant-390x844.png) |

**Sur mobile, voir le panneau complet après défilement de la page :**
[Alki](alki-detail-390x844.png) ·
[Prisonnier 02](prisonnier-02-detail-390x844.png).
Ces captures montrent le bouton au-dessus du footer fixe existant.

![Proposition Alki à 1837 × 856](alki-1837x856.png)

## Composition proposée

1. Titre et mention « Personnages locaux (exemples fictifs) » conservés.
2. Trois lignes de 52 px, espacées de 6 px : nom à gauche, commande `✕` à droite.
   La sélection conserve le fond rouge existant, avec un liseré rouge à gauche.
3. Résumé inférieur du personnage sélectionné : nom, temps de jeu, localisation.
4. Bouton de chargement ancré en bas du panneau, sur toute sa largeur intérieure,
   soit **495 px** sur grand écran, comme Continuer. Aucun positionnement absolu
   des contenus : la composition utilise une grille CSS et une liste défilable.

L'ancienne illustration `solo-background.jpg` est retirée **uniquement de la
simulation du panneau Sauvegardes**. La proposition n'utilise aucune grande image
ni aucun portrait. Elle garde un fond sombre et transparent sur le chalet.
Les quatre cartes illustrées, le personnage, le décor, le titre principal, le
header, la navigation et le footer restent ceux de la version validée.

### Données affichées, sans invention de personnage

- **Alki** : 24 h 12 min, Secteur A3 — valeurs déjà présentes dans Dernière session.
  Leur reprise est illustrative ; aucune nouvelle connexion de données de
  production n'est implémentée.
- **Prisonnier 02 et Survivante 03** : « Non renseigné » pour les deux champs,
  puisque le prototype ne fournit pas ces informations.
- Aucun portrait spécifique, date, statistique ou progression n'est inventé.

## Géométrie et défilements

| Résolution | Cadre du panneau conservé | Avant : défilement interne | Proposition : défilement |
| --- | --- | --- | --- |
| 1837 × 856 | x = 675, y ≈ 178,1 ; 537 × 501,6 px | 92 px, bouton initialement masqué | Aucun défilement du panneau ou de la liste ; les trois noms, le résumé et le bouton sont visibles. |
| 1366 × 768 | x ≈ 592,5, y ≈ 174,5 ; 477,7 × 450 px | 136 px, bouton initialement masqué | Aucun défilement du panneau ou de la liste avec les trois personnages actuels. |
| 390 × 844 | x = 12, y = 652 ; 366 × 613 px | Pas de défilement interne : le contenu fait grandir le panneau mobile | Défilement de la **page** nécessaire pour atteindre le panneau sous les quatre cartes. Aucun défilement interne avec ces trois personnages. Les vues de détail sont prises à `scrollY = 501 px`. |

Le panneau mobile conserve aussi sa hauteur extérieure actuelle de 613 px.
Cela laisse davantage d'espace entre la liste et le résumé qu'en desktop ; cette
zone libre résulte de la conservation stricte du cadre. Réduire cette hauteur
constituerait une proposition de géométrie distincte, non réalisée ici.

Le titre, le résumé et le bouton restent hors de la zone défilable. Seule la liste
dispose de `overflow-y: auto` et peut défiler si l'espace disponible devient
insuffisant. Aucun des trois formats demandés n'en a besoin avec trois lignes.
Le bouton est ancré au bas du **panneau**, pas à la fenêtre du navigateur : le
défilement de page reste nécessaire sur mobile.

## Comparaison au diagnostic

| Avant | Proposition |
| --- | --- |
| Grande capture d'interface avec textes incrustés et personnage, sans rapport avec la sélection | Composition sans grande illustration ni portrait, dédiée aux sauvegardes |
| Trois lignes d'environ 70 px | Trois lignes de 52 px, sélection rouge plus nettement délimitée |
| Libellé « Personnage sélectionné » après l'image, partiellement coupé à l'ouverture | Résumé séparé et toujours présent au-dessus de l'action |
| Bouton de 330,3 px sur grand écran, sous la zone visible | Bouton de 495 px, visible en bas du cadre |
| Panneau entier défilant sur ordinateur ; titre perdu après défilement | Cadre non défilant ; liste seule susceptible de défiler |

## Interactions conservées

La simulation déplace les **boutons existants** dans la nouvelle composition,
sans remplacer leurs gestionnaires :

- Clic sur le nom → sélection en mémoire et mise à jour du résumé.
- Clic sur Charger → message de démonstration existant.
- `✕` → confirmation nommée existante ; Annuler conserve les personnages.
- Simuler la suppression → message existant, puis les trois lignes restent en place.
- Le choix de Prisonnier 02 reste en mémoire après ces actions. Continuer affiche
  toujours la dernière session Alki, comme en production.
- Le clic sur le reste d'une ligne n'est pas ajouté. Les dialogues communs et
  leur gestion du clavier/focus ne sont pas corrigés dans cette revue.

## Vérifications et reproduction

[capture.mjs](capture.mjs) charge Vite puis injecte [simulation.css](simulation.css)
et [simulation.js](simulation.js) uniquement dans la page de revue du navigateur.
L'injection se réapplique après les rendus du prototype pour garder les boutons
d'origine fonctionnels. Un lancement normal de l'application n'active pas cette
proposition.

Résultats dans [verification.json](verification.json) :

- Deux sélections aux trois résolutions, onze captures au total, avant inclus.
- Dimensions et positions extérieures identiques à la version de production.
- **Aucun pixel modifié hors du panneau droit**, comparé aux vues avant injection.
- Bouton entièrement contenu dans le panneau, absence de débordement horizontal,
  absence de défilement du panneau et de la liste aux trois résolutions.
- Page principale SOLO identique octet pour octet en capture après retour à
  Continuer ; les styles de la proposition ciblent seulement le panneau de revue.
- Chargement, annulation et suppression simulée vérifiés par de vrais clics aux
  trois résolutions ; trois personnages toujours présents, aucune erreur JavaScript.
- Aucune compilation, modification d'export ou exécution de la suite de
  production : les fichiers du prototype restent inchangés.

Avec Vite déjà lancé à la racine du dépôt :

```sh
node docs/reviews/solo-saves-composition-v1/capture.mjs
```

La hauteur du cadre avant injection est mesurée et conservée par la simulation,
y compris sur mobile. Une future intégration devra reproduire ce résultat avec
les règles responsive retenues après validation ; ce script de revue n'est pas
une nouvelle architecture de production.

Attente de validation visuelle avant toute intégration définitive.
