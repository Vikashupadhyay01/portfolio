/* ── app.js ── */

// ── Custom Cursor ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
  if (cursor) { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
  if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
  requestAnimationFrame(animCursor);
})();
document.querySelectorAll('a,button,.magnetic-btn,.glass-card,.pill').forEach(el => {
  el.addEventListener('mouseenter', () => ring && ring.classList.add('expand'));
  el.addEventListener('mouseleave', () => ring && ring.classList.remove('expand'));
});

// ── Loader ──
window.addEventListener('DOMContentLoaded', () => {
  const loader = document.getElementById('loader');
  const lines = document.querySelectorAll('.loader-line');
  const bar = document.querySelector('.loader-bar');
  if (!loader) return;
  bar.style.width = '100%';
  lines.forEach((l, i) => setTimeout(() => l.classList.add('visible'), 400 + i * 600));
  setTimeout(() => loader.classList.add('done'), 3400);
});

// ── Navbar scroll ──
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Status Bar Dismiss ──
(function initStatusBar() {
  const bar = document.getElementById('statusBar');
  const closeBtn = document.getElementById('statusBarClose');
  if (!bar || !closeBtn) return;
  closeBtn.addEventListener('click', () => bar.classList.add('hidden'));
})();

// ── Mobile Menu ──
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

