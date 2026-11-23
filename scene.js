import * as THREE from 'three';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sec = document.getElementById('kit');
const cv = document.getElementById('kitCv');
const chap = [...document.querySelectorAll('#chap li')];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

let target = reduce ? 1 : 0, cur = target, chapI = -1;
function progress() {
  const r = sec.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - innerHeight));
}
function setChap(p) {
  const i = p < .22 ? 0 : p < .48 ? 1 : p < .74 ? 2 : 3;
  if (i === chapI) return; chapI = i;
  chap.forEach((li, k) => li.classList.toggle('on', k === i));
}
if (!reduce) { addEventListener('scroll', () => { target = progress(); setChap(target); }, { passive: true }); target = progress(); setChap(target); }
else chap.forEach(li => li.classList.add('on'));

try {
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 60);
  const mobile = () => innerWidth < 900;

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfbd, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(4, 7, 6); scene.add(key);
  const fill = new THREE.DirectionalLight(0xdfe8ff, .9); fill.position.set(-6, 3, 3); scene.add(fill);

  const M = {
    denim: new THREE.MeshStandardMaterial({ color: 0x2F5D9E, roughness: .38, metalness: .1 }),
    rust: new THREE.MeshStandardMaterial({ color: 0xD4472B, roughness: .38, metalness: .1 }),
    skin: new THREE.MeshStandardMaterial({ color: 0xF6F2E8, roughness: .85 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xC4C8D0, roughness: .35, metalness: .55 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2A3242, roughness: .5, metalness: .4 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xE3A91F, roughness: .3, metalness: .55, emissive: 0x4a3200, emissiveIntensity: .35 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xB98A5E, roughness: .6 })
  };
  const seg = mobile() ? 36 : 64;

  /* барабан: корпус + пластик + обручи, ось по Y */
  function drum(r, h, shell, skinSeg = seg) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, skinSeg), shell); g.add(body);
    [h / 2, -h / 2].forEach(y => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(r, r * .045, 10, skinSeg), M.metal); hoop.rotation.x = Math.PI / 2; hoop.position.y = y; g.add(hoop);
    });
    const skin = new THREE.Mesh(new THREE.CylinderGeometry(r * .985, r * .985, .02, skinSeg), M.skin); skin.position.y = h / 2 + .01; g.add(skin);
    g.userData.skin = skin;
    const lugs = Math.max(6, Math.round(r * 9));
    for (let i = 0; i < lugs; i++) { const a = i / lugs * Math.PI * 2; const l = new THREE.Mesh(new THREE.BoxGeometry(.05, h * .55, .05), M.metal); l.position.set(Math.cos(a) * (r + .02), 0, Math.sin(a) * (r + .02)); g.add(l); }
    return g;
  }
  function cymbal(r) {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * .96, .035, seg, 1), M.brass); g.add(c);
    const bell = new THREE.Mesh(new THREE.SphereGeometry(r * .2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.brass); bell.position.y = .015; g.add(bell);
    return g;
  }
  const pole = (x, y0, y1, z, m = M.metal, rad = .035) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, y1 - y0, 10), m); p.position.set(x, (y0 + y1) / 2, z); return p; };

  const parts = [];
  const add = (obj, a, b, from = 'up') => { obj.userData.win = [a, b]; obj.userData.from = from; obj.userData.base = obj.position.clone(); obj.userData.bs = obj.scale.clone(); scene.add(obj); parts.push(obj); return obj; };

  /* бас-барабан */
  const bass = drum(1, 1.05, M.denim); bass.rotation.x = Math.PI / 2; const bassG = new THREE.Group(); bassG.add(bass); bassG.position.set(0, 1.05, 0); add(bassG, 0, .2, 'down');
  [-.55, .55].forEach(x => { const leg = pole(x, -1.05, -.2, .8, M.metal, .03); leg.rotation.z = x * .25; bassG.add(leg); });
  /* малый */
  const snare = drum(.58, .3, M.rust); const snareG = new THREE.Group(); snareG.add(snare); snareG.position.set(-1.65, 1.5, 1.1); snareG.add(Object.assign(pole(0, -1.4, -.2, 0), {})); add(snareG, .2, .38);
  /* том-томы на бас-барабане */
  const t1 = drum(.42, .38, M.denim), t2 = drum(.46, .42, M.denim);
  const t1G = new THREE.Group(); t1G.add(t1); t1G.position.set(-.55, 2.28, .45); t1G.rotation.x = .28; add(t1G, .36, .52);
  const t2G = new THREE.Group(); t2G.add(t2); t2G.position.set(.58, 2.3, .45); t2G.rotation.x = .28; add(t2G, .44, .6);
  /* хай-хэт */
  const hh = new THREE.Group(); const h1 = cymbal(.5), h2 = cymbal(.5); h1.position.y = .06; h2.position.y = -.02; h2.rotation.x = Math.PI; hh.add(h1, h2); hh.position.set(-2.7, 2.05, .2); hh.add(pole(0, -2.05, -.05, 0)); add(hh, .5, .66);
  /* напольный том */
  const ft = drum(.68, .78, M.denim); const ftG = new THREE.Group(); ftG.add(ft); ftG.position.set(2.15, 1.1, .55); [0, 2.1, 4.2].forEach(a => { const leg = pole(Math.cos(a) * .6, -1.1, -.35, Math.sin(a) * .6, M.metal, .035); ftG.add(leg); }); add(ftG, .58, .74);
  /* крэш */
  const cr = new THREE.Group(); const c1 = cymbal(.78); c1.rotation.z = .12; cr.add(c1); cr.add(Object.assign(pole(0, -2.7, -.05, 0), {})); cr.position.set(2.35, 2.95, -.3); add(cr, .72, .88);
  /* райд */
  const rd = new THREE.Group(); const c2 = cymbal(.85); c2.rotation.z = -.1; rd.add(c2); rd.add(pole(0, -2.7, -.05, 0)); rd.position.set(-1.85, 3.1, -.45); add(rd, .66, .82);

  /* тень на полу */
  const sc = document.createElement('canvas'); sc.width = sc.height = 128; const sx = sc.getContext('2d');
  const gr = sx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(24,32,46,.28)'); gr.addColorStop(1, 'rgba(24,32,46,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, .005, .4); scene.add(shadow);

  /* палочки */
  const stick = () => { const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.CylinderGeometry(.028, .045, 1.5, 10), M.wood); s.position.y = .75; g.add(s); const tip = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), M.wood); g.add(tip); return g; };
  const stL = stick(), stR = stick(); scene.add(stL, stR);
  stL.position.set(-1.65, 1.92, 1.1); stR.position.set(-.55, 2.78, .45);

  function layout() {
    const r = cv.parentElement.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { layout(); if (reduce) frame(0); }); ro.observe(cv.parentElement); layout();

  let mx = 0, my = 0, cmx = 0, cmy = 0;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  let t0 = performance.now(), alive = true;
  function frame(time) {
    cur += (target - cur) * (reduce ? 1 : .09); const p = cur;
    cmx += (mx - cmx) * .05; cmy += (my - cmy) * .05;
    parts.forEach(o => {
      const [a, b] = o.userData.win; const t = clamp((p - a) / (b - a));
      const k = easeBack(t);
      o.visible = t > 0;
      const dy = o.userData.from === 'down' ? -1 : 1;
      o.position.set(o.userData.base.x, o.userData.base.y + (1 - ease(t)) * 5 * dy, o.userData.base.z);
      o.scale.copy(o.userData.bs).multiplyScalar(Math.max(.001, k));
      o.rotation.y = (1 - ease(t)) * 2.2;
    });
    /* игра: после сборки палочки бьют */
    const play = clamp((p - .88) / .1), tt = time / 1000;
    const hitA = Math.pow(Math.max(0, Math.sin(tt * 6.3)), 6), hitB = Math.pow(Math.max(0, Math.sin(tt * 6.3 + Math.PI)), 6);
    const up = -.55;
    stL.visible = stR.visible = play > 0;
    stL.scale.setScalar(Math.max(.001, play)); stR.scale.setScalar(Math.max(.001, play));
    const aL = reduce ? up : up + hitA * -.55, aR = reduce ? up : up + hitB * -.55;
    stL.rotation.set(.6 + (reduce ? 0 : hitA * .35) , 0, -.25); stL.position.y = 1.92 + (reduce ? 0 : (1 - hitA) * .18) ;
    stR.rotation.set(.6 + (reduce ? 0 : hitB * .35), 0, .25); stR.position.y = 2.78 + (reduce ? 0 : (1 - hitB) * .18);
    snareG.userData.base && (snare.userData.skin.scale.y = 1 + hitA * 1.4);
    t1.userData.skin.scale.y = 1 + hitB * 1.4;
    const ang = -.38 + p * .95;
    const R = mobile() ? 12.2 : 11.8;
    camera.position.set(Math.sin(ang + cmx * .4) * R, 3.2 - cmy * .8 + (mobile() ? .4 : 0), Math.cos(ang + cmx * .4) * R);
    camera.lookAt(0, 1.6, 0);
    renderer.render(scene, camera);
  }
  let vis = true;
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(sec);
  function loop(time) { if (alive && vis && !document.hidden) frame(time); requestAnimationFrame(loop); }
  if (reduce) frame(0); else requestAnimationFrame(loop);
  document.documentElement.classList.add('gl');
} catch (e) {
  console.error('WebGL недоступен', e);
  document.documentElement.classList.add('nogl');
}
