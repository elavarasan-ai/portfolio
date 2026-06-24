/* ================================================================
   ELAVARASAN T – PREMIUM PORTFOLIO SCRIPTS v3.0
   Recruiter-friendly · 60fps · Mobile-safe
   ================================================================ */
'use strict';

/* ── Helpers ── */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const isMobile = () => window.innerWidth <= 768 || window.matchMedia('(hover:none)').matches;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ================================================================
   1. LOADING SCREEN
   ================================================================ */
const Loader = (() => {
  const el = $('#loader');

  function hide() {
    el.classList.add('hidden');
    // stagger entrance of body elements
    document.body.classList.add('js-ready');
    Particles.init();
    ScrollReveal.init();
    HeroStats.init();
    ExpStats.init();
    TypeWriter.init();
  }

  function init() {
    const loaded = new Promise(r => {
      if (document.readyState === 'complete') r(); else window.addEventListener('load', r);
    });
    Promise.all([loaded, new Promise(r => setTimeout(r, 2400))]).then(hide);
  }

  return { init };
})();

/* ================================================================
   2. CUSTOM CURSOR
   ================================================================ */
const Cursor = (() => {
  const glow = $('#cursor-glow');
  let dot;

  function make() {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);
  }

  function move(e) {
    const x = e.clientX, y = e.clientY;
    if (glow) glow.style.transform = `translate(calc(${x}px - 50%),calc(${y}px - 50%))`;
    if (dot)  { dot.style.left = x + 'px'; dot.style.top = y + 'px'; }
  }

  function bindTargets() {
    $$('a,button,.project-card,.cert-card,.contact-link,.about-card,.tech-pill,.info-chip,.btn,.exp-stat-card,.learn-card,.ach-card').forEach(el => {
      el.addEventListener('mouseenter', () => dot?.classList.add('hovering'));
      el.addEventListener('mouseleave', () => dot?.classList.remove('hovering'));
    });
  }

  function init() {
    if (isMobile()) return;
    make();
    document.addEventListener('mousemove', move, { passive: true });
    bindTargets();
  }

  return { init, bindTargets };
})();

/* ================================================================
   3. PARTICLE SYSTEM
   ================================================================ */
