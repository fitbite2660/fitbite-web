// FITBITE — cyberpunk 3D-wandeling. Hoofdprogramma: renderer, besturing, rondleiding, kwaliteit.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { makeTextures, makeSigns } from './tex.js';
import { makeMaterials } from './mats.js';
import { buildWorld, floorAt, zoneName } from './world.js';
import { PlanarReflection, makeReflective } from './reflect.js';
import { makeRain } from './rain.js';
import tv1 from '../assets/tv1.jpg'; import tv2 from '../assets/tv2.jpg'; import tv3 from '../assets/tv3.jpg'; import tv4 from '../assets/tv4.jpg'; import salad from '../assets/salad.jpg';

const $ = (id) => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
const EYE = 1.66, RAD = 0.28;

const QUAL = {
  laag: { pr: 0.8, maxPr: 1, msaa: 2, shadow: 0, refl: 384, rain: 2500, tier: 0, bloom: 0.5 },
  midden: { pr: 1, maxPr: 1.25, msaa: 4, shadow: 1024, refl: 768, rain: 6000, tier: 1, bloom: 0.55 },
  hoog: { pr: 1, maxPr: 2, msaa: 4, shadow: 2048, refl: 1280, rain: 11000, tier: 1, bloom: 0.6 },
};
const params = new URLSearchParams(location.search);
let qName = params.get('q') || (isTouch ? 'laag' : 'midden'); if (!QUAL[qName]) qName = 'midden';

