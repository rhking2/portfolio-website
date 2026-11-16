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

// ------------------------------------------------------------------
// Slideshows: any Portfolio project with more than one image/video
// shows one at a time. It moves on by itself every few seconds
// (pausing on hover, focus, or when off screen, and never for
// visitors who prefer reduced motion), and can be clicked through
// with the arrows, the dots, the ← → keys, or a swipe on phones.
// ------------------------------------------------------------------
(function slideshows() {
  const AUTO_MS = 5000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ratioOf = (el) => {
    const set = el.style.getPropertyValue('--ar');
    if (set) return set;
    const img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (img && img.getAttribute('width')) return img.getAttribute('width') + ' / ' + img.getAttribute('height');
    return '2 / 3';
  };

  document.querySelectorAll('.project .project-media').forEach((media, mi) => {
    // Every standalone image, or linked image/video, in the order shown.
    const items = [...media.querySelectorAll('img, a.media-video-link')]
      .filter((el) => !(el.tagName === 'IMG' && el.closest('a.media-video-link')));
    if (items.length < 2) return;

    const caption = media.querySelector(':scope > .media-caption');
    const title = media.closest('.project').querySelector('h3');
    const name = title ? title.textContent : 'Project';

    const wrap = document.createElement('div');
    wrap.className = 'carousel';
    wrap.setAttribute('role', 'region');
    wrap.setAttribute('aria-roledescription', 'carousel');
    wrap.setAttribute('aria-label', name + ' examples');

    const viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';
    const track = document.createElement('div');
    track.className = 'carousel-track';
    track.id = 'carousel-track-' + mi;
    viewport.appendChild(track);

    const slides = items.map((item, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', (i + 1) + ' of ' + items.length);
      const frame = document.createElement('div');
      frame.className = 'carousel-frame';
      item.style.setProperty('--ar', ratioOf(item));
      item.classList.add('carousel-item');
      item.removeAttribute('loading'); // all slides ready before they slide in
      frame.appendChild(item);
      slide.appendChild(frame);
      track.appendChild(slide);
      return slide;
    });

    const btn = (cls, label, path) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-btn ' + cls;
      b.setAttribute('aria-label', label);
      b.setAttribute('aria-controls', track.id);
      b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      return b;
    };
    const prev = btn('prev', 'Previous', 'M15 5l-7 7 7 7');
    const next = btn('next', 'Next', 'M9 5l7 7-7 7');

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    const dotBtns = items.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Show ' + (i + 1) + ' of ' + items.length);
      d.setAttribute('aria-controls', track.id);
      dots.appendChild(d);
      return d;
    });

    wrap.append(viewport, prev, next, dots);
    media.className = 'project-media project-media--carousel' + (caption ? ' project-media--captioned' : '');
    media.replaceChildren(...(caption ? [caption, wrap] : [wrap]));

    let index = 0;
    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      slides.forEach((s, k) => {
        if (k === index) s.removeAttribute('inert');
        else s.setAttribute('inert', '');
      });
      dotBtns.forEach((d, k) => d.setAttribute('aria-current', k === index ? 'true' : 'false'));
    }
    go(0);

    // Auto-advance, paused while hovered, focused, off screen, or hidden.
    let hovering = false;
    let focused = false;
    let onScreen = false;
    let timer = null;
    const canRun = () => !reduceMotion && !hovering && !focused && onScreen && !document.hidden;
    function schedule() {
      clearTimeout(timer);
      if (canRun()) timer = setTimeout(() => { go(index + 1); schedule(); }, AUTO_MS);
    }
    wrap.addEventListener('mouseenter', () => { hovering = true; schedule(); });
    wrap.addEventListener('mouseleave', () => { hovering = false; schedule(); });
    // Pause for keyboard users (not after a mouse click on an arrow).
    wrap.addEventListener('focusin', (e) => {
      focused = e.target.matches(':focus-visible');
      schedule();
    });
    wrap.addEventListener('focusout', (e) => {
      if (!wrap.contains(e.relatedTarget)) { focused = false; schedule(); }
    });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        onScreen = entries[0].isIntersecting;
        schedule();
      }, { threshold: 0.4 }).observe(wrap);
    }

    prev.addEventListener('click', () => { go(index - 1); schedule(); });
    next.addEventListener('click', () => { go(index + 1); schedule(); });
    dotBtns.forEach((d, i) => d.addEventListener('click', () => { go(i); schedule(); }));
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(index - 1); schedule(); }
      if (e.key === 'ArrowRight') { go(index + 1); schedule(); }
    });

    // Swipe on touch screens (a swipe never counts as a click).
    let startX = null;
    let startY = null;
    let swiped = false;
    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
      startY = e.clientY;
      swiped = false;
    });
    viewport.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        swiped = true;
        go(index + (dx < 0 ? 1 : -1));
        schedule();
      }
    });
    viewport.addEventListener('click', (e) => {
      if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; }
    }, true);
  });
})();
