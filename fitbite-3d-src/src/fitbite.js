// De Fitbite-hoek: houten podium, toonbank, lattenwand met schermen en neon, keuken en opslag
import * as THREE from 'three';
import { box, bx, rb, cyl, sph, pl, tube, grp, solid, zones, into } from './ctx.js';
import { chair, table, pendant, bowls, bottle, carton, blob, foliage } from './props.js';
import { rng } from './tex.js';

export const P = 0.13;      // hoogte van het houten podium
const r = rng(808);

// akoestische latten: eiken latten op zwart vilt
export function slats(M, axis, a0, a1, fix, dir, y0, y1, cut, back = true) {
  const pitch = 0.05, w = 0.033, d = 0.02, n = Math.floor((a1 - a0) / pitch), off = ((a1 - a0) - n * pitch + (pitch - w)) / 2;
  if (back) { if (axis === 'z') box(M.felt, fix, y0, a0, fix + dir * 0.006, y1, a1, { cast: false }); else box(M.felt, a0, y0, fix, a1, y1, fix + dir * 0.006, { cast: false }); }
  for (let i = 0; i < n; i++) {
    const a = a0 + off + i * pitch, segs = cut ? cut(a + w / 2) : [[y0, y1]];
    for (const [s0, s1] of segs) {
      if (axis === 'z') box(M.slat, fix + dir * 0.006, s0, a, fix + dir * (0.006 + d), s1, a + w, { cast: false });
      else box(M.slat, a, s0, fix + dir * 0.006, a + w, s1, fix + dir * (0.006 + d), { cast: false });
    }
  }
}
function curvedGlass(mat, xEdge, y0, z0, z1, rad, flat) {
  // glazen kap van de saladebar: verticaal stukje, kwartboog en vlak dak
  const pts = []; const N = 10; pts.push([xEdge, y0]);
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI / 2; pts.push([xEdge - rad + Math.cos(a) * rad, y0 + 0.12 + Math.sin(a) * rad]); }
  pts.push([xEdge - rad - flat, y0 + 0.12 + rad]);
  const pos = [], idx = [];
  pts.forEach((p, i) => { pos.push(p[0], p[1], z0, p[0], p[1], z1); if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(pos.length / 3 * 2), 2));
  const m = new THREE.Mesh(g, mat); m.castShadow = false; return m;
}

