import { shell } from "../components/shell.js";
import { render } from "../navigation.js";
import { state } from "../state.js";
import { news } from "../data/news.js";
import { infoTabs } from "../data/navigation.js";

export function renderInfos() {
  let list = news.filter(
    (n) => state.infoTab === "all" || n.categoryId === state.infoTab,
  );
  shell(
    `<h1>INFOS <span class="small muted">COMMUNICATIONS OFFICIELLES DE SCUM SUR STEAM</span></h1><div class="tabs" style="margin-top:20px">${infoTabs.map(({ id, label: t }) => `<button class="${state.infoTab === id ? "active" : ""}" onclick="state.infoTab='${id}';render()">${t}</button>`).join("")}</div><p class="note">Les cartes ci-dessous sont des exemples de mise en page. Le jeu afficherait les cinq dernières publications officielles par catégorie, récupérées depuis Steam sous réserve de faisabilité.</p><div class="news">${list.map((n) => `<article class="card" onclick="openSteam()"><img src="${n.image}"><div class="card-body"><div><span class="pill">${n.cat}</span> <span class="muted small">Publication Steam</span></div><h3 style="margin-top:12px">${n.title}</h3><p class="muted">${n.desc}</p><b style="color:#ff6b5c">Lire sur Steam ↗</b></div></article>`).join("")}</div>`,
    "infos",
  );
}

export function openSteam() {
  state.modal = { type: "steam" };
  render();
}
