// olaolu-style interactions — no framework
(() => {
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  // Staged hero entrance
  document.documentElement.classList.add('js');
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add('loaded')));

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Menu toggle (olaolu hamburger -> fullscreen contact menu)
  const btn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('contact-menu');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close contact menu' : 'Open contact menu');
    menu.setAttribute('aria-hidden', String(!open));
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(!document.body.classList.contains('menu-open')); });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Journey line: scroll progress
  const progress = document.querySelector('.progress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.transform = 'scaleX(' + p + ')';
  };

  // Depth: work media drifts slower than scroll (subtle parallax)
  const parallaxEls = reduced ? [] : Array.from(document.querySelectorAll('.media > img, .media > video[data-main]'));
  const updateParallax = () => {
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const center = r.top + r.height / 2 - vh / 2;
      const shift = Math.max(-24, Math.min(24, -center * 0.06));
      el.style.setProperty('--py', shift.toFixed(1) + 'px');
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateProgress(); updateParallax(); ticking = false; });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateProgress(); updateParallax();

  // Invitation: magnetic controls (desktop pointers only)
  if (!reduced && finePointer) {
    document.querySelectorAll('.gh-btn, .menu-toggle, .contact-link.magnetic').forEach(el => {
      const strength = 6;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + (x / r.width * strength).toFixed(1) + 'px,' + (y / r.height * strength).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }
  // Reveal on scroll
  const els = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!reduced && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    els.forEach(el => obs.observe(el));
    setTimeout(() => els.forEach(el => el.classList.add('in')), 3000);
  } else {
    els.forEach(el => el.classList.add('in'));
  }

  // Dual video sync
  const dual = document.querySelector('[data-dual-video]');
  if (dual) {
    const main = dual.querySelector('[data-main]');
    const tac = dual.querySelector('[data-tactical]');
    if (main && tac) {
      [main, tac].forEach(v => { v.muted = true; v.loop = true; });
      const sync = () => {
        if (Math.abs(tac.currentTime - main.currentTime) > 0.25) {
          try { tac.currentTime = main.currentTime; } catch (e) {}
        }
      };
      main.addEventListener('timeupdate', sync);
      main.addEventListener('play', () => tac.play().catch(() => {}));
      main.addEventListener('pause', () => tac.pause());
      [main, tac].forEach(v => v.play().catch(() => {}));
    }
  }

  // WaterMate slider
  const wm = document.querySelector('[data-wm]');
  if (wm) {
    const track = wm.querySelector('[data-wm-track]');
    let i = 0;
    const go = (n) => {
      i = (n + 2) % 2;
      track.style.transform = 'translateX(' + (-i * 50) + '%)';
    };
    wm.querySelector('[data-wm-prev]').addEventListener('click', () => go(i - 1));
    wm.querySelector('[data-wm-next]').addEventListener('click', () => go(i + 1));
    go(0);
  }
})();
