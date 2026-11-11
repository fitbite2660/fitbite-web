// De hal van het sportcomplex rond Fitbite: sas, tegelpodium, gang, trap
import * as THREE from 'three';
import { box, bx, rb, cyl, sph, pl, grp, solid, solidC, zones } from './ctx.js';
import { chair, table, tubChair, planter, potPlant, blob, foliage } from './props.js';
import { slidingDoor } from './exterior.js';
import { slats } from './fitbite.js';

export function buildHall(M, W) {
  // vloer + plafond
  pl(M.floorc, -3, 0, -17, 46, 34, 'y+');
  box(M.concrete, -26, 4.2, -34, 20, 4.5, 0.1, { cast: false });
  for (const z of [-9.0, -18.2]) box(M.concrete, -10.35, 3.72, z - 0.2, 14, 4.2, z + 0.2, { cast: false });
  box(M.concrete, -10.35, 3.72, -5.6, 0.2, 4.2, -5.2, { cast: false }); box(M.concrete, 2.8, 3.72, -22, 3.2, 4.2, -4.15, { cast: false });

  // ---- sas (tochtportaal) met groenblauwe wand ----
  box(M.teal, 0, 0, -4.15, 1.5, 4.2, -4.0, { col: 1 }); box(M.teal, 5.5, 0, -4.15, 7.05, 4.2, -4.0, { col: 1 }); box(M.teal, 1.5, 2.62, -4.15, 5.5, 4.2, -4.0);
  box(M.teal, 6.9, 0, -4.15, 7.05, 4.2, 0, { col: 1 });
  slidingDoor(M, 1.5, -4.075, M.frameBlue, W.doors);
  pl(M.blackMatte, 3.5, 0.006, -2.0, 3.6, 2.6, 'y+', { cast: false });
  box(M.cyan, 0.2, 4.15, -3.98, 6.88, 4.18, -3.95, { cast: false }); box(M.cyan, 0.17, 4.15, -3.98, 0.2, 4.18, -0.02, { cast: false }); box(M.cyan, 6.86, 4.15, -3.98, 6.89, 4.18, -0.02, { cast: false });
  // roll-up banner + afvalbak
  box(M.steelDark, 0.35, 0, -4.62, 1.25, 0.06, -4.5); box(M.white, 0.4, 0.06, -4.57, 1.2, 2.0, -4.56); pl(M._std({ color: 0x1d7d6f, roughness: 0.8 }), 0.8, 0.8, -4.572, 0.8, 1.0, 'z-'); solid(0.35, -4.65, 1.25, -4.5);
  rb(M.plasterGrey, 6.4, 0.3, -4.5, 0.4, 0.6, 0.35, 0.04); solid(6.2, -4.7, 6.6, -4.3);
  // wand met drankautomaten
  box(M.darkwall, 7.05, 0, -4.15, 14, 4.2, -4.0, { col: 1 });
  for (const x of [8.2, 9.2, 10.2]) { rb(M.black, x, 0.95, -4.55, 0.92, 1.9, 0.78, 0.02); pl(M.vend, x, 0.95, -4.945, 0.86, 1.82, 'z-'); }
  solid(7.7, -4.95, 10.7, -4.15); blob(9.2, 0, -4.6, 3.6, 1.4);
  box(M.plasterGrey, 12.0, 0, -4.17, 12.95, 2.1, -4.15);
  // oostkant: gordijnen; noordwand met projectiescherm
  box(M.curtain, 13.9, 0, -22, 14.1, 4.2, -4.15, { col: 1 });
  box(M.plaster, -10.5, 0, -22.2, 14.1, 4.2, -22, { col: 1 });
  for (const [a, b, c, d] of [[-4.6, 1.05, 0.6, 1.11], [-4.6, 3.75, 0.6, 3.81], [-4.6, 1.05, -4.54, 3.81], [0.54, 1.05, 0.6, 3.81]]) box(M.black, a, b, -21.99, c, d, -21.93);
  pl(M.screenWhite, -2, 2.43, -21.95, 5.0, 2.62, 'z+');
  box(M.white, 2.0, 0, -22.0, 2.9, 2.1, -21.97); bx(M.steel, 2.12, 1.05, -21.95, 0.1, 0.02, 0.04);
  box(M.blackMatte, 3.6, 0, -21.98, 4.5, 2.0, -21.6); for (let i = 1; i < 5; i++) box(M.black, 3.62, i * 0.4, -21.96, 4.48, i * 0.4 + 0.02, -21.58); solid(3.6, -22, 4.5, -21.6);
  box(M.white, 4.9, 0.1, -21.9, 12, 2.9, -21.8); pl(M.aqua, 8.45, 1.5, -21.795, 7.1, 2.8, 'z+'); solid(4.9, -22, 12, -21.75);
  // westwand: bank, dojoraam, koffiehoek
  box(M.plasterGrey, -10.5, 0, -22, -10.35, 4.2, -7.35, { col: 1 });
  box(M.black, -10.36, 0.75, -17.6, -10.3, 2.95, -14.4); pl(M.dojo, -10.295, 1.85, -16, 3.1, 2.1, 'x+'); pl(M._emi(0xd83030, 0.5), -10.29, 1.05, -16, 3.1, 0.3, 'x+');
  rb(M.leatherC, -9.75, 0.3, -12.2, 0.95, 0.4, 2.6, 0.08); rb(M.leatherC, -10.1, 0.62, -12.2, 0.28, 0.5, 2.6, 0.08); rb(M.leatherC, -9.75, 0.5, -13.6, 0.95, 0.5, 0.25, 0.08); rb(M.leatherC, -9.4, 0.3, -10.6, 0.9, 0.4, 0.8, 0.08);
  rb(M.white, -10.0, 0.75, -11.6, 0.14, 0.4, 0.42, 0.06, { rz: 0.25 }); solid(-10.35, -13.75, -9.25, -10.2); blob(-9.75, 0, -12.1, 1.8, 3.6);
  planter(-10.3, -14.3, -9.5, -13.85, 0, 0.8); planter(-10.3, -10.1, -9.7, -9.5, 0, 0.8);
  slats(M, 'z', -20.8, -18.6, -9.6, 1, 0, 1.05); box(M.felt, -10.35, 0, -20.8, -9.6, 1.05, -18.6); box(M.pine, -10.35, 1.05, -20.85, -9.55, 1.1, -18.55); solid(-10.35, -20.85, -9.55, -18.55);
  rb(M.black, -10.0, 1.4, -19.4, 0.4, 0.6, 0.45, 0.03); bx(M.cmDisplay, -9.795, 1.5, -19.4, 0.01, 0.1, 0.16);
  pl(M._emi(0xc8773a, 0.35), -10.34, 2.2, -19.7, 1.6, 1.5, 'x+'); box(M.pine, -10.35, 3.0, -20.8, -9.8, 3.05, -18.6);

  // ---- gang met rode lichtlijn (naar de opslagdeur) ----
  box(M.darkwall, -20, 0, -5.6, -13.55, 2.8, -5.45, { col: 1 }); box(M.darkwall, -20, 0, -7.35, -10.5, 2.8, -7.2, { col: 1 }); box(M.darkwall, -20, 2.8, -7.35, -10.35, 2.9, -5.45, { cast: false });
  box(M.concrete, -10.5, 2.8, -7.35, -10.35, 4.2, -5.6); box(M.darkwall, -20.15, 0, -7.2, -20, 2.8, -5.6, { col: 1 });
  box(M.darkwall, -13.55, 0, -5.618, -12.6, 2.8, -5.6); box(M.darkwall, -11.7, 0, -5.618, -10.35, 2.8, -5.6); box(M.darkwall, -12.6, 2.15, -5.618, -11.7, 2.8, -5.6);
  box(M.redLed, -19.9, 2.782, -6.42, -10.7, 2.797, -6.38, { cast: false }); pl(M.kiosk, -19.99, 1.45, -6.4, 0.55, 1.0, 'x+');
  for (const x of [-15.5, -18]) { box(M.blackMatte, x, 0, -7.2, x + 0.9, 2.1, -7.18); bx(M.steel, x + 0.1, 1.05, -7.16, 0.1, 0.02, 0.03); box(M.blackMatte, x - 1, 0, -5.62, x - 0.1, 2.1, -5.6); }
  box(M.blackMatte, -10.32, 2.55, -7.1, -9.9, 3.35, -5.72); pl(M.corr, -9.893, 2.95, -6.41, 1.1, 0.78, 'x+');
  // kolom met "DANCE PILATES YOGA" + stalen trap
  box(M.concrete, -10.35, 0, -7.8, -9.9, 4.2, -7.35, { col: 1 }); pl(M.dance, -9.893, 1.9, -7.575, 0.38, 0.57, 'x+'); bx(M.black, -9.86, 2.5, -7.575, 0.1, 0.08, 0.08); sph(M.bulb, -9.8, 2.44, -7.575, 0.04);
  for (let i = 0; i < 16; i++) { box(M.steelDark, -10.3, 0.17 + i * 0.18, -8.0 - i * 0.28, -9.25, 0.2 + i * 0.18, -7.72 - i * 0.28 - 0.0); }
  for (const x of [-10.32, -9.24]) { const m = bx(M.black, x, 1.55, -10.1, 0.03, 0.26, 5.4, { rx: Math.atan2(0.18, 0.28) }); void m; }
  { const m = bx(M.black, -9.24, 2.5, -10.1, 0.03, 0.04, 5.4, { rx: Math.atan2(0.18, 0.28) }); void m; for (let i = 0; i < 6; i++) bx(M.black, -9.24, 1.1 + i * 0.58, -8.3 - i * 0.9, 0.02, 0.95, 0.02); }
  solid(-10.35, -12.5, -9.2, -7.8); blob(-9.8, 0, -10, 1.6, 5.2);
  // schildersezel met banner
  box(M.pine, -8.55, 0, -8.7, -8.5, 1.7, -8.65); box(M.pine, -8.55, 0, -8.05, -8.5, 1.7, -8.0); pl(M.bali, -8.49, 1.15, -8.35, 0.62, 1.55, 'x+'); solid(-8.7, -8.75, -8.4, -7.95);

  // ---- tegelpodium met zitjes ----
  box(M.ptiles, -5.5, 0, -18, 3.5, 0.18, -9.5); zones.push([-5.5, -18, 3.5, -9.5, 0.18]);
  box(M.pine, -5.52, 0, -9.5, 3.52, 0.165, -9.48, { cast: false }); box(M.pine, 3.5, 0, -18, 3.52, 0.165, -9.5, { cast: false }); box(M.pine, -5.52, 0, -18, -5.5, 0.165, -9.5, { cast: false }); box(M.pine, -5.52, 0, -18.02, 3.52, 0.165, -18, { cast: false });
  planter(-5.4, -9.42, -3.9, -8.92, 0); planter(-3.8, -9.42, -2.3, -8.92, 0); planter(-0.3, -9.42, 1.2, -8.92, 0); planter(1.3, -9.42, 2.8, -8.92, 0);
  planter(3.58, -12.4, 4.08, -10.9, 0); planter(3.58, -17.6, 4.08, -16.1, 0); planter(-6.08, -12.2, -5.58, -10.7, 0);
  // wegwijzerpaal
  cyl(M.planks, 3.83, 1.5, -9.2, 0.07, 3.0, { seg: 8 }); solidC(3.83, -9.2, 0.25);
  [[0xc8372d, 2.6, 0.3], [0xe8e2d4, 2.3, -0.3], [0x2a7b5a, 2.0, 0.3], [0x1b1b1b, 1.7, -0.3]].forEach(([c, y, dx]) => bx(M._std({ color: c, roughness: 0.7 }), 3.83 + dx, y, -9.12, 0.62, 0.2, 0.02));
  // kolom met staand scherm
  box(M.concrete, 2.75, 0, -13.95, 3.2, 4.2, -13.5, { col: 1 }); box(M.black, 2.68, 2.0, -14.1, 2.75, 3.3, -13.35); pl(M.kiosk, 2.675, 2.65, -13.725, 0.68, 1.2, 'x-');
  // meubilair
  const Y = 0.18;
  rb(M.pine, -2.6, Y + 0.74, -13.9, 2.3, 0.05, 1.3, 0.02); for (const dx of [-0.8, 0.8]) bx(M.black, -2.6 + dx, Y + 0.36, -13.9, 0.06, 0.72, 0.9); solid(-3.6, -14.4, -1.6, -13.4); blob(-2.6, Y, -13.9, 3.0, 2.0);
  tubChair(-3.3, -12.85, 0, Y); tubChair(-1.9, -12.85, 0, Y); tubChair(-3.3, -14.95, Math.PI, Y); tubChair(-1.9, -14.95, Math.PI, Y); tubChair(-4.25, -13.9, Math.PI / 2, Y); tubChair(-0.95, -13.9, -Math.PI / 2, Y);
  const sets = [[0.9, -11.2, M.fabYellow], [0.9, -12.9, M.fabGreen], [1.3, -15.6, M.fabYellow], [-0.4, -16.9, M.fabGreen], [-4.3, -11.0, M.fabGreen], [-3.8, -16.8, M.fabYellow]];
  for (const [x, z, f] of sets) { table(x, z, Y); chair(x, z + 0.62, Math.PI, Y, f); chair(x, z - 0.62, 0, Y, f); }
  tubChair(2.4, -11.4, -Math.PI / 2, Y);
  potPlant(11.5, -20.5, 0, 2.2); potPlant(-9.4, -21.2, 0, 1.8);
  // receptiebalie met latten (noordoost)
  box(M.felt, 9, 0, -14.3, 13.4, 1.1, -13.7); slats(M, 'x', 9, 13.4, -13.7, 1, 0, 1.1); slats(M, 'z', -14.3, -13.7, 9, -1, 0, 1.1); box(M.pine, 8.97, 1.1, -14.33, 13.4, 1.14, -13.67); solid(9, -14.3, 13.9, -13.7);

  // ---- luchtkanalen, kabelgoot, lampen ----
  M.duct.map.repeat.set(2, 34);
  cyl(M.duct, 1.8, 3.42, -6.4, 0.31, 24.2, { rz: Math.PI / 2, seg: 24 }); cyl(M.duct, 4, 3.38, -7.12, 0.25, 19.8, { rz: Math.PI / 2, seg: 20 });
  cyl(M.duct, 8.2, 3.42, -13, 0.28, 17.6, { rx: Math.PI / 2, seg: 20 });
  for (let x = -9; x < 14; x += 2.4) { bx(M.steelDark, x, 3.95, -6.4, 0.03, 0.5, 0.02, { cast: false }); }
  box(M.steelDark, -10.3, 3.9, -8.1, 13.9, 3.92, -7.8, { cast: false }); box(M.steelDark, -10.3, 3.9, -8.1, 13.9, 3.97, -8.09, { cast: false });
  for (const [x, z] of [[-1, -13.5], [1.5, -16.5], [-4, -11.5], [6.5, -9], [6.5, -17], [10, -7], [-7.5, -16]]) { cyl(M.black, x, 4.05, z, 0.004, 0.3, { seg: 4, cast: false }); cyl(M.black, x, 3.86, z, 0.16, 0.12, { rt: 0.06, seg: 14, cast: false }); cyl(M.bulb, x, 3.795, z, 0.13, 0.01, { seg: 14 }); }
  void THREE; void grp; void foliage;
}
