// Stelt de wereld samen en plaatst de lichten
import * as THREE from 'three';
import { root, bake, colliders, zones } from './ctx.js';
import { setMats } from './props.js';
import { buildExterior } from './exterior.js';
import { buildFitbite } from './fitbite.js';
import { buildHall } from './hall.js';

export function buildWorld(M, scene) {
  const W = { doors: [], lights: [], shadowLights: [], colliders, zones };
  setMats(M);
  buildExterior(M, W); buildHall(M, W); buildFitbite(M, W, root);

  const L = (l, tier = 0) => { scene.add(l); if (l.target) scene.add(l.target); W.lights.push({ l, tier }); return l; };
  const point = (c, i, d, x, y, z, tier) => { const l = new THREE.PointLight(c, i, d, 2); l.position.set(x, y, z); return L(l, tier); };
  const spot = (c, i, d, ang, x, y, z, tx, ty, tz, shadow, tier) => {
    const l = new THREE.SpotLight(c, i, d, ang, 0.85, 2); l.position.set(x, y, z); l.target.position.set(tx, ty, tz);
    if (shadow) { l.shadow.bias = -0.0006; l.shadow.normalBias = 0.03; l.shadow.camera.near = 0.5; l.shadow.camera.far = d; W.shadowLights.push(l); }
    return L(l, tier);
  };
  L(new THREE.HemisphereLight(0x3a4a6c, 0x100e12, 1.0));
  const moon = new THREE.DirectionalLight(0x7f9bd0, 0.75); moon.position.set(14, 22, 40); L(moon);
  // buiten
  spot(0xffe2c0, 300, 24, 0.95, 2.6, 5.9, 0.7, 2.3, 0, 6.5, true);
  point(0x25e6ff, 22, 9, -3.0, 4.6, 1.9);
  point(0xff2bd0, 30, 10, 3.0, 5.2, 2.6);
  point(0xff2a3c, 44, 17, 16, 7.4, 3.4, 1);
  spot(0xbfe8ff, 260, 26, 0.9, -10, 6.7, 12.6, -10, 0, 12.2);
  spot(0xbfe8ff, 260, 26, 0.9, 11.5, 6.7, 12.6, 11.5, 0, 12.2, false, 1);
  // Fitbite
  spot(0xffc88a, 40, 12, 1.05, -3.3, 3.35, -2.9, -3.3, 0, -2.9, true);
  point(0xffc88a, 10, 9, -5.9, 3.0, -3.55);
  point(0xffd9a0, 2.6, 3.2, -4.6, 0.75, -3.6, 1);
  point(0x3158ff, 9, 5, -7.25, 2.02, -3.7);
  point(0xdfeaff, 3, 4.5, -6.5, 1.55, -0.9, 1);
  point(0xfff0dc, 3.2, 5, -9.1, 2.6, -3.75);
  point(0xdfeaff, 10, 8, -12, 3.6, -2.8);
  // hal
  point(0xff1830, 9, 8, -14, 2.4, -6.4);
  spot(0xffd0a0, 70, 16, 1.1, -1, 4.0, -13.5, -1, 0, -13.5, true);
  point(0xffd6a8, 15, 16, 5.5, 3.5, -9);
  point(0xffd6a8, 11, 14, -7.5, 3.5, -15, 1);
  point(0x25e6ff, 11, 7, 3.5, 3.6, -2);
  point(0xbfefff, 6, 5, 9.2, 1.3, -5.6, 1);

  W.static = bake(scene);
  W.grounds = []; W.static.traverse(o => { if (o.userData.ground) W.grounds.push(o); });
  for (const d of W.doors) { d.col.off = false; colliders.push(d.col); }
  return W;
}

// vloerhoogte op (x,z)
export function floorAt(x, z) {
  let h = 0; for (const q of zones) if (x >= q[0] && x <= q[2] && z >= q[1] && z <= q[3] && q[4] > h) h = q[4]; return h;
}
export function zoneName(x, z) {
  if (z > 0.26) return 'Buiten · Movepassion';
  if (x > 0.15 && x < 6.9 && z > -4.0) return 'Ingang';
  if (x > -7.75 && x < -1.5 && z > -5.6) return (x < -5.75 || (z > -1.72 && x < -4.85)) ? 'Fitbite · achter de toonbank' : 'Fitbite · eetruimte';
  if (x > -10.2 && x < -7.95 && z > -5.45 && z < -2.0) return 'Fitbite · keuken';
  if (x > -13.4 && x < -7.95 && z > -5.45) return 'Fitbite · achterkeuken & opslag';
  if (x < -10.35 && z < -5.6 && z > -7.2) return 'Gang';
  return 'Hal · Movepassion';
}
