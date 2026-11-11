// Regen: dunne lichtgevende strepen rond de camera (alleen buiten)
import * as THREE from 'three';
export function makeRain(count) {
  const base = new THREE.PlaneGeometry(1, 1), g = new THREE.InstancedBufferGeometry();
  g.index = base.index; g.setAttribute('position', base.attributes.position); g.setAttribute('uv', base.attributes.uv);
  const seed = new Float32Array(count * 4); for (let i = 0; i < seed.length; i++) seed[i] = Math.random();
  g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seed, 4)); g.instanceCount = count;
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uCam: { value: new THREE.Vector3() }, uAmt: { value: 1 } },
    vertexShader: `attribute vec4 aSeed; uniform float uTime; uniform vec3 uCam; varying float vA; varying vec2 vUv; varying vec3 vW;
      void main(){ const float R=16.0; const float H=14.0;
        float sp = 10.0 + aSeed.w*5.0; vec3 p; p.y = mod(aSeed.y*H - uTime*sp, H);
        vec2 w = vec2(0.10, 0.04);
        p.xz = aSeed.xz*2.0*R + w*(H-p.y); p.xz = mod(p.xz - uCam.xz + R, 2.0*R) - R + uCam.xz;
        vec3 dir = normalize(vec3(-w.x, 1.0, -w.y)); vec3 toCam = normalize(uCam - p); vec3 side = normalize(cross(dir, toCam));
        float len = 0.32 + aSeed.w*0.3; vec3 wp = p + dir*position.y*len + side*position.x*0.011;
        vW = wp; vUv = uv; float d = distance(wp, uCam); vA = smoothstep(16.0, 9.0, d) * smoothstep(0.4, 1.6, d);
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0); }`,
    fragmentShader: `uniform float uAmt; varying float vA; varying vec2 vUv; varying vec3 vW;
      void main(){ if (vW.z < 0.32) discard; float a = (1.0 - abs(vUv.x-0.5)*2.0) * sin(vUv.y*3.14159) * vA * uAmt;
        gl_FragColor = vec4(vec3(0.55,0.7,0.9)*a*0.55, a); }`
  });
  const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 20; return m;
}
