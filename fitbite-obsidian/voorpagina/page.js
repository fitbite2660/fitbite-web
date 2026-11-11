(() => {
  'use strict';
  const root = document.documentElement;
  const story = document.querySelector('.story');
  const stage = document.querySelector('.stage');
  const panels = [...document.querySelectorAll('.panel')];
  const photos = panels.map(panel => panel.querySelector('.photo'));
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const shortScreen = matchMedia('(max-height: 639px)');
  const dialog = document.querySelector('#navigation');
  const menu = document.querySelector('.menu-toggle');
  let enhanced = false, scheduled = false, lastActive = -1;
  const clamp = value => Math.max(0, Math.min(1, value));

  function update() {
    scheduled = false;
    if (!enhanced) return;
    const range = story.offsetHeight - stage.offsetHeight;
    const p = clamp((scrollY - story.offsetTop) / Math.max(1, range));
    // Two adjoining scenes stay visible even when someone pauses halfway through the scroll.
    const travel = clamp((p - .25) / .5);
    panels[0].style.transform = `translateX(${-travel * 100}%)`;
    panels[1].style.transform = `translateX(${(1-travel) * 100}%)`;
    photos[0].style.transform = `translateX(${-p * 1.5}%) scale(${1 + p * .07})`;
    photos[1].style.transform = `translateX(${(1-p) * 1.5}%) scale(${1 + (1-p) * .06})`;
    const active = p < .5 ? 0 : 1;
    if (active !== lastActive) {
      panels.forEach((panel, index) => {
        panel.classList.toggle('is-active', index === active);
        panel.inert = index !== active;
        panel.setAttribute('aria-hidden', String(index !== active));
      });
      lastActive = active;
    }
  }
  function queue() { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } }
  function configure() {
    enhanced = !motion.matches && !shortScreen.matches;
    root.classList.toggle('is-enhanced', enhanced);
    lastActive = -1;
    panels.forEach((panel, index) => {
      panel.style.transform = ''; photos[index].style.transform = '';
      panel.inert = false; panel.removeAttribute('aria-hidden');
    });
    update();
  }
  function count() {
    let own = [];
    try { const value = JSON.parse(localStorage.getItem('fitbite:saladette:proefmand:v1') || '[]'); if (Array.isArray(value)) own = value.filter(item => ['Medium','Large'].includes(item?.size)); } catch {}
    const quantity = own.length + Object.values(window.fitbiteMenu.readCart()).reduce((sum, n) => sum + n, 0);
    document.querySelector('#count').textContent = quantity;
    document.querySelector('.bag').setAttribute('aria-label', `Bekijk je bestelling, ${quantity} ${quantity === 1 ? 'item' : 'items'}`);
  }
  function closeMenu() { dialog.close(); }
  menu.addEventListener('click', () => { dialog.showModal(); menu.setAttribute('aria-expanded','true'); });
  document.querySelector('#close-menu').addEventListener('click', closeMenu);
  dialog.addEventListener('close', () => { menu.setAttribute('aria-expanded','false'); });
  dialog.addEventListener('click', event => { if (event.target === dialog && (event.clientX < dialog.getBoundingClientRect().left || event.clientX > dialog.getBoundingClientRect().right || event.clientY < dialog.getBoundingClientRect().top || event.clientY > dialog.getBoundingClientRect().bottom)) closeMenu(); });
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    if (dialog.open) closeMenu();
    const bowls = link.hash === '#bowls';
    const top = bowls ? (enhanced ? story.offsetTop + story.offsetHeight - stage.offsetHeight : panels[1].offsetTop) : 0;
    scrollTo({top, behavior: motion.matches ? 'instant' : 'smooth'});
    history.replaceState(history.state, '', link.hash);
  }));
  addEventListener('scroll', queue, {passive:true});
  addEventListener('resize', configure);
  addEventListener('pageshow', () => { count(); configure(); });
  addEventListener('storage', count);
  motion.addEventListener('change', configure); shortScreen.addEventListener('change', configure);
  document.querySelector('.builder-trigger').addEventListener('click',()=>document.querySelector('#builder-routes').showModal());
  document.querySelector('#close-routes').addEventListener('click',()=>document.querySelector('#builder-routes').close());
  configure(); count();
  if (location.hash === '#bowls') requestAnimationFrame(() => { scrollTo(0, enhanced ? story.offsetHeight - stage.offsetHeight : panels[1].offsetTop); update(); });
})();
