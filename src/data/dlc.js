import { images } from "../assets.js";
export const shopArt = {
  hero: images["shop-hero"],
  angler: images["shop-angler"],
  stalker: images["shop-stalker"],
  apex: images["shop-apex"],
  supporter: images["shop-supporter"],
  detail: images["shop-detail"],
};
export const shopDLC = [
  {
    name: "SCUM - Specialist Angler Pack",
    short: "Specialist Angler Pack",
    art: "angler",
    description:
      "Équipements, appâts et vêtements exclusifs pour les passionnés de pêche.",
    detail:
      "Un ensemble d’équipements, d’appâts et de vêtements exclusifs dédiés aux amateurs de pêche. Découvrez de nouvelles tenues et des accessoires pour votre expérience de survie sur l’île.",
    price: "7,99 €",
    old: "9,99 €",
    sale: "-20%",
    owned: false,
  },
  {
    name: "SCUM - Stalker Outfit Pack",
    short: "Stalker Outfit Pack",
    art: "stalker",
    description:
      "Tenues de camouflage, équipements et accessoires pour devenir un véritable traqueur.",
    detail:
      "Une sélection de vêtements et d’accessoires à l’esthétique survie et camouflage.",
    price: "9,99 €",
    owned: false,
  },
  {
    name: "SCUM - Apex Predator Pack",
    short: "Apex Predator Pack",
    art: "apex",
    description: "Tenues et équipements premium pour votre prisonnier.",
    detail:
      "Des tenues et éléments cosmétiques inspirés des prédateurs de l’île.",
    price: "9,99 €",
    owned: true,
  },
  {
    name: "SCUM - Supporter Pack",
    short: "Supporter Pack",
    art: "supporter",
    description:
      "Soutenez le développement de SCUM et obtenez du contenu exclusif.",
    detail:
      "Un pack de soutien au développement de SCUM avec du contenu additionnel.",
    price: "4,99 €",
    owned: false,
  },
];
