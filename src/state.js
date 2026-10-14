import { optionData } from "./data/settings.js";
export const state = {
  tab: "home",
  multi: "servers",
  solo: "continue",
  serverTab: "community",
  selected: 3,
  search: "",
  region: "Toutes",
  ping: "Tous",
  activity: "Toutes",
  hideEmpty: false,
  hideFull: false,
  hideLocked: false,
  expanded: true,
  favs: new Set([1, 3, 5, 7]),
  ip: "",
  verified: false,
  ipError: "",
  directFav: false,
  infoTab: "all",
  optionCat: "game",
  optionSearch: "",
  settings: {},
  savedSettings: {},
  modal: null,
  match: false,
  matchFound: false,
  newsIndex: 0,
  saveIndex: 0,
};
for (const [cat, items] of Object.entries(optionData)) {
  for (const [name, value] of items) state.settings[cat + "|" + name] = value;
}
state.savedSettings = { ...state.settings };
state.shopSelected = 0;
state.shopPromo = 0;
