// Bouwhulpjes: geometrie plaatsen, botsvlakken registreren en alles per materiaal samenvoegen.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const root = new THREE.Group();   // statisch (wordt samengevoegd)
export const dyn = new THREE.Group();    // bewegend
export const colliders = [];             // [x0,z0,x1,z1]
export const zones = [];                 // vloerhoogtes [x0,z0,x1,z1,h]
let parent = root;

export function into(g, fn) { const p = parent; parent = g; fn(g); parent = p; return g; }
export function grp(x = 0, y = 0, z = 0, ry = 0, fn) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
  if (fn) into(g, fn); return g;
}
export function solid(x0, z0, x1, z1) { colliders.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]); }
export function solidC(x, z, hx, hz = hx) { colliders.push([x - hx, z - hz, x + hx, z + hz]); }

function add(m, o) {
  const tr = m.material.transparent || m.material.userData.noShadow;
  m.castShadow = o.cast !== undefined ? o.cast : !tr; m.receiveShadow = o.recv !== false && !tr;
  if (o.rx) m.rotation.x = o.rx; if (o.ry) m.rotation.y = o.ry; if (o.rz) m.rotation.z = o.rz;
  if (o.dyn) m.userData.dyn = true;
  (o.to || parent).add(m); return m;
}
// doos via hoekpunten
export function box(mat, x0, y0, z0, x1, y1, z1, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  if (o.col) solid(x0, z0, x1, z1);
  return add(m, o);
}
// doos via middelpunt
export function bx(mat, cx, cy, cz, w, h, d, o = {}) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(cx, cy, cz); return add(m, o);
}
export function rb(mat, cx, cy, cz, w, h, d, r = 0.03, o = {}) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)), mat); m.position.set(cx, cy, cz); return add(m, o);
}
export function cyl(mat, cx, cy, cz, r, h, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(o.rt !== undefined ? o.rt : r, r, h, o.seg || 16, 1, !!o.open, o.t0 || 0, o.tl || Math.PI * 2), mat);
  m.position.set(cx, cy, cz); return add(m, o);
}
export function sph(mat, cx, cy, cz, r, o = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg || 16, o.seg2 || 12), mat); m.position.set(cx, cy, cz);
  if (o.s) m.scale.set(o.s[0], o.s[1], o.s[2]); return add(m, o);
}
// vlak dat in een richting kijkt: 'x+','x-','y+','y-','z+','z-'
export function pl(mat, cx, cy, cz, w, h, face = 'z+', o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(cx, cy, cz);
  if (face === 'z-') m.rotation.y = Math.PI; else if (face === 'x+') m.rotation.y = Math.PI / 2; else if (face === 'x-') m.rotation.y = -Math.PI / 2;
  else if (face === 'y+') m.rotation.x = -Math.PI / 2; else if (face === 'y-') m.rotation.x = Math.PI / 2;
  if (o.spin) { if (face[0] === 'y') m.rotation.z = o.spin; else m.rotateZ(o.spin); }
  o = { ...o, rx: 0, ry: 0, rz: 0 };
  return add(m, o);
}
export function tube(mat, pts, r, o = {}) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', o.tension !== undefined ? o.tension : 0.2);
  const m = new THREE.Mesh(new THREE.TubeGeometry(c, o.segs || pts.length * 6, r, o.seg || 8, false), mat); return add(m, o);
}
export function ext(mat, shape, depth, o = {}) {
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: !!o.bevel, bevelSize: o.bevel || 0, bevelThickness: o.bevel || 0, bevelSegments: 2, curveSegments: o.curve || 10 }), mat);
  if (o.pos) m.position.set(o.pos[0], o.pos[1], o.pos[2]); return add(m, o);
}
export function torus(mat, cx, cy, cz, r, t, o = {}) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, o.seg || 8, o.seg2 || 40, o.arc || Math.PI * 2), mat); m.position.set(cx, cy, cz); return add(m, o);
}
export function rrect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s;
}

// UV's uit wereldpositie zodat tegels/planken overal dezelfde schaal hebben
function worldUV(g, sc, swap) {
  const p = g.attributes.position, n = g.attributes.normal; const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); if (swap) { const t = u; u = v; v = t; } }
    else if (ax >= az) { u = p.getZ(i); v = p.getY(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u / sc[0]; uv[i * 2 + 1] = v / sc[1];
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

// Voeg alle statische meshes per materiaal samen -> weinig draw calls
export function bake(scene) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  const walk = (o) => {
    if (o.userData.dyn) return;
    if (o.isMesh) {
      const key = o.material.uuid + (o.castShadow ? 'c' : '-') + (o.receiveShadow ? 'r' : '-') + (o.renderOrder || 0);
      let e = groups.get(key); if (!e) groups.set(key, e = { mat: o.material, cast: o.castShadow, recv: o.receiveShadow, ro: o.renderOrder, list: [] });
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      g.applyMatrix4(o.matrixWorld);
      for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      const wu = o.material.userData.wuv; if (wu) worldUV(g, wu, o.material.userData.wswap);
      e.list.push(g);
    }
    for (const c of o.children) walk(c);
  };
  walk(root);
  const out = new THREE.Group(); out.name = 'static';
  for (const e of groups.values()) {
    const g = mergeGeometries(e.list, false); if (!g) continue;
    const m = new THREE.Mesh(g, e.mat); m.castShadow = e.cast; m.receiveShadow = e.recv; m.renderOrder = e.ro || 0; m.matrixAutoUpdate = false; m.frustumCulled = false;
    if (e.mat.userData.ground) m.userData.ground = true;
    out.add(m); e.list.forEach(x => x.dispose());
  }
  // bewegende delen die nog in root zitten overzetten
  const movers = []; root.traverse(o => { if (o.userData.dyn) movers.push(o); });
  movers.forEach(o => { o.updateMatrixWorld(true); const m = o.matrixWorld.clone(); dyn.add(o); m.decompose(o.position, o.quaternion, o.scale); });
  scene.add(out); scene.add(dyn);
  return out;
}
