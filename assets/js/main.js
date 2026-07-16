/* ==========================================================================
   RSM365 — front-end behaviour
   - Hero 3D vortex (three.js) — logo marki ożywione jako wir cząsteczek
   - Auto-hide header, mobile nav, scroll reveal
   ========================================================================== */

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ */
/*  Mobile navigation                                                 */
/* ------------------------------------------------------------------ */
const toggle = document.querySelector('.nav-toggle');
const mobileNav = document.getElementById('mobile-nav');
const menuOpen = () => toggle && toggle.getAttribute('aria-expanded') === 'true';
const closeMenu = () => {
  if (!toggle || !mobileNav) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Otwórz menu');
  mobileNav.hidden = true;
};
if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    if (menuOpen()) { closeMenu(); }
    else {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Zamknij menu');
      mobileNav.hidden = false;
    }
  });
  mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menuOpen()) { closeMenu(); toggle.focus(); } });
}

/* ------------------------------------------------------------------ */
/*  Header: scrolled state + auto-hide on scroll down                 */
/* ------------------------------------------------------------------ */
const header = document.querySelector('.site-header');
let lastY = window.scrollY;
const onHeaderScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 12);
  if (menuOpen()) {
    closeMenu();
    header.classList.remove('is-hidden');
  } else if (y > lastY + 4 && y > 140) {
    header.classList.add('is-hidden');
  } else if (y < lastY - 4 || y <= 140) {
    header.classList.remove('is-hidden');
  }
  lastY = y;
};
onHeaderScroll();
window.addEventListener('scroll', onHeaderScroll, { passive: true });

/* ------------------------------------------------------------------ */
/*  Scroll reveal — position-based, no IntersectionObserver needed    */
/* ------------------------------------------------------------------ */
const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
if (prefersReduced) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const check = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    for (let i = revealEls.length - 1; i >= 0; i--) {
      const el = revealEls[i];
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92 && r.bottom > 0) { el.classList.add('is-in'); revealEls.splice(i, 1); }
    }
  };
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { check(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', check);
  check();
}

/* ------------------------------------------------------------------ */
/*  Footer year                                                       */
/* ------------------------------------------------------------------ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ------------------------------------------------------------------ */
/*  Hero 3D vortex — logo RSM365 jako wir cząsteczek                  */
/* ------------------------------------------------------------------ */
const canvas = document.getElementById('hero-canvas');

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (_) { return false; }
}

if (canvas && supportsWebGL()) {
  import('three').then((THREE) => initHero(THREE, canvas)).catch(() => { /* graceful: CSS gradient remains */ });
}

