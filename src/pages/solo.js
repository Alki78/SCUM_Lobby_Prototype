import { btn } from "../components/buttons.js";
import { shell } from "../components/shell.js";
import { state } from "../state.js";
import { soloNavigation } from "../data/navigation.js";

export function renderSolo() {
  let body = "";
  if (state.solo === "continue")
    body = `<h2>DERNIÈRE SESSION SOLO</h2><div class="illustration"></div><h3>Alki</h3><p class="muted">Bac à sable · Dernier personnage utilisé</p><div class="detail-line"><span>Temps de jeu</span><span>24 h 12 min</span></div><div class="detail-line"><span>Localisation</span><span>Secteur A3</span></div>${btn("▶ CONTINUER LA PARTIE", "demoAction('Chargement de la partie solo')", "red big")}`;
  else if (state.solo === "load")
    body = `<h2>CHARGER UNE SAUVEGARDE</h2><p class="muted">Personnages locaux (exemples fictifs)</p>${["Alki", "Prisonnier 02", "Survivante 03"].map((n, i) => `<div class="row between" style="padding:12px;border-bottom:1px solid #444;background:${state.saveIndex === i ? "#59201d" : ""}"><button class="btn ghost" onclick="state.saveIndex=${i};render()">${n}</button><button class="btn ghost" onclick="confirmDelete('${n}')">✕</button></div>`).join("")}<div class="illustration"></div><p>Personnage sélectionné : <b>${["Alki", "Prisonnier 02", "Survivante 03"][state.saveIndex]}</b></p>${btn("CHARGER CETTE SAUVEGARDE", "demoAction('Chargement de la sauvegarde')", "red big")}`;
  else if (state.solo === "new")
    body = `<h2>NOUVELLE PARTIE</h2><div class="illustration"></div><p>Incarnez un prisonnier et embarquez sur l'île. Mettez à l'épreuve vos compétences de survie.</p>${btn("CRÉER UN PERSONNAGE", "demoAction('Création de personnage — écran du jeu non reproduit')", "red big")}`;
  else
    body = `<h2>TUTORIEL</h2><div class="illustration"></div><p>Apprenez les bases de la survie dans un mode de jeu dédié avant de vous lancer sur l'île.</p>${btn("LANCER LE TUTORIEL", "demoAction('Tutoriel — lancement simulé')", "red big")}`;
  shell(
    `<h1>SOLO / BAC À SABLE</h1><div class="solo-layout"><div class="solo-choices">${soloNavigation.map(({ id, label: x, description }) => `<button class="choice ${state.solo === id ? "active" : ""}" onclick="state.solo='${id}';render()">${x}<span>${description}</span></button>`).join("")}</div><div class="panel">${body}</div></div>`,
    "solo",
  );
}
