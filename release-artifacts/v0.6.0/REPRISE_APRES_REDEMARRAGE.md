# Reprise v0.6.0 — transfert uniquement

Le fichier HTML est déjà compilé et validé : ne pas reconstruire ni modifier les sources.

- Main utilisé : `1e9f01673d68dedca85b554268be607649df151a`.
- Fichier local : `/workspace/output/releases/v0.6.0/SCUM_Lobby_Prototype_v0.6.0.html`.
- Taille : 18 463 207 octets.
- SHA-256 : `59161fb640d9eaad389584a78cd55122a5c9665378bbd4b8a02663833c9c77af`.
- Sauvegarde indépendante du disque cloud : branche `artifacts/v0.6.0` du dépôt `Alki78/SCUM_Lobby_Prototype`, dossier `release-artifacts/v0.6.0/`.
- Brouillon existant : release GitHub ID `413905033`, tag prévu `v0.6.0`.
- URL : https://github.com/Alki78/SCUM_Lobby_Prototype/releases/tag/untagged-aef9cfc4f101ad6d0c23

Après redémarrage :

1. Rechercher le fichier local et vérifier sa taille et son SHA-256.
2. Si absent, récupérer ses octets depuis la branche d'archive (sans reconstruire).
3. Lire le brouillon existant et sa liste de pièces jointes. S'il contient déjà le fichier exact, vérifier son intégrité plutôt que le remplacer.
4. Sinon, utiliser `gh release upload v0.6.0 /workspace/output/releases/v0.6.0/SCUM_Lobby_Prototype_v0.6.0.html --repo Alki78/SCUM_Lobby_Prototype`.
5. Vérifier le nom, la taille, le SHA-256 de la pièce jointe et le maintien de `draft: true`.
6. Ne pas publier la release, créer de tag définitif, modifier v0.5.0 ni toucher aux sources. Attendre l'accord de l'utilisateur.
