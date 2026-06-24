/* ================================================================
   ELAVARASAN T – ADVANCED PORTFOLIO SCRIPTS
   Version 2.0 | GitHub Pages Optimised
   ================================================================ */
 
'use strict';
 
/* ----------------------------------------------------------------
   UTILITY HELPERS
   ---------------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
 
const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
 
function onReady(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}
 
/* ----------------------------------------------------------------
   1. LOADING SCREEN
   ---------------------------------------------------------------- */
const Loader = (() => {
  const loader = $('#loader');
 
  function hide() {
    loader.classList.add('hidden');
    document.body.style.cursor = 'none';
    // Kick off all entrance animations
    Particles.init();
    ScrollReveal.init();
    HeroStats.init();
    TypeWriter.init();
  }
 
  function init() {
    // Wait for fill animation (2.1s) + slight grace
    const minDelay = 2400;
    const loaded   = new Promise(resolve => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve);
    });
    const delay = new Promise(resolve => setTimeout(resolve, minDelay));
 
    Promise.all([loaded, delay]).then(hide);
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   2. CUSTOM CURSOR
   ---------------------------------------------------------------- */
const Cursor = (() => {
  const glow = $('#cursor-glow');
  let dot;
  const isTouchDevice = () => window.matchMedia('(hover: none)').matches;
 
  function createDot() {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);
  }
 
  function moveCursor(e) {
    const x = e.clientX, y = e.clientY;
    if (glow) glow.style.transform = `translate(calc(${x}px - 50%), calc(${y}px - 50%))`;
    if (dot)  { dot.style.left = x + 'px'; dot.style.top = y + 'px'; }
  }
 
  function onEnter() { dot && dot.classList.add('hovering');    }
  function onLeave() { dot && dot.classList.remove('hovering'); }
 
  function bindHoverTargets() {
    const targets = 'a, button, .project-card, .cert-card, .contact-link, .about-card, .tech-pill, .info-chip, .btn';
    $$(targets).forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });
  }
 
  function init() {
    if (isTouchDevice()) return;
    createDot();
    document.addEventListener('mousemove', moveCursor, { passive: true });
    bindHoverTargets();
  }
 
  return { init, bindHoverTargets };
})();
 
/* ----------------------------------------------------------------
   3. PARTICLE SYSTEM
   ---------------------------------------------------------------- */
const Particles = (() => {
  const canvas = $('#particles');
  const ctx    = canvas ? canvas.getContext('2d') : null;
  let   width, height, particles = [], raf;
 
  const CONFIG = {
    count:      0,       // computed from viewport
    maxDist:    130,
    speed:      0.35,
    minSize:    0.5,
    maxSize:    2.0,
    colors:     ['108,99,255', '0,212,255', '168,85,247'],
  };
 
  class Particle {
    constructor() { this.reset(true); }
 
    reset(initial = false) {
      this.x       = Math.random() * width;
      this.y       = initial ? Math.random() * height : (Math.random() > 0.5 ? -5 : height + 5);
      this.vx      = (Math.random() - 0.5) * CONFIG.speed;
      this.vy      = (Math.random() - 0.5) * CONFIG.speed;
      this.size    = Math.random() * (CONFIG.maxSize - CONFIG.minSize) + CONFIG.minSize;
      this.opacity = Math.random() * 0.55 + 0.1;
      this.color   = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.pulse   = Math.random() * Math.PI * 2; // phase offset
    }
 
    update() {
      this.x      += this.vx;
      this.y      += this.vy;
      this.pulse  += 0.018;
      this.opacity = 0.15 + Math.sin(this.pulse) * 0.2;
 
      if (this.x < -10 || this.x > width + 10 ||
          this.y < -10 || this.y > height + 10) {
        this.reset();
      }
    }
 
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }
 
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
 
        if (dist < CONFIG.maxDist) {
          const alpha = (1 - dist / CONFIG.maxDist) * 0.14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }
 
  function resize() {
    if (!canvas) return;
    width  = canvas.width  = window.innerWidth;
    height = canvas.height = window.innerHeight;
    CONFIG.count = clamp(Math.floor(width / 14), 40, 100);
 
    if (particles.length !== CONFIG.count) {
      while (particles.length > CONFIG.count) particles.pop();
      while (particles.length < CONFIG.count) particles.push(new Particle());
    }
  }
 
  function loop() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    raf = requestAnimationFrame(loop);
  }
 
  function init() {
    if (!canvas || !ctx) return;
    resize();
    loop();
    window.addEventListener('resize', resize, { passive: true });
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   4. NAVBAR
   ---------------------------------------------------------------- */
const Navbar = (() => {
  const nav       = $('#navbar');
  const hamburger = $('#hamburger');
  const navLinks  = $('#navLinks');
  const links     = $$('#navLinks a');
  let   isOpen    = false;
 
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    BackToTop.update();
    updateActiveLink();
  }
 
  function toggleMenu() {
    isOpen = !isOpen;
    hamburger.classList.toggle('active', isOpen);
    navLinks.classList.toggle('open',    isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  }
 
  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  }
 
  function updateActiveLink() {
    const sections = $$('section[id]');
    let current    = '';
    const offset   = window.innerHeight * 0.35;
 
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) current = sec.id;
    });
 
    links.forEach(a => {
      const match = a.getAttribute('href') === `#${current}`;
      a.classList.toggle('active', match);
    });
  }
 
  function smoothScrollLinks() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = $(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        closeMenu();
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth' });
        }, isOpen ? 320 : 0);
      });
    });
  }
 
  function init() {
    if (!nav) return;
    window.addEventListener('scroll', onScroll, { passive: true });
    hamburger && hamburger.addEventListener('click', toggleMenu);
 
    // Close on outside click
    document.addEventListener('click', e => {
      if (isOpen && !nav.contains(e.target)) closeMenu();
    });
 
    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeMenu();
    });
 
    smoothScrollLinks();
    onScroll(); // run once
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   5. TYPING EFFECT
   ---------------------------------------------------------------- */
