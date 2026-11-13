// Bestelreis: korte videoclips van de echte zaak die tussen twee stappen afspelen.
// Een clip vervangen = het mp4-bestand in media/reis/ vervangen (staand, 720×1280, zonder geluid, 2–4 s).
(() => {
  'use strict';
  const clips = {
    'naar-saladette': 'Naar de saladette',
    'naar-keuken': 'Naar de keuken',
    'bar-naar-keuken': 'Naar de keuken',
    'naar-luik': 'Naar het keukenluik',
    'naar-kassa': 'Naar de kassa',
    'naar-buiten': 'Je bestelling is onderweg'
  };
  // Welke clip hoort bij welke overgang, per samenstelroute.
  const routes = {
    poke: {'intro>groenten': 'naar-saladette', 'groenten>proteine': 'naar-keuken', 'proteine>sauzen': 'naar-luik'},
    crousty: {'intro>proteine': 'bar-naar-keuken', 'proteine>sauzen': 'naar-luik'},
    protein: {'intro>proteine': 'bar-naar-keuken', 'proteine>groenten': 'naar-saladette', 'groenten>sauzen': 'naar-luik'}
  };
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let layer, video, label, done;

  function build() {
    layer = document.createElement('div'); layer.className = 'reis'; layer.hidden = true;
    video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = 'auto';
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    label = document.createElement('p'); label.className = 'reis-label';
    layer.append(video, label); document.body.append(layer);
    layer.addEventListener('click', () => done?.());
  }
  function play(name) {
    if (!clips[name] || still()) return Promise.resolve(false);
    if (!layer) build();
    done?.();
    return new Promise(resolve => {
      let finished = false, timer;
      done = () => {
        if (finished) return; finished = true; clearTimeout(timer); done = null;
        layer.classList.remove('is-on');
        setTimeout(() => { if (!done) { layer.hidden = true; video.pause(); } resolve(true); }, 380);
      };
      label.textContent = clips[name];
      video.src = 'media/reis/' + name + '.mp4'; video.currentTime = 0;
      layer.hidden = false;
      requestAnimationFrame(() => layer.classList.add('is-on'));
      video.onended = done; video.onerror = done;
      timer = setTimeout(done, 6000);
      const started = video.play(); if (started?.catch) started.catch(done);
    });
  }
  const between = (kind, from, to) => (to === 'kassa' && from !== 'kassa') ? 'naar-kassa' : routes[kind]?.[from + '>' + to];
  // Clips alvast ophalen zodra de pagina rustig is, zodat de overgang meteen start.
  addEventListener('load', () => setTimeout(() => {
    if (still() || navigator.connection?.saveData) return;
    for (const name of Object.keys(clips)) { const l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'video'; l.href = 'media/reis/' + name + '.mp4'; document.head.append(l); }
  }, 1200));
  window.fitbiteReis = {play, between, clips};
})();
