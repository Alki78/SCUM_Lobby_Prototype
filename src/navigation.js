import { renderHome } from "./pages/home.js";
import { renderSolo } from "./pages/solo.js";
import { renderMulti } from "./pages/multiplayer.js";
import { isDirty, renderOptions } from "./pages/options.js";
import { renderShop } from "./pages/shop.js";
import { renderInfos } from "./pages/infos.js";
import { renderCredits } from "./pages/credits.js";
import { state } from "./state.js";

export function go(tab) {
  if (state.tab === "options" && tab !== "options" && isDirty()) {
    state.modal = { type: "unsaved", target: tab };
    render();
    return;
  }
  if (tab === "credits") {
    state.tab = tab;
    render();
    return;
  }
  state.tab = tab;
  render();
}

export function render() {
  if (state.tab === "home") return renderHome();
  if (state.tab === "solo") return renderSolo();
  if (state.tab === "multiplayer") return renderMulti();
  if (state.tab === "options") return renderOptions();
  if (state.tab === "shop") return renderShop();
  if (state.tab === "infos") return renderInfos();
  if (state.tab === "credits") return renderCredits();
}