const Particles = (() => {
  const canvas = $('#particles');
  const ctx    = canvas?.getContext('2d');
  let w, h, list = [], raf;

  const cfg = { maxDist: 120, speed: 0.32, colors: ['108,99,255','0,212,255','168,85,247'] };

  class P {
    constructor() { this.reset(true); }
    reset(init) {
      this.x  = Math.random() * w;
      this.y  = init ? Math.random() * h : (Math.random() > .5 ? -6 : h + 6);
      this.vx = (Math.random() - .5) * cfg.speed;
      this.vy = (Math.random() - .5) * cfg.speed;
      this.r  = Math.random() * 1.5 + .4;
      this.ph = Math.random() * Math.PI * 2;
      this.c  = cfg.colors[~~(Math.random() * 3)];
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.ph += .016;
      if (this.x < -8 || this.x > w+8 || this.y < -8 || this.y > h+8) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${this.c},${.1 + Math.sin(this.ph)*.2})`;
      ctx.fill();
    }
  }

  function connections() {
    for (let i = 0; i < list.length; i++) {
      for (let j = i+1; j < list.length; j++) {
        const dx = list[i].x - list[j].x, dy = list[i].y - list[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < cfg.maxDist) {
          ctx.beginPath();
          ctx.moveTo(list[i].x, list[i].y);
          ctx.lineTo(list[j].x, list[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${(1-d/cfg.maxDist)*.13})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    if (!canvas) return;
    w = canvas.width  = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const n = clamp(~~(w/14), 35, 90);
    while (list.length > n) list.pop();
    while (list.length < n) list.push(new P());
  }

  function loop() {
    ctx.clearRect(0, 0, w, h);
    list.forEach(p => { p.update(); p.draw(); });
    connections();
    raf = requestAnimationFrame(loop);
  }

  function init() {
    if (!canvas || !ctx) return;
    resize();
    loop();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf); else loop();
    });
  }

  return { init };
})();

/* ================================================================
   4. NAVBAR – hide on scroll down, reappear on scroll up
   ================================================================ */
const Navbar = (() => {
  const nav  = $('#navbar');
  const ham  = $('#hamburger');
  const list = $('#navLinks');
  let   open = false, lastY = 0, ticking = false;

  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('scrolled', y > 30);
      // hide/show
      if (y > lastY && y > 120) {
        nav.classList.add('nav-hidden');
        if (open) closeMenu();
      } else {
        nav.classList.remove('nav-hidden');
      }
      lastY = y;
      ticking = false;
      BackToTop.update();
      updateActive();
    });
    ticking = true;
  }

  function closeMenu() {
    open = false;
    ham.classList.remove('active');
    list.classList.remove('open');
    ham.setAttribute('aria-expanded', false);
  }

  function updateActive() {
    const secs = $$('section[id]');
    let cur = '';
    secs.forEach(s => { if (window.scrollY >= s.offsetTop - window.innerHeight*.35) cur = s.id; });
    $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
  }

  function init() {
    if (!nav) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    ham?.addEventListener('click', () => {
      open = !open;
      ham.classList.toggle('active', open);
      list.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', e => { if (open && !nav.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    // smooth scroll
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = $(a.getAttribute('href'));
        if (!t) return;
        e.preventDefault();
        closeMenu();
        setTimeout(() => t.scrollIntoView({ behavior: 'smooth' }), open ? 300 : 0);
      });
    });
    onScroll();
  }

  return { init };
})();

/* ================================================================
   5. TYPING EFFECT
   ================================================================ */
const TypeWriter = (() => {
  const el = $('#typed-text');
  const phrases = [
    'Data Analyst',
    'Data Science Enthusiast',
    'AI Learner',
    'Python Developer',
    'ML Explorer',
    'Cloud Technologist',
  ];
  let pi = 0, ci = 0, del = false;

  function tick() {
    const phrase = phrases[pi];
    el.textContent = del ? phrase.slice(0, ci-1) : phrase.slice(0, ci+1);
    del ? ci-- : ci++;
    let speed = del ? 42 : 80;
    if (!del && ci > phrase.length) { speed = 1900; del = true; }
    else if (del && ci < 1) { del = false; pi = (pi+1) % phrases.length; speed = 320; }
    setTimeout(tick, speed);
  }

  function init() {
    if (!el) return;
    setTimeout(tick, 700);
  }

  return { init };
})();

/* ================================================================
   6. SCROLL REVEAL (fade-up + blur removal)
   ================================================================ */
const ScrollReveal = (() => {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      // animate skill bars inside
      $$('.bar-fill', el).forEach(b => setTimeout(() => { b.style.width = b.dataset.width + '%'; }, 160));
      // animate exp-stat counters inside
      $$('.exp-stat-num', el).forEach(n => animCount(n));
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  function init() {
    $$('.reveal').forEach((el, i) => {
      const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal')) : [];
      const pos  = sibs.indexOf(el);
      if (pos > 0) el.style.transitionDelay = `${pos * 0.08}s`;
      io.observe(el);
    });
  }

  return { init };
})();

/* ================================================================
   7. HERO STATS COUNTER
   ================================================================ */
const HeroStats = (() => {
  let fired = false;
  const io  = new IntersectionObserver(entries => {
    if (fired) return;
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      fired = true;
      $$('.stat-num').forEach(animCount);
      io.disconnect();
    });
  }, { threshold: 0.5 });

  function init() {
    const b = $('.hero-stats');
    if (b) io.observe(b);
  }

  return { init };
})();

/* ================================================================
   8. EXP-STATS SECTION COUNTER
   ================================================================ */
const ExpStats = (() => {
  const fired = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting || fired.has(e.target)) return;
      fired.add(e.target);
      $$('.exp-stat-num', e.target).forEach(animCount);
    });
  }, { threshold: 0.3 });

  function init() {
    $$('.exp-stat-card').forEach(c => io.observe(c));
  }

  return { init };
})();

/* ================================================================
   9. GENERIC COUNTER ANIMATION
   ================================================================ */
function animCount(el) {
  if (el.dataset.counted) return;
  el.dataset.counted = '1';
  const target = parseInt(el.dataset.target, 10);
  const dur    = 1600;
  const step   = dur / target;
  let cur      = 0;
  const t = setInterval(() => {
    cur++;
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, step);
}

/* ================================================================
   10. SKILL BARS (observer-driven, fires on section reveal)
   ================================================================ */
const SkillBars = (() => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      $$('.bar-fill', e.target).forEach(b => setTimeout(() => { b.style.width = b.dataset.width + '%'; }, 200));
      io.unobserve(e.target);
    });
  }, { threshold: 0.25 });

  function init() {
    $$('.skill-category').forEach(c => io.observe(c));
  }

  return { init };
})();

/* ================================================================
   11. 3D PROJECT CARD TILT
   ================================================================ */
const CardTilt = (() => {
  const MAX = 7;

  function init() {
    if (isMobile()) return;
    $$('.project-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
        const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
        card.style.transform = `translateY(-10px) rotateX(${clamp(-dy*MAX,-MAX,MAX)}deg) rotateY(${clamp(dx*MAX,-MAX,MAX)}deg)`;
      }, { passive: true });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform .6s cubic-bezier(.23,1,.32,1), box-shadow .35s, border-color .35s';
        setTimeout(() => card.style.transition = '', 600);
      });
    });
  }

  return { init };
})();

/* ================================================================
   12. SPOTLIGHT HOVER ON CARDS
   ================================================================ */
const Spotlight = (() => {
  function init() {
    if (isMobile()) return;
    $$('.spotlight-card').forEach(card => {
      const sp = $('.spotlight', card);
      if (!sp) return;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        sp.style.left = (e.clientX - r.left) + 'px';
        sp.style.top  = (e.clientY - r.top)  + 'px';
      }, { passive: true });
    });
  }

  return { init };
})();

/* ================================================================
   13. MAGNETIC BUTTONS
   ================================================================ */
const MagneticBtns = (() => {
  const STRENGTH = 0.28;

  function init() {
    if (isMobile()) return;
    $$('.mag-wrap').forEach(wrap => {
      const btn = $('.mag-btn', wrap);
      if (!btn) return;

      wrap.addEventListener('mousemove', e => {
        const r  = wrap.getBoundingClientRect();
        const dx = (e.clientX - r.left - r.width  / 2) * STRENGTH;
        const dy = (e.clientY - r.top  - r.height / 2) * STRENGTH;
        btn.style.transform = `translate(${dx}px,${dy}px)`;
      }, { passive: true });

      wrap.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform .5s cubic-bezier(.23,1,.32,1)';
        setTimeout(() => btn.style.transition = '', 500);
      });
    });
  }

  return { init };
})();

/* ================================================================
   14. FLOATING ICON PARALLAX ON SCROLL
   ================================================================ */
const FloatParallax = (() => {
  const icons = $$('.float-icon');
  let ticking = false;

  function update() {
    const y = window.scrollY;
    icons.forEach((ic, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      ic.style.transform = `translateY(${dir * y * 0.045}px)`;
    });
    ticking = false;
  }

  function init() {
    if (!icons.length || isMobile()) return;
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  return { init };
})();

/* ================================================================
   15. BACK TO TOP – morph animation
   ================================================================ */
const BackToTop = (() => {
  const btn = $('#backToTop');

  function update() {
    if (!btn) return;
    const show = window.scrollY > 420;
    btn.classList.toggle('visible', show);
  }

  function init() {
    btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  return { init, update };
})();

/* ================================================================
   16. ACHIEVEMENT CARDS – floating handled by CSS,
       but we re-bind after page load in case DOM was injected late
   ================================================================ */
const AchCards = (() => {
  function init() {
    // CSS handles the float animation via nth-child selectors.
    // JS disables it on touch to avoid jank.
    if (isMobile()) {
      $$('.ach-card').forEach(c => c.style.animation = 'none');
    }
  }
  return { init };
})();

/* ================================================================
   17. MARQUEE – pause on user interaction / reduced motion
   ================================================================ */
const Marquee = (() => {
  function init() {
    const track = $('#marqueeTrack');
    if (!track) return;

    // Respect reduced-motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.style.animation = 'none';
    }
  }

  return { init };
})();

/* ================================================================
   18. GRID OVERLAY on alt sections
   ================================================================ */
const GridOverlay = (() => {
  function init() {
    $$('.section-alt, .exp-stats-section').forEach(s => {
      if (!$('.section-grid-overlay', s)) {
        const d = document.createElement('div');
        d.className = 'section-grid-overlay';
        s.insertBefore(d, s.firstChild);
      }
    });
  }
  return { init };
})();

/* ================================================================
   19. RESIZE – debounced
   ================================================================ */
const Resize = (() => {
  let t;
  function init() {
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => Cursor.bindTargets?.(), 300);
    }, { passive: true });
  }
  return { init };
})();

/* ================================================================
   BOOT
   ================================================================ */
function boot() {
  Cursor.init();
  Navbar.init();
  BackToTop.init();
  SkillBars.init();
  CardTilt.init();
  Spotlight.init();
  MagneticBtns.init();
  FloatParallax.init();
  AchCards.init();
  Marquee.init();
  GridOverlay.init();
  Resize.init();

  // Loader kicks off: Particles · ScrollReveal · HeroStats · ExpStats · TypeWriter
  Loader.init();
}

if (document.readyState !== 'loading') boot();
else document.addEventListener('DOMContentLoaded', boot);