(() => {
  'use strict';
  const root = document.querySelector('#discovery');
  if (!root) return;
  const track = root.querySelector('.discovery-track');
  const stage = root.querySelector('.discovery-stage');
  const video = root.querySelector('#discovery-video');
  const poster = root.querySelector('#discovery-crousty-poster');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const croustyCopy = root.querySelector('.discovery-crousty-copy');
  const bowlCopy = root.querySelector('.discovery-bowl-copy');
  const croustyActions = root.querySelector('.discovery-crousty-actions');
  const bowlActions = root.querySelector('.discovery-bowl-actions');
  const chapterButtons = [...root.querySelectorAll('.discovery-chapters button')];
  let active = !root.hidden;
  let frame = 0;
  let progress = 0;
  let wantedTime = 0;
  let seeking = false;
  let seekTimer = 0;
  let failed = false;
  let hasMetadata = false;
  let lastChapter = '';
  let lastPoster = '';
  const clamp = value => Math.max(0, Math.min(1, value));
  const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const visible = () => active && !root.hidden && !document.hidden;

  function bounds() {
    return {
      start: window.scrollY + track.getBoundingClientRect().top,
      range: Math.max(1, track.offsetHeight - stage.offsetHeight)
    };
  }
  function setAccessible(element, enabled) {
    element.inert = !enabled;
    element.setAttribute('aria-hidden', String(!enabled));
  }
  function setPoster(end) {
    const next = end ? 'assets/crousty-end.jpg' : 'assets/crousty-poster.jpg';
    if (next !== lastPoster) { poster.src = next; lastPoster = next; }
  }
  function resetSeek() {
    seeking = false;
    clearTimeout(seekTimer);
    seekTimer = 0;
  }
  function mediaFallback() {
    failed = true;
    resetSeek();
    video.pause();
    root.classList.remove('has-video-frame');
    setPoster(progress > .35);
  }
  // At most one seek is in flight. A newer scroll position replaces its target.
  function pumpSeek() {
    if (!visible() || reduceMotion.matches || failed || !hasMetadata || seeking) return;
    if (Math.abs(video.currentTime - wantedTime) < .045) {
      if (video.readyState >= 2) root.classList.add('has-video-frame');
      return;
    }
    seeking = true;
    seekTimer = setTimeout(mediaFallback, 1800);
    try { video.currentTime = wantedTime; } catch (_) { mediaFallback(); }
  }
  function ensureVideo() {
    if (!visible() || reduceMotion.matches || failed || video.getAttribute('src')) return;
    video.src = video.dataset.src;
    video.preload = 'auto';
    video.load();
  }
  function render() {
    frame = 0;
    if (!visible()) return;
    const { start, range } = bounds();
    progress = clamp((window.scrollY - start) / range);
    const crossfade = reduceMotion.matches ? Number(progress >= .6) : smooth((progress - .54) / .2);
    const croustyOpacity = 1 - crossfade;
    const movieProgress = smooth((progress - .08) / .48);
    root.style.setProperty('--discovery-progress', progress.toFixed(4));
    root.style.setProperty('--discovery-crousty-opacity', croustyOpacity.toFixed(4));
    root.style.setProperty('--discovery-bowl-opacity', crossfade.toFixed(4));
    const croustyCaption = reduceMotion.matches ? 1 - crossfade : 1 - smooth((progress - .45) / .1);
    const bowlCaption = reduceMotion.matches ? crossfade : smooth((progress - .69) / .1);
    root.style.setProperty('--discovery-crousty-copy', croustyCaption.toFixed(4));
    root.style.setProperty('--discovery-bowl-copy', bowlCaption.toFixed(4));
    root.style.setProperty('--discovery-crousty-y', `${-movieProgress * 12}px`);
    root.style.setProperty('--discovery-crousty-scale', String(1 - crossfade * .08));
    root.style.setProperty('--discovery-crousty-angle', `${-crossfade * 2.5}deg`);
    root.style.setProperty('--discovery-bowl-y', `${(1 - crossfade) * 25}px`);
    const chapter = crossfade >= .5 ? 'bowls' : 'croustys';
    if (chapter !== lastChapter) {
      lastChapter = chapter;
      for (const button of chapterButtons) {
        if (button.dataset.discoveryChapter === chapter) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      }
    }
    setAccessible(croustyCopy, croustyCaption > .1);
    setAccessible(bowlCopy, bowlCaption > .1);
    setAccessible(croustyActions, croustyCaption > .5);
    setAccessible(bowlActions, bowlCaption > .5);
    setPoster(movieProgress > .55);
    if (!reduceMotion.matches && progress < .77) {
      ensureVideo();
      if (hasMetadata) wantedTime = movieProgress * Math.max(0, video.duration - .06);
      pumpSeek();
    }
  }
  function requestRender() {
    if (frame || !visible()) return;
    frame = requestAnimationFrame(render);
  }
  function goToChapter(chapter, focus = false) {
    if (!visible()) return;
    const { start, range } = bounds();
    const top = start + (chapter === 'bowls' ? range : 0);
    window.scrollTo({ top, behavior: reduceMotion.matches || focus ? 'instant' : 'smooth' });
    if (focus) {
      cancelAnimationFrame(frame); frame = 0;
      render();
      root.querySelector('.discovery-select').focus({ preventScroll: true });
    } else requestRender();
  }
  function stop() {
    active = false;
    cancelAnimationFrame(frame);
    frame = 0;
    video.pause();
    resetSeek();
  }
  function openOrder(view) {
    if (!visible()) return;
    document.dispatchEvent(new CustomEvent('fitbite:open-order', { detail: { view } }));
  }

  root.addEventListener('click', event => {
    const chapterButton = event.target.closest('[data-discovery-chapter]');
    if (chapterButton) {
      event.preventDefault();
      goToChapter(chapterButton.dataset.discoveryChapter);
    } else if (event.target.closest('.discovery-select')) openOrder('product');
    else if (event.target.closest('.discovery-bag')) openOrder('cart');
  });
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', requestRender, { passive: true });
  video.addEventListener('loadedmetadata', () => {
    hasMetadata = Number.isFinite(video.duration) && video.duration > 0;
    if (!hasMetadata) { mediaFallback(); return; }
    wantedTime = smooth((progress - .08) / .48) * Math.max(0, video.duration - .06);
    pumpSeek();
  });
  video.addEventListener('loadeddata', () => {
    if (visible() && !reduceMotion.matches && !failed) { root.classList.add('has-video-frame'); pumpSeek(); }
  });
  video.addEventListener('seeked', () => {
    resetSeek();
    if (!visible() || reduceMotion.matches || failed) return;
    root.classList.add('has-video-frame');
    pumpSeek();
  });
  video.addEventListener('error', mediaFallback);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { video.pause(); cancelAnimationFrame(frame); frame = 0; resetSeek(); }
    else requestRender();
  });
  reduceMotion.addEventListener('change', () => {
    video.pause(); resetSeek(); root.classList.remove('has-video-frame'); requestRender();
  });
  document.addEventListener('fitbite:open-order', event => {
    if (['product', 'cart'].includes(event.detail?.view)) stop();
  });
  document.addEventListener('fitbite:explore', () => {
    active = true;
    // The order controller unhides discovery before emitting this event.
    requestAnimationFrame(() => {
      if (root.hidden) return;
      goToChapter('bowls', true);
      render();
    });
  });
  document.addEventListener('fitbite:cart-changed', event => {
    const raw = Number(event.detail?.count);
    const count = Number.isFinite(raw) ? Math.max(0, Math.trunc(raw)) : 0;
    root.querySelector('.discovery-count').textContent = String(count);
    root.querySelector('.discovery-bag').setAttribute('aria-label', `Bekijk je bestelling, ${count} ${count === 1 ? 'item' : 'items'}`);
  });
  // Root owns visibility and product/cart state; this file only controls discovery.
  requestRender();
})();