/* ═══════════════════════════════════════════
   (legacy globe code removed — replaced by the
   live telemetry panel + angular network background)
═══════════════════════════════════════════ */
(function initGlobeUnused() {
  const canvas = document.getElementById('globeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, R;
  let rotation = 0;
  const LAT_STEPS = 8;    // latitude rings
  const LON_STEPS = 12;   // longitude rings
  const SEGMENTS = 64;    // resolution per ring

  // A handful of "threat node" points at fixed lat/lon, pulsing gently
  const nodes = [
    { lat: 28.6, lon: 77.2, label: 'IN' },   // Delhi region
    { lat: 40.7, lon: -74.0, label: 'US' },
    { lat: 51.5, lon: -0.1, label: 'UK' },
    { lat: 35.7, lon: 139.7, label: 'JP' },
    { lat: -33.9, lon: 151.2, label: 'AU' },
    { lat: 52.5, lon: 13.4, label: 'DE' },
    { lat: 1.35, lon: 103.8, label: 'SG' },
    { lat: -23.5, lon: -46.6, label: 'BR' },
  ];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    cx = W * 0.72;              // offset right of center, behind headline
    cy = H * 0.42;
    R = Math.min(W, H) * 0.30;
    if (window.innerWidth <= 768) { cx = W * 0.5; cy = H * 0.24; R = Math.min(W, H) * 0.22; }
  }

  // Project a 3D point (unit sphere) with current rotation to 2D screen space
  function project(x, y, z) {
    // rotate around Y axis
    const cosA = Math.cos(rotation), sinA = Math.sin(rotation);
    const xr = x * cosA - z * sinA;
    const zr = x * sinA + z * cosA;
    // slight tilt around X axis for a more natural globe angle
    const tilt = 0.35;
    const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
    const yr = y * cosT - zr * sinT;
    const zf = y * sinT + zr * cosT;

    const scale = R;
    const persp = 1 / (2.4 - zf); // simple perspective factor
    return {
      x: cx + xr * scale * persp,
      y: cy + yr * scale * persp,
      z: zf,
      persp
    };
  }

  function sphericalToCartesian(latDeg, lonDeg) {
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;
    return {
      x: Math.cos(lat) * Math.sin(lon),
      y: -Math.sin(lat),
      z: Math.cos(lat) * Math.cos(lon)
    };
  }

  function drawRing(points, alphaBase) {
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= points.length; i++) {
      const p = points[i % points.length];
      if (p.z < -0.15) { started = false; continue; } // hide far side to reduce clutter
      if (!started) { ctx.moveTo(p.x, p.y); started = true; }
      else ctx.lineTo(p.x, p.y);
    }
    const alpha = alphaBase;
    ctx.strokeStyle = `rgba(91,141,239,${alpha})`;
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Outer glow disc
    const grad = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.15);
    grad.addColorStop(0, 'rgba(91,141,239,0.09)');
    grad.addColorStop(1, 'rgba(91,141,239,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.fill();

    // Latitude rings (horizontal circles)
    for (let i = 1; i < LAT_STEPS; i++) {
      const latDeg = -90 + (180 / LAT_STEPS) * i;
      const pts = [];
      for (let s = 0; s <= SEGMENTS; s++) {
        const lonDeg = (360 / SEGMENTS) * s;
        const v = sphericalToCartesian(latDeg, lonDeg);
        pts.push(project(v.x, v.y, v.z));
      }
      drawRing(pts, 0.14);
    }

    // Longitude rings (vertical half-meridians)
    for (let i = 0; i < LON_STEPS; i++) {
      const lonDeg = (360 / LON_STEPS) * i;
      const pts = [];
      for (let s = 0; s <= SEGMENTS; s++) {
        const latDeg = -90 + (180 / SEGMENTS) * s;
        const v = sphericalToCartesian(latDeg, lonDeg);
        pts.push(project(v.x, v.y, v.z));
      }
      drawRing(pts, 0.11);
    }

    // Outer rim circle for a crisp edge
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(91,141,239,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Threat nodes with pulse + connecting arcs to a "home" node (India)
    const projected = nodes.map(n => {
      const v = sphericalToCartesian(n.lat, n.lon);
      return { ...project(v.x, v.y, v.z), raw: v };
    });

    const home = projected[0];
    projected.forEach((p, idx) => {
      if (p.z < -0.15) return; // behind globe
      const alpha = Math.max(0.15, Math.min(1, (p.z + 1) / 1.6));

      // connecting arc to home node (skip self)
      if (idx !== 0 && home.z > -0.15) {
        ctx.beginPath();
        const midX = (p.x + home.x) / 2;
        const midY = (p.y + home.y) / 2 - 24;
        ctx.moveTo(home.x, home.y);
        ctx.quadraticCurveTo(midX, midY, p.x, p.y);
        ctx.strokeStyle = `rgba(227,168,87,${0.16 * alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // node glow
      const pulse = 1 + Math.sin(Date.now() / 600 + idx) * 0.35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.4 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143,169,214,${0.9 * alpha})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(91,141,239,${0.15 * alpha})`;
      ctx.fill();
    });

    rotation += 0.0016; // continuous slow rotation
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// ── Hero Network Canvas ──
(function initCanvas() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: 0, y: 0 };

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    nodes = [];
    const cols = Math.max(5, Math.round(W / 190));
    const rows = Math.max(4, Math.round(H / 190));
    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        if (Math.random() > 0.78) continue; // skip some grid points → sparse but visible
        nodes.push({
          x: (W / cols) * i + (Math.random() - 0.5) * 90,
          y: (H / rows) * j + (Math.random() - 0.5) * 90,
          vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15,
          r: Math.random() * 1.4 + (Math.random() > 0.82 ? 2.6 : 1.1),
          big: Math.random() > 0.82,
          pulse: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const CONNECT_DIST = Math.max(W, H) * 0.2;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(91,141,239,${0.22 * (1 - dist / CONNECT_DIST)})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      n.x += n.vx + (mouse.x - W / 2) * 0.00004;
      n.y += n.vy + (mouse.y - H / 2) * 0.00004;
      if (n.x < -20 || n.x > W + 20) n.vx *= -1;
      if (n.y < -20 || n.y > H + 20) n.vy *= -1;
      n.pulse += 0.02;
      const pulseR = n.r * (1 + Math.sin(n.pulse) * 0.25);
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2);
      ctx.fillStyle = n.big ? 'rgba(91,141,239,0.85)' : 'rgba(143,169,214,0.5)';
      ctx.fill();
      if (n.big) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, pulseR * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(91,141,239,0.08)';
        ctx.fill();
      }
    });
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('resize', () => { resize(); createNodes(); });
  resize(); createNodes(); draw();
  // re-measure shortly after load in case fonts/layout shifted canvas size
  window.addEventListener('load', () => { resize(); createNodes(); });
  setTimeout(() => { resize(); createNodes(); }, 300);
})();

