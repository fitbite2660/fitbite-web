(() => {
  'use strict';
  history.scrollRestoration = 'manual';
  const app = document.querySelector('#app');
  const discovery = document.querySelector('#discovery');
  const video = document.querySelector('#scene-video');
  const still = document.querySelector('#scene-still');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const prices = { medium: 1599, large: 1799 };
  const sizeNames = { medium: 'Medium', large: 'Large' };
  const maxQuantity = 20;
  const storageKey = 'fitbite.video-order-demo.v1';
  const images = { table: 'assets/table.jpg', product: 'assets/hero.jpg', checkout: 'assets/checkout.jpg' };
  const labels = { table: 'Kleurrijke bowls op tafel in de Fitbite-zaak', product: 'De gekozen bowl vooraan in de zaak; bewegingsproef', checkout: 'Een ingepakte bowl bij de kassa; bewegingsproef' };
  const panels = ['table', 'product', 'cart', 'checkout'];
  let view = 'table';
  let selectedSize = 'medium';
  let quantity = 1;
  let cart = { medium: 0, large: 0 };
  let busy = false;
  let currentPose = 'table';
  let animationFrame = 0;
  let finishTransition = null;
  let transitionSerial = 0;

  const money = cents => new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
  const totalCount = () => cart.medium + cart.large;
  const totalPrice = () => cart.medium * prices.medium + cart.large * prices.large;
  const say = message => { document.querySelector('#announcement').textContent = message; };

  // Keep size variants separate and validate restored data before it reaches the UI.
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    for (const size of Object.keys(cart)) {
      const count = Number(saved[size]);
      if (Number.isInteger(count) && count >= 0 && count <= maxQuantity) cart[size] = count;
    }
  } catch (_) { /* The demo remains usable when storage is unavailable. */ }
  function saveCart() {
    try { localStorage.setItem(storageKey, JSON.stringify(cart)); } catch (_) { /* Optional persistence. */ }
    renderCart();
  }
  function showPose(pose) {
    currentPose = pose;
    video.pause();
    app.classList.remove('is-playing');
    still.src = images[pose];
    still.alt = labels[pose];
  }
  function setView(next, focus = true) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    view = next;
    app.dataset.view = next;
    for (const panel of panels) document.querySelector(`#${panel}-panel`).hidden = panel !== next;
    app.querySelector('.back-button').hidden = next === 'table';
    document.querySelector('#step-label').textContent = next === 'checkout' ? '03 / AFREKENEN' : next === 'table' ? '01 / KIEZEN' : '02 / JOUW BESTELLING';
    document.querySelector('#stage-kicker').hidden = next === 'cart';
    if (next === 'table') showPose('table');
    if (next === 'product') showPose('product');
    if (next === 'checkout') showPose('checkout');
    if (next === 'cart') renderCart();
    if (focus) document.querySelector(`#${next}-title`).focus({ preventScroll: true });
  }
  function renderQuantity() {
    document.querySelector('#quantity').textContent = quantity;
    document.querySelector('#product-price').textContent = money(prices[selectedSize]);
    document.querySelector('#add-price').textContent = money(prices[selectedSize] * quantity);
    document.querySelector('[data-action="quantity-minus"]').disabled = busy || quantity <= 1;
    document.querySelector('[data-action="quantity-plus"]').disabled = busy || quantity >= maxQuantity;
  }
  function renderCart() {
    const count = totalCount();
    document.querySelector('#bag-count').textContent = count;
    app.querySelector('.bag-button').setAttribute('aria-label', `Bekijk je bestelling, ${count} ${count === 1 ? 'item' : 'items'}`);
    document.querySelector('.table-cart').hidden = count === 0;
    const lines = Object.keys(cart).filter(size => cart[size] > 0);
    // Only locally defined sizes enter this markup; no user-entered HTML is interpolated.
    document.querySelector('#cart-items').innerHTML = lines.length ? lines.map(size => `<article class="cart-row"><div class="cart-row-top"><div><h2>Fresh Salmon</h2><p>${sizeNames[size]} · ${money(prices[size])} per bowl</p></div><strong class="line-total">${money(cart[size] * prices[size])}</strong></div><div class="cart-row-bottom"><div class="cart-quantity"><button data-action="cart-minus" data-size="${size}" aria-label="Eén Fresh Salmon ${sizeNames[size]} minder">−</button><output aria-label="Aantal ${sizeNames[size]}">${cart[size]}</output><button data-action="cart-plus" data-size="${size}" aria-label="Eén Fresh Salmon ${sizeNames[size]} meer" ${cart[size] >= maxQuantity ? 'disabled' : ''}>+</button></div><button class="remove-button" data-action="remove" data-size="${size}" aria-label="Verwijder Fresh Salmon ${sizeNames[size]}">Verwijderen</button></div></article>`).join('') : '<p class="empty-cart">Je mand is nog leeg. Bekijk Fresh Salmon en kies Medium of Large.</p>';
    document.querySelector('#checkout-items').innerHTML = lines.map(size => `<div class="checkout-item"><div>${cart[size]} × Fresh Salmon<small>${sizeNames[size]}</small></div><strong>${money(cart[size] * prices[size])}</strong></div>`).join('');
    document.querySelector('#cart-total-price').textContent = money(totalPrice());
    document.querySelector('#checkout-total-price').textContent = money(totalPrice());
    document.querySelector('#cart-total').hidden = count === 0;
    document.querySelector('#checkout-button').hidden = count === 0;
    document.querySelector('#checkout-button').disabled = busy || count === 0;
    document.dispatchEvent(new CustomEvent('fitbite:cart-changed', { detail: { count, total: totalPrice() } }));
  }
  function setBusy(value) {
    busy = value;
    app.classList.toggle('is-busy', value);
    app.setAttribute('aria-busy', String(value));
    app.querySelectorAll('button').forEach(button => { button.disabled = value; });
    app.querySelectorAll('input').forEach(input => { input.disabled = value; });
    if (!value) { renderCart(); renderQuantity(); }
  }
  function waitForMedia(event, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { cleanup(); reject(new Error('Media timeout')); }, timeout);
      function cleanup() { clearTimeout(timer); video.removeEventListener(event, ready); video.removeEventListener('error', failed); }
      function ready() { cleanup(); resolve(); }
      function failed() { cleanup(); reject(new Error('Media unavailable')); }
      video.addEventListener(event, ready, { once: true });
      video.addEventListener('error', failed, { once: true });
    });
  }
  async function playSegment(start, end, target) {
    if (busy) return;
    const token = ++transitionSerial;
    const targetPose = target === 'product' ? 'product' : 'checkout';
    let fallbackTimer = 0;
    let settled = false;
    const complete = () => {
      if (settled || token !== transitionSerial) return;
      settled = true;
      clearTimeout(fallbackTimer);
      cancelAnimationFrame(animationFrame);
      video.pause();
      finishTransition = null;
      showPose(targetPose);
      setBusy(false);
      setView(target);
      say(target === 'product' ? 'Fresh Salmon. Kies Medium of Large en voeg je bowl toe.' : 'Je volledige bestelling staat bij de kassa. Dit is een betaalproef.');
    };
    setBusy(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
    finishTransition = complete;
    document.querySelector('#motion-label').textContent = target === 'product' ? 'Jouw bowl komt naar voren' : 'Je bestelling gaat naar de kassa';
    if (reduceMotion.matches || document.hidden) { complete(); return; }
    fallbackTimer = setTimeout(complete, 10000);
    try {
      if (video.readyState < 1) await waitForMedia('loadedmetadata', 3500);
      if (settled || token !== transitionSerial) return;
      video.pause();
      const seekTime = Math.min(start, Math.max(0, video.duration - .05));
      if (Math.abs(video.currentTime - seekTime) > .005) {
        const sought = waitForMedia('seeked', 1800);
        video.currentTime = seekTime;
        await sought;
      }
      if (settled || token !== transitionSerial) return;
      await video.play();
      if (settled || token !== transitionSerial) { video.pause(); return; }
      app.classList.add('is-playing');
      const tick = () => {
        if (settled || token !== transitionSerial) return;
        if (video.currentTime >= end - .01 || video.ended) { complete(); return; }
        animationFrame = requestAnimationFrame(tick);
      };
      tick();
    } catch (_) { complete(); }
  }
  function beginSelection() {
    app.classList.remove('has-added');
    document.querySelector('.ingredients').open = false;
    document.querySelector('#added-message').hidden = true;
    document.querySelector('#product-next').hidden = true;
    renderQuantity();
    playSegment(0, 1.375, 'product');
  }
  function addSelected() {
    const before = cart[selectedSize];
    cart[selectedSize] = Math.min(maxQuantity, before + quantity);
    const added = cart[selectedSize] - before;
    saveCart();
    const message = added > 0 ? `${added} × Fresh Salmon ${sizeNames[selectedSize]} toegevoegd. Je kunt verder kiezen of je bestelling bekijken.` : `Er staan al ${maxQuantity} Fresh Salmon ${sizeNames[selectedSize]} in je mand.`;
    const box = document.querySelector('#added-message');
    box.textContent = message;
    box.hidden = false;
    app.classList.add('has-added');
    document.querySelector('#product-next').hidden = false;
    document.querySelector('#product-next [data-action="cart"]').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function returnToDiscovery() {
    document.querySelector('#payment-note').hidden = true;
    setView('table', false);
    if (!discovery) { document.querySelector('#table-title').focus({ preventScroll: true }); return; }
    app.hidden = true;
    discovery.hidden = false;
    document.dispatchEvent(new CustomEvent('fitbite:explore'));
  }
  document.addEventListener('fitbite:open-order', event => {
    if (busy || !discovery || !['product', 'cart'].includes(event.detail?.view)) return;
    discovery.hidden = true;
    app.hidden = false;
    if (event.detail.view === 'cart') setView('cart');
    else { setView('table', false); beginSelection(); }
  });
  app.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    event.preventDefault();
    if (busy || button.disabled) return;
    const action = button.dataset.action;
    const size = button.dataset.size;
    if (action === 'select') beginSelection();
    else if (action === 'home') returnToDiscovery();
    else if (action === 'back') { if (view === 'checkout') setView('cart'); else returnToDiscovery(); }
    else if (action === 'cart') setView('cart');
    else if (action === 'quantity-minus') { quantity = Math.max(1, quantity - 1); renderQuantity(); }
    else if (action === 'quantity-plus') { quantity = Math.min(maxQuantity, quantity + 1); renderQuantity(); }
    else if (action === 'add') addSelected();
    else if (action === 'checkout' && totalCount()) {
      document.querySelector('#payment-note').hidden = true;
      showPose('product');
      playSegment(1.375, 5, 'checkout');
    } else if (action === 'payment') { document.querySelector('#payment-note').hidden = false; say('Dit is een betaalproef. Er wordt niets besteld of betaald.'); }
    else if (['cart-minus', 'cart-plus', 'remove'].includes(action) && Object.hasOwn(cart, size)) {
      if (action === 'remove') cart[size] = 0;
      if (action === 'cart-minus') cart[size] = Math.max(0, cart[size] - 1);
      if (action === 'cart-plus') cart[size] = Math.min(maxQuantity, cart[size] + 1);
      saveCart();
      say(`${totalCount()} ${totalCount() === 1 ? 'bowl' : 'bowls'} in je bestelling. Totaal ${money(totalPrice())}.`);
      // Re-rendering a cart row should not drop keyboard focus onto the document.
      const matching = app.querySelector(`[data-action="${action}"][data-size="${size}"]`);
      (matching && !matching.disabled ? matching : document.querySelector('#cart-title')).focus({ preventScroll: true });
    }
  });
  app.addEventListener('change', event => {
    if (event.target.name !== 'size' || busy || !Object.hasOwn(prices, event.target.value)) return;
    selectedSize = event.target.value;
    document.querySelector('#added-message').hidden = true;
    renderQuantity();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { video.pause(); if (finishTransition) finishTransition(); }
  });
  reduceMotion.addEventListener('change', () => { if (reduceMotion.matches && finishTransition) finishTransition(); });
  video.addEventListener('error', () => { if (finishTransition) finishTransition(); });
  video.addEventListener('ended', () => { if (finishTransition) finishTransition(); });
  // A restored cart never triggers a camera journey or changes the chosen screen.
  renderCart();
  renderQuantity();
  showPose('table');
  window.scrollTo({ top: 0, behavior: 'instant' });
})();
