# SCUM / Community Rework — référence v0.5.0

Jalon de référence de la phase de maquettage, issu de `main` au commit
`b5971c8f6d78a39d2632dd1c166443c6643b8c33`. Les PR #2, #3, #5 et #6 sont intégrées.

## Fonctionnalités

- Accueil validé : géométrie, décor SCUM authentique, quatre illustrations et
  cadrages approuvés, huit pictogrammes SVG monochromes intégrés.
- Sept rubriques : Accueil, Solo, Multijoueur, Options, DLC / Shop, Infos et Crédits.
- Six communications officielles, carrousel boutique, filtres et favoris des
  serveurs, paramètres, dialogues et parcours de jeu simulés.
- Distribution en un HTML autonome avec CSS, JavaScript, 27 images et SVG intégrés.

## Limites connues

- Prototype communautaire : données, parties, serveurs, sauvegardes et achats
  simulés ; aucune connexion au jeu ni backend. L’état reste en mémoire.
- Les liens externes, notamment Steam, nécessitent Internet lorsqu’ils sont ouverts.
- L’ergonomie mobile et l’accessibilité clavier/focus restent partielles sur
  certaines rubriques. Des pictogrammes Unicode subsistent hors de l’Accueil et
  peuvent varier selon les polices du système.
- Le titre HTML et la version du package restent à **v0.4.3**. **v0.5.0** désigne
  ce jalon et le nom de l’artefact ; le prototype n’a pas été modifié pour le préparer.

Fichier à joindre : `SCUM_Lobby_Prototype_v0.5.0.html` (10 499 244 octets).
Il est identique à `dist/index.html`. La validation hors ligne est effectuée
dans Chromium avec le réseau désactivé ; l’environnement bloque `file://`,
donc l’ouverture par double-clic reste à vérifier sur un poste local.

Release et tag GitHub non créés : publication en attente de validation.

Validation : 30 tests réussis, compilation de production et formatage réussis.
Navigation et export hors ligne vérifiés aux résolutions 1837 × 856,
1366 × 768 et 390 × 844 ; autres rubriques également comparées à V0.4.3.
