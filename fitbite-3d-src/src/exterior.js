// Buiten: straat, pad, gevel van het Movepassion-gebouw met de Fitbite-ingang
import * as THREE from 'three';
import { box, bx, cyl, sph, pl, grp, solid, solidC, torus, dyn, into } from './ctx.js';
import { car } from './props.js';
import { rng } from './tex.js';

export const GL = 4.0, LOW = 6.2, TALL = 9.6;

// beglazing met stijlen; n ruiten tussen x0 en x1
export function glazing(M, x0, x1, y0, y1, n, z = 0.12, frame = M.frame) {
  const w = (x1 - x0) / n;
  for (let i = 0; i <= n; i++) box(frame, x0 + i * w - 0.03, y0, z - 0.07, x0 + i * w + 0.03, y1, z + 0.07);
  box(frame, x0, y1 - 0.06, z - 0.07, x1, y1, z + 0.07); box(frame, x0, y0, z - 0.07, x1, y0 + 0.07, z + 0.07);
  for (let i = 0; i < n; i++) pl(M.glass, x0 + (i + 0.5) * w, (y0 + y1) / 2, z, w - 0.06, y1 - y0 - 0.1, 'z+');
}
// schuifdeur met 4 vleugels (middelste twee schuiven open)
export function slidingDoor(M, x0, z, frame, doors) {
  const leaves = [];
  for (let i = 0; i < 4; i++) {
    const g = new THREE.Group(); g.userData.dyn = true; g.position.set(x0 + i + 0.5, 0, z + (i === 1 || i === 2 ? 0.035 : -0.035));
    into(g, () => {
      box(frame, -0.5, 0, -0.02, -0.45, 2.48, 0.02); box(frame, 0.45, 0, -0.02, 0.5, 2.48, 0.02); box(frame, -0.5, 2.42, -0.02, 0.5, 2.48, 0.02); box(frame, -0.5, 0, -0.02, 0.5, 0.08, 0.02);
      pl(M.glass, 0, 1.25, 0, 0.9, 2.34, 'z+');
    });
    dyn.add(g); leaves.push(g);
  }
  box(frame, x0 - 0.05, 2.48, z - 0.1, x0 + 4.05, 2.62, z + 0.1);
  doors.push({ x: x0 + 2, z, leaves, base: [x0 + 1.5, x0 + 2.5], open: 0, col: [x0 + 1, z - 0.1, x0 + 3, z + 0.1] });
  solid(x0, z - 0.1, x0 + 1, z + 0.1); solid(x0 + 3, z - 0.1, x0 + 4, z + 0.1);
}

