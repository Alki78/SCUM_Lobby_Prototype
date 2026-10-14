import { matchHTML } from "../pages/multiplayer.js";
import { modalHTML } from "./dialogs.js";
import { state } from "../state.js";
import { images } from "../assets.js";
import { $ } from "../utils/dom.js";
import { topNavigation } from "../data/navigation.js";

export function shell(content, bg) {
  $("#app").innerHTML =
    `<div class="app" data-bg="${bg}"><header><div class="logo" aria-label="Logo SCUM"><img src="${images["logo"]}" alt="SCUM"></div><nav>${topNavigation.map(({ id, label: t }) => `<button class="${state.tab === id ? "active" : ""}" onclick="go('${id}')">${t}</button>`).join("")}</nav><div class="profile" aria-label="Compte de connexion Steam"><img class="profile-avatar" src="${images["avatar"]}" alt="Avatar du profil Steam (démo)"><div class="profile-identity"><div class="profile-name"><b>cherwood</b><span class="profile-status" title="En ligne (simulation)"></span></div><div class="profile-platform" title="Plateforme de connexion : Steam"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-9.93 8.8l5.37 2.22a3.2 3.2 0 0 1 1.8-.57l2.4-3.47a4.5 4.5 0 1 1 4.3 5.82l-3.46 2.46a3.2 3.2 0 0 1-6.26.56L2 16.08A10 10 0 1 0 12 2Zm4.35 5.2a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6ZM9.2 14.1a1.7 1.7 0 0 0-.92.27l1.34.55a1.3 1.3 0 1 1-1 2.4l-1.28-.53a1.8 1.8 0 1 0 1.86-2.69Z"/></svg><span>STEAM</span></div></div><div class="profile-divider" aria-hidden="true"></div><div class="profile-sync" title="Compte Twitch non connecté (simulation)" aria-label="Twitch non connecté"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2 2 7v14h5v3l4-3h4l7-7V2H4Zm16 11-4 4h-5l-3 3v-3H5V4h15v9ZM16 7h-2v6h2V7Zm-5 0H9v6h2V7Z"/></svg><span>TWITCH</span></div></div></header><main class="wrap">${content}</main><footer class="footer"><button onclick="quitDemo()">⏻ &nbsp; QUITTER</button><span>PROTOTYPE COMMUNAUTAIRE — DONNÉES FICTIVES</span></footer>${state.modal ? modalHTML() : ""}${state.match ? matchHTML() : ""}</div>`;
}
