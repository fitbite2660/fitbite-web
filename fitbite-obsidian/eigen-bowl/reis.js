// Bestelreis: AI-clips (Higgsfield, Kling 3.0) van de zaak die tussen twee stappen afspelen.
// Na elke clip blijft het laatste beeld van die clip staan als achtergrond van de stap, zodat er
// nooit een ander beeld verschijnt. Er zijn meerdere versies ("thema's") van de reis; bij elk nieuw
// bezoek krijgt de klant een volgende versie, binnen één bezoek blijft het dezelfde.
//
// Bestanden: media/reis/<thema>/<clip>.mp4 met het laatste beeld als <clip>-eind.jpg,
// en het beginbeeld van de route als intro.jpg (pokébowl) of intro-bar.jpg (Crousty/proteïnebowl).
// Testen van een versie: voeg ?thema=drukte (of avond, daglicht) toe aan de adresbalk.
(() => {
  'use strict';
  const base = 'media/reis/';
  const labels = {
    'naar-saladette': 'Naar de saladette',
    'keuken-naar-saladette': 'Naar de saladette',
    'naar-keuken': 'Naar de keuken',
    'bar-naar-keuken': 'Naar de keuken',
    'naar-luik': 'Naar het keukenluik',
    'saladette-naar-luik': 'Naar het keukenluik',
    'naar-kassa': 'Naar de kassa',
    'naar-buiten': 'Je bestelling is onderweg'
  };
  const pokeClips = ['naar-saladette', 'naar-keuken', 'naar-luik', 'naar-kassa'];
  const themes = {
    avond: {routes: ['poke', 'crousty', 'protein']},
    drukte: {routes: ['poke']},
    daglicht: {routes: ['poke']}
  };
  const order = ['avond', 'drukte', 'daglicht'];
  // Welke clip hoort bij welke overgang, per samenstelroute.
  const routes = {
    poke: {'intro>groenten': 'naar-saladette', 'groenten>proteine': 'naar-keuken', 'proteine>sauzen': 'naar-luik'},
    crousty: {'intro>proteine': 'bar-naar-keuken', 'proteine>sauzen': 'naar-luik'},
    protein: {'intro>proteine': 'bar-naar-keuken', 'proteine>groenten': 'keuken-naar-saladette', 'groenten>sauzen': 'saladette-naar-luik'}
  };
  // Het beeld waarop elke stap staat: het eindbeeld van de clip die er naartoe leidt.
  const stills = {
    poke: {intro: 'intro', groenten: 'naar-saladette', proteine: 'naar-keuken', sauzen: 'naar-luik', toppings: 'naar-luik', keuze: 'naar-luik', kassa: 'naar-kassa'},
    crousty: {intro: 'intro-bar', proteine: 'bar-naar-keuken', sauzen: 'naar-luik', toppings: 'naar-luik', keuze: 'naar-luik', kassa: 'naar-kassa'},
    protein: {intro: 'intro-bar', proteine: 'bar-naar-keuken', groenten: 'keuken-naar-saladette', sauzen: 'saladette-naar-luik', toppings: 'saladette-naar-luik', keuze: 'saladette-naar-luik', kassa: 'naar-kassa'}
  };
  const still = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = (area, key, value) => { try { if (value === undefined) return window[area].getItem(key); window[area].setItem(key, value); } catch { return null; } };

  function themeFor(kind) {
    const available = order.filter(name => themes[name].routes.includes(kind));
    const asked = new URLSearchParams(location.search).get('thema');
    if (available.includes(asked)) return asked;
    const key = 'fitbite.reis.thema.' + kind;
    const saved = store('sessionStorage', key);
    if (available.includes(saved)) return saved;
    const visits = Number(store('localStorage', 'fitbite.reis.bezoeken')) || 0;
    store('localStorage', 'fitbite.reis.bezoeken', String(visits + 1));
    const chosen = available[visits % available.length];
    store('sessionStorage', key, chosen);
    return chosen;
  }
  const kind = document.body.dataset.kind || 'poke';
  const theme = themeFor(kind);
  document.body.dataset.thema = theme;
  document.body.classList.add('reis-mode');
  const clipSrc = name => name === 'naar-buiten' ? base + 'naar-buiten.mp4' : base + theme + '/' + name + '.mp4';
  const endSrc = name => name === 'naar-buiten' ? base + 'naar-buiten-eind.jpg' : base + theme + '/' + name + '-eind.jpg';
  const stillSrc = step => {
    const ref = stills[kind]?.[step];
    if (!ref) return null;
    return ref.startsWith('intro') ? base + theme + '/' + ref + '.jpg' : endSrc(ref);
  };

  // Achtergrond: twee lagen die zacht in elkaar overvloeien wanneer er geen clip tussen zit.
  const stage = document.createElement('div');
  stage.id = 'stage-bg'; stage.setAttribute('aria-hidden', 'true');
  const layers = [new Image(), new Image()];
  layers.forEach(img => { img.alt = ''; img.decoding = 'async'; stage.append(img); });
  document.body.prepend(stage);
  let front = 0, current = '';
  function setBg(src, instant) {
    if (!src || src === current) return;
    current = src;
    const next = layers[1 - front], prev = layers[front];
    const show = () => {
      if (current !== src) return;
      next.classList.toggle('instant', !!instant); prev.classList.toggle('instant', !!instant);
      next.classList.add('is-on'); prev.classList.remove('is-on'); front = 1 - front;
    };
    next.onload = show; next.src = src;
    if (next.complete && next.naturalWidth) show();
  }

  // Clip-laag over het hele scherm.
  let layer, video, label, done;
  function build() {
    layer = document.createElement('div'); layer.className = 'reis'; layer.hidden = true;
    video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = 'auto';
    video.setAttribute('muted', ''); video.setAttribute('playsinline', ''); video.setAttribute('aria-hidden', 'true');
    label = document.createElement('p'); label.className = 'reis-label';
    layer.append(video, label); document.body.append(layer);
    layer.addEventListener('click', () => done?.());
  }
  function play(name, endStill = endSrc(name)) {
    if (!labels[name] || still()) { setBg(endStill); return Promise.resolve(false); }
    if (!layer) build();
    done?.();
    document.body.classList.add('reis-onderweg');
    return new Promise(resolve => {
      let finished = false, started = false, timer, startTimer;
      const preload = new Image(); preload.src = endStill;
      done = () => {
        if (finished) return; finished = true; done = null;
        clearTimeout(timer); clearTimeout(startTimer);
        setBg(endStill, started);
        document.body.classList.remove('reis-onderweg');
        layer.classList.remove('is-on');
        setTimeout(() => { if (!done) { layer.hidden = true; video.pause(); } resolve(started); }, 420);
      };
      label.textContent = labels[name];
      video.onplaying = () => {
        if (started || finished) return;
        started = true; clearTimeout(startTimer);
        layer.hidden = false; layer.classList.add('is-on');    // eerste beeld = huidige achtergrond: direct tonen
        setTimeout(() => { if (!finished) setBg(endStill, true); }, 60);
        timer = setTimeout(done, (video.duration || 5) * 1000 + 1500);
      };
      video.onended = done; video.onerror = done;
      startTimer = setTimeout(done, 2500);                       // start de clip niet, dan gewoon zacht overvloeien
      video.src = clipSrc(name); video.currentTime = 0;
      const p = video.play(); if (p?.catch) p.catch(done);
    });
  }
  const between = (k, from, to) => (to === 'kassa' && from !== 'kassa') ? 'naar-kassa' : routes[k]?.[from + '>' + to];
  // Wordt door de bouwer aangeroepen bij elke stapwissel.
  function go(k, from, to) {
    const clip = from && from !== to ? between(k, from, to) : null;
    if (clip) return play(clip, endSrc(clip));
    const target = stillSrc(to);
    if (target) setBg(target, !from);
  }
  setBg(stillSrc(document.body.dataset.scene) || stillSrc('intro'), true);

  // Clips en eindbeelden van deze versie alvast ophalen zodra de pagina rustig is.
  addEventListener('load', () => setTimeout(() => {
    if (still() || navigator.connection?.saveData) return;
    const names = new Set(Object.values(routes[kind] || {}).concat('naar-kassa'));
    for (const name of names) {
      const l = document.createElement('link'); l.rel = 'prefetch'; l.as = 'video'; l.href = clipSrc(name); document.head.append(l);
      new Image().src = endSrc(name);
    }
  }, 900));
  window.fitbiteReis = {play, between, go, setBg, theme, labels};
})();
