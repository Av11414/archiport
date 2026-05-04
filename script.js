/* ─── HERO VIDEO PARALLAX ─── */
(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.hero-video');
    if (!video) return;

    let rafId;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        video.style.transform = `translateY(${window.scrollY * 0.28}px)`;
        rafId = null;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  });
})();

/* ─── INTERSECTION OBSERVER REVEAL ─── */
(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(el => observer.observe(el));
  });
})();

/* ─── IMAGE PROTECTION ─── */
(function () {
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  let pressTimer;
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'IMG') {
      pressTimer = setTimeout(() => {}, 600);
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  }, { passive: false });
})();
