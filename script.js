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
// Decoration: faint wildflower and vine drawings that draw themselves
// in, and sections that fade up on scroll. Purely visual (hidden from
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

  const pageH = document.documentElement.scrollHeight;
  const wide = window.innerWidth >= 1200;

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
    { art: 'corner-bouquet', cls: 'fl-top-right' },
    { art: 'wildflowers', cls: 'fl-bottom-left' },
  ];
  if (wide) {
    for (let y = 1000, i = 0; y < pageH - 1100; y += 1100, i++) {
      spots.push(i % 2 === 0
        ? { art: 'vine', cls: 'fl-side-left', top: y }
        : { art: 'side-sprig', cls: 'fl-side-right', top: y });
    }
  }

  spots.forEach((spot) => {
    const el = document.createElement('div');
    el.className = 'floral ' + spot.cls;
    if (spot.top) el.style.top = spot.top + 'px';
    layer.appendChild(el);
    fetch('assets/florals/' + spot.art + '.svg?v=3')
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