export function buildFitbite(M, W, root) {
  const borderS = M._std({ map: M.border.map.clone(), roughness: 0.25 }); borderS.map.repeat.set(0.3, 1); borderS.map.offset.x = 0.4;

  // ---------- podium ----------
  box(M.laminate, -7.75, 0, -5.6, -1.5, P, 0);
  box(M.steel, -1.53, P - 0.012, -5.6, -1.49, P + 0.004, 0, { cast: false }); box(M.steel, -7.75, P - 0.012, -5.63, -1.49, P + 0.004, -5.59, { cast: false });
  box(M.pine, -1.505, 0, -5.6, -1.495, P - 0.012, 0, { cast: false }); box(M.pine, -7.75, 0, -5.605, -1.5, P - 0.012, -5.595, { cast: false });
  zones.push([-7.85, -5.6, -1.5, 0, P], [-10.25, -5.5, -7.85, -2.0, P]);

  // krijtbordwand (westwand van het sas) + kolommen
  box(M.teal, 0, 0, -4.0, 0.15, 4.2, 0, { col: 1 }); pl(M.chalk, -0.006, 1.7, -2.0, 4.0, 3.4, 'x-'); box(M.concrete, -0.06, 3.4, -4.0, 0.2, 4.2, 0);
  box(M.plaster, -1.75, 0, -0.42, -1.35, 4.2, 0, { col: 1 });
  cyl(M.red, -1.55, P + 0.3, -0.56, 0.065, 0.5, { seg: 12 }); cyl(M.black, -1.55, P + 0.58, -0.56, 0.02, 0.08, { seg: 8 });
  box(M.concrete, -4.85, 0, -0.45, -4.4, 4.2, 0, { col: 1 });
  box(M.concrete, -1.95, 0, -5.6, -1.5, 4.2, -5.15, { col: 1 });
  box(M.black, -1.5, 0.95, -5.72, -1.43, 2.25, -5.03); pl(M.kiosk, -1.425, 1.6, -5.375, 0.62, 1.2, 'x+');
  // binnenkant gevel
  box(M.plaster, -7.95, 0, 0, -4.4, 4.2, 0.1); box(M.blocks, -10.6, 0, 0, -7.95, 4.2, 0.1); box(M.blocks, -13.55, 0, 0, -13.1, 4.2, 0.1); box(M.blocks, -13.1, 3.0, 0, -10.6, 4.2, 0.1);
  box(M.concrete, -4.4, GLH, 0, 6.9, 4.2, 0.1);
  cyl(M.black, -3.1, 3.5, -0.42, 0.035, 5.6, { rz: Math.PI / 2, seg: 10 });

  // ---------- scheidingswand W1 met deur en doorgeefluik ----------
  const HY0 = P + 1.27, HY1 = P + 1.65, HZ0 = -4.35, HZ1 = -3.05;
  box(M.plaster, -7.95, 0, -0.85, -7.75, 4.2, 0, { col: 1 });
  box(M.plaster, -7.95, 2.3, -1.75, -7.75, 4.2, -0.85);
  box(M.plaster, -7.95, 0, HZ1, -7.75, 4.2, -1.75); box(M.plaster, -7.95, 0, HZ0, -7.75, HY0, HZ1); box(M.plaster, -7.95, HY1, HZ0, -7.75, 4.2, HZ1); box(M.plaster, -7.95, 0, -5.6, -7.75, 4.2, HZ0);
  solid(-7.95, -5.6, -7.75, -1.75);
  box(M.white, -7.97, 0, -1.79, -7.73, 2.3, -1.75); box(M.white, -7.97, 0, -0.85, -7.73, 2.3, -0.81); box(M.white, -7.97, 2.26, -1.79, -7.73, 2.34, -0.81);
  box(M.white, -8.84, 0.02, -0.9, -7.96, 2.24, -0.86); solid(-8.84, -0.92, -7.95, -0.84); cyl(M.steel, -8.72, 1.05, -0.94, 0.012, 0.13, { rx: Math.PI / 2, seg: 6 });
  // tegelwerk in de nis (zuid- en westwand) met gekleurde sierrand
  box(M.wtiles, -7.75, P, -0.012, -4.85, P + 1.9, 0); box(M.border, -7.75, P + 1.9, -0.014, -4.85, P + 2.1, 0);
  box(M.wtiles, -7.75, P, -0.85, -7.738, P + 1.9, 0); box(borderS, -7.75, P + 1.9, -0.85, -7.736, P + 2.1, 0);
  box(M.wtiles, -7.75, P, -2.0, -7.738, P + 1.9, -1.79); box(borderS, -7.75, P + 2.21, -2.0, -7.736, P + 2.41, -0.85);

  // ---------- lattenwand met schermen, neon en luik ----------
  const cutH = (a) => (a > HZ0 - 0.03 && a < HZ1 + 0.03) ? [[P, HY0 - 0.03], [HY1 + 0.03, P + 2.85]] : [[P, P + 2.85]];
  slats(M, 'z', -5.4, -2.0, -7.75, 1, P, P + 2.85, cutH, false);
  box(M.felt, -7.75, P, -5.4, -7.744, HY0 - 0.03, -2.0); box(M.felt, -7.75, HY1 + 0.03, -5.4, -7.744, P + 2.85, -2.0); box(M.felt, -7.75, HY0 - 0.03, -5.4, -7.744, HY1 + 0.03, HZ0 - 0.03); box(M.felt, -7.75, HY0 - 0.03, HZ1 + 0.03, -7.744, HY1 + 0.03, -2.0);
  box(M.slat, -7.76, P + 2.85, -5.4, -7.71, P + 2.88, -2.0); box(M.slat, -7.76, P, -2.02, -7.71, P + 2.88, -2.0);
  // luik: grenen kader + plank
  box(M.pine, -7.97, HY1, HZ0 - 0.035, -7.69, HY1 + 0.035, HZ1 + 0.035); box(M.pine, -7.97, HY0 - 0.035, HZ0 - 0.035, -7.69, HY0, HZ1 + 0.035);
  box(M.pine, -7.97, HY0, HZ0 - 0.035, -7.69, HY1, HZ0); box(M.pine, -7.97, HY0, HZ1, -7.69, HY1, HZ1 + 0.035);
  box(M.pine, -7.72, HY0 - 0.065, HZ0 - 0.2, -7.52, HY0 - 0.035, HZ1 + 0.2);
  rb(M.blackMatte, -7.62, HY0 - 0.025, -3.6, 0.2, 0.012, 0.42, 0.005); rb(M.kraft, -7.62, HY0 + 0.005, -3.6, 0.13, 0.045, 0.2, 0.015);
  bx(M.blackMatte, -7.61, HY0 - 0.025, -4.3, 0.05, 0.018, 0.17, { ry: 0.2 }); bx(M.blackMatte, -7.6, HY0 - 0.025, -4.2, 0.05, 0.018, 0.17, { ry: 0.1 });
  // neon "Train, Eat, Repeat"
  pl(M.neon, -7.7, P + 1.93, -3.7, 1.04, 0.52, 'x+');
  // twee menuschermen
  for (const [zc, mat] of [[-3.21, M.tvL], [-4.19, M.tvR]]) { box(M.screenOff, -7.72, P + 2.125, zc - 0.487, -7.665, P + 2.695, zc + 0.487); pl(mat, -7.662, P + 2.415, zc, 0.955, 0.538, 'x+'); }
  // achterbalie (grijs blad, wit betegeld) met halfhoog tegelmuurtje
  box(M.worktop, -7.72, P + 0.9, -5.4, -7.05, P + 0.95, -2.0); box(M.wtiles, -7.72, P, -5.4, -7.69, P + 0.9, -2.0); box(M.wtiles, -7.72, P, -5.4, -7.08, P + 0.9, -5.34);
  box(M.wtiles, -7.72, P, -2.0, -6.9, P + 1.15, -1.84); solid(-7.75, -5.4, -7.05, -2.0); solid(-7.75, -2.0, -6.9, -1.84);
  { const blue = M._std({ color: 0x2f5a8f, roughness: 0.25 }), pink = M._std({ color: 0xe9c8c0, roughness: 0.25 }), yel = M._std({ color: 0xf0d874, roughness: 0.25 });
    pl(blue, -7.25, P + 0.75, -1.838, 0.1, 0.1, 'z+'); pl(pink, -7.45, P + 0.35, -1.838, 0.1, 0.1, 'z+'); pl(yel, -7.05, P + 0.15, -1.838, 0.1, 0.1, 'z+');
    pl(blue, -6.898, P + 0.75, -1.92, 0.1, 0.1, 'x+'); pl(pink, -6.898, P + 0.35, -1.92, 0.1, 0.1, 'x+'); }
  bowls(-7.42, P + 0.95, -5.1, 16); bowls(-7.4, P + 0.95, -4.82, 10); bowls(-7.4, P + 0.95, -4.55, 6, 0.07); bowls(-7.25, P + 0.95, -2.95, 8, 0.06);
  bx(M.white, -7.35, P + 0.975, -2.35, 0.2, 0.05, 0.2); cyl(M.steelDark, -7.3, P + 1.0, -3.3, 0.05, 0.1, { seg: 10 });
  grp(-7.28, P + 0.95, -2.62, 0.25, () => { bx(M.steel, 0, 0.01, 0, 0.14, 0.02, 0.16); bx(M.black, 0, 0.12, 0, 0.012, 0.19, 0.27, { rz: -0.35 }); const s = pl(M.pos, 0.012, 0.122, 0, 0.25, 0.17, 'x+'); s.rotation.z = -0.35; });
  carton(-7.4, P, -4.9, 0.5, 0.42, 0.6); carton(-7.38, P, -4.2, 0.45, 0.5, 0.4, 0.1); carton(-7.38, P, -3.5, 0.42, 0.36, 0.5);

  // vleugel aan de noordkant: hoog lattenpaneel + laag schot
  box(M.felt, -7.75, P, -5.5, -6.75, P + 3.05, -5.4); slats(M, 'x', -7.75, -6.75, -5.4, 1, P, P + 3.05); slats(M, 'x', -7.75, -6.75, -5.5, -1, 0, P + 3.05); slats(M, 'z', -5.5, -5.4, -6.75, 1, P, P + 3.05);
  box(M.felt, -6.75, P, -5.56, -5.75, P + 1.33, -5.46); slats(M, 'x', -6.75, -5.75, -5.46, 1, P, P + 1.33); slats(M, 'x', -6.75, -5.75, -5.56, -1, 0, P + 1.33); box(M.slat, -6.76, P + 1.33, -5.6, -5.75, P + 1.36, -5.42);
  solid(-7.75, -5.6, -5.75, -5.4);

  // ---------- toonbank ----------
  box(M.felt, -5.72, P, -5.6, -5.03, P + 1.06, -1.75); solid(-5.78, -5.6, -4.97, -1.72);
  slats(M, 'z', -5.6, -1.75, -5.03, 1, P + 0.02, P + 1.035); slats(M, 'x', -5.72, -5.03, -1.75, 1, P + 0.02, P + 1.035); slats(M, 'x', -5.72, -5.03, -5.6, -1, 0.0, P + 1.035);
  box(M.topBlack, -5.78, P + 1.06, -3.75, -4.96, P + 1.1, -1.71);
  box(M.ledWarm, -5.0, P + 1.036, -5.6, -4.985, P + 1.052, -1.74, { cast: false }); box(M.ledWarm, -5.74, P + 1.036, -1.735, -5.0, P + 1.052, -1.72, { cast: false });
  box(M.white, -5.76, P, -3.75, -5.72, P + 1.06, -1.75); box(M.white, -5.76, P + 0.5, -3.75, -5.4, P + 0.52, -1.75);
  pl(M.hours, -4.978, P + 0.6, -2.9, 0.42, 0.59, 'x+');
  // koelwerkbank / saladebar met glazen kap
  box(M.steel, -5.77, P + 0.14, -5.58, -5.72, P + 0.98, -3.77); box(M.steelDark, -5.775, P, -5.58, -5.72, P + 0.14, -3.77);
  for (const z of [-4.98, -4.37]) box(M.steelDark, -5.776, P + 0.16, z - 0.006, -5.77, P + 0.96, z + 0.006, { cast: false });
  for (const z of [-5.28, -4.67, -4.07]) box(M.steelDark, -5.79, P + 0.86, z - 0.2, -5.77, P + 0.89, z + 0.2, { cast: false });
  box(M.steel, -5.78, P + 1.06, -5.6, -4.96, P + 1.095, -3.75); box(M.white, -5.8, P + 1.095, -5.6, -5.6, P + 1.112, -3.75);
  { const m = pl(M.salad, -5.3, P + 1.098, -4.675, 1.74, 0.54, 'y+', { spin: Math.PI / 2, cast: false }); void m; }
  root.add(curvedGlass(M.glassClear, -4.99, P + 1.095, -5.58, -3.77, 0.26, 0.3));
  for (const z of [-5.58, -3.77]) pl(M.glassClear, -5.27, P + 1.3, z, 0.56, 0.38, 'z+');
  for (const z of [-5.58, -3.77]) cyl(M.steel, -5.56, P + 1.29, z, 0.008, 0.38, { seg: 6 });
  // spulletjes op de balie
  cyl(M.steel, -5.25, P + 1.115, -2.05, 0.04, 0.03, { rt: 0.012, seg: 12 }); cyl(M.black, -5.25, P + 1.102, -2.05, 0.05, 0.008, { seg: 12 });
  pl(M.white, -5.3, P + 1.102, -2.5, 0.21, 0.3, 'y+', { spin: 0.2 }); pl(M._std({ color: 0x1f4d38, roughness: 0.7 }), -5.28, P + 1.103, -2.95, 0.21, 0.3, 'y+', { spin: -0.1 });
  grp(-5.3, P + 1.1, -3.42, 0, () => { box(M.cardboard, -0.2, 0, -0.22, 0.2, 0.09, 0.22); box(M.white, -0.2, 0.09, -0.22, 0.2, 0.1, -0.2); for (let i = 0; i < 8; i++) bx(i % 2 ? M.red : M.blackMatte, -0.13 + (i % 4) * 0.085, 0.11, -0.1 + ((i / 4) | 0) * 0.17, 0.07, 0.06, 0.13, { ry: r() * 0.3 }); });

  // zwart rek aan de noordkant (op de betonvloer) met plantjes en "we zijn open"
  { const x0 = -7.9, x1 = -5.86, z0 = -6.04, z1 = -5.63;
    for (const x of [x0, (x0 + x1) / 2, x1]) for (const z of [z0, z1]) bx(M.black, x, 0.5, z, 0.025, 1.0, 0.025);
    for (const y of [0.3, 0.64]) { box(M.black, x0, y, z0, x1, y + 0.02, z0 + 0.02); box(M.black, x0, y, z1 - 0.02, x1, y + 0.02, z1); box(M.blackMatte, x0, y + 0.02, z0, x1, y + 0.03, z1); }
    box(M.topBlack, x0 - 0.02, 0.99, z0 - 0.02, x1 + 0.02, 1.02, z1 + 0.02); solid(x0, z0, x1, z1); blob(-6.9, 0, -5.84, 2.6, 1.0);
    for (const x of [-7.5, -6.9, -6.3]) { cyl(M.blackMatte, x, 1.08, -5.84, 0.06, 0.12, { rt: 0.075, seg: 10 }); foliage(x, 1.15, -5.84, 0.11, 22, 0, 0.11); }
    for (const x of [-7.3, -6.5]) { cyl(M.blackMatte, x, 0.72, -5.84, 0.06, 0.12, { rt: 0.075, seg: 10 }); foliage(x, 0.78, -5.84, 0.1, 16, 0.5, 0.11); }
    bx(M.blackMatte, -6.02, 1.03, -5.84, 0.1, 0.02, 0.3); const s = pl(M.weopen, -5.98, 1.21, -5.84, 0.44, 0.3, 'x+'); s.rotation.y = Math.PI / 2 - 0.45; const s2 = pl(M.weopen, -6.0, 1.21, -5.85, 0.44, 0.3, 'x-'); s2.rotation.y = -Math.PI / 2 - 0.45; }

  // ---------- zijwerkblad met spoelbak, koffiemachine en wandrek ----------
  box(M.blackMatte, -7.73, P, -0.58, -4.87, P + 0.1, -0.02); box(M.cabinet, -7.74, P + 0.1, -0.62, -4.86, P + 0.88, -0.02); box(M.worktop, -7.75, P + 0.88, -0.66, -4.85, P + 0.93, -0.012); solid(-7.75, -0.66, -4.85, 0);
  for (let i = 1; i < 5; i++) box(M.felt, -7.74 + i * 0.576 - 0.003, P + 0.12, -0.624, -7.74 + i * 0.576 + 0.003, P + 0.86, -0.62, { cast: false });
  for (let i = 0; i < 5; i += 2) bx(M.black, -7.74 + (i + 1) * 0.576, P + 0.8, -0.635, 0.22, 0.015, 0.015);
  box(M.steel, -6.75, P + 0.925, -0.55, -5.95, P + 0.936, -0.12); box(M.steelDark, -6.72, P + 0.9, -0.52, -6.36, P + 0.938, -0.15); box(M.steelDark, -6.33, P + 0.9, -0.52, -5.98, P + 0.938, -0.15);
  tube(M.steel, [[-6.35, P + 0.93, -0.09], [-6.35, P + 1.18, -0.09], [-6.35, P + 1.22, -0.16], [-6.35, P + 1.14, -0.28]], 0.012, { seg: 8 });
  // koffiemachine met cyaan display
  rb(M.black, -7.36, P + 1.22, -0.33, 0.44, 0.58, 0.5, 0.03); bx(M.cmDisplay, -7.36, P + 1.36, -0.585, 0.16, 0.1, 0.01); bx(M.cyan, -7.36, P + 1.02, -0.585, 0.3, 0.012, 0.01); bx(M.steel, -7.36, P + 0.95, -0.5, 0.3, 0.02, 0.16);
  // wandrek met ledstrip
  for (const y of [P + 1.52, P + 1.9]) box(M.black, -7.6, y, -0.3, -5.45, y + 0.018, -0.02);
  for (const x of [-7.6, -6.52, -5.45]) { bx(M.black, x, P + 1.71, -0.29, 0.018, 0.4, 0.018); bx(M.black, x, P + 1.71, -0.03, 0.018, 0.4, 0.018); }
  box(M.ledCool, -7.58, P + 1.508, -0.29, -5.47, P + 1.52, -0.27, { cast: false });
  for (let i = 0; i < 9; i++) { const x = -7.4 + i * 0.22 + r() * 0.05, big = r() > 0.5; cyl(i % 3 ? M.glassClear : M.blackMatte, x, P + 1.538 + (big ? 0.09 : 0.06), -0.16, big ? 0.05 : 0.04, big ? 0.18 : 0.12, { seg: 10 }); }
  for (let i = 0; i < 5; i++) cyl(M.white, -7.2 + i * 0.4, P + 1.95, -0.16, 0.06, 0.07, { seg: 10 });

  // drankenkoeler bij het raam + "OPEN"-neon
  box(M.black, -4.3, P, -0.76, -3.2, P + 1.3, -0.1); solid(-4.3, -0.76, -3.2, 0); box(M.ledCool, -4.26, P + 1.24, -0.77, -3.24, P + 1.26, -0.755, { cast: false });
  box(M.steelDark, -4.26, P + 0.2, -0.768, -3.24, P + 1.24, -0.74);
  { const cols = [0xd82a2a, 0x2a7bd8, 0xf2a41e, 0x39b54a, 0xf2f2f2, 0xe05aa0].map(c => M._std({ color: c, roughness: 0.3 }));
    for (let s = 0; s < 3; s++) { box(M.steel, -4.26, P + 0.22 + s * 0.34, -0.9, -3.24, P + 0.235 + s * 0.34, -0.74); for (let i = 0; i < 11; i++) cyl(cols[(r() * cols.length) | 0], -4.19 + i * 0.09, P + 0.235 + s * 0.34 + 0.1, -0.83, 0.032, 0.2, { seg: 8, cast: false }); } }
  cyl(M.blackMatte, -3.5, P + 1.37, -0.4, 0.07, 0.14, { seg: 10 }); foliage(-3.5, P + 1.45, -0.4, 0.14, 26, 0.2, 0.13);
  pl(M.open, -2.7, P + 2.35, -0.2, 0.84, 0.42, 'z-'); pl(M.open, -2.7, P + 2.35, -0.19, 0.84, 0.42, 'z+');

  // ---------- eetruimte: tafels, stoelen, lampen ----------
  table(-2.35, -1.5, P); chair(-2.35, -0.86, Math.PI, P, M.fabGreen); chair(-2.35, -2.14, 0, P, M.fabGreen);
  table(-2.35, -4.3, P); chair(-2.35, -3.66, Math.PI, P, M.fabGreen); chair(-2.35, -4.94, 0, P, M.fabGreen);
  cyl(M.black, -3.4, 4.17, -2.9, 0.07, 0.05, { seg: 12 });
  for (const [dx, dz, len] of [[-0.9, -0.5, 1.05], [0.6, -0.9, 1.25], [0.2, 0.9, 0.95], [-0.5, 0.8, 1.3], [0.9, 0.1, 1.1]]) { tube(M.black, [[-3.4, 4.16, -2.9], [-3.4 + dx * 0.5, 4.13, -2.9 + dz * 0.5], [-3.4 + dx, 4.17, -2.9 + dz]], 0.004, { seg: 4, cast: false }); pendant(-3.4 + dx, 4.17, -2.9 + dz, len); }
  for (const [z, len] of [[-2.3, 1.2], [-3.55, 1.0], [-4.8, 1.25]]) pendant(-5.9, 4.2, z, len);

  // ---------- bereidingskeuken achter de lattenwand ----------
  box(M.laminate, -10.2, 0, -5.45, -7.95, P, -1.95);
  box(M.wtiles, -9.2, 0, -5.6, -7.95, 4.2, -5.45, { col: 1 }); box(M.wtiles, -10.35, 0, -5.6, -10.1, 4.2, -5.45, { col: 1 }); box(M.wtiles, -10.1, P + 2.1, -5.6, -9.2, 4.2, -5.45);
  box(M.white, -10.19, P, -5.44, -10.15, P + 2.08, -4.56); solid(-10.2, -5.45, -10.13, -4.56);
  { const blue = M._std({ color: 0x2f5a8f, roughness: 0.25 }), pink = M._std({ color: 0xe9c8c0, roughness: 0.25 }), yel = M._std({ color: 0xf0d874, roughness: 0.25 });
    [[-8.3, 1.5, blue], [-8.9, 0.9, pink], [-8.6, 2.1, yel], [-8.1, 0.5, pink], [-8.8, 1.7, blue], [-10.22, 1.2, yel]].forEach(([x, y, m]) => pl(m, x, y, -5.602, 0.1, 0.1, 'z-')); }
  box(M.plaster, -10.35, 0, -3.3, -10.2, 4.2, -1.95, { col: 1 }); box(M.plaster, -10.35, 0, -5.45, -10.2, 4.2, -4.2, { col: 1 }); box(M.plaster, -10.35, P + 2.1, -4.2, -10.2, 4.2, -3.3);
  box(M.blocks, -10.365, 0, -3.3, -10.35, 4.2, -1.95); box(M.blocks, -10.365, 0, -5.45, -10.35, 4.2, -4.2); box(M.blocks, -10.365, P + 2.1, -4.2, -10.35, 4.2, -3.3);
  box(M.wtiles, -8.75, 0, -2.1, -7.95, 4.2, -1.95, { col: 1 }); box(M.plaster, -10.2, 2.5, -2.1, -8.75, 4.2, -1.95);
  slats(M, 'z', -5.45, -2.1, -7.95, -1, P, P + 2.9, (a) => (a > HZ0 - 0.03 && a < HZ1 + 0.03) ? [[P, HY0 - 0.03], [HY1 + 0.03, P + 2.9]] : [[P, P + 2.9]], false);
  slats(M, 'x', -9.2, -7.95, -5.45, 1, P, P + 2.9);
  // werkblad met koel-opzetvitrine, blender en rijstkoker
  box(M.blackMatte, -8.52, P, -5.4, -7.97, P + 0.1, -2.75); box(M.cabinet, -8.55, P + 0.1, -5.42, -7.97, P + 0.88, -2.74); box(M.worktop, -8.6, P + 0.88, -5.44, -7.97, P + 0.93, -2.72); solid(-8.6, -5.45, -7.95, -2.72);
  for (let i = 1; i < 5; i++) box(M.felt, -8.554, P + 0.12, -5.42 + i * 0.536 - 0.003, -8.55, P + 0.86, -5.42 + i * 0.536 + 0.003, { cast: false });
  for (let i = 0; i < 5; i += 2) bx(M.black, -8.565, P + 0.8, -5.42 + (i + 1) * 0.536, 0.015, 0.015, 0.22);
  box(M.pine, -8.38, P + 0.93, -4.95, -8.0, P + 0.99, -3.35); box(M.steel, -8.36, P + 0.99, -4.93, -8.02, P + 1.17, -3.35);
  for (let i = 0; i < 6; i++) box(M.steelDark, -8.33, P + 1.168, -4.9 + i * 0.2, -8.06, P + 1.174, -4.9 + i * 0.2 + 0.17, { cast: false });
  bx(M.redLed, -8.365, P + 1.08, -3.5, 0.006, 0.02, 0.05);
  for (let i = 0; i < 7; i++) bottle([M.sauceA, M.sauceA, M.sauceB, M.sauceC, M.white][(i * 3) % 5], -8.1 - (i % 2) * 0.09, P + 1.17, -3.52 - i * 0.11, 0.2, 0.032);
  rb(M.black, -8.25, P + 1.03, -5.2, 0.18, 0.2, 0.2, 0.02); cyl(M.glassClear, -8.25, P + 1.27, -5.2, 0.07, 0.28, { rt: 0.085, seg: 12 }); cyl(M.black, -8.25, P + 1.42, -5.2, 0.088, 0.025, { seg: 12 });
  cyl(M.steel, -8.27, P + 1.05, -3.03, 0.17, 0.24, { seg: 20 }); sph(M.steel, -8.27, P + 1.17, -3.03, 0.17, { s: [1, 0.35, 1], seg: 20 }); bx(M.black, -8.44, P + 1.0, -3.03, 0.03, 0.1, 0.12);
  // zwarte tafel
  box(M.topBlack, -10.19, P + 0.72, -3.12, -9.74, P + 0.76, -2.2); for (const z of [-3.05, -2.27]) bx(M.black, -9.96, P + 0.36, z, 0.4, 0.72, 0.03); solid(-10.2, -3.12, -9.74, -2.2);
  bowls(-9.95, P + 0.76, -2.5, 10, 0.07); bx(M.white, -9.95, P + 0.8, -2.9, 0.2, 0.08, 0.2);
  // lamp
  bx(M.panel, -9.1, 3.0, -3.75, 0.3, 0.03, 1.2); for (const z of [-4.3, -3.2]) cyl(M.black, -9.1, 3.6, z, 0.004, 1.2, { seg: 4, cast: false });

  // ---------- achterkeuken / opslag ----------
  // combisteamer bij de deur
  for (const x of [-9.85, -9.02]) for (const z of [-0.78, -0.1]) bx(M.steel, x, 0.37, z, 0.035, 0.74, 0.035);
  for (const y of [0.22, 0.48]) box(M.steel, -9.86, y, -0.79, -9.0, y + 0.015, -0.09);
  rb(M.steel, -9.43, 1.26, -0.44, 0.9, 1.04, 0.74, 0.02); pl(M.glassDark, -9.55, 1.26, -0.815, 0.52, 0.84, 'z-'); pl(M.blackMatte, -9.12, 1.26, -0.815, 0.2, 0.9, 'z-'); bx(M.cmDisplay, -9.12, 1.55, -0.82, 0.12, 0.07, 0.006);
  cyl(M.steel, -9.25, 1.26, -0.86, 0.012, 0.7, { seg: 6 }); solid(-9.9, -0.82, -8.95, 0); blob(-9.43, 0, -0.44, 1.4, 1.2);
  // wanden opslag (betonblokken)
  box(M.blocks, -13.55, 0, -5.6, -13.4, 4.2, 0.1, { col: 1 });
  box(M.blocks, -13.4, 0, -5.6, -12.6, 4.2, -5.45, { col: 1 }); box(M.blocks, -11.7, 0, -5.6, -10.35, 4.2, -5.45, { col: 1 }); box(M.blocks, -12.6, 2.15, -5.6, -11.7, 4.2, -5.45);
  box(M.darkwall, -12.66, 0.02, -5.44, -12.61, 2.12, -4.56); solid(-12.68, -5.45, -12.6, -4.56);
  // koelkast (dubbele deur, rvs)
  rb(M.steel, -13.0, 1.09, -3.68, 0.78, 1.95, 1.34, 0.015); box(M.blackMatte, -12.615, 1.78, -4.35, -12.6, 2.0, -3.01); box(M.steelDark, -12.612, 0.2, -3.685, -12.606, 1.76, -3.675, { cast: false });
  for (const z of [-3.78, -3.58]) bx(M.blackMatte, -12.59, 1.1, z, 0.03, 0.3, 0.03); bx(M.redLed, -12.598, 1.89, -3.68, 0.006, 0.03, 0.08); solid(-13.4, -4.36, -12.6, -3.0); blob(-13, 0, -3.68, 1.2, 1.7);
  // stellingrek
  { const x0 = -13.38, x1 = -12.92, z0 = -2.82, z1 = -0.95;
    for (const x of [x0, x1]) for (const z of [z0, (z0 + z1) / 2, z1]) bx(M.black, x, 0.9, z, 0.03, 1.8, 0.03);
    for (const y of [0.25, 0.95, 1.78]) box(M.blackMatte, x0, y, z0, x1, y + 0.03, z1);
    solid(x0, z0, x1, z1);
    for (let i = 0; i < 5; i++) carton(-13.15, 0.28, z0 + 0.25 + i * 0.36, 0.34, 0.2 + r() * 0.2, 0.3, r() * 0.2);
    for (let i = 0; i < 7; i++) bottle([M.sauceB, M.sauceC, M.sauceA][i % 3], -13.1, 0.98, z0 + 0.15 + i * 0.13, 0.3, 0.04);
    carton(-13.15, 0.98, -1.4, 0.34, 0.3, 0.5);
    for (let i = 0; i < 3; i++) { for (let k = 0; k < 7; k++) bx(M.kraft, -13.15, 1.83 + k * 0.03, z0 + 0.3 + i * 0.5, 0.3 - k * 0.012, 0.03, 0.3 - k * 0.012, { cast: k === 0 }); }
    cyl(M.white, -13.15, 1.95, -1.2, 0.05, 0.3, { seg: 10 }); }
  // diepvrieskist met rode tape
  rb(M.white, -11.78, 0.44, -0.52, 1.65, 0.84, 0.68, 0.03); box(M.plasterGrey, -12.6, 0.74, -0.865, -10.96, 0.75, -0.862, { cast: false }); bx(M.white, -11.78, 0.72, -0.875, 0.18, 0.03, 0.03);
  pl(M.red, -11.2, 0.863, -0.5, 0.3, 0.12, 'y+', { spin: 0.2 }); solid(-12.62, -0.88, -10.94, 0); blob(-11.78, 0, -0.52, 2.1, 1.1);
  // elektrakasten, gasleiding, kabelgoot, lamp
  box(M._std({ color: 0xd8d2c0, roughness: 0.6 }), -10.62, 0.9, -5.3, -10.37, 1.7, -4.5); box(M.white, -10.58, 1.9, -5.2, -10.37, 2.5, -4.7); solid(-10.62, -5.3, -10.35, -4.5);
  cyl(M.yellow, -13.3, 1.85, -0.2, 0.035, 3.7, { seg: 10 }); cyl(M.yellow, -13.3, 3.7, -2.8, 0.035, 5.2, { rx: Math.PI / 2, seg: 10 }); sph(M.yellow, -13.3, 3.7, -0.2, 0.045);
  for (const y of [2.6, 2.75]) cyl(M.steel, -13.33, y, -2.7, 0.015, 5.4, { rx: Math.PI / 2, seg: 6 });
  box(M.steelDark, -10.75, 3.5, -5.4, -10.4, 3.52, -2.0); box(M.steelDark, -10.75, 3.5, -5.4, -10.74, 3.58, -2.0);
  box(M.panel, -12.3, 4.17, -3.1, -11.7, 4.2, -2.5, { cast: false });
  carton(-10.9, 0, -1.6, 0.5, 0.4, 0.4, 0.3); carton(-10.85, 0.4, -1.62, 0.4, 0.3, 0.35, -0.2); solid(-11.15, -1.85, -10.6, -1.35);
  void W; void into;
}
const GLH = 4.0;