function initHero(THREE, canvas) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 9.5);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);

  /* Kolory ramion — tęcza logo RSM365 */
  const ARM_COLORS = ['#00d084', '#0ecbc0', '#45a4f6', '#3f51b5', '#9033fb', '#d6219c', '#f2314e', '#fcb900'];
  const ARMS = ARM_COLORS.length;
  const PER_ARM = 240;

  const group = new THREE.Group();
  group.position.x = 2.6;
  group.rotation.x = 0.52;           // widok "galaktyki" pod kątem
  scene.add(group);

  /* soft round sprite */
  function dotTexture() {
    const s = 64;
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d');
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.9)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
    const tex = new THREE.CanvasTexture(cv);
    tex.needsUpdate = true;
    return tex;
  }
  const sprite = dotTexture();

  /* --- Wir: 8 logarytmicznych ramion jak w logo --- */
  const R_IN = 0.55, R_OUT = 3.1, SWIRL = 2.4;
  const count = ARMS * PER_ARM;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const phase = new Float32Array(count);   // do falowania w pętli
  const tmp = new THREE.Color();

  let k = 0;
  for (let a = 0; a < ARMS; a++) {
    tmp.set(ARM_COLORS[a]);
    const base = (a / ARMS) * Math.PI * 2;
    for (let i = 0; i < PER_ARM; i++) {
      const t = i / (PER_ARM - 1);                       // 0..1 wzdłuż ramienia
      const r = R_IN + (R_OUT - R_IN) * Math.pow(t, 0.85);
      const ang = base + SWIRL * t + (Math.random() - 0.5) * 0.10;
      const jitter = (Math.random() - 0.5) * 0.16 * t;
      pos[k * 3]     = Math.cos(ang) * (r + jitter);
      pos[k * 3 + 1] = Math.sin(ang) * (r + jitter);
      pos[k * 3 + 2] = (Math.random() - 0.5) * 0.35 * (1 - t * 0.5);
      col[k * 3] = tmp.r; col[k * 3 + 1] = tmp.g; col[k * 3 + 2] = tmp.b;
      phase[k] = Math.random() * Math.PI * 2;
      k++;
    }
  }
  const vortexGeo = new THREE.BufferGeometry();
  vortexGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  vortexGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const vortex = new THREE.Points(vortexGeo, new THREE.PointsMaterial({
    size: 0.075, map: sprite, vertexColors: true,
    transparent: true, opacity: 0.92, depthWrite: false, sizeAttenuation: true,
  }));
  group.add(vortex);

  /* --- Pierścień zewnętrzny (cienka obwódka wiru) --- */
  const ringGeo = new THREE.TorusGeometry(R_OUT * 1.12, 0.012, 8, 140);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xd3d8e8, transparent: true, opacity: 0.55 }));
  group.add(ring);

  /* --- Drobny pył wokół --- */
  const dustCount = 220;
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const r = 3.6 + Math.random() * 3.4;
    const th = Math.random() * Math.PI * 2;
    dustPos[i * 3] = Math.cos(th) * r;
    dustPos[i * 3 + 1] = Math.sin(th) * r * 0.8;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 2.2;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
    size: 0.045, map: sprite, color: 0x9aa3c4,
    transparent: true, opacity: 0.5, depthWrite: false,
  }));
  group.add(dust);

  /* --- Resize: samonaprawiający się wzorzec (bufor = box CSS co klatkę) --- */
  function syncSize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 2 || h < 2) return false;
    const pr = Math.min(window.devicePixelRatio || 1, 2);
    const needW = Math.floor(w * pr);
    const needH = Math.floor(h * pr);
    if (canvas.width === needW && canvas.height === needH) return false;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.x = w > 900 ? 2.6 : 0;
    const scale = w > 900 ? 1 : 0.8;
    group.scale.setScalar(scale);
    return true;
  }
  syncSize();

  /* --- Parallax myszy --- */
  const targetRot = { x: 0.52, y: 0 };
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    targetRot.y = nx * 0.28;
    targetRot.x = 0.52 + ny * 0.16;
  }, { passive: true });

  /* --- Gating: karta niewidoczna / hero poza ekranem --- */
  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });
  let inView = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((ents) => { inView = ents[0].isIntersecting; }, { threshold: 0.01 })
      .observe(canvas);
  }

  /* --- Pętla --- */
  const clock = new THREE.Clock();
  const posAttr = vortexGeo.attributes.position;
  function frame() {
    requestAnimationFrame(frame);
    if (!visible || !inView) return;
    syncSize();
    const t = clock.getElapsedTime();

    group.rotation.z = t * 0.12;                       // powolna rotacja wiru
    group.rotation.y += (targetRot.y - group.rotation.y) * 0.04;
    group.rotation.x += (targetRot.x - group.rotation.x) * 0.04;

    /* delikatne "oddychanie" cząsteczek w osi Z */
    for (let i = 0; i < count; i += 7) {              // co 7. cząsteczka — tanio
      posAttr.array[i * 3 + 2] += Math.sin(t * 1.4 + phase[i]) * 0.0011;
    }
    posAttr.needsUpdate = true;

    ring.rotation.z = -t * 0.05;
    dust.rotation.z = t * 0.02;

    renderer.render(scene, camera);
  }

  if (prefersReduced) {
    const renderStatic = () => {
      if (!syncSize() && canvas.width < 2) { requestAnimationFrame(renderStatic); return; }
      renderer.render(scene, camera);
    };
    renderStatic();
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => { if (syncSize()) renderer.render(scene, camera); }).observe(canvas);
    }
  } else {
    frame();
  }
}
