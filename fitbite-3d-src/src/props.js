// Meubels en losse objecten
import * as THREE from 'three';
import { grp, bx, rb, cyl, sph, pl, tube, ext, box, solidC, solid } from './ctx.js';
import { rng } from './tex.js';

const r = rng(4242);
let M;
export function setMats(m) { M = m; }

export function blob(x, y, z, w, d = w) { pl(M.blob, x, y + 0.004, z, w, d, 'y+'); }

export function chair(x, z, ry, y0, fab, col = true) {
  grp(x, y0, z, ry, () => {
    rb(fab, 0, 0.46, 0, 0.44, 0.06, 0.42, 0.028);
    rb(fab, 0, 0.77, -0.205, 0.42, 0.25, 0.045, 0.022, { rx: -0.13 });
    for (const sx of [-1, 1]) {
      tube(M.black, [[sx * 0.18, 0.44, 0.16], [sx * 0.21, 0, 0.2]], 0.011, { segs: 1, seg: 6 });
      tube(M.black, [[sx * 0.17, 0.7, -0.215], [sx * 0.18, 0.44, -0.17], [sx * 0.21, 0, -0.21]], 0.011, { segs: 4, seg: 6, tension: 0 });
    }
  });
  blob(x, y0, z, 0.7); if (col) solidC(x, z, 0.19);
}
export function table(x, z, y0, s = 0.7, d = s, top = M.topBlack, col = true) {
  grp(x, y0, z, 0, () => {
    rb(top, 0, 0.745, 0, s, 0.03, d, 0.012);
    cyl(M.black, 0, 0.39, 0, 0.032, 0.7, { seg: 10 });
    for (const a of [0, Math.PI / 2]) rb(M.black, 0, 0.03, 0, 0.56, 0.045, 0.06, 0.02, { ry: a + Math.PI / 4 });
    cyl(M.black, 0, 0.07, 0, 0.07, 0.06, { rt: 0.035, seg: 10 });
  });
  blob(x, y0, z, s * 1.5, d * 1.5); if (col) solidC(x, z, s / 2 - 0.06, d / 2 - 0.06);
}
export function tubChair(x, z, ry, y0) {
  grp(x, y0, z, ry, () => {
    cyl(M.leatherB, 0, 0.2, 0, 0.33, 0.4, { seg: 20 });
    rb(M.leatherB, 0, 0.43, 0.03, 0.5, 0.1, 0.5, 0.045);
    const s = new THREE.Shape(); s.absarc(0, 0, 0.37, -Math.PI * 0.08, Math.PI * 1.08, false); s.absarc(0, 0, 0.27, Math.PI * 1.08, -Math.PI * 0.08, true);
    ext(M.leatherB, s, 0.36, { rx: -Math.PI / 2, pos: [0, 0.36, 0], bevel: 0.015, curve: 14 });
  });
  blob(x, y0, z, 1.0); solidC(x, z, 0.32);
}
export function foliage(cx, cy, cz, rad, n, hang = 0, size = 0.17) {
  for (let i = 0; i < n; i++) {
    const a = r() * 7, d = Math.sqrt(r()) * rad, h = r();
    const m = pl(M.leaf, cx + Math.cos(a) * d, cy + h * rad * 0.9 - (r() < hang ? r() * 0.45 : 0), cz + Math.sin(a) * d, size * (0.7 + r() * 0.7), size * (0.7 + r() * 0.7), 'z+');
    m.rotation.set(r() * 2 - 1, r() * 6.28, r() * 2 - 1);
  }
}
export function planter(x0, z0, x1, z1, y0, h = 0.62, plants = 1) {
  box(M.planks, x0, y0, z0, x1, y0 + h, z1); box(M.steel, x0 - 0.01, y0 + h, z0 - 0.01, x1 + 0.01, y0 + h + 0.03, z1 + 0.01);
  box(M.soil, x0 + 0.04, y0 + h + 0.03, z0 + 0.04, x1 - 0.04, y0 + h + 0.035, z1 - 0.04, { cast: false });
  solid(x0, z0, x1, z1); blob((x0 + x1) / 2, y0, (z0 + z1) / 2, Math.abs(x1 - x0) + 0.5, Math.abs(z1 - z0) + 0.5);
  if (plants) {
    const L = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0)), k = Math.max(1, Math.round(L / 0.55));
    for (let i = 0; i < k; i++) { const t = (i + 0.5) / k; foliage(x0 + (x1 - x0) * (Math.abs(x1 - x0) > Math.abs(z1 - z0) ? t : 0.5), y0 + h + 0.05, z0 + (z1 - z0) * (Math.abs(x1 - x0) > Math.abs(z1 - z0) ? 0.5 : t), 0.26, 26, 0.35); }
  }
}
export function potPlant(x, z, y0, h = 1.5) {
  cyl(M.kraft, x, y0 + 0.17, z, 0.17, 0.34, { rt: 0.2, seg: 14 }); cyl(M.soil, x, y0 + 0.342, z, 0.19, 0.01, { seg: 14 });
  tube(M.kraft, [[x, y0 + 0.3, z], [x + 0.03, y0 + h * 0.6, z + 0.02], [x - 0.02, y0 + h, z]], 0.018, { seg: 6 });
  foliage(x, y0 + h * 0.75, z, 0.42, 60, 0.1, 0.24); solidC(x, z, 0.2); blob(x, y0, z, 0.9);
}
export function pendant(x, yTop, z, len) {
  cyl(M.black, x, yTop - len / 2, z, 0.004, len, { seg: 5, cast: false });
  cyl(M.black, x, yTop - len - 0.03, z, 0.02, 0.06, { seg: 8, cast: false });
  sph(M.bulb, x, yTop - len - 0.1, z, 0.048, { seg: 12, seg2: 10 });
}
export function bowls(x, y, z, n, rr = 0.085) { for (let i = 0; i < n; i++) cyl(M.kraft, x, y + 0.035 + i * 0.012, z, rr * 0.72, 0.07, { rt: rr, seg: 14, cast: i === 0 }); }
export function bottle(mat, x, y, z, h = 0.2, rr = 0.03) { cyl(mat, x, y + h * 0.4, z, rr, h * 0.8, { seg: 10 }); cyl(M.white, x, y + h * 0.9, z, rr * 0.25, h * 0.2, { rt: rr * 0.08, seg: 8 }); }
export function carton(x, y, z, w, h, d, ry = 0) { bx(M.cardboard, x, y + h / 2, z, w, h, d, { ry }); }

