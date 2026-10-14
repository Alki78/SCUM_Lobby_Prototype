// Stable identifiers; labels remain identical to V0.4.3.
export const topNavigation = [
  {
    id: "home",
    label: "ACCUEIL",
  },
  {
    id: "solo",
    label: "SOLO",
  },
  {
    id: "multiplayer",
    label: "MULTIJOUEUR",
  },
  {
    id: "options",
    label: "OPTIONS",
  },
  {
    id: "shop",
    label: "DLC / SHOP",
  },
  {
    id: "infos",
    label: "INFOS",
  },
  {
    id: "credits",
    label: "CRÉDITS",
  },
];
export const soloNavigation = [
  {
    id: "continue",
    label: "CONTINUER",
    description: "Reprendre la dernière partie solo",
  },
  {
    id: "load",
    label: "CHARGER UNE SAUVEGARDE",
    description: "Choisir un personnage existant",
  },
  {
    id: "new",
    label: "NOUVELLE PARTIE",
    description: "Créer un nouveau personnage",
  },
  {
    id: "tutorial",
    label: "TUTORIEL",
    description: "Apprendre les bases de la survie",
  },
];
export const multiNavigation = [
  {
    id: "servers",
    label: "SERVEURS PUBLICS",
  },
  {
    id: "battleground",
    label: "BATTLEGROUND",
  },
  {
    id: "direct",
    label: "CONNEXION DIRECTE",
  },
  {
    id: "rent",
    label: "LOUER UN SERVEUR",
  },
];
export const serverTabs = [
  {
    id: "official",
    label: "OFFICIELS",
  },
  {
    id: "community",
    label: "COMMUNAUTÉ",
  },
  {
    id: "favorites",
    label: "FAVORIS",
  },
];
export const infoTabs = [
  {
    id: "all",
    label: "TOUT",
  },
  {
    id: "news",
    label: "ACTUALITÉS",
  },
  {
    id: "patch-notes",
    label: "PATCH NOTES",
  },
  {
    id: "hotfix",
    label: "HOTFIX",
  },
];
export const optionCategories = [
  {
    id: "game",
    label: "JEU",
  },
  {
    id: "video",
    label: "VIDÉO",
  },
  {
    id: "graphics",
    label: "GRAPHISMES",
  },
  {
    id: "sound",
    label: "SON",
  },
  {
    id: "mouse",
    label: "SOURIS",
  },
  {
    id: "controls",
    label: "CONTRÔLES",
  },
];
export function labelFor(items, id) {
  return items.find((item) => item.id === id)?.label ?? id;
}
