import { render } from "../navigation.js";
import { state } from "../state.js";
import { $ } from "../utils/dom.js";

export function renderCredits() {
  $("#app").innerHTML =
    `<div class="credits" onclick="state.tab='home';render()"><div class="credits-scroll"><h1>SCUM</h1><h2>CRÉDITS OFFICIELS</h2><p>Le générique original du jeu serait conservé ici.</p><p>Équipes de développement</p><p>Collaborateurs</p><p>Remerciements</p><p>Mentions légales</p></div><div class="credits-tip">APPUYEZ SUR UNE TOUCHE POUR REVENIR · Simulation du générique</div></div>`;
  document.onkeydown = () => {
    document.onkeydown = null;
    state.tab = "home";
    render();
  };
}
