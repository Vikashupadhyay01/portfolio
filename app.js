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

// ── Mobile Menu ──
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', () => mobileMenu.classList.remove('open')));
}

// ── Hero Network Canvas ──
(function initCanvas() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: 0, y: 0 };
  const NODE_COUNT = 60, CONNECT_DIST = 130;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createNodes() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
        r: Math.random() * 2 + 1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx + (mouse.x - W / 2) * 0.00008;
      n.y += n.vy + (mouse.y - H / 2) * 0.00008;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(110,231,255,0.4)';
      ctx.fill();
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(110,231,255,${0.15 * (1 - dist / CONNECT_DIST)})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('resize', () => { resize(); createNodes(); });
  resize(); createNodes(); draw();
})();

// ── Typed Role Animation ──
(function initTyped() {
  const el = document.getElementById('typedRole');
  if (!el) return;
  const roles = ['Cyber Security Engineer','SOC Analyst','Threat Hunter','Incident Responder','Penetration Tester','Blue Team Engineer','Bug Bounty Hunter'];
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

// ── Terminal Animation ──
(function initTerminal() {
  const cmdEl = document.getElementById('termCmd');
  const outEl = document.getElementById('termOutput');
  if (!cmdEl || !outEl) return;
  const cmd = 'connect --vikash';
  const entries = [
    { key: 'LinkedIn', val: 'VikashUpadhyay', check: true },
    { key: 'GitHub', val: 'vikash0101', check: true },
    { key: 'Email', val: 'v.vupadhyay0101@gmail.com', check: true },
    { key: 'Phone', val: '+91-9343546665', check: true },
    { key: 'Status', val: 'Open to Work ✓', check: true },
  ];
  let triggered = false;
  const section = document.getElementById('contact');
  const obs = new IntersectionObserver(e => {
    if (e[0].isIntersecting && !triggered) {
      triggered = true;
      let i = 0;
      const typeCmd = setInterval(() => {
        cmdEl.textContent = cmd.slice(0, ++i);
        if (i >= cmd.length) {
          clearInterval(typeCmd);
          entries.forEach((entry, idx) => {
            setTimeout(() => {
              const div = document.createElement('div');
              div.className = 't-entry';
              div.innerHTML = `<span class="t-key">${entry.key}</span><span class="t-val">${entry.val}</span>${entry.check ? '<span class="t-check">✓</span>' : ''}`;
              div.style.opacity = 0;
              div.style.transform = 'translateY(8px)';
              div.style.transition = 'all .4s';
              outEl.appendChild(div);
              setTimeout(() => { div.style.opacity = 1; div.style.transform = 'none'; }, 50);
            }, idx * 300);
          });
        }
      }, 70);
    }
  }, { threshold: 0.4 });
  if (section) obs.observe(section);
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
   CONTACT SECTION v2 — JS
═══════════════════════════════════════════ */

// ── Contact micro-canvas (background nodes) ──
(function initContactCanvas() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, pts = [];
  const N = 30;
  function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
  function mkPt() { return { x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.3 }; }
  function init() { pts = Array.from({length:N}, mkPt); }
  function tick() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2);
      ctx.fillStyle='rgba(110,231,255,.35)'; ctx.fill();
    });
    for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) {
      const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y, d=Math.hypot(dx,dy);
      if(d<120){ ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`rgba(110,231,255,${.12*(1-d/120)})`; ctx.lineWidth=.5; ctx.stroke(); }
    }
    requestAnimationFrame(tick);
  }
  window.addEventListener('resize', ()=>{ resize(); init(); });
  resize(); init(); tick();
})();

// ── Card tilt on mouse move ──
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width/2) / (r.width/2);
    const y = (e.clientY - r.top - r.height/2) / (r.height/2);
    card.style.transform = `translateY(-8px) rotateX(${-y*4}deg) rotateY(${x*4}deg) scale(1.01)`;
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

  // Guard: warn in console if not yet configured
  const configured = ![EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID]
    .some(v => v.startsWith('YOUR_'));

  if (!configured) {
    console.warn(
      '[ContactForm] EmailJS is NOT configured yet.\n' +
      'Open app.js and replace YOUR_PUBLIC_KEY, YOUR_SERVICE_ID, YOUR_TEMPLATE_ID\n' +
      'with real values from https://www.emailjs.com\n' +
      'See the comments above initContactForm() for step-by-step instructions.'
    );
  }

  // Initialise EmailJS with public key
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }

  const form    = document.getElementById('contactForm');
  const btn     = document.getElementById('formSubmitBtn');
  const feedback = document.getElementById('formSuccess');
  if (!form || !btn) return;

  let isSending = false; // prevent duplicate submissions

  // ── Field validation ──
  function validate() {
    const fields = {
      name:    { el: form.querySelector('#fname'),    label: 'Full Name' },
      email:   { el: form.querySelector('#femail'),   label: 'Email Address' },
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

  // ── Toast helper ──
  function showToast(type, message) {
    const toast   = document.getElementById('toast');
    const toastMsg  = document.getElementById('toastMsg');
    const toastIcon = document.getElementById('toastIcon');
    if (!toast) return;
    toast.className = `toast toast-${type} toast-show`;
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    toastMsg.textContent  = message;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'toast'; }, 6000);
  }

  // ── Inline feedback helper ──
  function showFeedback(type, message) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.className   = `form-success ${type === 'error' ? 'form-error' : ''} show`;
  }
  function hideFeedback() {
    if (feedback) feedback.className = 'form-success';
  }

  // ── Button state helpers ──
  function setBtnLoading() {
    btn.classList.add('loading');
    btn.disabled = true;
  }
  function setBtnReset(label = 'Send Message', success = false) {
    btn.classList.remove('loading');
    btn.disabled = false;
    const txt = btn.querySelector('.submit-text');
    if (txt) txt.textContent = label;
    btn.style.background = success
      ? 'linear-gradient(135deg,#22c55e,#16a34a)'
      : '';
  }

  // ── Form submit ──
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

    // Not configured yet → simulate success so UI can be tested
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

    // Real EmailJS send
    isSending = true;
    setBtnLoading();

    try {
      const templateParams = {
        from_name:  form.querySelector('#fname').value.trim(),
        from_email: form.querySelector('#femail').value.trim(),
        subject:    form.querySelector('#fsubject').value.trim(),
        message:    form.querySelector('#fmessage').value.trim(),
        to_email:   'v.vupadhyay0101@gmail.com',
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

  // Clear per-field error styling on input
  form.querySelectorAll('.form-input').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('input-error'));
  });

})();
