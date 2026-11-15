// Vikash Upadhyay — Portfolio

// ── Navbar: shadow on scroll + mobile menu ──
const nav = document.getElementById('nav');
const links = document.getElementById('links');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll); onScroll();
document.getElementById('burger').addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));

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
