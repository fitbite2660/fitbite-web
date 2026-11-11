// Procedurele texturen (canvas) — alles wordt in de browser gegenereerd, geen losse bestanden.
import * as THREE from 'three';

export function rng(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
export const R = rng(20241);

export function cv(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h); return c;
}
export function tex(c, { rep = true, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = aniso; return t;
}
// Naadloos herhaalbare fbm-ruis, 0..1
export function fbm(size, cells, oct, seed) {
  const out = new Float32Array(size * size); let amp = 1, tot = 0;
  for (let o = 0; o < oct; o++) {
    const n = Math.min(cells << o, size); const r = rng(seed + o * 131);
    const g = new Float32Array(n * n); for (let i = 0; i < n * n; i++) g[i] = r();
    const s = n / size;
    for (let y = 0; y < size; y++) {
      const fy = y * s, y0 = fy | 0, ty = fy - y0, y1 = (y0 + 1) % n, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < size; x++) {
        const fx = x * s, x0 = fx | 0, tx = fx - x0, x1 = (x0 + 1) % n, sx = tx * tx * (3 - 2 * tx);
        const a = g[y0 * n + x0], b = g[y0 * n + x1], c = g[y1 * n + x0], d = g[y1 * n + x1];
        out[y * size + x] += amp * (a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy);
      }
    }
    tot += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= tot; return out;
}
// Schilder per pixel: fn(i, x, y) -> [r,g,b] (0..255)
function paint(g, w, h, fn) {
  const id = g.getImageData(0, 0, w, h), d = id.data;
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
    const c = fn(i, x, y); d[i * 4] = c[0]; d[i * 4 + 1] = c[1]; d[i * 4 + 2] = c[2]; d[i * 4 + 3] = c.length > 3 ? c[3] : 255;
  }
  g.putImageData(id, 0, 0);
}
function modulate(g, w, h, n, amt, bias = 0.5) {
  const id = g.getImageData(0, 0, w, h), d = id.data;
  for (let i = 0; i < w * h; i++) { const k = 1 + (n[i] - bias) * amt; d[i * 4] *= k; d[i * 4 + 1] *= k; d[i * 4 + 2] *= k; }
  g.putImageData(id, 0, 0);
}

