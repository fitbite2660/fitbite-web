// Materialen
import * as THREE from 'three';

export function makeMaterials(T, S, IMG) {
  const M = {};
  const std = (o, wuv, extra) => { const m = new THREE.MeshStandardMaterial(o); if (wuv) m.userData.wuv = wuv; if (extra) Object.assign(m.userData, extra); return m; };
  const emi = (hex, k) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) }); m.userData.noShadow = true; return m; };
  const sign = (map, k = 1, o = {}) => { const m = new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, color: new THREE.Color(k, k, k), ...o }); m.userData.noShadow = true; return m; };
  const over = (m) => { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; return m; };

  // buiten
  M.asphalt = std({ map: T.asphalt, bumpMap: T.asphaltB, bumpScale: 0.6, roughness: 0.82, color: 0xb8b8c0 }, [3, 3], { ground: 1 });
  M.pavers = over(std({ map: T.pavers, bumpMap: T.paversB, bumpScale: 0.9, roughness: 0.78 }, [0.8, 0.8], { ground: 1 }));
  M.turf = over(std({ map: T.turf, roughness: 1 }, [1.2, 1.2]));
  M.mulch = over(std({ map: T.mulch, roughness: 1 }, [1, 1]));
  M.facade = std({ map: T.facade, bumpMap: T.facadeB, bumpScale: 1.2, roughness: 0.5, metalness: 0.25, color: 0xe6eaf2 }, [4, 4]);
  M.roof = std({ color: 0x0c0d10, roughness: 0.9 });
  M.frame = std({ color: 0x16181c, roughness: 0.38, metalness: 0.75 });
  M.frameBlue = std({ color: 0x1b3f8f, roughness: 0.4, metalness: 0.5 });
  M.glass = std({ color: 0x0d1a20, roughness: 0.04, metalness: 0.85, transparent: true, opacity: 0.26, envMapIntensity: 1.7, depthWrite: false, side: THREE.DoubleSide });
  M.glassClear = std({ color: 0x7fa2ac, roughness: 0.03, metalness: 0.7, transparent: true, opacity: 0.09, envMapIntensity: 2.0, depthWrite: false, side: THREE.DoubleSide });
  M.glassDark = std({ color: 0x06090d, roughness: 0.05, metalness: 0.9, envMapIntensity: 1.8 });
  M.rock = std({ color: 0x8a7f78, roughness: 0.9 });
  M.carA = std({ color: 0x14161a, roughness: 0.25, metalness: 0.8, envMapIntensity: 1.5 });
  M.carB = std({ color: 0x3a3f48, roughness: 0.3, metalness: 0.8, envMapIntensity: 1.5 });
  M.tree = new THREE.MeshBasicMaterial({ map: T.tree, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, color: 0x9098a8 }); M.tree.userData.noShadow = true;
  M.cone = new THREE.MeshBasicMaterial({ map: T.cone, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, color: 0x8fb4c8, opacity: 0.22, fog: false }); M.cone.userData.noShadow = true;

  // schil binnen
  M.concrete = std({ map: T.concrete, roughness: 0.92 }, [3, 3]);
  M.floorc = std({ map: T.floorc, roughness: 0.34, metalness: 0.05 }, [5, 5], { ground: 1 });
  M.plaster = std({ color: 0xcbc8c0, roughness: 0.95 });
  M.plasterGrey = std({ color: 0x8c8a86, roughness: 0.95 });
  M.teal = std({ color: 0x1d5d57, roughness: 0.85 });
  M.darkwall = std({ color: 0x1a1c20, roughness: 0.9 });
  M.blocks = std({ map: T.blocks, roughness: 0.95 }, [0.8, 0.8]);
  M.wtiles = std({ map: T.wtiles, roughness: 0.22, envMapIntensity: 0.6, color: 0xd6d6d6 }, [0.2, 0.2]);
  M.border = std({ map: T.border, roughness: 0.25 });
  M.chalk = std({ map: S.chalk, roughness: 0.95 });
  M.duct = std({ map: T.duct, roughness: 0.38, metalness: 0.9, envMapIntensity: 1.1 });
  M.curtain = std({ map: T.curtain, roughness: 1, color: 0xd8ccb0 }, [1.6, 4]);
  M.sectional = std({ map: T.sectional, roughness: 0.5, metalness: 0.2, color: 0x9a9da4 }, [1, 0.8]);

  // Fitbite
  M.laminate = std({ map: T.laminate, roughness: 0.46, envMapIntensity: 0.7 }, [2.4, 1.6], { wswap: 1 });
  M.slat = std({ map: T.slat, roughness: 0.62 }, [0.25, 2]);
  M.felt = std({ color: 0x171310, roughness: 1 });
  M.topBlack = std({ color: 0x0e0e10, roughness: 0.3, metalness: 0.2, envMapIntensity: 1.2 });
  M.worktop = std({ map: T.worktop, roughness: 0.55 }, [1, 1]);
  M.cabinet = std({ map: T.cabinet, roughness: 0.6 }, [1, 1]);
  M.steel = std({ color: 0xb4b8bd, roughness: 0.3, metalness: 1, envMapIntensity: 1.3 });
  M.steelDark = std({ color: 0x4a4d52, roughness: 0.4, metalness: 1 });
  M.black = std({ color: 0x0c0c0e, roughness: 0.5, metalness: 0.55 });
  M.blackMatte = std({ color: 0x101012, roughness: 0.85 });
  M.white = std({ color: 0xe9e9e6, roughness: 0.55 });
  M.pine = std({ map: T.pine, roughness: 0.7 }, [1, 0.25]);
  M.planks = std({ map: T.planks, roughness: 0.85 }, [0.6, 0.6]);
  M.kraft = std({ color: 0xb58d5e, roughness: 0.85 });
  M.cardboard = std({ map: T.cardboard, roughness: 0.9 }, [0.5, 0.5]);
  M.fabGreen = std({ color: 0x17463a, roughness: 0.95 });
  M.fabYellow = std({ color: 0xb98a1c, roughness: 0.95 });
  M.leatherB = std({ color: 0x121214, roughness: 0.42, envMapIntensity: 0.8 });
  M.leatherC = std({ color: 0x7a4322, roughness: 0.6 });
  M.ptiles = std({ map: T.ptiles, roughness: 0.4, envMapIntensity: 0.6 }, [0.8, 0.8]);
  M.soil = std({ color: 0x1a130d, roughness: 1 });
  M.leaf = std({ map: T.leaf, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 }); M.leaf.userData.noShadow = true;
  M.red = std({ color: 0xb01818, roughness: 0.4 });
  M.yellow = std({ color: 0xe0b800, roughness: 0.45 });
  M.sauceA = std({ color: 0xe8b06a, roughness: 0.4 }); M.sauceB = std({ color: 0x5a2a12, roughness: 0.4 }); M.sauceC = std({ color: 0xc81e1e, roughness: 0.4 });
  M.screenOff = std({ color: 0x050506, roughness: 0.15, metalness: 0.5 });
  M.blob = new THREE.MeshBasicMaterial({ map: T.blob, transparent: true, depthWrite: false, opacity: 0.9 }); M.blob.userData.noShadow = true; over(M.blob);

  // lichtgevend
  M.bulb = emi(0xffc880, 5); M.ledWarm = emi(0xffd9a0, 3.2); M.ledCool = emi(0xdfeaff, 2.6);
  M.cyan = emi(0x25e6ff, 2.4); M.magenta = emi(0xff2bd0, 2.4); M.redLed = emi(0xff1830, 3.6); M.panel = emi(0xeaf2ff, 2.2);
  M.tail = emi(0xff1010, 2.5); M.lampHead = emi(0xbfe8ff, 5); M.dojo = emi(0x3a6fd8, 0.55); M.screenWhite = emi(0xf2efe6, 0.5);
  M.cmDisplay = emi(0x22e0e6, 2.2);

  // bordjes / schermen
  M.neon = sign(S.neon, 1.7); M.emblemNeon = sign(S.emblemNeon, 1.9); M.fitbiteNeon = sign(S.fitbiteNeon, 2.4);
  M.open = sign(S.open, 2.4); M.move = sign(S.move, 2.6); M.bar = sign(S.bar, 1.1);
  M.hours = sign(S.hours, 0.9, { transparent: false, depthWrite: true }); M.weopen = sign(S.weopen, 0.95, { transparent: false, depthWrite: true });
  M.dance = sign(S.dance, 0.8, { transparent: false, depthWrite: true }); M.welcome = sign(S.welcome, 0.9);
  M.corr = sign(S.corr, 1.6, { transparent: false, depthWrite: true }); M.kiosk = sign(S.kiosk, 1.3, { transparent: false, depthWrite: true });
  M.vend = sign(S.vend, 1.25, { transparent: false, depthWrite: true }); M.aqua = std({ map: S.aqua, roughness: 0.8 }); M.bali = std({ map: S.bali, roughness: 0.9 });
  M.pos = sign(S.pos, 1.1, { transparent: false, depthWrite: true });
  M.tvL = sign(IMG.tv1, 1.25, { transparent: false, depthWrite: true }); M.tvR = sign(IMG.tv2, 1.25, { transparent: false, depthWrite: true });
  M.salad = std({ map: IMG.salad, roughness: 0.35, metalness: 0.1, color: 0xd8d8d8 });
  M.sky = new THREE.MeshBasicMaterial({ map: T.sky, side: THREE.BackSide, fog: false, depthWrite: false });
  M.skyline = new THREE.MeshBasicMaterial({ map: T.skyline, side: THREE.BackSide, fog: false, transparent: true, depthWrite: false, color: 0xb0b0c0 });
  M._std = std; M._emi = emi;
  return M;
}