export function car(x, z, ry, mat) {
  grp(x, 0, z, ry, () => {
    const s = new THREE.Shape();
    s.moveTo(-2.1, 0.32); s.lineTo(-2.15, 0.7); s.quadraticCurveTo(-2.1, 0.92, -1.5, 0.98); s.lineTo(-0.75, 1.42); s.quadraticCurveTo(-0.4, 1.5, 0.6, 1.5); s.quadraticCurveTo(1.5, 1.45, 1.75, 1.0);
    s.lineTo(2.1, 0.92); s.quadraticCurveTo(2.2, 0.6, 2.12, 0.32); s.lineTo(-2.1, 0.32);
    ext(mat, s, 1.6, { pos: [0, 0, -0.8], bevel: 0.08, curve: 8 });
    const g = new THREE.Shape(); g.moveTo(-1.35, 1.0); g.lineTo(-0.72, 1.38); g.lineTo(0.62, 1.4); g.quadraticCurveTo(1.3, 1.36, 1.5, 1.02); g.lineTo(-1.35, 1.0);
    ext(M.glassDark, g, 1.78, { pos: [0, 0, -0.89] });
    for (const wx of [-1.35, 1.35]) for (const wz of [-0.82, 0.82]) cyl(M.blackMatte, wx, 0.33, wz, 0.33, 0.22, { rx: Math.PI / 2, seg: 16 });
    for (const sz of [-0.6, 0.6]) { bx(M.tail, 2.2, 0.82, sz, 0.05, 0.1, 0.42); bx(M.panel, -2.22, 0.72, sz, 0.05, 0.1, 0.34); }
  });
  const c = Math.abs(Math.cos(ry)), s2 = Math.abs(Math.sin(ry)); solidC(x, z, 2.2 * c + 0.9 * s2, 2.2 * s2 + 0.9 * c);
}