export function makeTextures() {
  const T = {};
  const nA = fbm(512, 64, 3, 11), nB = fbm(512, 4, 5, 23), nC = fbm(512, 8, 4, 37), nD = fbm(256, 32, 3, 51), nE = fbm(256, 4, 4, 77);

  // --- buiten ---
  const asph = cv(512, 512, (g, w, h) => paint(g, w, h, i => { const v = 26 + nA[i] * 30 + nB[i] * 16; return [v, v, v + 4]; }));
  T.asphalt = tex(asph); T.asphaltB = tex(cv(512, 512, (g, w, h) => paint(g, w, h, i => { const v = nA[i] * 255; return [v, v, v]; })), { srgb: false });

  const pav = cv(512, 512, (g, w, h) => {
    g.fillStyle = '#26282b'; g.fillRect(0, 0, w, h);
    const bw = w / 4, bh = h / 8;
    for (let r = 0; r < 8; r++) for (let c = -1; c < 4; c++) {
      const v = 78 + R() * 34; g.fillStyle = `rgb(${v},${v + 1},${v + 4})`;
      const x = c * bw + (r % 2 ? bw / 2 : 0);
      g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
      if (x + bw > w) g.fillRect(x - w + 2, r * bh + 2, bw - 4, bh - 4);
    }
    modulate(g, w, h, nA, 0.35); modulate(g, w, h, nB, 0.3);
  });
  T.pavers = tex(pav);
  T.paversB = tex(cv(512, 512, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h); const bw = w / 4, bh = h / 8; g.fillStyle = '#fff';
    for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) g.fillRect(c * bw + (r % 2 ? bw / 2 : 0) + 3, r * bh + 3, bw - 6, bh - 6);
  }), { srgb: false });

  T.turf = tex(cv(256, 256, (g, w, h) => paint(g, w, h, i => { const v = nD[i], u = nE[i]; return [14 + v * 22, 44 + v * 46 + u * 14, 20 + v * 18]; })));
  T.mulch = tex(cv(256, 256, (g, w, h) => paint(g, w, h, i => { const v = nD[i]; return [50 + v * 60, 34 + v * 40, 26 + v * 26]; })));

  // gevelpanelen (antraciet sandwichpanelen met horizontale naden, 4x4 m)
  const fac = cv(512, 512, (g, w, h) => {
    g.fillStyle = '#2b2e33'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x++) { const a = (nC[x] - 0.5) * 0.10; g.fillStyle = a > 0 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${-a})`; g.fillRect(x, 0, 1, h); }
    for (let k = 0; k < 4; k++) { const y = k * 128; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(0, y, w, 3); g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, y + 3, w, 2); }
    modulate(g, w, h, nB, 0.18);
  });
  T.facade = tex(fac);
  T.facadeB = tex(cv(64, 512, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = '#000'; for (let k = 0; k < 4; k++) g.fillRect(0, k * 128, w, 4); }), { srgb: false });

  // --- binnen ---
  const conc = cv(512, 512, (g, w, h) => {
    paint(g, w, h, i => { const v = 132 + nB[i] * 44 + nA[i] * 14; return [v, v - 1, v - 4]; });
    for (let y = 0; y < h; y += 46) { g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(0, y, w, 1); g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(0, y + 1, w, 1); }
    for (let k = 0; k < 140; k++) { g.fillStyle = `rgba(0,0,0,${0.05 + R() * 0.12})`; g.beginPath(); g.arc(R() * w, R() * h, 0.6 + R() * 1.6, 0, 7); g.fill(); }
  });
  T.concrete = tex(conc);
  T.floorc = tex(cv(512, 512, (g, w, h) => paint(g, w, h, i => { const v = 92 + nB[i] * 40 + nC[i] * 16 + nA[i] * 5; return [v, v, v + 2]; })));

  // laminaat (lichte eik) — 2.4 x 1.6 m, planken langs u
  T.laminate = tex(cv(768, 512, (g, w, h) => {
    const rows = 8, ph = h / rows; const gr = fbm(512, 2, 3, 91);
    for (let r = 0; r < rows; r++) {
      const off = R() * w; let x = -off;
      while (x < w) {
        const len = w / 2 * (0.8 + R() * 0.4), t = 0.9 + R() * 0.2;
        g.fillStyle = `rgb(${196 * t | 0},${164 * t | 0},${118 * t | 0})`; g.fillRect(x, r * ph, len, ph);
        for (let k = 0; k < 26; k++) { g.fillStyle = `rgba(${R() > .5 ? '120,84,44' : '236,210,168'},${0.05 + R() * 0.1})`; g.fillRect(x + R() * len * 0.2, r * ph + R() * ph, len * (0.4 + R() * 0.6), 1); }
        g.fillStyle = 'rgba(60,40,20,.45)'; g.fillRect(x, r * ph, 1.5, ph); x += len;
      }
      g.fillStyle = 'rgba(60,40,20,.4)'; g.fillRect(0, r * ph, w, 1.5);
    }
    void gr;
  }));

  // eiken latten (verticale nerf)
  T.slat = tex(cv(64, 512, (g, w, h) => {
    g.fillStyle = '#c69d68'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 150; k++) { g.fillStyle = `rgba(${R() > .5 ? '110,74,36' : '240,214,170'},${0.05 + R() * 0.12})`; g.fillRect(R() * w, R() * h, 1 + R() * 1.5, 40 + R() * 220); }
  }));
  // steigerhout voor plantenbakken (verticale planken)
  T.planks = tex(cv(512, 256, (g, w, h) => {
    for (let p = 0; p < 4; p++) {
      const t = 0.85 + R() * 0.3; g.fillStyle = `rgb(${182 * t | 0},${128 * t | 0},${70 * t | 0})`; g.fillRect(p * 128, 0, 128, h);
      for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${R() > .5 ? '96,56,22' : '232,186,120'},${0.08 + R() * 0.14})`; g.fillRect(p * 128 + R() * 128, R() * h, 1 + R() * 2, 30 + R() * 150); }
      g.fillStyle = 'rgba(30,18,8,.7)'; g.fillRect(p * 128, 0, 2.5, h);
    }
  }));
  T.pine = tex(cv(256, 64, (g, w, h) => {
    g.fillStyle = '#d7b98a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(150,104,52,${0.06 + R() * 0.12})`; g.fillRect(R() * w, R() * h, 40 + R() * 160, 1); }
  }));

  // podiumtegels (grijze patroontegels 20 cm)
  T.ptiles = tex(cv(512, 512, (g, w, h) => {
    const n = 4, s = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const v = 128 + R() * 44; g.fillStyle = `rgb(${v},${v},${v + 3})`; g.fillRect(i * s, j * s, s, s);
      g.save(); g.translate(i * s + s / 2, j * s + s / 2); g.strokeStyle = `rgba(${R() > .5 ? '235,235,238' : '70,72,78'},.33)`; g.lineWidth = 2;
      const k = (R() * 5) | 0;
      if (k === 0) for (let a = 0; a < 8; a++) { g.rotate(Math.PI / 4); g.beginPath(); g.ellipse(0, -s * 0.22, s * 0.07, s * 0.2, 0, 0, 7); g.stroke(); }
      else if (k === 1) { for (const r of [0.14, 0.26, 0.38]) { g.beginPath(); g.arc(0, 0, s * r, 0, 7); g.stroke(); } }
      else if (k === 2) { g.rotate(Math.PI / 4); for (const r of [0.2, 0.32]) g.strokeRect(-s * r, -s * r, s * r * 2, s * r * 2); }
      else if (k === 3) for (let a = 0; a < 4; a++) { g.rotate(Math.PI / 2); g.beginPath(); g.arc(s / 2, s / 2, s * 0.42, Math.PI, Math.PI * 1.5); g.stroke(); }
      g.restore();
      g.strokeStyle = 'rgba(215,215,215,.5)'; g.lineWidth = 2; g.strokeRect(i * s, j * s, s, s);
    }
    modulate(g, w, h, nB, 0.2);
  }));

  // witte wandtegels 10 cm
  T.wtiles = tex(cv(128, 128, (g, w, h) => {
    g.fillStyle = '#c9c6bf'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const v = 232 + R() * 10; g.fillStyle = `rgb(${v},${v - 1},${v - 5})`; g.fillRect(i * 64 + 1.5, j * 64 + 1.5, 61, 61); }
  }));
  // sierrand met gekleurde tegels (blauw / roze / geel / wit) — uniek, 32 tegels breed
  T.border = tex(cv(1024, 64, (g, w, h) => {
    const pal = ['#2f4f77', '#e9c8c0', '#f0d874', '#ece9e2', '#ece9e2', '#f0d874', '#e9c8c0', '#3d6ea0', '#ece9e2'];
    for (let i = 0; i < 32; i++) { g.fillStyle = '#c9c6bf'; g.fillRect(i * 32, 0, 32, h); g.fillStyle = pal[(R() * pal.length) | 0]; g.fillRect(i * 32 + 1, 1, 30, 30); g.fillStyle = pal[(R() * pal.length) | 0]; g.fillRect(i * 32 + 1, 33, 30, 30); }
  }));
  // betonblokken (opslag)
  T.blocks = tex(cv(512, 512, (g, w, h) => {
    g.fillStyle = '#5c5a56'; g.fillRect(0, 0, w, h); const bw = w / 2, bh = h / 4;
    for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) { const v = 122 + R() * 22; g.fillStyle = `rgb(${v},${v - 2},${v - 8})`; g.fillRect(c * bw + (r % 2 ? bw / 2 : 0) + 2, r * bh + 2, bw - 4, bh - 4); }
    modulate(g, w, h, nA, 0.25); modulate(g, w, h, nB, 0.2);
  }));
  T.cabinet = tex(cv(256, 256, (g, w, h) => paint(g, w, h, i => { const v = 34 + nE[i] * 26 + nD[i] * 8; return [v, v + 1, v + 3]; })));
  T.worktop = tex(cv(256, 256, (g, w, h) => paint(g, w, h, i => { const v = 118 + nE[i] * 26 + nD[i] * 10; return [v, v, v - 2]; })));
  T.cardboard = tex(cv(128, 128, (g, w, h) => paint(g, w, h, i => { const v = nD[(i * 2) % nD.length]; return [150 + v * 30, 116 + v * 24, 76 + v * 18]; })));
  T.sectional = tex(cv(64, 256, (g, w, h) => {
    g.fillStyle = '#d9dbdc'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16) { g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(0, y + 2, w, 2); }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, w, 3); g.fillRect(0, 128, w, 3);
  }));
  T.curtain = tex(cv(256, 64, (g, w, h) => { for (let x = 0; x < w; x++) { const s = 0.72 + 0.28 * Math.sin(x / w * Math.PI * 16) * Math.sin(x / w * Math.PI * 5 + 1); const v = 190 * s; g.fillStyle = `rgb(${v},${v * 0.9},${v * 0.72})`; g.fillRect(x, 0, 1, h); } }));
  T.duct = tex(cv(256, 256, (g, w, h) => {
    paint(g, w, h, i => { const v = 150 + nE[i] * 40; return [v, v + 2, v + 6]; });
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 3; for (let k = -4; k < 12; k++) { g.beginPath(); g.moveTo(0, k * 32); g.lineTo(w, k * 32 + 96); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; for (let k = -4; k < 12; k++) { g.beginPath(); g.moveTo(0, k * 32 + 4); g.lineTo(w, k * 32 + 100); g.stroke(); }
  }));

  // hulptexturen
  T.blob = tex(cv(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.62)'); gr.addColorStop(0.6, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), { rep: false });
  T.cone = tex(cv(64, 256, (g, w, h) => {
    const id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const u = Math.abs(x / (w - 1) - 0.5) * 2, v = y / h; const a = Math.pow(1 - v, 1.6) * Math.pow(1 - u, 1.5); const i = (y * w + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = a * 255; }
    g.putImageData(id, 0, 0);
  }), { rep: false });
  T.leaf = tex(cv(64, 64, (g) => {
    const gr = g.createLinearGradient(0, 64, 64, 0); gr.addColorStop(0, '#16401f'); gr.addColorStop(1, '#3f8a45'); g.fillStyle = gr;
    g.beginPath(); g.moveTo(4, 60); g.quadraticCurveTo(6, 10, 60, 4); g.quadraticCurveTo(54, 56, 4, 60); g.fill();
    g.strokeStyle = 'rgba(190,230,170,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(6, 58); g.lineTo(56, 8); g.stroke();
  }), { rep: false });
  // ruis voor plassen (r) en microverstoring (g)
  T.puddle = tex(cv(256, 256, (g, w, h) => { const a = fbm(256, 4, 5, 301), b = fbm(256, 16, 3, 302); paint(g, w, h, i => [a[i] * 255, b[i] * 255, 0]); }), { srgb: false });

  // lucht (verloop) + skyline
  T.sky = tex(cv(8, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#02030a'); gr.addColorStop(0.42, '#070a1a'); gr.addColorStop(0.5, '#171233'); gr.addColorStop(0.56, '#2a1640'); gr.addColorStop(0.60, '#102a38'); gr.addColorStop(1, '#04060c');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }), { rep: false });
  T.skyline = tex(cv(2048, 256, (g, w, h) => {
    let x = 0; const r = rng(99);
    while (x < w) {
      const bw = 30 + r() * 120, bh = 20 + r() * (r() > 0.85 ? 190 : 90);
      g.fillStyle = `rgb(${8 + r() * 8},${10 + r() * 8},${20 + r() * 12})`; g.fillRect(x, h - bh, bw, bh);
      const cols = ['#ffd9a0', '#9ef0ff', '#ff6ad5', '#ffe9c4', '#7dd3ff'];
      for (let k = 0; k < bw * bh / 260; k++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.globalAlpha = 0.25 + r() * 0.6; g.fillRect(x + 3 + r() * (bw - 6), h - bh + 4 + r() * (bh - 8), 2, 1.5); }
      g.globalAlpha = 1;
      if (bh > 120) { g.fillStyle = '#ff3030'; g.fillRect(x + bw / 2, h - bh - 3, 2, 2); }
      x += bw + r() * 26;
    }
  }), { rep: true });
  T.skyline.wrapT = THREE.ClampToEdgeWrapping;
  T.tree = tex(cv(256, 512, (g, w, h) => {
    const r = rng(7); g.fillStyle = '#0a0f0c'; g.fillRect(w / 2 - 5, h * 0.55, 10, h * 0.45);
    for (let k = 0; k < 260; k++) { const a = r() * 7, d = Math.pow(r(), 0.7); const x = w / 2 + Math.cos(a) * d * w * 0.42, y = h * 0.36 + Math.sin(a) * d * h * 0.33; const v = r(); g.fillStyle = `rgba(${10 + v * 16},${22 + v * 34},${18 + v * 20},.9)`; g.beginPath(); g.arc(x, y, 8 + r() * 16, 0, 7); g.fill(); }
  }), { rep: false });
  return T;
}

// ---------- logo, neon en bordjes ----------
const SERIF = '"Playfair Display", Georgia, "Times New Roman", serif';
const SANS = 'Oswald, "Arial Narrow", Impact, sans-serif';
const SCRIPT = 'Sacramento, "Brush Script MT", "Segoe Script", cursive';
export const FONTS = { SERIF, SANS, SCRIPT };

function arcText(g, str, R0, size, font, span) {
  g.font = `${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const n = str.length;
  for (let i = 0; i < n; i++) {
    const th = Math.PI / 2 + span / 2 - span * (i / (n - 1));
    g.save(); g.translate(Math.cos(th) * R0, Math.sin(th) * R0); g.rotate(th - Math.PI / 2); g.fillText(str[i], 0, 0); g.restore();
  }
}
// Het Fit Bite-embleem: ring, FB-monogram met vorkje, "FIT BITE" in de boog
export function drawEmblem(g, cx, cy, Rr, col) {
  g.save(); g.translate(cx, cy); g.strokeStyle = col; g.fillStyle = col; g.lineCap = 'round';
  g.lineWidth = Rr * 0.045; g.beginPath(); g.arc(0, 0, Rr, Math.PI / 2 + 0.9, Math.PI / 2 - 0.9 + Math.PI * 2); g.stroke();
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = `700 ${Rr * 1.0}px ${SERIF}`; g.fillText('F', -Rr * 0.22, -Rr * 0.2);
  g.font = `700 ${Rr * 1.12}px ${SERIF}`; g.fillText('B', Rr * 0.16, -Rr * 0.02);
  g.save(); g.translate(Rr * 0.5, -Rr * 0.6); g.rotate(0.75); g.lineWidth = Rr * 0.03;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo((i - 1.5) * Rr * 0.06, -Rr * 0.16); g.lineTo((i - 1.5) * Rr * 0.06, 0); g.stroke(); }
  g.beginPath(); g.moveTo(-Rr * 0.09, 0); g.lineTo(Rr * 0.09, 0); g.stroke(); g.restore();
  arcText(g, 'FIT BITE', Rr * 0.99, Rr * 0.26, `500 ${SANS}`.replace(/^500 /, ''), 1.25);
  g.restore();
}
function glow(g, col, blur, fn, core = '#ffffff') {
  g.save(); g.shadowColor = col; g.fillStyle = col; g.strokeStyle = col;
  for (const b of [blur, blur * 0.5, blur * 0.2]) { g.shadowBlur = b; fn(col); }
  g.shadowBlur = 0; g.globalAlpha = 0.55; fn(core); g.restore();
}

export function makeSigns(T) {
  const S = {};
  const t = (c) => tex(c, { rep: false });
  // gevelneon: embleem
  S.emblemNeon = t(cv(768, 768, (g) => glow(g, '#5dffc8', 16, (c) => drawEmblem(g, 384, 376, 300, c), '#f2fff9')));
  S.fitbiteNeon = t(cv(1024, 256, (g) => glow(g, '#ff4fd8', 28, (c) => { g.fillStyle = c; g.font = `700 150px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('F I T B I T E', 512, 132); }, '#ffe6fa')));
  S.neon = t(cv(1024, 512, (g) => glow(g, '#2450ff', 30, (c) => {
    g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 5; g.lineJoin = 'round'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `190px ${SCRIPT}`;
    for (const [s, x, y] of [['Train, Eat,', 500, 160], ['Repeat', 520, 350]]) { g.strokeText(s, x, y); g.fillText(s, x, y); }
  }, '#8fb0ff')));
  S.open = t(cv(512, 256, (g) => glow(g, '#ff3fb4', 26, (c) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 7; g.font = `500 130px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('OPEN', 256, 136); g.beginPath(); g.roundRect(50, 40, 412, 180, 40); g.stroke(); }, '#ffe0f4')));
  S.move = t(cv(1024, 384, (g) => glow(g, '#ff2a3c', 24, (c) => {
    g.fillStyle = c; g.strokeStyle = c;
    for (let k = 0; k < 2; k++) { const y = 70 + k * 120; g.beginPath(); g.moveTo(40, y); g.lineTo(110, y); g.lineTo(190, y + 60); g.lineTo(110, y + 120); g.lineTo(40, y + 120); g.lineTo(120, y + 60); g.closePath(); g.fill(); }
    g.font = `700 104px ${SANS}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('MOVEPASSION', 240, 205);
  }, '#ffd0d0')));
  S.bar = t(cv(256, 96, (g) => { g.fillStyle = 'rgba(235,240,245,.92)'; g.font = `500 70px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('B A R', 128, 52); }));
  // wit embleem (posters / stickers)
  S.emblemDark = t(cv(256, 256, (g) => drawEmblem(g, 128, 124, 98, '#17382a')));
  // openingsuren-poster (tekst zoals op de echte poster)
  S.hours = t(cv(512, 720, (g, w, h) => {
    g.fillStyle = '#f4f3ee'; g.fillRect(0, 0, w, h); drawEmblem(g, 256, 84, 62, '#17382a');
    g.fillStyle = '#17382a'; g.textAlign = 'center'; g.font = `500 22px ${SANS}`; g.fillText('T I J D E L I J K E', 256, 178);
    g.font = `700 58px ${SANS}`; g.fillText('OPENINGSUREN', 256, 232);
    g.fillStyle = '#1f4d38'; g.fillRect(40, 262, w - 80, 430);
    const rows = [['MAANDAG', '16:00 - 22:00'], ['DINSDAG', '16:00 - 22:00'], ['WOENSDAG', '16:00 - 22:00'], ['DONDERDAG', '16:00 - 22:00'], ['VRIJDAG', '16:00 - 22:00'], ['ZATERDAG', '09:30 - 12:30 · 16:00 - 22:00'], ['ZONDAG', '15:00 - 22:00']];
    rows.forEach((r, i) => { const y = 300 + i * 56; g.fillStyle = '#e9efe8'; g.textAlign = 'left'; g.font = `500 22px ${SANS}`; g.fillText(r[0], 62, y + 8); g.textAlign = 'right'; g.font = `700 ${i === 5 ? 21 : 26}px ${SANS}`; g.fillText(r[1], w - 62, y + 8); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(62, y + 26, w - 124, 1); });
  }));
  S.weopen = t(cv(384, 256, (g, w, h) => { g.fillStyle = '#f5a3c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#f36d00'; g.fillRect(0, h - 64, w, 64); g.fillStyle = '#111'; g.font = `700 86px ${SANS}`; g.textAlign = 'center'; g.fillText('we zijn', 192, 88); g.fillText('open', 192, 172); }));
  S.dance = t(cv(256, 384, (g, w, h) => { g.fillStyle = '#e8e2d4'; g.fillRect(0, 0, w, h); g.fillStyle = '#1b1b1b'; g.font = `500 54px ${SANS}`; g.textAlign = 'center'; ['DANCE', 'PILATES', 'YOGA'].forEach((s, i) => g.fillText(s, 128, 90 + i * 66)); g.lineWidth = 9; g.strokeStyle = '#1b1b1b'; g.beginPath(); g.moveTo(70, 310); g.lineTo(186, 310); g.moveTo(150, 280); g.lineTo(186, 310); g.lineTo(150, 340); g.stroke(); }));
  S.welcome = t(cv(256, 256, (g) => { g.fillStyle = '#1e57c8'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `700 40px ${SANS}`; g.textAlign = 'center'; g.fillText('Welcome', 128, 80); g.lineWidth = 6; g.strokeStyle = '#fff'; g.strokeRect(92, 104, 72, 60); g.font = `500 22px ${SANS}`; g.fillText('MOVEPASSION', 128, 200); }));
  S.corr = t(cv(256, 192, (g, w, h) => { g.fillStyle = '#0a0a0c'; g.fillRect(0, 0, w, h); g.shadowColor = '#ff2a2a'; g.shadowBlur = 22; g.fillStyle = '#ff3030'; g.beginPath(); g.moveTo(88, 46); g.lineTo(180, 96); g.lineTo(88, 146); g.closePath(); g.fill(); }));
  // krijtbord (west-wand van het sas)
  S.chalk = t(cv(1024, 1024, (g, w, h) => {
    g.fillStyle = '#141617'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(255,255,255,${0.008 + R() * 0.02})`; g.beginPath(); g.ellipse(R() * w, R() * h, 60 + R() * 200, 20 + R() * 60, R() * 3, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(238,238,232,.9)'; g.strokeStyle = 'rgba(238,238,232,.9)'; g.textAlign = 'left';
    g.save(); g.translate(250, 400); g.rotate(-0.16); g.font = `108px ${SCRIPT}`; g.fillText('Bon Appétit!', 0, 0); g.restore();
    g.font = `80px ${SCRIPT}`; g.fillText('Take Away', 330, 560); g.lineWidth = 3; g.beginPath(); g.moveTo(326, 580); g.lineTo(600, 572); g.stroke();
    g.font = `54px ${SCRIPT}`; ['- fresh bowls', '- smoothies', '- kimbap', '- koffie'].forEach((s, i) => g.fillText(s, 356, 640 + i * 54));
    g.font = `60px ${SCRIPT}`; ['Train,', 'Eat,', 'Repeat'].forEach((s, i) => g.fillText(s, 700, 500 + i * 62));
    g.lineWidth = 5; g.save(); g.translate(770, 250); g.rotate(0.1); g.beginPath(); g.moveTo(0, 30); g.bezierCurveTo(-70, -30, -30, -80, 0, -36); g.bezierCurveTo(30, -80, 70, -30, 0, 30); g.stroke(); g.restore();
  }));
  // schermen in de hal
  S.kiosk = t(cv(256, 448, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0c1f5a'); gr.addColorStop(1, '#19b6ff'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(128, 200, 60, 0, 7); g.fill(); g.fillStyle = '#0c1f5a'; g.beginPath(); g.arc(144, 190, 44, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = `500 30px ${SANS}`; g.textAlign = 'center'; g.fillText('MOVEPASSION', 128, 330); }));
  S.vend = t(cv(256, 512, (g, w, h) => {
    g.fillStyle = '#05070a'; g.fillRect(0, 0, w, h); g.fillStyle = '#cfefff'; g.fillRect(22, 30, 150, 400);
    const cols = ['#e33', '#39f', '#fc3', '#3c6', '#f6a', '#fff', '#f80'];
    for (let r = 0; r < 6; r++) { g.fillStyle = '#7a8a96'; g.fillRect(22, 30 + r * 66 + 58, 150, 6); for (let c = 0; c < 6; c++) { g.fillStyle = cols[(R() * cols.length) | 0]; g.fillRect(30 + c * 23, 30 + r * 66 + 16, 16, 42); } }
    g.fillStyle = '#16e0ff'; g.fillRect(190, 150, 44, 60); g.fillStyle = '#222'; g.fillRect(186, 250, 52, 80);
  }));
  S.aqua = t(cv(1024, 384, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#184f9c'); gr.addColorStop(0.28, '#1d5fb4'); gr.addColorStop(0.3, '#bfd4de'); gr.addColorStop(0.62, '#8fb4c4'); gr.addColorStop(0.64, '#2a8fc0'); gr.addColorStop(1, '#125a86'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.font = `700 54px ${SANS}`; g.textAlign = 'left'; g.fillText('AQUAPASSION', 150, 62); g.font = `500 30px ${SANS}`; g.fillText('Hier komt', 24, 40); g.fillText('een nieuw zwembad voor Puurs-Sint-Amands', 24, 100); }));
  S.bali = t(cv(256, 640, (g, w, h) => { g.fillStyle = '#ece8df'; g.fillRect(0, 0, w, h); g.fillStyle = '#b9b2a4'; g.fillRect(0, 150, w, 300); g.fillStyle = '#2a2622'; g.font = `400 34px ${SERIF}`; g.textAlign = 'center'; g.fillText('BALI RETREAT', 128, 90); g.font = `400 20px ${SERIF}`; g.fillText('FLOWMOTION ESCAPES', 128, 510); }));
  S.pos = t(cv(256, 160, (g, w, h) => { g.fillStyle = '#f2f4f7'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f4d38'; g.fillRect(0, 0, w, 34); g.fillStyle = '#d33'; g.beginPath(); g.arc(128, 78, 14, 0, 7); g.fill(); g.fillStyle = '#333'; g.fillRect(70, 108, 116, 8); g.fillRect(90, 126, 76, 8); }));
  void T;
  return S;
}
