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
// Sections softly fade up as they scroll into view (skipped for
// visitors whose device is set to "reduce motion").
// ------------------------------------------------------------------
(function fadeUp() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canObserve = 'IntersectionObserver' in window;

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
