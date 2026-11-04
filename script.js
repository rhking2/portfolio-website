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

// ------------------------------------------------------------------
// Enlarge images: click or tap any Portfolio image to see it large
// enough to read. Arrows (or ← →) flip between images in the same
// project; Esc, the ✕, or clicking the dark background closes it.
// ------------------------------------------------------------------
(function lightbox() {
  const imgs = [...document.querySelectorAll('.project-media img')]
    .filter((img) => !img.closest('a'));
  if (!imgs.length) return;

  let box = null;
  let group = [];
  let index = 0;
  let opener = null;

  function show() {
    const img = group[index];
    const big = box.querySelector('img');
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    const count = box.querySelector('.lb-count');
    if (count) count.textContent = (index + 1) + ' / ' + group.length;
    box.scrollTop = 0;
  }

  function close() {
    if (!box) return;
    box.remove();
    box = null;
    document.documentElement.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (opener) opener.focus();
  }

  function step(d) {
    index = (index + d + group.length) % group.length;
    show();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight' && group.length > 1) step(1);
    else if (e.key === 'ArrowLeft' && group.length > 1) step(-1);
    else if (e.key === 'Tab') {
      // keep keyboard focus inside the enlarged view
      const f = [...box.querySelectorAll('button')];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  }

  function open(img) {
    opener = img;
    group = [...img.closest('.project-media').querySelectorAll('img.zoomable')];
    index = group.indexOf(img);
    box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Enlarged image');
    box.innerHTML = '<img alt="">'
      + '<button class="lb-close" type="button" aria-label="Close">✕</button>'
      + (group.length > 1
        ? '<span class="lb-count"></span>'
          + '<button class="lb-prev" type="button" aria-label="Previous image">‹</button>'
          + '<button class="lb-next" type="button" aria-label="Next image">›</button>'
        : '');
    box.addEventListener('click', (e) => {
      if (e.target === box) close();
    });
    box.querySelector('.lb-close').addEventListener('click', close);
    if (group.length > 1) {
      box.querySelector('.lb-prev').addEventListener('click', () => step(-1));
      box.querySelector('.lb-next').addEventListener('click', () => step(1));
    }
    document.body.appendChild(box);
    document.documentElement.style.overflow = 'hidden';
    show();
    requestAnimationFrame(() => box && box.classList.add('open'));
    box.querySelector('.lb-close').focus();
    document.addEventListener('keydown', onKey);
  }

  imgs.forEach((img) => {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', 'Enlarge image: ' + img.alt);
    img.addEventListener('click', () => open(img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(img);
      }
    });
  });
})();
