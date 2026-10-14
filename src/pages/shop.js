import { shell } from "../components/shell.js";
import { render } from "../navigation.js";
import { state } from "../state.js";
import { escapeHTML } from "../utils/dom.js";
import { shopArt, shopDLC } from "../data/dlc.js";

export function shopPrice(d) {
  return d.sale
    ? `<span class="shop-sale">${d.sale}</span> <span class="shop-old">${d.old}</span> <span class="shop-new">${d.price}</span>`
    : `<strong>${d.price}</strong>`;
}

export function shopChoose(i) {
  state.shopSelected = i;
  renderShop();
}

export function shopSlide(delta) {
  state.shopPromo = (state.shopPromo + delta + shopDLC.length) % shopDLC.length;
  renderShop();
}

export function shopLink(i) {
  event.stopPropagation();
  state.modal = {
    type: "shopExternal",
    name: shopDLC[i].name,
    owned: shopDLC[i].owned,
  };
  render();
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.innerHTML = `<div class="dialog"><h2>OUVRIR STEAM</h2><p>Vous allez consulter la fiche « ${escapeHTML(shopDLC[i].name)} » sur Steam.</p><p class="muted small">Lien externe illustratif : aucune transaction dans le prototype.</p><button class="btn red" onclick="state.modal=null;render()">FERMER</button></div>`;
  }
}

export function renderShop() {
  const d = shopDLC[state.shopSelected],
    p = shopDLC[state.shopPromo];
  shell(
    `<div class="shop-v03"><section class="shop-hero"><img class="shop-hero-bg" src="${shopArt[p.art]}" alt="Illustration du DLC mis en avant"><span class="shop-ribbon">${p.sale ? "PROMOTION" : "À LA UNE"}</span><button class="shop-arrow left" aria-label="Promotion précédente" onclick="shopSlide(-1)">‹</button><div class="shop-hero-content"><h2>SCUM<br>${p.short}</h2><p>${p.description}</p><div class="shop-hero-actions">${p.sale ? shopPrice(p) : `<strong>${p.price}</strong>`}<button class="shop-steam" onclick="shopLink(${state.shopPromo})">↗ VOIR SUR STEAM</button></div></div><button class="shop-arrow right" aria-label="Promotion suivante" onclick="shopSlide(1)">›</button><div class="shop-dots">${shopDLC.map((_, i) => `<button aria-label="Afficher la promotion ${i + 1}" class="${i === state.shopPromo ? "active" : ""}" onclick="state.shopPromo=${i};renderShop()"></button>`).join("")}</div></section><h2 class="shop-heading">TOUS LES DLC</h2><div class="shop-lower"><section><div class="shop-list">${shopDLC.map((item, i) => `<div role="button" tabindex="0" aria-label="Afficher ${item.name}" class="shop-card ${i === state.shopSelected ? "selected" : ""} ${item.owned ? "owned" : ""}" onclick="shopChoose(${i})" onkeydown="if(event.key==='Enter')shopChoose(${i})"><img class="shop-card-image" src="${shopArt[item.art]}" alt="Illustration ${item.short}"><div class="shop-card-info"><h3>${item.name.toUpperCase()}</h3><p>${item.description}</p>${item.owned ? '<span class="shop-owned">✓ POSSÉDÉ</span>' : ""}</div><div class="shop-card-price">${item.owned ? "" : shopPrice(item)}<button class="shop-steam" onclick="shopLink(${i})">${item.owned ? "VOIR DANS STEAM" : "↗ VOIR SUR STEAM"}</button></div></div>`).join("")}</div></section><aside class="shop-detail"><h3>${d.name.toUpperCase()}</h3><img class="shop-detail-img" src="${shopArt[d.art]}" alt="Grande illustration du DLC sélectionné"><p>${d.detail}</p><div class="shop-detail-bottom">${d.owned ? '<span class="shop-owned">✓ POSSÉDÉ</span>' : shopPrice(d)}<button class="shop-steam" onclick="shopLink(${state.shopSelected})">${d.owned ? "↗ VOIR DANS STEAM" : "↗ VOIR SUR STEAM"}</button></div></aside></div><p class="shop-footnote">PROTOTYPE COMMUNAUTAIRE — PRIX, PROMOTIONS ET POSSESSION SIMULÉS · AUCUN ACHAT INTÉGRÉ</p></div>`,
    "shop",
  );
}