/* ═══════════════════════════════════════════
   LIVE TELEMETRY PANEL — simulated ops feed
═══════════════════════════════════════════ */
(function initTelemetry() {
  const log = document.getElementById('tpLog');
  if (!log) return;

  const EVENTS = [
    { tag: 'critical', label: 'CRITICAL', msg: 'Suspicious SYN flood pattern flagged', meta: '192.168.1.45:80' },
    { tag: 'high',     label: 'HIGH',     msg: 'Embedded JS found in PDF payload',     meta: 'sample_report.pdf' },
    { tag: 'medium',   label: 'MEDIUM',   msg: 'SPF / Return-Path mismatch detected',  meta: 'phish_test.eml' },
    { tag: 'info',     label: 'INFO',     msg: 'Nmap service scan completed',          meta: '24 ports open' },
    { tag: 'info',     label: 'INFO',     msg: 'Burp Suite scan session started',      meta: 'staging.target.local' },
    { tag: 'medium',   label: 'MEDIUM',   msg: 'Outdated TLS cipher suite found',      meta: 'Score: 78/100' },
    { tag: 'high',     label: 'HIGH',     msg: 'Unauthorized USB device blocked',      meta: 'Storage Blocker' },
    { tag: 'info',     label: 'INFO',     msg: 'Wireshark capture parsed',             meta: '< 240ms' },
    { tag: 'critical', label: 'CRITICAL', msg: 'Exploit attempt on CVE-2023-21554',    meta: 'lab-range-03' },
    { tag: 'info',     label: 'INFO',     msg: 'VulneraSim range reset to baseline',   meta: 'Docker cluster' },
  ];

  const MAX_ROWS = 4;
  let idx = 0;

  function addRow() {
    const e = EVENTS[idx % EVENTS.length];
    idx++;
    const row = document.createElement('div');
    row.className = 'tp-row';
    row.innerHTML = `
      <span class="tp-tag ${e.tag}">${e.label}</span>
      <span class="tp-msg">${e.msg}</span>
      <span class="tp-meta">${e.meta}</span>
    `;
    log.prepend(row);
    while (log.children.length > MAX_ROWS) log.removeChild(log.lastChild);
  }

  for (let i = 0; i < MAX_ROWS; i++) addRow();
  setInterval(addRow, 2600);
})();

// ── Typed Role Animation ──
(function initTyped() {
  const el = document.getElementById('typedRole');
  if (!el) return;
  const roles = ['Cyber Security Engineer', 'SOC Analyst', 'Threat Hunter', 'Incident Responder', 'Penetration Tester', 'Blue Team Engineer', 'Bug Bounty Hunter'];
  let ri = 0, ci = 0, deleting = false;
  function type() {
    const role = roles[ri];
    if (!deleting) {
      el.textContent = role.slice(0, ++ci);
      if (ci === role.length) { deleting = true; return setTimeout(type, 2000); }
    } else {
      el.textContent = role.slice(0, --ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
    }
    setTimeout(type, deleting ? 40 : 80);
  }
  setTimeout(type, 3600);
})();

// ── Scroll Reveal ──
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal-up,.reveal-left,.reveal-right').forEach((el, i) => {
    el.style.transitionDelay = (i % 6) * 0.08 + 's';
    obs.observe(el);
  });
})();

// ── Counter Animation ──
(function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = target / 60;
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.ceil(current) + suffix;
        if (current >= target) clearInterval(interval);
      }, 20);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.ach-num').forEach(el => obs.observe(el));
})();

// ── Magnetic Buttons ──
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.15}px,${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
});

// ── Smooth scroll for nav links ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ═══════════════════════════════════════════
   CONTACT SECTION — JS
═══════════════════════════════════════════ */

// ── Contact micro-canvas (background nodes) ──
(function initContactCanvas() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const N = 28;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function mkPt() { return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }; }
  function init() { pts = Array.from({ length: N }, mkPt); }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(143,169,214,.32)'; ctx.fill();
    });
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
      if (d < 120) {
        ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
        ctx.strokeStyle = `rgba(91,141,239,${.11 * (1 - d / 120)})`; ctx.lineWidth = .5; ctx.stroke();
      }
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', () => { resize(); init(); });
  resize(); init(); tick();
})();

// ── Card tilt on mouse move ──
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

