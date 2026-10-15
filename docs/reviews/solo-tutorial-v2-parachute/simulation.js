// Habillage du navigateur de revue : boutons et événements d'origine conservés.
(() => {
  function decorate() {
    const panel = document.querySelector('.app[data-bg="solo"] .solo-detail[data-solo-view="tutorial"]');
    if (!panel || panel.hasAttribute('data-review-tutorial')) return;
    const height = panel.getBoundingClientRect().height;
    const illustration = panel.querySelector(':scope > .illustration');
    const description = panel.querySelector(':scope > p');
    const intro = document.createElement('div');
    intro.className = 'review-tutorial-intro';
    illustration.before(intro);
    intro.append(illustration, description);
    panel.style.setProperty('--review-tutorial-original-height', `${height}px`);
    panel.setAttribute('data-review-tutorial', '');
  }
  new MutationObserver(decorate).observe(document.querySelector('#app'), {childList:true, subtree:true});
  decorate();
})();
