import { btn, side } from "../components/buttons.js";
import { shell } from "../components/shell.js";
import { render } from "../navigation.js";
import { state } from "../state.js";
import { $, escapeHTML } from "../utils/dom.js";
import { optionData } from "../data/settings.js";
import { optionCategories, labelFor } from "../data/navigation.js";

export function isDirty() {
  return Object.keys(state.settings).some(
    (k) => state.settings[k] !== state.savedSettings[k],
  );
}

export function setOption(k, v) {
  state.settings[k] = v;
  render();
}

export function renderOptions() {
  const query = state.optionSearch.trim().toLowerCase();
  const cats = query ? Object.keys(optionData) : [state.optionCat];
  const entries = cats.flatMap((cat) =>
    optionData[cat]
      .filter(([name]) => !query || name.toLowerCase().includes(query))
      .map((item) => ({ cat, item })),
  );
  const help =
    "Sélectionnez un paramètre pour modifier son comportement. Certaines modifications peuvent nécessiter un redémarrage du jeu.";
  shell(
    `<div class="layout">${side(optionCategories, state.optionCat, "setOptionCat")}<div><h1>OPTIONS</h1><p class="lead">Configurez votre expérience de jeu selon vos préférences.</p><input class="input" placeholder="⌕ Rechercher un paramètre dans toutes les catégories…" value="${escapeHTML(state.optionSearch)}" oninput="state.optionSearch=this.value;refreshOptionSearch()"><div class="settings-layout" style="margin-top:15px"><div class="panel"><h2>${query ? "RÉSULTATS DE RECHERCHE" : "PARAMÈTRES — " + labelFor(optionCategories, state.optionCat)}</h2><div class="setting-list">${
      entries
        .map(
          ({ cat, item: [name, def, values] }) =>
            `<div class="setting"><label>${query ? `<span class="small muted">${labelFor(optionCategories, cat)} · </span>` : ""}${escapeHTML(name)}</label><select onchange="setOption('${cat}|${name.replaceAll("'", "\\'")}',this.value)">${values
              .split("|")
              .map(
                (v) =>
                  `<option ${state.settings[cat + "|" + name] === v ? "selected" : ""}>${escapeHTML(v)}</option>`,
              )
              .join("")}</select></div>`,
        )
        .join("") || '<div class="empty">Aucun paramètre trouvé.</div>'
    }</div></div><aside class="panel"><h3>AIDE CONTEXTUELLE</h3><p class="muted">${help}</p><p class="note">Valeurs d'exemple pour le prototype, non synchronisées avec SCUM.</p></aside></div><div class="actions">${btn("RÉINITIALISER LA CATÉGORIE", "resetAsk('category')")}${btn("TOUT RÉINITIALISER", "resetAsk('all')")}${btn("✓ APPLIQUER", "applySettings()", "red").replace("<button", "<button " + (!isDirty() ? "disabled" : ""))}</div></div></div>`,
    "options",
  );
}

export function refreshOptionSearch() {
  const v = state.optionSearch;
  render();
  const el = $(".wrap > .layout input.input");
  if (el) {
    el.focus();
    el.setSelectionRange(v.length, v.length);
  }
}

export function setOptionCat(x) {
  state.optionCat = x;
  state.optionSearch = "";
  render();
}

export function applySettings() {
  state.savedSettings = { ...state.settings };
  render();
}

export function resetAsk(mode) {
  state.modal = { type: "reset", mode };
  render();
}

export function resetConfirm() {
  const mode = state.modal.mode;
  for (const [cat, items] of Object.entries(optionData)) {
    if (mode === "all" || cat === state.optionCat)
      for (const [name, def] of items) state.settings[cat + "|" + name] = def;
  }
  state.modal = null;
  render();
}

export function leaveOptions(mode) {
  if (mode === "apply") state.savedSettings = { ...state.settings };
  else state.settings = { ...state.savedSettings };
  const target = state.modal.target;
  state.modal = null;
  state.tab = target;
  render();
}