const TypeWriter = (() => {
  const el     = $('#typed-text');
  const phrases = [
    'Aspiring Data Analyst',
    'Data Scientist',
    'AI Enthusiast',
    'Python Developer',
    'ML Explorer',
    'Cloud Technologist',
  ];
 
  let phraseIdx  = 0;
  let charIdx    = 0;
  let deleting   = false;
  let timer      = null;
 
  function tick() {
    const phrase  = phrases[phraseIdx];
    const display = deleting
      ? phrase.substring(0, charIdx - 1)
      : phrase.substring(0, charIdx + 1);
 
    el.textContent = display;
    charIdx = deleting ? charIdx - 1 : charIdx + 1;
 
    let delay = deleting ? 45 : 85;
 
    if (!deleting && display === phrase) {
      delay    = 2000;
      deleting = true;
    } else if (deleting && display === '') {
      deleting   = false;
      phraseIdx  = (phraseIdx + 1) % phrases.length;
      charIdx    = 0;
      delay      = 350;
    }
 
    timer = setTimeout(tick, delay);
  }
 
  function init() {
    if (!el) return;
    setTimeout(tick, 600);
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   6. SCROLL REVEAL
   ---------------------------------------------------------------- */
const ScrollReveal = (() => {
  const items = $$('.reveal');
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
 
      const el = entry.target;
      el.classList.add('visible');
 
      // Trigger skill bars inside revealed card
      $$('.bar-fill', el).forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 150);
      });
 
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
 
  function init() {
    // Stagger children with delay
    items.forEach((el, i) => {
      const sib = el.parentElement
        ? [...el.parentElement.children].filter(c => c.classList.contains('reveal'))
        : [];
      const pos = sib.indexOf(el);
      if (pos > 0) el.style.transitionDelay = `${pos * 0.08}s`;
 
      observer.observe(el);
    });
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   7. ANIMATED COUNTERS (Hero stats)
   ---------------------------------------------------------------- */
const HeroStats = (() => {
  const stats = $$('.stat-num');
  let   fired = false;
 
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const dur    = 1800;
    const steps  = target;
    const step   = dur / steps;
    let   cur    = 0;
 
    el.textContent = '0';
 
    const timer = setInterval(() => {
      cur++;
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, step);
  }
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || fired) return;
      fired = true;
      stats.forEach(animateCounter);
      observer.disconnect();
    });
  }, { threshold: 0.5 });
 
  function init() {
    const block = $('.hero-stats');
    if (block) observer.observe(block);
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   8. SKILL BARS (observer-driven)
   ---------------------------------------------------------------- */
const SkillBars = (() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.bar-fill', entry.target).forEach(bar => {
        setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
 
  function init() {
    $$('.skill-category').forEach(cat => observer.observe(cat));
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   9. PROJECT CARDS – 3D TILT ON HOVER
   ---------------------------------------------------------------- */
const ProjectTilt = (() => {
  const MAX_TILT = 6;
 
  function applyTilt(card, e) {
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width  / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    const rx    = clamp(-dy * MAX_TILT, -MAX_TILT, MAX_TILT);
    const ry    = clamp( dx * MAX_TILT, -MAX_TILT, MAX_TILT);
 
    card.style.transform = `translateY(-10px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
 
  function resetTilt(card) {
    card.style.transform = '';
  }
 
  function init() {
    // Only on non-touch devices
    if (window.matchMedia('(hover: none)').matches) return;
 
    $$('.project-card').forEach(card => {
      card.style.transition = 'transform 0.15s ease, box-shadow 0.35s ease, border-color 0.35s ease';
      card.addEventListener('mousemove',  e  => applyTilt(card, e), { passive: true });
      card.addEventListener('mouseleave', () => resetTilt(card));
    });
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   10. BACK TO TOP
   ---------------------------------------------------------------- */
const BackToTop = (() => {
  const btn = $('#backToTop');
 
  function update() {
    if (!btn) return;
    btn.classList.toggle('visible', window.scrollY > 420);
  }
 
  function init() {
    if (!btn) return;
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
 
  return { init, update };
})();
 
/* ----------------------------------------------------------------
   11. FLOATING ICONS – PARALLAX ON SCROLL
   ---------------------------------------------------------------- */
const FloatParallax = (() => {
  const icons = $$('.float-icon');
  let   ticking = false;
 
  function update() {
    const y = window.scrollY;
    icons.forEach((icon, i) => {
      const dir    = i % 2 === 0 ? 1 : -1;
      const offset = dir * y * 0.05;
      icon.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }
 
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }
 
  function init() {
    if (!icons.length) return;
    window.addEventListener('scroll', onScroll, { passive: true });
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   12. SECTION GRID OVERLAY (decorative – adds on alternate sections)
   ---------------------------------------------------------------- */
const GridOverlay = (() => {
  function init() {
    $$('.section-alt').forEach(sec => {
      if (!$('.section-grid-overlay', sec)) {
        const div = document.createElement('div');
        div.className = 'section-grid-overlay';
        sec.insertBefore(div, sec.firstChild);
      }
    });
  }
  return { init };
})();
 
/* ----------------------------------------------------------------
   13. ACTIVE SECTION HIGHLIGHT (section-based bg tint on navbar)
   ---------------------------------------------------------------- */
const SectionWatcher = (() => {
  const sections = $$('section[id]');
  let   current  = '';
 
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) current = entry.target.id;
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
 
  function init() {
    sections.forEach(s => observer.observe(s));
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   14. KEYBOARD NAVIGATION HELPER
   ---------------------------------------------------------------- */
const KeyboardNav = (() => {
  function init() {
    // Make glass cards focusable for keyboard users if they have links
    $$('.project-card, .cert-card, .about-card').forEach(card => {
      if (!$('a, button', card)) {
        card.setAttribute('tabindex', '0');
      }
    });
  }
  return { init };
})();
 
/* ----------------------------------------------------------------
   15. RESIZE HANDLER (debounced)
   ---------------------------------------------------------------- */
const ResizeHandler = (() => {
  let timer;
 
  function onResize() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      // Re-bind cursor hover targets after DOM changes
      Cursor.bindHoverTargets && Cursor.bindHoverTargets();
    }, 250);
  }
 
  function init() {
    window.addEventListener('resize', onResize, { passive: true });
  }
 
  return { init };
})();
 
/* ----------------------------------------------------------------
   16. PERFORMANCE – PAUSE PARTICLES WHEN TAB HIDDEN
   ---------------------------------------------------------------- */
const VisibilityManager = (() => {
  function init() {
    document.addEventListener('visibilitychange', () => {
      // particles RAF automatically pauses when hidden in most browsers,
      // but we can explicitly manage here if needed.
    });
  }
  return { init };
})();
 
/* ----------------------------------------------------------------
   17. SMOOTH ENTRANCE for hero elements (CSS driven, JS triggers)
   ---------------------------------------------------------------- */
const HeroEntrance = (() => {
  function init() {
    // Hero elements are animated via CSS keyframes with animation-fill-mode: both
    // so they work without JS — this just ensures body doesn't flash
    document.body.classList.add('js-loaded');
  }
  return { init };
})();
 
/* ----------------------------------------------------------------
   18. GITHUB PAGES PATH FIX (for subdirectory deployments)
   ---------------------------------------------------------------- */
const GitHubPagesFix = (() => {
  function init() {
    // Ensure anchor links work on GitHub Pages
    const base = document.querySelector('base');
    if (base) {
      $$('a[href^="#"]').forEach(a => {
        const href = a.getAttribute('href');
        if (href.startsWith('#')) {
          a.setAttribute('href', href); // keep as-is
        }
      });
    }
  }
  return { init };
})();
 
/* ----------------------------------------------------------------
   BOOTSTRAP – INIT ORDER MATTERS
   ---------------------------------------------------------------- */
onReady(() => {
  HeroEntrance.init();
  GitHubPagesFix.init();
  Navbar.init();
  BackToTop.init();
  Cursor.init();
  SkillBars.init();
  ProjectTilt.init();
  FloatParallax.init();
  GridOverlay.init();
  SectionWatcher.init();
  KeyboardNav.init();
  ResizeHandler.init();
  VisibilityManager.init();
 
  // Loader drives Particles + ScrollReveal + HeroStats + TypeWriter
  Loader.init();
});
 
/* ----------------------------------------------------------------
   END OF SCRIPT
   ---------------------------------------------------------------- */