// ── EmailJS Contact Form ──
(function initContactForm() {

  // ════════════════════════════════════════════════════════════
  //  EMAILJS CONFIGURATION
  //  Step 1: Sign up free at https://www.emailjs.com
  //  Step 2: Add a Gmail service → copy the Service ID below
  //  Step 3: Create an email template → copy the Template ID below
  //  Step 4: Go to Account → API Keys → copy your Public Key below
  //  Step 5: In your EmailJS template set these variables:
  //          {{from_name}}   {{from_email}}   {{subject}}   {{message}}
  //          "To Email" in template settings → v.vupadhyay0101@gmail.com
  // ════════════════════════════════════════════════════════════
  const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';    // ← paste here
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';    // ← paste here
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';   // ← paste here
  // ════════════════════════════════════════════════════════════

  const configured = ![EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID]
    .some(v => v.startsWith('YOUR_'));

  if (!configured) {
    console.warn(
      '[ContactForm] EmailJS is NOT configured yet.\n' +
      'Open app.js and replace YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, YOUR_TEMPLATE_ID\n' +
      'with real values from https://www.emailjs.com'
    );
  }

  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const form = document.getElementById('contactForm');
  const btn = document.getElementById('formSubmitBtn');
  const feedback = document.getElementById('formSuccess');
  if (!form || !btn) return;

  let isSending = false;

  function validate() {
    const fields = {
      name: { el: form.querySelector('#fname'), label: 'Full Name' },
      email: { el: form.querySelector('#femail'), label: 'Email Address' },
      subject: { el: form.querySelector('#fsubject'), label: 'Subject' },
      message: { el: form.querySelector('#fmessage'), label: 'Message' },
    };
    const errors = [];
    Object.values(fields).forEach(({ el, label }) => {
      el.classList.remove('input-error');
      const val = el.value.trim();
      if (!val) { errors.push(`${label} is required.`); el.classList.add('input-error'); return; }
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors.push('Please enter a valid email address.'); el.classList.add('input-error');
      }
    });
    return errors;
  }

  function showToast(type, message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast) return;
    toast.className = `toast toast-${type} toast-show`;
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    toastMsg.textContent = message;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'toast'; }, 6000);
  }

  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className = `form-success ${type === 'error' ? 'form-error' : ''} show`;
  }
  function hideFeedback() {
    if (feedback) feedback.className = 'form-success';
  }

  function setBtnLoading() {
    btn.classList.add('loading');
    btn.disabled = true;
  }
  function setBtnReset(label = 'Send Message', success = false) {
    btn.classList.remove('loading');
    btn.disabled = false;
    const txt = btn.querySelector('.submit-text');
    if (txt) txt.textContent = label;
    btn.style.background = success ? '#4ADE80' : '';
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (isSending) return;

    hideFeedback();
    const errors = validate();
    if (errors.length) {
      showFeedback('error', errors[0]);
      showToast('error', errors[0]);
      return;
    }

    if (!configured) {
      console.info('[ContactForm] Running in demo mode (EmailJS not configured).');
      isSending = true;
      setBtnLoading();
      await new Promise(r => setTimeout(r, 1800));
      setBtnReset('Message Sent ✓', true);
      showFeedback('success', '✓ [Demo] Form works! Configure EmailJS to send real emails.');
      showToast('success', 'Demo mode: configure EmailJS in app.js to deliver real emails.');
      setTimeout(() => { form.reset(); setBtnReset(); hideFeedback(); isSending = false; }, 5000);
      return;
    }

    isSending = true;
    setBtnLoading();

    try {
      const templateParams = {
        from_name: form.querySelector('#fname').value.trim(),
        from_email: form.querySelector('#femail').value.trim(),
        subject: form.querySelector('#fsubject').value.trim(),
        message: form.querySelector('#fmessage').value.trim(),
        to_email: 'v.vupadhyay0101@gmail.com',
      };

      console.info('[ContactForm] Sending via EmailJS…', templateParams);
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      console.info('[ContactForm] Email delivered successfully.');

      setBtnReset('Message Sent ✓', true);
      showFeedback('success', '✓ Message delivered! I\'ll respond within 24 hours.');
      showToast('success', 'Message sent successfully! Expect a reply within 24 hours.');

      setTimeout(() => {
        form.reset();
        setBtnReset('Send Message', false);
        hideFeedback();
        isSending = false;
      }, 5000);

    } catch (err) {
      console.error('[ContactForm] EmailJS send failed:', err);
      const errMsg = err?.text || err?.message || 'Unknown error. Check console.';
      setBtnReset('Try Again', false);
      showFeedback('error', `✕ Failed to send. ${errMsg}`);
      showToast('error', 'Could not deliver message. Please try emailing directly.');
      isSending = false;
    }
  });

  form.querySelectorAll('.form-input').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });

})();
