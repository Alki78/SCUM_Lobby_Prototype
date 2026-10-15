// Habillage du navigateur de revue : boutons et événements d'origine conservés.
(() => {
  function decorate() {
    const panel = document.querySelector('.app[data-bg="solo"] .solo-detail[data-solo-view="new"]');
    if (!panel || panel.hasAttribute('data-review-new')) return;
    const height = panel.getBoundingClientRect().height;
    const illustration = panel.querySelector(':scope > .illustration');
    const description = panel.querySelector(':scope > p');
    const intro = document.createElement('div');
    intro.className = 'review-new-intro';
    illustration.before(intro);
    intro.append(illustration, description);
    panel.style.setProperty('--review-new-original-height', `${height}px`);
    panel.setAttribute('data-review-new', '');
  }
  new MutationObserver(decorate).observe(document.querySelector('#app'), {childList:true, subtree:true});
  decorate();
})();
