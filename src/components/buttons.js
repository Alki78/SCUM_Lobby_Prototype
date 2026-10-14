import { state } from "../state.js";
import { escapeHTML } from "../utils/dom.js";

export function btn(t, action, cls = "") {
  return `<button class="btn ${cls}" onclick="${action}">${t}</button>`;
}

export function side(items, selected, fn) {
  return `<div class="side">${items.map(({ id, label }) => `<button class="${id === selected ? "active" : ""}" onclick="${fn}('${id}')">${label}</button>`).join("")}</div>`;
}

export function detailLine(a, b) {
  return `<div class="detail-line"><span class="muted">${a}</span><span>${escapeHTML(b)}</span></div>`;
}

export function selectHTML(k, opts) {
  return `<select onchange="state.${k}=this.value;render()">${opts.map((v) => `<option ${state[k] === v ? "selected" : ""}>${v}</option>`).join("")}</select>`;
}
