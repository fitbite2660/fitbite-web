/** Two real video angles, joined with a brief camera-swish transition. */
export function createTableMontage({
  hero,
  poster,
  videos,
  button,
  clipSeconds = 4,
  transitionMs = 280,
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)'),
  onError = () => {},
}) {
  if (!hero || !poster || !button || videos?.length !== 2 || videos.some(v => !v)) {
    throw new TypeError('Table montage needs a hero, poster, button and two video elements.');
  }

  const abort = new AbortController();
  const signal = abort.signal;
  const names = ['front', 'opposite'];
  const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 10 7-10 7Z"/></svg>';
  const pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6v12M15 6v12"/></svg>';
  let active = 0;
  let cycles = 0;
  let paused = reducedMotion.matches;
  let staticPoster = paused;
  let visible = true;
  let failed = false;
  let destroyed = false;
  let pending = null;
  let playingRequest = false;
  let frame = 0;
  let epoch = 0;

  const runnable = () => !destroyed && !paused && !failed && visible && !document.hidden;
  const ready = v => v.readyState >= 2 && !v.seeking;
  const state = () => ({
    active: names[active],
    paused,
    visible,
    hidden: document.hidden,
    transition: pending?.phase || 'none',
    cycles,
    failed,
    staticPoster,
  });

  function label() {
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Beweging afspelen' : 'Beweging pauzeren');
    button.innerHTML = (paused ? playIcon : pauseIcon) +
      '<span class="motion-label">' + (paused ? 'Afspelen' : 'Pauze') + '</span>';
    hero.dataset.montageAngle = names[active];
    hero.dataset.montagePaused = String(paused);
    hero.dataset.montageTransition = pending?.phase || 'none';
    hero.dataset.montageCycles = String(cycles);
    hero.dataset.montageFailed = String(failed);
    document.body.classList.toggle('motion-paused', paused);
  }

  function setLayer(video, opacity) {
    Object.assign(video.style, {
      opacity: String(opacity),
      transform: 'none',
      filter: 'none',
      transition: 'none',
      zIndex: opacity ? '2' : '1',
    });
  }

  function showPoster() {
    hero.classList.remove('video-ready');
    poster.style.opacity = '1';
    videos.forEach(v => setLayer(v, 0));
  }

  function showVideo() {
    if (staticPoster || !ready(videos[active])) return;
    hero.classList.add('video-ready');
    poster.style.opacity = '0';
    setLayer(videos[active], 1);
  }

  function ensureSources() {
    for (const video of videos) {
      if (!video.getAttribute('src') && video.dataset.src) {
        video.src = video.dataset.src;
        video.load();
      }
    }
  }

  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  function schedule() {
    if (!frame && runnable()) frame = requestAnimationFrame(tick);
  }

  function cancelTransition() {
    epoch++;
    pending?.animations?.forEach(a => a.cancel());
    pending = null;
    playingRequest = false;
    videos.forEach(v => v.pause());
    videos.forEach((v, i) => setLayer(v, i === active && !staticPoster ? 1 : 0));
  }

  function fail(error) {
    if (destroyed || failed) return;
    failed = true;
    paused = true;
    staticPoster = true;
    stopFrame();
    cancelTransition();
    showPoster();
    label();
    onError(error);
  }

  async function startCurrent() {
    if (playingRequest || !runnable() || pending) return;
    const video = videos[active];
    if (!ready(video)) return;
    playingRequest = true;
    const requestEpoch = epoch;
    try {
      await video.play();
      if (destroyed || requestEpoch !== epoch) return;
      if (!runnable()) video.pause();
      else showVideo();
    } catch (error) {
      if (error?.name !== 'AbortError' && !destroyed && requestEpoch === epoch && runnable()) fail(error);
    } finally {
      if (requestEpoch === epoch) playingRequest = false;
      schedule();
    }
  }

  function finishTransition(transition) {
    if (destroyed || pending !== transition) return;
    const outgoing = videos[active];
    active = transition.next;
    if (active === 0) cycles++;
    setLayer(videos[active], 1);
    setLayer(outgoing, 0);
    transition.animations.forEach(a => a.cancel());
    outgoing.pause();
    outgoing.currentTime = 0;
    pending = null;
    label();
    schedule();
  }

  async function startTransition() {
    if (!runnable() || pending?.phase !== 'waiting' || playingRequest) return;
    const transition = pending;
    const incoming = videos[transition.next];
    if (!ready(incoming)) return; // Hold the outgoing frame until the next one exists.
    playingRequest = true;
    const requestEpoch = epoch;
    try {
      await incoming.play();
      if (destroyed || requestEpoch !== epoch || pending !== transition) return;
      if (!runnable()) {
        incoming.pause();
        return;
      }
      const outgoing = videos[active];
      incoming.style.zIndex = '3';
      transition.phase = 'animating';
      const timing = { duration: transitionMs, easing: 'cubic-bezier(.22,.7,.2,1)', fill: 'forwards' };
      transition.animations = [
        outgoing.animate([
          { opacity: 1, transform: 'translateX(0) scale(1)', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translateX(-7%) scale(1.16)', filter: 'blur(7px)' },
        ], timing),
        incoming.animate([
          { opacity: 0, transform: 'translateX(7%) scale(1.16)', filter: 'blur(7px)' },
          { opacity: 1, transform: 'translateX(0) scale(1)', filter: 'blur(0px)' },
        ], timing),
      ];
      label();
      Promise.all(transition.animations.map(a => a.finished))
        .then(() => finishTransition(transition)).catch(() => {});
    } catch (error) {
      if (error?.name !== 'AbortError' && !destroyed && requestEpoch === epoch && pending === transition && runnable()) fail(error);
    } finally {
      if (requestEpoch === epoch) playingRequest = false;
      schedule();
    }
  }

  function tick() {
    frame = 0;
    if (!runnable()) return;
    if (pending) {
      if (pending.phase === 'waiting') startTransition();
    } else {
      const video = videos[active];
      const end = Number.isFinite(video.duration)
        ? Math.min(clipSeconds, Math.max(0.1, video.duration - 0.04)) : clipSeconds;
      if (video.currentTime >= end || video.ended) {
        video.pause();
        pending = { next: 1 - active, phase: 'waiting', animations: [] };
        label();
        startTransition();
      } else if (video.paused) {
        startCurrent();
      }
    }
    schedule();
  }

  function sync() {
    if (destroyed) return;
    document.body.classList.toggle('hero-away', !visible);
    document.body.classList.toggle('page-hidden', document.hidden);
    if (!runnable()) {
      stopFrame();
      videos.forEach(v => v.pause());
      pending?.animations?.forEach(a => a.pause());
    } else {
      ensureSources();
      if (pending?.phase === 'animating') {
        const transition = pending;
        const requestEpoch = epoch;
        const incoming = videos[transition.next];
        incoming.play().then(() => {
          if (pending === transition && requestEpoch === epoch && !runnable()) incoming.pause();
        }).catch(error => {
          if (error?.name !== 'AbortError' && !destroyed && pending === transition && requestEpoch === epoch && runnable()) fail(error);
        });
        transition.animations.forEach(a => a.play());
      } else if (pending) startTransition();
      else startCurrent();
      schedule();
    }
    if (staticPoster) showPoster();
    label();
  }

  function setPaused(value) {
    if (destroyed) return;
    paused = Boolean(value);
    if (!paused) {
      staticPoster = false;
      if (failed) {
        failed = false;
        active = 0;
        videos.forEach(v => { if (v.getAttribute('src')) v.load(); });
      }
    }
    sync();
  }

  poster.style.animation = 'none';
  videos.forEach((video, i) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.loop = false;
    video.preload = 'auto';
    video.setAttribute('aria-hidden', 'true');
    video.tabIndex = -1;
    setLayer(video, 0);
    video.addEventListener('loadeddata', sync, { signal });
    video.addEventListener('seeked', sync, { signal });
    video.addEventListener('error', () => fail(new Error('Could not load the ' + names[i] + ' video.')), { signal });
  });
  button.addEventListener('click', () => setPaused(!paused), { signal });
  document.addEventListener('visibilitychange', sync, { signal });
  reducedMotion.addEventListener('change', event => {
    paused = event.matches;
    staticPoster = event.matches;
    if (staticPoster) {
      cancelTransition();
      active = 0;
      videos.forEach(v => { if (v.readyState) v.currentTime = 0; });
    }
    sync();
  }, { signal });
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }, { threshold: 0.15 });
  observer.observe(hero);
  showPoster();
  sync();

  return {
    getState: state,
    setPaused,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      stopFrame();
      cancelTransition();
      observer.disconnect();
      abort.abort();
      staticPoster = true;
      showPoster();
    },
  };
}
