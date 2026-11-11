// Vlakke spiegeling op y=0 (natte straat + gepolijste betonvloer) en het bijbehorende materiaal-patch
import * as THREE from 'three';

export class PlanarReflection {
  constructor(size) {
    this.rt = new THREE.WebGLRenderTarget(size, size, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter });
    this.cam = new THREE.PerspectiveCamera(); this.texMatrix = new THREE.Matrix4();
    this.uTime = { value: 0 }; this.uOn = { value: 1 }; this.tex = { value: this.rt.texture }; this.uM = { value: this.texMatrix };
    this.hide = [];
  }
  setSize(s) { this.rt.setSize(s, s); }
  update(renderer, scene, camera) {
    const n = new THREE.Vector3(0, 1, 0), camPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    if (camPos.y < 0.02) return;
    const rot = new THREE.Matrix4().extractRotation(camera.matrixWorld);
    const view = camPos.clone().negate().reflect(n).negate();
    const look = new THREE.Vector3(0, 0, -1).applyMatrix4(rot).add(camPos);
    const target = look.clone().negate().reflect(n).negate();
    const v = this.cam; v.position.copy(view); v.up.set(0, 1, 0).applyMatrix4(rot).reflect(n); v.lookAt(target);
    v.far = camera.far; v.near = camera.near; v.updateMatrixWorld(); v.projectionMatrix.copy(camera.projectionMatrix); v.matrixWorldInverse.copy(v.matrixWorld).invert();
    this.texMatrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(v.projectionMatrix).multiply(v.matrixWorldInverse);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, new THREE.Vector3(0, 0.01, 0)).applyMatrix4(v.matrixWorldInverse);
    const clip = new THREE.Vector4(plane.normal.x, plane.normal.y, plane.normal.z, plane.constant), p = v.projectionMatrix, q = new THREE.Vector4();
    q.x = (Math.sign(clip.x) + p.elements[8]) / p.elements[0]; q.y = (Math.sign(clip.y) + p.elements[9]) / p.elements[5]; q.z = -1; q.w = (1 + p.elements[10]) / p.elements[14];
    clip.multiplyScalar(2 / clip.dot(q));
    p.elements[2] = clip.x; p.elements[6] = clip.y; p.elements[10] = clip.z + 1; p.elements[14] = clip.w;
    for (const o of this.hide) o.visible = false;
    const old = renderer.getRenderTarget(), sh = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(this.rt); renderer.clear(); renderer.render(scene, v);
    renderer.setRenderTarget(old); renderer.shadowMap.autoUpdate = sh;
    for (const o of this.hide) o.visible = true;
  }
}

const HEAD = `
uniform sampler2D tRefl; uniform sampler2D tPud; uniform float uTime; uniform float uReflOn; uniform vec4 uP; uniform mat4 uReflM;
varying vec3 vWp; varying vec4 vRc;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
vec2 ripple(vec2 p, float t){
  vec2 acc=vec2(0.0);
  for(int i=0;i<2;i++){ vec2 q=p*(1.0+float(i)*0.6)+float(i)*17.3; vec2 c=floor(q); vec2 f=fract(q)-0.5; float r0=h21(c);
    float tt=fract(t*(0.7+r0*0.6)+r0*7.0); vec2 o=(vec2(h21(c+1.7),h21(c+9.2))-0.5)*0.55; vec2 d=f-o; float dist=length(d);
    float ring=sin((dist-tt*0.42)*46.0)*smoothstep(0.07,0.0,abs(dist-tt*0.42))*(1.0-tt); acc+=normalize(d+1e-4)*ring; }
  return acc; }
`;
// opts: strength (basis-spiegeling), puddles (0..1), rain (0/1), micro (verstoring), blur (mip-bias)
export function makeReflective(mat, R, T, o) {
  const uP = { value: new THREE.Vector4(o.strength, o.puddles || 0, o.rain || 0, o.micro || 0) }, blur = (o.blur || 0).toFixed(1);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.tRefl = R.tex; sh.uniforms.uReflM = R.uM; sh.uniforms.tPud = { value: T.puddle }; sh.uniforms.uTime = R.uTime; sh.uniforms.uReflOn = R.uOn; sh.uniforms.uP = uP;
    sh.vertexShader = 'uniform mat4 uReflM; varying vec3 vWp; varying vec4 vRc;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vec4 wp4 = modelMatrix * vec4(transformed, 1.0); vWp = wp4.xyz; vRc = uReflM * wp4;');
    sh.fragmentShader = HEAD.replace('uniform mat4 uReflM;', '') + sh.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        float pn = texture2D(tPud, vWp.xz*0.031).r*0.62 + texture2D(tPud, vWp.xz*0.097+3.7).r*0.38;
        float pud = smoothstep(0.50,0.58,pn)*uP.y;
        diffuseColor.rgb *= mix(1.0, 0.4, pud) * mix(1.0, 0.62, uP.z);`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\n roughnessFactor = mix(roughnessFactor, 0.05, pud);')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { vec3 Vv = normalize(cameraPosition - vWp); float ndv = clamp(Vv.y, 0.0, 1.0);
          vec2 micro = (texture2D(tPud, vWp.xz*0.8).rg - 0.5) * uP.w;
          vec2 rp = ripple(vWp.xz*1.7, uTime) * uP.z * pud;
          vec2 ruv = vRc.xy / vRc.w + micro * (1.0 - pud*0.9) + rp * 0.012;
          vec3 refl = texture2D(tRefl, ruv, mix(${blur}, 0.0, pud)).rgb;
          float fr = pow(1.0 - ndv, 3.0);
          float k = mix(uP.x * (0.3 + 0.7*fr), 0.3 + 0.7*fr, pud);
          totalEmissiveRadiance += refl * k * uReflOn; }`);
  };
  mat.customProgramCacheKey = () => 'refl' + blur;
}
