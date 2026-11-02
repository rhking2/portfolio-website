document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Highlight whichever nav link points at the page currently being viewed.
const currentPage = location.pathname.split('/').pop() || 'index.html';
siteNav.querySelectorAll('a').forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// ------------------------------------------------------------------
// Decoration: small, faint wildflower drawings that draw themselves in,
// linger, and erase themselves in empty spots around the page, and
// sections that fade up on scroll. Purely visual (hidden from
// screen readers). To change the color, edit --floral at the top of
// styles.css; the artwork itself is in assets/florals/.
// ------------------------------------------------------------------
(function decorate() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  const layer = document.createElement('div');
  layer.className = 'florals';
  layer.setAttribute('aria-hidden', 'true');
  document.body.prepend(layer);

  // Small single-stem drawings scattered through the background. Each
  // one draws itself in, lingers, erases itself, then reappears in a
  // new spot. They only ever appear in empty space: never touching a
  // line, text, image, button, the header, footer, or the left rail.
  const MOTIFS = ['m-cosmos', 'm-poppy', 'm-grass', 'm-branch', 'm-bud', 'm-cosmos-pair'];
  const PAD = 18;           // clear space kept around every drawing
  const DRAW = 3200;        // ms to draw in (incl. stagger)
  const ERASE = 2800;       // ms to erase (incl. stagger)

  const art = {};
  const load = (name) => fetch('assets/florals/' + name + '.svg?v=4')
    .then((r) => (r.ok ? r.text() : ''))
    .then((svg) => {
      if (!svg) return;
      const tmp = document.createElement('div');
      tmp.innerHTML = svg;
      const vb = tmp.querySelector('svg').getAttribute('viewBox').split(/\s+/).map(Number);
      art[name] = { svg, ratio: vb[2] / vb[3] };
    })
    .catch(() => {});

  // Everything a drawing must stay clear of, in page coordinates.
  let blocks = [];
  let bounds = null;
  function measure() {
    const sy = window.scrollY;
    const box = (r, pad = PAD) => ({
      l: r.left - pad, r: r.right + pad, t: r.top + sy - pad, b: r.bottom + sy + pad,
    });
    blocks = [];
    const header = document.querySelector('.site-header');
    const footer = document.querySelector('.site-footer');
    const rail = document.querySelector('.rail');
    if (!header || !footer) return;
    // Text: the actual lines of text, so short lines leave room beside them.
    document.querySelectorAll('main h1, main h2, main h3, main h4, main p, main li, main .timeline-date, main .project-eyebrow, main .page-next')
      .forEach((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        [...range.getClientRects()].forEach((r) => blocks.push(box(r)));
      });
    // Images, buttons, bubbles, and every divider line.
    document.querySelectorAll('main img, main .btn, main .skill-chips li, main .contact-item, main .project-media, main .play-button')
      .forEach((el) => blocks.push(box(el.getBoundingClientRect())));
    document.querySelectorAll('.page-head, .subsection, .project + .project').forEach((el) => {
      const r = el.getBoundingClientRect();
      const line = el.classList.contains('page-head')
        ? { left: r.left, right: r.right, top: r.bottom - 1, bottom: r.bottom }
        : { left: r.left, right: r.right, top: r.top, bottom: r.top + 1 };
      blocks.push(box(line));
    });
    if (rail) {
      const r = rail.getBoundingClientRect();
      blocks.push({ l: r.left - PAD, r: r.right + PAD, t: -1e6, b: 1e6 });
    }
    const pageW = document.documentElement.clientWidth;
    bounds = {
      l: 4,
      r: pageW - 4,
      t: header.getBoundingClientRect().bottom + sy + PAD,
      b: footer.getBoundingClientRect().top + sy - PAD,
    };
  }

  const active = new Set();
  const hits = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

  function findSpot(name) {
    if (!bounds) return null;
    const small = window.innerWidth < 720;
    for (let tries = 0; tries < 80; tries++) {
      const h = (small ? 80 : 105) + Math.random() * (small ? 30 : 45);
      const w = h * art[name].ratio;
      const x = bounds.l + Math.random() * (bounds.r - bounds.l - w);
      const y = bounds.t + Math.random() * (bounds.b - bounds.t - h);
      const r = { l: x, r: x + w, t: y, b: y + h };
      if (r.l < bounds.l || r.r > bounds.r || r.t < bounds.t || r.b > bounds.b) continue;
      if (blocks.some((b) => hits(r, b))) continue;
      if ([...active].some((o) => hits(r, { l: o.l - 40, r: o.r + 40, t: o.t - 40, b: o.b + 40 }))) continue;
      return { x, y, w, h, l: r.l, r: r.r, t: r.t, b: r.b };
    }
    return null;
  }

  function show(name, spot, still) {
    const el = document.createElement('div');
    el.className = 'floral';
    el.style.left = Math.round(spot.x) + 'px';
    el.style.top = Math.round(spot.y) + 'px';
    el.style.width = Math.round(spot.w) + 'px';
    el.innerHTML = art[name].svg;
    const paths = el.querySelectorAll('path');
    paths.forEach((p, i) => p.style.setProperty('--d', (i / paths.length * 1.2).toFixed(2) + 's'));
    layer.appendChild(el);
    if (still) {
      el.classList.add('drawn');
    } else {
      el.getBoundingClientRect(); // start from "not drawn yet"
      requestAnimationFrame(() => el.classList.add('drawn'));
    }
    return el;
  }

  const wait = (ms) => new Promise((res) => setTimeout(res, ms));

  async function cycle(i) {
    await wait(i * 1700 + Math.random() * 1500);
    for (;;) {
      if (document.hidden) { await wait(1000); continue; }
      const name = MOTIFS[Math.floor(Math.random() * MOTIFS.length)];
      const spot = art[name] && findSpot(name);
      if (!spot) { await wait(2500); continue; }
      active.add(spot);
      const el = show(name, spot, false);
      await wait(DRAW + 3000 + Math.random() * 3000);   // draw in, then linger
      el.classList.add('erased');
      await wait(ERASE + 200);
      el.remove();
      active.delete(spot);
      await wait(800 + Math.random() * 2500);
    }
  }

  Promise.all(MOTIFS.map(load)).then(() => {
    const start = () => {
      measure();
      const perScreen = window.innerWidth < 720 ? 2 : 4;
      const pageH = document.documentElement.scrollHeight;
      const slots = Math.max(2, Math.min(14, Math.round(perScreen * pageH / window.innerHeight)));
      if (reduceMotion) {
        // No animation: place a few still drawings once.
        for (let i = 0; i < slots; i++) {
          const name = MOTIFS[i % MOTIFS.length];
          const spot = findSpot(name);
          if (spot) { active.add(spot); show(name, spot, true); }
        }
        return;
      }
      for (let i = 0; i < slots; i++) cycle(i);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
    else start();
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measure, 250);
    });
    // Content fades up as you scroll, which moves things slightly:
    // re-measure now and then so new drawings keep clear.
    setInterval(measure, 4000);
  });

  // Fade-up on scroll for content below the first screen.
  if (canObserve && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.about-grid, .link-card-grid, .project, .timeline-item, .subsection > h3,'
      + ' .skill-chips, .contact-grid, .page-next'
    ).forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      }
    });
  }
})();