export function buildExterior(M, W) {
  const r = rng(555);
  // --- grond ---
  pl(M.asphalt, 0, 0, 40.1, 180, 79.8, 'y+');
  pl(M.pavers, 2.3, 0.004, 3.45, 10, 6.4, 'y+');
  for (const [a, b] of [[-40, -2.7], [7.3, 40]]) { pl(M.turf, (a + b) / 2, 0.012, 3.95, b - a, 5.3, 'y+'); pl(M.mulch, (a + b) / 2, 0.01, 0.78, b - a, 1.05, 'y+'); }
  for (const [a, b] of [[-40, -2.7], [7.3, 40]]) box(M.concrete, a, 0, 6.6, b, 0.07, 6.72);
  box(M.concrete, -2.76, 0, 1.3, -2.66, 0.07, 6.72); box(M.concrete, 7.26, 0, 1.3, 7.36, 0.07, 6.72);
  // overkant: groenstrook en parking
  pl(M.turf, 0, 0.012, 16.4, 120, 4.6, 'y+'); box(M.concrete, -60, 0, 14.0, 60, 0.07, 14.1);
  for (const [x, z, s] of [[-6.2, 15.0, 0.55], [-3.4, 15.9, 0.42], [9.5, 15.4, 0.5]]) { const m = sph(M.rock, x, s * 0.45, z, s, { seg: 9, seg2: 7, s: [1.3, 0.8, 1] }); m.rotation.y = r() * 3; solidC(x, z, s * 0.9); }
  // bomen (silhouetten)
  for (const [x, z, h] of [[-13, 16.5, 8], [-1.5, 17.2, 6.5], [6, 16.8, 9], [15, 16.2, 7.5], [-22, 17, 9], [24, 17.5, 8.5], [-9, 30, 10], [11, 31, 11], [-28, 31, 10], [30, 30, 9], [-36, 8, 9], [38, 9, 8]]) {
    for (const a of [0.3, 1.87]) { const m = pl(M.tree, x, h / 2, z, h * 0.55, h, 'z+'); m.rotation.y = a; }
    solidC(x, z, 0.2);
  }
  // lantaarnpalen met lichtkegel
  for (const x of [-10, 11.5]) {
    cyl(M.frame, x, 3.4, 13.4, 0.07, 6.8, { seg: 10 }); bx(M.frame, x, 6.82, 12.9, 0.22, 0.07, 1.1); bx(M.lampHead, x, 6.78, 12.6, 0.18, 0.02, 0.45); solidC(x, 13.4, 0.12);
    const c = cyl(M.cone, x, 3.4, 12.6, 3.4, 6.8, { rt: 0.12, seg: 20, open: true }); c.renderOrder = 5;
  }
  // geparkeerde auto's
  car(-14, 22.5, 0, M.carA); car(-4.5, 22.8, 0.04, M.carB); car(7, 22.4, Math.PI, M.carA); car(18, 23, 0, M.carB);
  solid(-60, 19.4, 60, 19.6); solid(-27, 0, -26.8, 20); solid(29, 0, 29.2, 20);

  // --- gevel ---
  const fw = (x0, x1, y0, y1, col) => { box(M.facade, x0, y0, 0.1, x1, y1, 0.26); if (col) solid(x0, 0, x1, 0.26); };
  fw(-60, -13.1, 0, LOW, 1);
  box(M.sectional, -13.1, 0, 0.04, -10.6, 3.0, 0.14, { col: 1 }); fw(-13.1, -10.6, 3.0, LOW);
  fw(-10.6, -4.4, 0, LOW, 1);
  fw(-4.4, 6.9, GL, LOW);
  fw(6.9, 40, 0, LOW, 1);
  box(M.facade, 7.6, LOW, -24, 40, TALL, 0.26); box(M.roof, -60, LOW - 0.1, -34, 7.6, LOW, 0.1);
  box(M.facade, -60, 0, -34, 40, LOW, -33.7);
  // BAR-ramen (5 smalle ruiten) + deurpartij
  glazing(M, -4.4, -1.35, 0, GL, 5); solid(-4.4, 0, -1.3, 0.26);
  pl(M.bar, -1.66, 3.3, 0.135, 0.5, 0.19, 'z+'); pl(M.bar, -1.66, 3.3, 0.105, 0.5, 0.19, 'z-');
  box(M.frame, -1.35, 0, 0.03, -1.28, GL, 0.21); box(M.frame, -0.28, 0, 0.03, 0.2, GL, 0.21, { col: 1 });
  box(M.frame, -1.28, 2.5, 0.05, -0.28, 2.62, 0.19);
  glazing(M, 0.2, 1.45, 0, 2.55, 1); solid(0.2, 0, 1.5, 0.26);
  glazing(M, 5.5, 6.9, 0, 2.55, 1); solid(5.5, 0, 6.9, 0.26);
  glazing(M, -1.28, 6.9, 2.62, GL, 6);
  pl(M.welcome, 0.82, 0.62, 0.14, 0.5, 0.5, 'z+');
  slidingDoor(M, 1.5, 0.12, M.frame, W.doors);
  // openstaande enkele deur met witte duwstang
  grp(-1.28, 0, 0.2, 0, () => {
    const g = grp(0, 0, 0, -1.72, () => {
      box(M.frame, 0, 0, -0.025, 0.06, 2.48, 0.025); box(M.frame, 0.94, 0, -0.025, 1.0, 2.48, 0.025); box(M.frame, 0, 2.42, -0.025, 1.0, 2.48, 0.025); box(M.frame, 0, 0, -0.025, 1.0, 0.1, 0.025);
      pl(M.glass, 0.5, 1.26, 0, 0.88, 2.3, 'z+'); cyl(M.white, 0.5, 1.02, -0.07, 0.016, 0.8, { rz: Math.PI / 2, seg: 8 });
    }); void g;
  });
  solid(-1.5, 0.26, -1.25, 1.22);
  // neonaccenten rond de ramen en dakrand
  box(M.cyan, -4.48, GL + 0.03, 0.26, 6.98, GL + 0.065, 0.29); box(M.cyan, -4.48, 0.05, 0.26, -4.445, GL + 0.03, 0.29); box(M.cyan, 6.945, 0.05, 0.26, 6.98, GL + 0.03, 0.29);
  box(M.magenta, -40, LOW - 0.06, 0.26, 7.6, LOW - 0.025, 0.29); box(M.magenta, 7.565, LOW, 0.26, 7.6, TALL, 0.29); box(M.magenta, 7.6, TALL - 0.06, 0.26, 40, TALL - 0.025, 0.29);
  // neonlogo's op de gevel
  cyl(M.roof, -2.87, 5.1, 0.275, 1.0, 0.03, { rx: Math.PI / 2, seg: 48 }); pl(M.emblemNeon, -2.87, 5.1, 0.3, 2.3, 2.3, 'z+');
  pl(M.fitbiteNeon, 2.75, 5.08, 0.29, 4.4, 1.1, 'z+');
  pl(M.move, 16, 7.85, 0.29, 6.2, 2.32, 'z+');
  box(M.frame, 8.55, 0.25, 0.26, 9.65, 4.3, 0.3); pl(M.glassDark, 9.1, 2.27, 0.31, 0.98, 3.92, 'z+');
  box(M.frame, 10.4, 6.75, 0.26, 12.1, 8.35, 0.3); pl(M.glassDark, 11.25, 7.55, 0.31, 1.56, 1.46, 'z+'); pl(M._emi(0xffc88a, 0.5), 11.6, 7.2, 0.315, 0.5, 0.5, 'z+');
  // dakrandleuning + schijnwerpers
  for (let x = -34; x <= 7; x += 2.05) cyl(M.steelDark, x, LOW + 0.5, -0.5, 0.02, 1.0, { seg: 6 });
  for (const y of [LOW + 0.5, LOW + 1.0]) box(M.steelDark, -34, y - 0.015, -0.52, 7, y + 0.015, -0.48);
  for (const x of [-8.5, 2.6]) { bx(M.frame, x, LOW - 0.12, 0.42, 0.34, 0.24, 0.16, { rx: 0.5 }); bx(M.lampHead, x, LOW - 0.17, 0.5, 0.28, 0.17, 0.02, { rx: 0.5 }); }
  { const c = cyl(M.cone, 2.6, 3.1, 1.6, 3.0, 6.0, { rt: 0.1, seg: 20, open: true, rx: -0.17 }); c.renderOrder = 5; }

  // --- verte: skyline, lucht, windmolen ---
  const sky = new THREE.Mesh(new THREE.SphereGeometry(420, 24, 16), M.sky); sky.userData.dyn = true; sky.renderOrder = -10; dyn.add(sky);
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(330, 330, 46, 64, 1, true), M.skyline); sl.position.y = 20; sl.renderOrder = -9; sl.userData.dyn = true; M.skyline.map.repeat.set(3, 1); dyn.add(sl);
  const wt = new THREE.Group(); wt.position.set(-62, 0, -95); wt.userData.dyn = true; dyn.add(wt);
  into(wt, () => {
    cyl(M.plasterGrey, 0, 32, 0, 1.6, 64, { rt: 0.9, seg: 12, cast: false }); bx(M.plasterGrey, 0, 64.5, 0.5, 2, 2, 5, { cast: false });
    const hub = new THREE.Group(); hub.position.set(0, 64.5, 3.2); wt.add(hub); W.turbine = hub;
    into(hub, () => { for (let i = 0; i < 3; i++) { const b = grp(0, 0, 0, 0, () => bx(M.plasterGrey, 0, 14, 0, 1.3, 28, 0.3, { cast: false })); b.rotation.z = i * Math.PI * 2 / 3; } sph(M.plasterGrey, 0, 0, 0, 1.2, { cast: false }); });
    W.beacon = sph(M._emi(0xff2020, 6), 0, 66, 0, 0.5);
  });
  M.plasterGrey.fog = true;
}
