// Injection de revue uniquement : les boutons gardent leurs onclick originaux.
(() => {
  function decorate() {
    const panel = document.querySelector('.app[data-bg="solo"] .solo-detail[data-solo-view="load"]');
    if (!panel || panel.hasAttribute('data-review-saves')) return;
    const originalHeight = panel.getBoundingClientRect().height;
    const rows = [...panel.querySelectorAll(':scope > .row')];
    const selection = panel.querySelector(':scope > p:not(.muted)');
    const name = selection.querySelector('b').textContent;
    const list = document.createElement('div');
    list.className = 'review-save-list';
    rows[0].before(list);
    rows.forEach((row, i) => {
      row.classList.toggle('is-selected', i === window.state.saveIndex);
      list.append(row);
    });
    panel.querySelector(':scope > .illustration').remove();
    const summary = document.createElement('section');
    summary.className = 'review-save-summary';
    // Seules les données d'Alki existent déjà dans le panneau Continuer.
    // Les autres valeurs restent explicitement inconnues dans cette proposition.
    summary.innerHTML = `<p>PERSONNAGE SÉLECTIONNÉ</p><b class="review-save-name"></b><div class="review-save-meta"><div><span>Temps de jeu</span><b>${name === 'Alki' ? '24 h 12 min' : 'Non renseigné'}</b></div><div><span>Localisation</span><b>${name === 'Alki' ? 'Secteur A3' : 'Non renseigné'}</b></div></div>`;
    summary.querySelector('.review-save-name').textContent = name;
    selection.replaceWith(summary);
    panel.style.setProperty('--review-original-height', `${originalHeight}px`);
    panel.setAttribute('data-review-saves', '');
  }
  new MutationObserver(decorate).observe(document.querySelector('#app'), {childList:true, subtree:true});
  decorate();
})();
