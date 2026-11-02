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
// Decoration: faint botanical/celestial drawings that draw themselves
// in, twinkling eight-pointed stars, and sections that fade up on
// scroll. Purely visual (hidden from screen readers). To change the
// colors, edit --floral / --twinkle at the top of styles.css; the
// artwork itself is in assets/florals/.
// ------------------------------------------------------------------
(function decorate() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

  const layer = document.createElement('div');
  layer.className = 'florals';
  layer.setAttribute('aria-hidden', 'true');
  document.body.prepend(layer);

  const pageH = document.documentElement.scrollHeight;
  const wide = window.innerWidth >= 1200;

  // Small repeatable random generator, so a page decorates the same way
  // on every visit.
  let seed = 0;
  for (const ch of currentPage) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Draws a drawing's lines once it scrolls into view.
  const drawObserver = canObserve && !reduceMotion
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('drawn');
            drawObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 })
    : null;

  // Which drawings go where. Long pages get extra pieces down the sides
  // on wide screens, alternating left and right.
  const spots = [
    { art: 'moon-bouquet', cls: 'fl-top-right' },
    { art: 'wildflowers', cls: 'fl-bottom-left' },
  ];
  if (wide) {
    for (let y = 1000, i = 0; y < pageH - 1100; y += 1100, i++) {
      spots.push(i % 2 === 0
        ? { art: 'constellation', cls: 'fl-side-left', top: y }
        : { art: 'side-sprig', cls: 'fl-side-right', top: y });
    }
  }

  spots.forEach((spot) => {
    const el = document.createElement('div');
    el.className = 'floral ' + spot.cls;
    if (spot.top) el.style.top = spot.top + 'px';
    layer.appendChild(el);
    fetch('assets/florals/' + spot.art + '.svg')
      .then((r) => (r.ok ? r.text() : ''))
      .then((svg) => {
        if (!svg) return;
        el.innerHTML = svg;
        const paths = el.querySelectorAll('path');
        paths.forEach((p, i) => {
          p.style.setProperty('--d', (i / paths.length * 1.8).toFixed(2) + 's');
        });
        if (drawObserver) drawObserver.observe(el);
        else el.classList.add('drawn');
      })
      .catch(() => {});
  });

  // Twinkling eight-pointed stars, mostly in the side margins.
  const STAR = 'M0-10L1.2-2.9 3.9-3.9 2.9-1.2 10 0 2.9 1.2 3.9 3.9 1.2 2.9 0 10'
    + '-1.2 2.9-3.9 3.9-2.9 1.2-10 0-2.9-1.2-3.9-3.9-1.2-2.9Z';
  const section = document.querySelector('main .section');
  const cs = section ? getComputedStyle(section) : null;
  const box = section ? section.getBoundingClientRect() : null;
  const contentL = box ? box.left + parseFloat(cs.paddingLeft) : 0;
  const contentR = box ? box.right - parseFloat(cs.paddingRight) : window.innerWidth;
  const W = document.documentElement.clientWidth;
  const count = Math.round(Math.min(18, Math.max(6, pageH / (wide ? 260 : 420))));

  for (let i = 0; i < count; i++) {
    const size = 9 + rand() * 9;
    const leftSide = i % 2 === 0;
    let x;
    if (contentL - 90 > 40) {
      x = leftSide ? 80 + rand() * (contentL - 110) : contentR + 20 + rand() * (W - contentR - 50);
    } else {
      x = leftSide ? rand() * 0.08 * W : W * 0.92 + rand() * 0.08 * W - size;
    }
    const y = 90 + rand() * (pageH - 180);
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '-11 -11 22 22');
    s.setAttribute('class', 'twinkle');
    s.style.cssText = `left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${size.toFixed(1)}px;`
      + `height:${size.toFixed(1)}px;--dur:${(5 + rand() * 4).toFixed(1)}s;`
      + `--delay:${(-rand() * 8).toFixed(1)}s`;
    s.innerHTML = `<path d="${STAR}"/>`;
    layer.appendChild(s);
  }

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
