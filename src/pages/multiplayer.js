import { btn, side, detailLine, selectHTML } from "../components/buttons.js";
import { shell } from "../components/shell.js";
import { render } from "../navigation.js";
import { state } from "../state.js";
import { $, escapeHTML } from "../utils/dom.js";
import { servers } from "../data/servers.js";
import { multiNavigation, serverTabs } from "../data/navigation.js";

export function renderMulti() {
  let content = "";
  let bg = "servers";
  if (state.multi === "servers") content = publicServers();
  if (state.multi === "battleground") {
    bg = "battle";
    content = `<h1>BATTLEGROUND</h1><p class="lead">SURVIVEZ. ÉVOLUEZ. SOYEZ LE DERNIER.</p><div class="panel" style="max-width:780px;margin-top:40px"><h2>UNE PARTIE RAPIDE SUR L'ÎLE DE SCUM</h2><p>Affrontez d'autres prisonniers dans une zone dynamique, récupérez de l'équipement et survivez. Une seule règle : être le dernier en vie.</p><div class="grid" style="grid-template-columns:1fr 1fr;margin:25px 0"><div>◉ MODE SOLO</div><div>♟ JUSQU'À 50 JOUEURS</div><div>✈ LARGAGE AÉRIEN</div><div>◎ ZONE DYNAMIQUE</div><div>▣ LOOT VARIÉ</div><div>☠ SURVIE COMPLÈTE</div></div>${btn("▶ REJOINDRE BATTLEGROUND", "startMatch()", "red big")}</div>`;
  }
  if (state.multi === "direct") {
    bg = "direct";
    content = `<h1>CONNEXION DIRECTE</h1><p class="lead">REJOIGNEZ UN SERVEUR AVEC SON ADRESSE IP.</p><p>Renseignez l'adresse et cliquez sur Vérifier pour afficher les détails.</p><div class="server-layout" style="margin-top:35px"><div class="panel"><div class="row"><input class="input" placeholder="Adresse IP : port" value="${escapeHTML(state.ip)}" oninput="setIP(this.value)" onkeydown="if(event.key==='Enter')verifyIP()">${btn("VÉRIFIER", "verifyIP()")}</div><p class="note">La vérification est simulée dans ce prototype : aucune connexion réelle à un serveur SCUM.</p>${state.ipError ? `<p style="color:#ff8070">${state.ipError}</p>` : ""}</div><div class="panel detail">${state.verified ? `<div class="detail-image"></div><div class="row between"><h2>Serveur vérifié (démo)</h2><button class="star ${state.directFav ? "on" : ""}" onclick="state.directFav=!state.directFav;render()">${state.directFav ? "★" : "☆"}</button></div>${detailLine("Adresse", state.ip)}${detailLine("Joueurs", "32 / 64")}${detailLine("Ping", "24 ms (fictif)")}${detailLine("Version", "Démo")}${detailLine("Verrouillé", "Non")}${btn("▶ REJOINDRE LE SERVEUR", "demoAction('Connexion au serveur — simulation')", "red big")}` : `<div class="detail-image"></div><h2>DÉTAILS DU SERVEUR</h2><p class="muted">Saisissez une adresse puis cliquez sur « Vérifier ».</p>${btn("REJOINDRE LE SERVEUR", "", "big")}`}</div></div>`;
  }
  if (state.multi === "rent") {
    bg = "rent";
    content = `<h1>LOUEZ VOTRE SERVEUR SCUM</h1><p class="lead">CRÉEZ VOTRE PROPRE EXPÉRIENCE DE SURVIE.</p><p>Louez un serveur auprès d'un hébergeur pour jouer avec vos amis et votre communauté.</p><div class="cards" style="margin-top:32px">${["4NETPLAYERS", "G-PORTAL", "GG HOST", "NITRADO", "PINGPERFECT"].map((n) => `<div class="provider" onclick="provider('${n}')"><b>${n}</b><span class="muted">Hébergement de serveurs SCUM</span><span style="text-align:right">Ouvrir le site ↗</span></div>`).join("")}</div><p class="note">Liste illustrative : les hébergeurs officiels seraient choisis par les développeurs. Les liens sont externes.</p>`;
  }
  shell(
    `<div class="layout">${side(multiNavigation, state.multi, "setMulti")}<div>${content}</div></div>`,
    bg,
  );
}

export function setMulti(x) {
  state.multi = x;
  render();
}

export function filtered() {
  return servers.filter((s) => {
    if (state.serverTab === "official" && !s.official) return false;
    if (state.serverTab === "community" && s.official) return false;
    if (state.serverTab === "favorites" && !state.favs.has(s.id)) return false;
    if (!s.name.toLowerCase().includes(state.search.toLowerCase()))
      return false;
    if (state.region !== "Toutes" && s.region !== state.region) return false;
    if (state.ping === "Moins de 50 ms" && s.ping >= 50) return false;
    if (state.ping === "Moins de 100 ms" && s.ping >= 100) return false;
    if (state.activity === "Actifs" && s.players / s.max < 0.5) return false;
    if (state.activity === "Peu peuplés" && s.players / s.max >= 0.5)
      return false;
    if (state.hideEmpty && s.players === 0) return false;
    if (state.hideFull && s.players === s.max) return false;
    if (state.hideLocked && s.locked) return false;
    return true;
  });
}