const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; varying vec2 vUv;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)))*43758.5453); }
    void main(){ vec2 d = vUv-0.5; float ca = dot(d,d)*0.006; vec3 c;
      c.r = texture2D(tDiffuse, vUv + d*ca).r; c.g = texture2D(tDiffuse, vUv).g; c.b = texture2D(tDiffuse, vUv - d*ca).b;
      float l = dot(c, vec3(0.2126,0.7152,0.0722));
      c = mix(c, c*vec3(0.90,1.02,1.12), (1.0-smoothstep(0.0,0.45,l))*0.55);
      c = mix(c, c*vec3(1.06,1.0,0.93), smoothstep(0.45,1.0,l)*0.5);
      c = (c-0.5)*1.07+0.5; c = mix(vec3(l), c, 1.1);
      float v = smoothstep(0.95,0.3,length(d*vec2(1.0,0.86))); c *= mix(0.66,1.0,v);
      c += (hash(vUv*uRes + fract(uTime)*91.7)-0.5)*0.028;
      gl_FragColor = vec4(max(c,0.0),1.0); }`
};

function loadTex(uri) { return new Promise((res) => { const im = new Image(); im.onload = () => { const t = new THREE.Texture(im); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; res(t); }; im.src = uri; }); }

async function boot() {
  const canvas = $('c');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false }); }
  catch (e) { $('loadmsg').textContent = 'Deze browser ondersteunt geen WebGL 2. Probeer een recente Chrome, Edge, Firefox of Safari.'; return; }
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.shadowMap.autoUpdate = false;

  try { await Promise.all(['40px Sacramento', '500 40px Oswald', '700 40px Oswald', '700 40px "Playfair Display"'].map(f => document.fonts.load(f))); } catch (e) { /* systeemfonts als terugval */ }
  const [i1, i2, i3, i4, isal] = await Promise.all([tv1, tv2, tv3, tv4, salad].map(loadTex));
  isal.wrapS = isal.wrapT = THREE.MirroredRepeatWrapping; isal.repeat.set(2, 1);
  await new Promise(r => setTimeout(r, 30));

  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x070b16, 0.0125);
  const camera = new THREE.PerspectiveCamera(66, 1, 0.08, 900); camera.rotation.order = 'YXZ';

  const T = makeTextures(), S = makeSigns(T), M = makeMaterials(T, S, { tv1: i1, tv2: i2, salad: isal });
  const tvSets = [[i1, i2], [i3, i4]];
  const R = new PlanarReflection(QUAL[qName].refl);
  makeReflective(M.asphalt, R, T, { strength: 0.5, puddles: 1, rain: 1, micro: 0.02, blur: 2.2 });
  makeReflective(M.pavers, R, T, { strength: 0.42, puddles: 0.85, rain: 1, micro: 0.025, blur: 2.6 });
  makeReflective(M.floorc, R, T, { strength: 0.42, puddles: 0, rain: 0, micro: 0.008, blur: 2.4 });

  // omgevingsreflectie (kleine lichtstudio met neonvlakken)
  { const s = new THREE.Scene(); s.background = new THREE.Color(0x04060a);
    const add = (c, k, x, y, z, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
    add(0x25e6ff, 5, -8, 2, -6, 7, 1.2); add(0xff2bd0, 5, 8, 3, 5, 7, 1.2); add(0xffc890, 6, 0, 9, 0, 5, 5); add(0x4060ff, 2.5, 6, 1, -8, 3, 2); add(0xffe0b0, 3, -6, 4, 7, 4, 1.2); add(0x203050, 1, 0, -9, 0, 20, 20);
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(s, 0.04).texture; scene.environmentIntensity = 0.55; pm.dispose(); }

  const W = buildWorld(M, scene);
  R.hide = [...W.grounds];
  const rain = makeRain(QUAL.hoog.rain); scene.add(rain); R.hide.push(rain);

  // ---------- post-processing ----------
  let composer, bloom, grade;
  function buildComposer() {
    const Q = QUAL[qName]; const sz = renderer.getDrawingBufferSize(new THREE.Vector2());
    if (composer) { composer.renderTarget1.dispose(); composer.renderTarget2.dispose(); }
    const rt = new THREE.WebGLRenderTarget(sz.x, sz.y, { type: THREE.HalfFloatType, samples: Q.msaa });
    composer = new EffectComposer(renderer, rt); composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(sz.x / 2, sz.y / 2), Q.bloom, 0.7, 1.0); composer.addPass(bloom);
    composer.addPass(new OutputPass()); grade = new ShaderPass(GradeShader); composer.addPass(grade);
    grade.uniforms.uRes.value.set(sz.x, sz.y);
  }
  function resize() {
    const Q = QUAL[qName], w = innerWidth, h = innerHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q.maxPr) * Q.pr); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.fov = w < h ? 78 : 66; camera.updateProjectionMatrix(); buildComposer();
  }
  function applyQuality(name, silent) {
    qName = name; const Q = QUAL[name];
    for (const { l, tier } of W.lights) l.visible = tier <= Q.tier;
    for (const l of W.shadowLights) { l.castShadow = Q.shadow > 0; if (Q.shadow) { l.shadow.mapSize.set(Q.shadow, Q.shadow); if (l.shadow.map) { l.shadow.map.dispose(); l.shadow.map = null; } } }
    scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
    renderer.shadowMap.needsUpdate = true; R.setSize(Q.refl); rain.geometry.instanceCount = Q.rain; resize();
    document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === name));
    if (!silent) toast('Kwaliteit: ' + name);
  }
  addEventListener('resize', resize);

  // ---------- speler ----------
  const P = { x: -1.6, z: 12.6, y: 0, yaw: -0.13, pitch: 0.07, vx: 0, vz: 0, bob: 0 };
  const keys = {}; let locked = false, started = false, mode = 'idle'; // idle | walk | tour
  const cols = W.colliders;
  function collide(p) {
    for (let it = 0; it < 3; it++) for (const c of cols) {
      if (c.off) continue; const cx = clamp(p.x, c[0], c[2]), cz = clamp(p.z, c[1], c[3]); const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= RAD * RAD) continue;
      if (d2 > 1e-9) { const d = Math.sqrt(d2); p.x = cx + dx / d * RAD; p.z = cz + dz / d * RAD; }
      else { const l = p.x - c[0], r = c[2] - p.x, t = p.z - c[1], b = c[3] - p.z, m = Math.min(l, r, t, b); if (m === l) p.x = c[0] - RAD; else if (m === r) p.x = c[2] + RAD; else if (m === t) p.z = c[1] - RAD; else p.z = c[3] + RAD; }
    }
  }
  function moveBy(dx, dz) { const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.08)); for (let i = 0; i < n; i++) { P.x += dx / n; P.z += dz / n; collide(P); } }
  const stick = { x: 0, y: 0 };
  function stepPlayer(dt) {
    let f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - stick.y, s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x;
    const len = Math.hypot(f, s); if (len > 1) { f /= len; s /= len; }
    const sp = (keys.ShiftLeft || keys.ShiftRight) ? 3.0 : 1.7, sy = Math.sin(P.yaw), cy = Math.cos(P.yaw);
    const tx = (-sy * f + cy * s) * sp, tz = (-cy * f - sy * s) * sp, k = 1 - Math.exp(-dt * 9);
    P.vx += (tx - P.vx) * k; P.vz += (tz - P.vz) * k;
    const ox = P.x, oz = P.z; moveBy(P.vx * dt, P.vz * dt);
    const moved = Math.hypot(P.x - ox, P.z - oz); P.bob += moved * 3.4;
  }

  // ---------- rondleiding ----------
  const TOUR = [
    { p: [-1.6, 12.6], look: [0.5, 3.4, 0], hold: 2.5 }, { p: [-1.2, 8.5], look: [-1.5, 3.2, 0] }, { p: [-0.85, 4.2], look: [-0.8, 1.8, -2] }, { p: [-0.76, 1.0] }, { p: [-0.78, -1.3], look: [-5.4, 1.7, -3.2] },
    { p: [-1.0, -2.9], look: [-6.5, 1.8, -3.6] }, { p: [-3.3, -2.95], look: [-7.6, 2.1, -3.7] }, { p: [-4.25, -3.4], look: [-7.6, 2.15, -3.7], hold: 4 },
    { p: [-4.3, -4.7], look: [-5.4, 1.15, -4.7], hold: 2.5 }, { p: [-4.2, -2.4], look: [-5.0, 0.8, -2.9] }, { p: [-4.5, -1.2], look: [-7.2, 1.5, -0.4] }, { p: [-6.3, -1.22], look: [-7.5, 1.6, -3.0] },
    { p: [-6.4, -3.3], look: [-7.7, 1.7, -3.7], hold: 3 }, { p: [-6.6, -1.4], look: [-8.6, 1.4, -1.3] }, { p: [-7.6, -1.3] }, { p: [-8.7, -1.36], look: [-9.5, 1.3, -0.5] }, { p: [-9.45, -1.5], look: [-9.5, 1.25, -0.4], hold: 1.5 },
    { p: [-9.4, -2.7], look: [-8.2, 1.3, -4.0] }, { p: [-9.2, -3.75], look: [-7.95, 1.55, -3.7], hold: 3 }, { p: [-10.3, -3.75], look: [-13, 1.2, -3.7] }, { p: [-11.3, -3.4], look: [-13, 1.2, -3.6], hold: 1.5 },
    { p: [-11.6, -2.3], look: [-11.8, 0.9, -0.3], hold: 2.5 }, { p: [-12.1, -4.4], look: [-12.15, 1.5, -6.6] }, { p: [-12.15, -6.2], look: [-19, 1.6, -6.4], hold: 1.2 }, { p: [-10.9, -6.4], look: [-5, 1.6, -6.6] },
    { p: [-9.0, -6.6], look: [-3, 1.6, -9] }, { p: [-5.0, -7.5], look: [-1, 1.2, -13] }, { p: [-1.5, -7.9], look: [-1, 1.3, -14], hold: 2.5 }, { p: [0.6, -7.2], look: [-5.5, 1.9, -3.4], hold: 4 },
  ];
  const tour = { t: 0, curve: null, T: [], seg: [], total: 0, since: 0 };
  { const pts = TOUR.map(k => new THREE.Vector3(k.p[0], 0, k.p[1])); tour.curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.12); let t = 0;
    TOUR.forEach((k, i) => { tour.T.push(t); t += (k.hold || 0); if (i < TOUR.length - 1) { const d = pts[i].distanceTo(pts[i + 1]) / 1.05; tour.seg.push(d); t += d; } }); tour.total = t; }
  function tourPose(t) {
    const n = TOUR.length; let i = n - 2; for (let k = 0; k < n - 1; k++) if (t < tour.T[k + 1]) { i = k; break; }
    let u = clamp((t - tour.T[i] - (TOUR[i].hold || 0)) / tour.seg[i], 0, 1); const e = u * u * (3 - 2 * u); u = u * 0.5 + e * 0.5;
    const g = (i + u) / (n - 1), p = tour.curve.getPoint(g), a = tour.curve.getPoint(Math.min(1, g + 0.012));
    const ahead = new THREE.Vector3(p.x + (a.x - p.x) * 40, EYE + floorAt(p.x, p.z) - 0.05, p.z + (a.z - p.z) * 40);
    const la = TOUR[i].look ? new THREE.Vector3(...TOUR[i].look) : ahead, lb = TOUR[i + 1].look ? new THREE.Vector3(...TOUR[i + 1].look) : ahead;
    return { x: p.x, z: p.z, look: la.lerp(lb, e) };
  }
  function startTour() { mode = 'tour'; tour.t = 0; tour.since = performance.now(); started = true; hideOverlay(); if (document.pointerLockElement) document.exitPointerLock(); $('tourbar').classList.add('show'); audioStart(); }
  function stopTour(msg) { if (mode !== 'tour') return; mode = 'walk'; P.vx = P.vz = 0; $('tourbar').classList.remove('show'); if (msg) toast(msg); if (!isTouch) showOverlay(true); }
  function stepTour(dt) {
    tour.t += dt; if (tour.t >= tour.total) { stopTour('Einde rondleiding — loop zelf verder'); return; }
    const q = tourPose(tour.t); P.x = q.x; P.z = q.z;
    const ey = P.y + EYE, dx = q.look.x - P.x, dz = q.look.z - P.z, dy = q.look.y - ey;
    const ty = Math.atan2(-dx, -dz), tp = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.6, 0.6), k = 1 - Math.exp(-dt * 2.2);
    let d = ty - P.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); P.yaw += d * k; P.pitch += (tp - P.pitch) * k; P.bob += dt * 3.2;
    $('tourfill').style.width = (tour.t / tour.total * 100).toFixed(1) + '%';
  }

  // ---------- invoer ----------
  const overlay = $('overlay');
  function hideOverlay() { overlay.classList.add('hide'); $('hud').classList.add('show'); }
  function showOverlay(paused) { overlay.classList.remove('hide'); $('startbtn').textContent = paused ? 'Verder wandelen' : 'Start wandeling'; $('sub').textContent = paused ? 'Gepauzeerd' : 'Train, Eat, Repeat'; }
  function startWalk() {
    started = true; if (mode === 'tour') stopTour(); mode = 'walk'; hideOverlay(); audioStart();
    if (!isTouch && canvas.requestPointerLock) { try { const pr = canvas.requestPointerLock(); if (pr && pr.catch) pr.catch(() => {}); } catch (e) { /* geen pointer lock */ } }
  }
  $('startbtn').onclick = startWalk; $('tourbtn').onclick = startTour; $('tourbtn2').onclick = () => (mode === 'tour' ? stopTour('Rondleiding gestopt') : startTour());
  document.querySelectorAll('[data-q]').forEach(b => b.onclick = (e) => { e.stopPropagation(); applyQuality(b.dataset.q); });
  canvas.addEventListener('click', () => { if (mode === 'tour') return; if (started && !isTouch && !locked) startWalk(); });
  document.addEventListener('pointerlockchange', () => { locked = document.pointerLockElement === canvas; if (!locked && started && mode === 'walk' && !isTouch) showOverlay(true); if (locked) hideOverlay(); });
  document.addEventListener('mousemove', (e) => { if (!locked || mode !== 'walk') return; P.yaw -= e.movementX * 0.0021; P.pitch = clamp(P.pitch - e.movementY * 0.0021, -1.35, 1.35); });
  addEventListener('keydown', (e) => { keys[e.code] = true; if (mode === 'tour' && performance.now() - tour.since > 800 && ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Space'].includes(e.code)) stopTour('Rondleiding gestopt'); if (e.code === 'KeyR' && mode !== 'tour') startTour(); if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault(); });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  // aanraakbediening: links joystick, rechts rondkijken
  if (isTouch) {
    document.body.classList.add('touch'); const joy = $('joy'), nub = $('nub'); let jid = null, lid = null, jx = 0, jy = 0, lx = 0, ly = 0;
    const tstart = (e) => { if (mode === 'tour') { if (performance.now() - tour.since > 800 && e.target === canvas) stopTour('Rondleiding gestopt'); return; }
      for (const t of e.changedTouches) { if (t.clientX < innerWidth * 0.42 && t.clientY > innerHeight * 0.35 && jid === null) { jid = t.identifier; jx = t.clientX; jy = t.clientY; joy.style.left = (jx - 60) + 'px'; joy.style.top = (jy - 60) + 'px'; joy.classList.add('on'); } else if (lid === null) { lid = t.identifier; lx = t.clientX; ly = t.clientY; } } e.preventDefault(); };
    const tmove = (e) => { for (const t of e.changedTouches) { if (t.identifier === jid) { let dx = (t.clientX - jx) / 50, dy = (t.clientY - jy) / 50; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } stick.x = dx; stick.y = dy; nub.style.transform = `translate(${dx * 34}px,${dy * 34}px)`; } else if (t.identifier === lid) { P.yaw -= (t.clientX - lx) * 0.0052; P.pitch = clamp(P.pitch - (t.clientY - ly) * 0.0052, -1.3, 1.3); lx = t.clientX; ly = t.clientY; } } e.preventDefault(); };
    const tend = (e) => { for (const t of e.changedTouches) { if (t.identifier === jid) { jid = null; stick.x = stick.y = 0; nub.style.transform = ''; joy.classList.remove('on'); } if (t.identifier === lid) lid = null; } };
    canvas.addEventListener('touchstart', tstart, { passive: false }); canvas.addEventListener('touchmove', tmove, { passive: false }); canvas.addEventListener('touchend', tend); canvas.addEventListener('touchcancel', tend);
  }
  let toastT = 0; function toast(s) { const t = $('toast'); t.textContent = s; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

  // ---------- geluid (regenruis, binnen gedempt) ----------
  let actx = null, again = null, afilt = null, sound = true;
  function audioStart() {
    if (actx || !sound) return; try {
      actx = new (window.AudioContext || window.webkitAudioContext)(); const n = actx.sampleRate * 3, buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0); let b = 0;
      for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; b = b * 0.82 + w * 0.18; d[i] = b * 0.9 + w * 0.12; }
      const src = actx.createBufferSource(); src.buffer = buf; src.loop = true; afilt = actx.createBiquadFilter(); afilt.type = 'lowpass'; afilt.frequency.value = 5000; again = actx.createGain(); again.gain.value = 0;
      src.connect(afilt); afilt.connect(again); again.connect(actx.destination); src.start();
    } catch (e) { actx = null; }
  }
  $('sndbtn').onclick = () => { sound = !sound; $('sndbtn').classList.toggle('on', sound); $('sndbtn').textContent = sound ? 'Geluid aan' : 'Geluid uit'; if (sound) audioStart(); else if (again) again.gain.value = 0; };

  // ---------- lus ----------
  const clock = new THREE.Clock(); let time = 0, fpsAcc = 0, fpsN = 0, lowT = 0, tvIdx = 0, tvT = 0, lastZone = '';
  applyQuality(qName, true);
  $('loading').classList.add('hide'); showOverlay(false);

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05); time += dt;
    if (mode === 'walk') stepPlayer(dt); else if (mode === 'tour') stepTour(dt); else if (mode === 'idle') { P.yaw = -0.13 + Math.sin(time * 0.17) * 0.035; P.pitch = 0.07 + Math.sin(time * 0.11) * 0.012; }
    const fh = floorAt(P.x, P.z); P.y += (fh - P.y) * (1 - Math.exp(-dt * 12));
    camera.position.set(P.x, P.y + EYE + Math.sin(P.bob) * 0.012, P.z); camera.rotation.y = P.yaw; camera.rotation.x = P.pitch; camera.updateMatrixWorld();
    // automatische schuifdeuren
    for (const d of W.doors) { const near = Math.hypot(P.x - d.x, P.z - d.z) < 3.4; d.open += ((near ? 1 : 0) - d.open) * (1 - Math.exp(-dt * 3.5)); d.leaves[1].position.x = d.base[0] - d.open * 0.96; d.leaves[2].position.x = d.base[1] + d.open * 0.96; d.col.off = d.open > 0.7; }
    if (W.turbine) W.turbine.rotation.z = time * 0.5; if (W.beacon) W.beacon.visible = (time % 2.4) < 1.2;
    // menuschermen wisselen
    tvT += dt; if (tvT > 9) { tvT = 0; tvIdx = 1 - tvIdx; M.tvL.map = tvSets[tvIdx][0]; M.tvR.map = tvSets[tvIdx][1]; }
    { const f = clamp(Math.min(tvT, 9 - tvT) * 2.5, 0.05, 1) * 1.25; M.tvL.color.setScalar(f); M.tvR.color.setScalar(f); }
    const fl = 1.7 + Math.sin(time * 13) * 0.04 + (Math.sin(time * 2.3) > 0.985 ? -0.6 : 0); M.neon.color.setScalar(fl); M.open.color.setScalar(2.2 + Math.sin(time * 3.1) * 0.25);
    const outside = P.z > 0.26;
    renderer.toneMappingExposure += ((outside ? 1.12 : 0.88) - renderer.toneMappingExposure) * (1 - Math.exp(-dt * 1.6));
    rain.material.uniforms.uTime.value = time; rain.material.uniforms.uCam.value.copy(camera.position); R.uTime.value = time;
    if (again) { const tg = sound ? (outside ? 0.2 : 0.045) : 0; again.gain.value += (tg - again.gain.value) * 0.05; afilt.frequency.value += ((outside ? 5200 : 700) - afilt.frequency.value) * 0.05; }
    const zn = zoneName(P.x, P.z); if (zn !== lastZone) { lastZone = zn; $('zone').textContent = zn; }
    R.update(renderer, scene, camera);
    grade.uniforms.uTime.value = time; composer.render(dt);
    // automatisch terugschakelen bij lage framerate
    if (started && !params.get('q')) { fpsAcc += dt; fpsN++; if (fpsAcc > 1) { const fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; lowT = fps < 22 ? lowT + 1 : 0; if (lowT >= 4 && qName !== 'laag') { lowT = 0; applyQuality(qName === 'hoog' ? 'midden' : 'laag', true); toast('Kwaliteit verlaagd voor vloeiender beeld'); } } }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // testhaak (gebruikt bij de controle vóór oplevering)
  window.__fb = { P, W, tour, tourPose, TOUR, collide, moveBy, floorAt, renderer, scene, camera, RAD,
    pose(x, z, yaw, pitch) { P.x = x; P.z = z; P.yaw = yaw; P.pitch = pitch || 0; P.y = floorAt(x, z); mode = 'pose'; started = true; hideOverlay(); },
    setMode(m) { mode = m; }, keys, get mode() { return mode; }, startTour, startWalk, applyQuality };
}
boot().catch((e) => { console.error(e); const m = document.getElementById('loadmsg'); if (m) m.textContent = 'Er ging iets mis bij het laden: ' + e.message; });
