// Vikash Upadhyay — Portfolio

// ── Documents / certificates (file names must match the files in your GitHub repo) ──
// t = title shown in the popup, f = exact file name (with extension).
// Leave f as '' to hide that View button until you upload the file.
const FILES = {
  resume:       { t: 'Resume',                                   f: 'RESUME.pdf' },
  appreciation: { t: 'Appreciation Letter — NCRB',               f: 'Appreciation letter (National Crime Records Bureau).jpeg' }, // ← CHANGE to full file name + extension
  ncrbCert:     { t: 'Cyber Security Internship — NCRB',         f: 'Cyber Security Internship Certificate(National Crime Records Bureau).jpeg' }, // ← CHANGE to full file name + extension
  criai:        { t: 'Internship Certificate — CRIAI',           f: 'CRIAI_Certificate.png' },
  shentilinix:  { t: 'Internship Certificate — Shentinelix Sphere', f: 'SHENTILINIX SPHERE PVT.LTD_Certificate.png' },
  pentest:      { t: 'Penetration Testing — Security Blue Team', f: 'penetration tester certificate.png' },
  nptel:        { t: 'Foundation of Cloud, IoT & Edge ML — NPTEL', f: 'Internet fo things.png' },
  cisco:        { t: 'Ethical Hacker — Cisco Networking Academy', f: '' }, // upload the file to GitHub, then put its name here
  vitCtf:       { t: 'CyberCell VIT CTF',                        f: 'CYBERCELL VIT CTF.png' },
  armyReport:   { t: 'Indian Army CTF Report',                   f: 'Indian Army CTF Report.pdf' }
};

// ── Navbar: shadow on scroll + mobile menu ──
const nav = document.getElementById('nav');
const links = document.getElementById('links');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll); onScroll();
document.getElementById('burger').addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

// ── Document viewer (View button → popup preview, download only on demand) ──
(function () {
  const modal = document.getElementById('docModal');
  const body = document.getElementById('docBody');
  const title = document.getElementById('docTitle');
  const dl = document.getElementById('docDl');
  const op = document.getElementById('docOpen');
  const closeBtn = document.getElementById('docClose');
  let lastBtn = null;

  // hide View buttons whose file is not set yet
  document.querySelectorAll('[data-view]').forEach(b => {
    const d = FILES[b.dataset.view];
    if (!d || !d.f) b.hidden = true;
  });

  function open(key, btn) {
    const d = FILES[key]; if (!d || !d.f) return;
    const url = encodeURI(d.f);
    lastBtn = btn || null;
    title.textContent = d.t;
    dl.href = url; dl.setAttribute('download', d.f);
    op.href = url;
    body.innerHTML = '';
    const isPdf = d.f.toLowerCase().endsWith('.pdf');
    let el;
    if (isPdf) {
      el = document.createElement('iframe');
      el.src = url; el.title = d.t;
    } else {
      el = document.createElement('img');
      el.src = url; el.alt = d.t;
      el.onerror = () => { body.innerHTML = '<p class="nofile">File not found. Check the file name in app.js.</p>'; };
    }
    body.appendChild(el);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('open');
    body.innerHTML = '';
    document.body.style.overflow = '';
    if (lastBtn) lastBtn.focus();
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-view]');
    if (b) { e.preventDefault(); open(b.dataset.view, b); }
  });
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
})();

// ── Typed role ──
(function () {
  const el = document.getElementById('typed');
  const roles = ['Cybersecurity Analyst', 'Digital Forensics Associate', 'SOC Analyst', 'Penetration Tester', 'Incident Response Enthusiast'];
  let r = 0, c = 0, del = false;
  (function tick() {
    const w = roles[r];
    el.textContent = w.slice(0, del ? --c : ++c);
    let wait = del ? 40 : 80;
    if (!del && c === w.length) { del = true; wait = 1800; }
    else if (del && c === 0) { del = false; r = (r + 1) % roles.length; wait = 300; }
    setTimeout(tick, wait);
  })();
})();

// ── Scroll reveal ──
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.fade').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 0.07 + 's'; io.observe(el); });

// ── Counters ──
const co = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, t = +el.dataset.t, s = el.dataset.s || '';
  let n = 0; const step = Math.max(1, t / 50);
  const id = setInterval(() => {
    n = Math.min(n + step, t); el.textContent = Math.ceil(n) + s;
    if (n >= t) clearInterval(id);
  }, 25);
  co.unobserve(el);
}), { threshold: 0.6 });
document.querySelectorAll('.count').forEach(el => co.observe(el));

