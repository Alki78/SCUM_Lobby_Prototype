# Périmètre de la réorganisation V0.4.3

## Référence

Le HTML V0.4.3 à la racine est conservé sans modification. Il constitue la source
du découpage et la référence visuelle/comportementale des tests. Les images sont
décodées depuis ses URI Base64 sans retouche ni réencodage. Les occurrences
identiques partagent désormais un fichier ; leurs 22 empreintes figurent dans
`assets/images/manifest.json`.

## Changements techniques

- Entrée HTML, styles, données, état, rendu et ressources séparés.
- Modules JavaScript natifs ; références entre modules par imports explicites.
- Identifiants de navigation stables distincts des libellés affichés.
- Adaptateur pour les attributs d'événement existants.
- Vite pour le développement et export à un seul HTML avec
  `vite-plugin-singlefile`.
- Tests de comparaison directe avec la référence, sans actualisation de captures
  de référence générées par la nouvelle application.

Les imports entre navigation et pages peuvent être circulaires : ils concernent
des fonctions et ne lancent aucun rendu à l'évaluation des modules. Le démarrage
a lieu uniquement dans `src/main.js`, après l'enregistrement des gestionnaires.

## Limitations volontairement conservées

- Sur petit écran, le profil peut recouvrir certains contrôles.
- Cartes DLC partiellement tronquées sur certains petits écrans.
- Sélection d'un serveur pouvant rester affichée après son exclusion par un filtre.
- Validation permissive de certaines adresses et refus d'autres formats.
- Construction du dialogue boutique après le rendu commun ; l'état
  `shopExternal` n'est pas traité directement par `modalHTML()`.
- Rendu intégral via `innerHTML`, état uniquement en mémoire et attributs
  d'événement inline.
- Accessibilité clavier/focus incomplète sur certaines cartes et dialogues.
- Styles historiques superposés, tailles fixes et polices système.

Ces points appartiennent à des corrections ultérieures. Les améliorer ici
changerait le comportement ou le rendu de référence. L'Accueil reste celui de
la V0.4.3, avec ses six indicateurs de communication et son fond original.

Les comparaisons visuelles sur mobile atteignent les écrans par événements
`click` synthétiques, car le profil de la référence peut recouvrir les contrôles.
Les tests de parcours utilisent de vrais clics sur ordinateur. Ils ne valident
pas l’ergonomie mobile existante ni des corrections d’accessibilité.
