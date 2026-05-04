/* ─── SMOOTH INERTIA SCROLL ─── */
(function () {
  const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;

  if (!isTouchDevice()) {
    let current = 0;
    let target = 0;
    let ease = 0.09;
    let ticking = false;

    const body = document.body;
    const html = document.documentElement;

    function getDocHeight() {
      return Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
      );
    }

    function setBodyHeight() {
      document.body.style.height = getDocHeight() + 'px';
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    const scrollEl = document.createElement('div');
    scrollEl.id = 'smooth-wrapper';
    scrollEl.style.cssText = 'position:fixed;top:0;left:0;width:100%;will-change:transform;';

    window.addEventListener('DOMContentLoaded', () => {
      while (body.firstChild) {
        scrollEl.appendChild(body.firstChild);
      }
      body.appendChild(scrollEl);
      setBodyHeight();

      window.addEventListener('resize', setBodyHeight);

      function loop() {
        target = window.scrollY;
        current = lerp(current, target, ease);

        if (Math.abs(target - current) < 0.05) {
          current = target;
        }

        scrollEl.style.transform = `translateY(${-current}px)`;
        requestAnimationFrame(loop);
      }

      requestAnimationFrame(loop);
    });
  }
})();

/* ─── HERO VIDEO PARALLAX ─── */
(function () {
  window.addEventListener('DOMContentLoaded', () => {
    const video = document.querySelector('.hero-video');
    if (!video) return;

    let rafId;

    function onScroll() {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        video.style.transform = `translateY(${scrolled * 0.28}px)`;
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
  // Disable right-click
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  // Disable drag on images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') e.preventDefault();
  });

  // Disable long-press context menu on mobile
  let pressTimer;
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'IMG') {
      pressTimer = setTimeout(() => {}, 600);
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });

  // Prevent save-image on mobile via touchstart returning false on images
  document.addEventListener('touchstart', (e) => {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
    }
  }, { passive: false });
})();