// ── Contact form (EmailJS) ──
(function () {
  const PUBLIC_KEY = 'Ys9tLVHNSD_st2zgR';
  const SERVICE_ID = 'service_wh1uhyt';
  const TEMPLATE_ID = 'template_wmney38';
  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: PUBLIC_KEY });

  const form = document.getElementById('contactForm');
  const btn = document.getElementById('sendBtn');
  const msg = document.getElementById('formMsg');
  const f = { name: form.fname, email: form.femail, subject: form.fsubject, message: form.fmessage };
  let sending = false;

  const show = (type, text) => { msg.className = 'formmsg ' + type; msg.textContent = text; };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending) return;
    Object.values(f).forEach(i => i.classList.remove('err'));
    for (const [k, el] of Object.entries(f)) {
      const v = el.value.trim();
      if (!v || (k === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) {
        el.classList.add('err'); el.focus();
        return show('bad', k === 'email' ? 'Please enter a valid email address.' : 'Please fill in all fields.');
      }
    }
    sending = true; btn.disabled = true; btn.textContent = 'Sending…'; msg.className = 'formmsg';
    try {
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
        from_name: f.name.value.trim(),
        from_email: f.email.value.trim(),
        subject: f.subject.value.trim(),
        message: f.message.value.trim(),
        to_email: 'v.vupadhyay0101@gmail.com'
      });
      show('ok', 'Message sent successfully. I will get back to you soon.');
      form.reset();
    } catch (err) {
      show('bad', 'Could not send the message. Please email me directly at v.vupadhyay0101@gmail.com.');
    }
    sending = false; btn.disabled = false; btn.textContent = 'Send Message';
  });
})();

// ── Animated network background (blue + green multi-colour) ──
(function () {
  const c = document.getElementById('bg'); if (!c) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const x = c.getContext('2d');
  const COLORS = ['59,130,246', '34,211,238', '16,185,129', '74,222,128', '99,102,241'];
  const LINK = 165, MOUSE = 230;
  let W, H, P = [], m = { x: -999, y: -999 };
  function init() {
    W = c.width = innerWidth; H = c.height = innerHeight;
    P = Array.from({ length: Math.min(130, Math.round(W * H / 12000)) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
      r: Math.random() * 1.8 + 1.4, col: COLORS[Math.floor(Math.random() * COLORS.length)] }));
  }
  addEventListener('resize', init);
  addEventListener('mousemove', e => { m.x = e.clientX; m.y = e.clientY; });
  addEventListener('mouseout', () => { m.x = m.y = -999; });
  init();
  (function draw() {
    x.clearRect(0, 0, W, H);
    for (const p of P) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      x.shadowBlur = 10; x.shadowColor = 'rgba(' + p.col + ',.9)';
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7);
      x.fillStyle = 'rgba(' + p.col + ',.95)'; x.fill();
    }
    x.shadowBlur = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[i];
      for (let j = i + 1; j < P.length; j++) {
        const b = P[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          const g = x.createLinearGradient(a.x, a.y, b.x, b.y), al = .6 * (1 - d / LINK);
          g.addColorStop(0, 'rgba(' + a.col + ',' + al + ')');
          g.addColorStop(1, 'rgba(' + b.col + ',' + al + ')');
          x.strokeStyle = g; x.lineWidth = 1.1;
          x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke();
        }
      }
      const dm = Math.hypot(a.x - m.x, a.y - m.y);
      if (dm < MOUSE) {
        x.strokeStyle = 'rgba(' + a.col + ',' + (0.95 * (1 - dm / MOUSE)) + ')'; x.lineWidth = 1.6;
        x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(m.x, m.y); x.stroke();
      }
    }
    requestAnimationFrame(draw);
  })();
})();

// ── Live security feed (simulated demo data) ──
(function () {
  const log = document.getElementById('feedLog'); if (!log) return;
  const E = [
    ['crit', 'CRITICAL', 'SYN flood pattern flagged', 'PCAP'],
    ['high', 'HIGH', 'Embedded JavaScript in PDF', 'sample.pdf'],
    ['med', 'MEDIUM', 'SPF / Return-Path mismatch', 'phish.eml'],
    ['info', 'INFO', 'Nmap service scan completed', '24 ports'],
    ['high', 'HIGH', 'Unauthorized USB device blocked', 'Blocker'],
    ['info', 'INFO', 'Wireshark capture parsed', '<240ms'],
    ['crit', 'CRITICAL', 'Exploit attempt on CVE-2023-21554', 'lab-range'],
    ['med', 'MEDIUM', 'Suspicious login attempt', 'Wazuh']
  ];
  let k = 0;
  function add() {
    const e = E[k++ % E.length], r = document.createElement('div');
    r.className = 'fr'; r.innerHTML = '<b class="' + e[0] + '">' + e[1] + '</b><span>' + e[2] + '</span><i>' + e[3] + '</i>';
    log.prepend(r); while (log.children.length > 4) log.lastChild.remove();
  }
  for (let i = 0; i < 4; i++) add();
  setInterval(add, 2600);
})();
