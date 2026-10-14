import { btn } from "../components/buttons.js";
import { shell } from "../components/shell.js";
import { render } from "../navigation.js";
import { state } from "../state.js";
import { news } from "../data/news.js";

export function renderHome() {
  const item = news[state.newsIndex % news.length];
  shell(
    `<div class="home home-v04"><section class="home-stack">
<div class="home-session panel"><div class="home-label">DERNIÈRE SESSION</div><div class="home-session-body"><div class="home-session-art"></div><div class="home-session-details"><h2>SCUM Official Server #1</h2><p>Survie · Multijoueur</p><div class="home-meta">⌖ ÎLE DE SCUM</div><div class="home-meta">♟ 42 / 64 JOUEURS</div><div class="home-meta">▣ 18 sept. 2024 · 3 h 27 min</div>${btn("▶ CONTINUER", "demoAction('Reprise de la dernière session')", "red")}</div></div></div>
<div class="home-news home-news-v04"><div class="home-news-top"><span class="home-label">COMMUNICATION OFFICIELLE</span><span class="home-news-date">18 sept. 2024</span></div><h2>${item.title}</h2><p>${item.desc}</p><div class="home-news-controls">${btn("←", "cycleNews(-1)", "ghost")}${btn("VOIR LES DÉTAILS ↗", "go('infos')", "ghost")}${btn("→", "cycleNews(1)", "ghost")}</div><div class="home-news-dots">${news.map((_, i) => `<span class="${i === state.newsIndex ? "active" : ""}"></span>`).join("")}</div></div>
<div class="home-promo home-promo-v04"><div class="promo" onclick="state.tab='multiplayer';state.multi='battleground';render()"><strong>BATTLEGROUND</strong><small>ÉVÉNEMENTS SPÉCIAUX</small><span>↗</span></div><div class="promo" onclick="go('shop')"><strong>DLC</strong><small>CONTENUS ADDITIONNELS</small><span>↗</span></div><div class="promo" onclick="demoAction('Espace communautaire — lien à définir')"><strong>COMMUNAUTÉ</strong><small>ACTUALITÉS ET LIENS UTILES</small><span>↗</span></div></div>
</section><section class="home-stage"></section></div>`,
    "home",
  );
}

export function cycleNews(n) {
  state.newsIndex = (state.newsIndex + n + news.length) % news.length;
  render();
}