export function publicServers() {
  const rows = filtered();
  const s = servers[state.selected];
  return `<div class="server-layout"><section><div class="row between" style="flex-wrap:wrap"><div class="tabs">${serverTabs.map(({ id, label: t }) => `<button class="${state.serverTab === id ? "active" : ""}" onclick="state.serverTab='${id}';render()">${t}</button>`).join("")}</div></div><div class="server-controls"><input placeholder="Rechercher un serveur…" value="${escapeHTML(state.search)}" oninput="state.search=this.value;refreshServerTable()">${btn("⟳ RAFRAÎCHIR", "demoAction('Liste de serveurs actualisée (simulation)')")}</div><div class="filters"><button class="btn ghost" style="width:100%;text-align:left" onclick="state.expanded=!state.expanded;render()">⚑ FILTRES AVANCÉS ${state.expanded ? "⌃" : "⌄"}</button>${
    state.expanded
      ? `<div class="filters-inner"><label>Région ${selectHTML("region", ["Toutes", "FR", "EU", "US"])}</label><label>Ping ${selectHTML("ping", ["Tous", "Moins de 50 ms", "Moins de 100 ms"])}</label><label>Activité ${selectHTML("activity", ["Toutes", "Actifs", "Peu peuplés"])}</label>${[
          ["hideEmpty", "Masquer les serveurs vides"],
          ["hideFull", "Masquer les serveurs complets"],
          ["hideLocked", "Masquer les serveurs verrouillés"],
        ]
          .map(
            ([k, t]) =>
              `<label><input type="checkbox" ${state[k] ? "checked" : ""} onchange="state.${k}=this.checked;render()"> ${t}</label>`,
          )
          .join("")}</div>`
      : ""
  }</div><div class="tablewrap"><table><thead><tr><th>★</th><th>NOM DU SERVEUR</th><th>OFFICIEL</th><th>VERROUILLÉ</th><th>VERSION</th><th>JOUEURS</th><th>PING</th></tr></thead><tbody>${rows.map((s) => `<tr class="${state.selected === s.id ? "selected" : ""}" onclick="state.selected=${s.id};render()"><td><button class="star ${state.favs.has(s.id) ? "on" : ""}" onclick="event.stopPropagation();toggleFav(${s.id})">${state.favs.has(s.id) ? "★" : "☆"}</button></td><td><span class="truncate" title="${escapeHTML(s.name)}">${escapeHTML(s.name)}</span></td><td>${s.official ? "◈" : "—"}</td><td>${s.locked ? "🔒" : "—"}</td><td>${s.version}</td><td>${s.players}/${s.max}</td><td style="color:${s.ping < 45 ? "#55e687" : s.ping < 65 ? "#ffcb55" : "#ff7777"}">${s.ping} ms</td></tr>`).join("")}</tbody></table>${rows.length ? "" : '<div class="empty">Aucun serveur ne correspond aux filtres.</div>'}</div><p class="small muted">${rows.length} serveurs affichés · Données fictives</p></section><aside class="panel detail"><div class="row between"><h2 style="font-size:21px">${escapeHTML(s.name)}</h2><button class="star ${state.favs.has(s.id) ? "on" : ""}" onclick="toggleFav(${s.id})">${state.favs.has(s.id) ? "★" : "☆"}</button></div><div class="detail-image"></div>${detailLine("Joueurs", s.players + " / " + s.max)}${detailLine("Ping", s.ping + " ms")}${detailLine("Verrouillé", s.locked ? "Oui" : "Non")}${detailLine("Officiel", s.official ? "Oui" : "Non")}${detailLine("Version", s.version)}<p class="muted small">Nom complet du serveur</p><p>${escapeHTML(s.name)}</p>${btn("▶ REJOINDRE LE SERVEUR", "demoAction('Connexion au serveur sélectionné — simulation')", "red big")}</aside></div>`;
}

export function toggleFav(id) {
  state.favs.has(id) ? state.favs.delete(id) : state.favs.add(id);
  render();
}

export function refreshServerTable() {
  const el = $(".tablewrap");
  if (el) {
    const p = el.scrollTop;
    render();
    $(".tablewrap").scrollTop = p;
    const inp = $(".server-controls input");
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }
}

export function setIP(v) {
  state.ip = v;
  state.verified = false;
  state.ipError = "";
  state.directFav = false;
  const d = $(".detail");
  if (d) {
    d.innerHTML =
      '<div class="detail-image"></div><h2>DÉTAILS DU SERVEUR</h2><p class="muted">Cliquez sur « Vérifier » pour rechercher le serveur.</p>';
  }
}

export function verifyIP() {
  const v = state.ip.trim();
  if (!/^([\w.-]+|\[[0-9a-f:]+\])(:\d{1,5})?$/i.test(v) || !v.includes(".")) {
    state.ipError = "Adresse invalide. Exemple : 123.45.67.89:7777";
    state.verified = false;
  } else {
    state.ipError = "";
    state.verified = true;
  }
  render();
}

export function provider(name) {
  state.modal = { type: "provider", name };
  render();
}

export function startMatch() {
  state.match = true;
  state.matchFound = false;
  render();
}

export function matchHTML() {
  return `<div class="overlay"><div class="dialog" style="text-align:center"><div class="spinner"></div><h1>RECHERCHE DE PARTIE…</h1><p>Matchmaking Battleground — simulation visuelle.</p>${btn("ANNULER LA RECHERCHE", "cancelMatch()", "ghost")}<p class="small muted">Pour tester la suite du parcours :</p>${btn("SIMULER UNE PARTIE TROUVÉE", "foundMatch()", "red")}</div></div>`;
}

export function cancelMatch() {
  state.match = false;
  render();
}

export function foundMatch() {
  state.match = false;
  state.modal = { type: "found" };
  render();
}
