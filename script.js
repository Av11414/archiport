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

/* ─── PORTFOLIO EXPAND + SLIDESHOW ─── */
(function () {
  const PROJECTS = {
    meditation: {
      title: 'The House of Meditation',
      location: 'Tokyo, Japan',
      hero: 'images/meditation-hero.png',
      description: 'A contemplative retreat embedded within Tokyo\'s urban fabric. Raw concrete and filtered light define a space where silence becomes material — each threshold a transition from the city\'s noise into stillness. The architecture frames nature as event: the shadow of a branch, the movement of water, the slow arc of the sun.',
      slides: [
        'images/meditation-hero.png',
        'images/meditation-slide-02.jpg',
        'images/meditation-slide-03.jpg',
        'images/meditation-slide-04.jpg',
        'images/meditation-slide-05.jpg'
      ],
      url: 'meditation.html'
    },
    monolith: {
      title: 'Get-away Monolith',
      location: 'Remote hill top',
      hero: 'images/monolith-hero.png',
      description: 'A single mass set against open sky. The Monolith is a retreat from complexity — its geometry absolute, its relationship to the landscape elemental. Stone and silence. The building asks nothing of its surroundings except to be seen, and to see.',
      slides: [
        'images/monolith-hero.png',
        'images/monolith-slide-02.jpg',
        'images/monolith-slide-03.jpg',
        'images/monolith-slide-04.jpg'
      ],
      url: 'monolith.html'
    },
    garden: {
      title: 'Garden Intellectual Space',
      location: 'Kampala, Uganda',
      hero: 'images/garden-hero.png',
      description: 'Situated in Kampala, the Garden Intellectual Space is designed as a place of thought and quiet communion with the natural world. Marble and stone surfaces echo the terrain, while openings draw the garden inward — blurring the edge between built and living. The program invites contemplation, study, and a deepened awareness of one\'s environment.',
      slides: [
        'images/garden-hero.png',
        'images/garden-slide-02.jpg',
        'images/garden-slide-03.jpg',
        'images/garden-slide-04.jpg'
      ],
      url: 'garden.html'
    }
  };

  let currentProject = null;
  let countdownTimer = null;
  let slideIndex = 0;
  let slideList = [];

  const expandOverlay  = document.getElementById('expand-overlay');
  const expandBg       = document.getElementById('expand-bg');
  const expandClose    = document.getElementById('expand-close');
  const expandContent  = document.getElementById('expand-content');
  const expandTitle    = document.getElementById('expand-title');
  const expandLocation = document.getElementById('expand-location');
  const expandDesc     = document.getElementById('expand-description');
  const expandCountdown= document.getElementById('expand-countdown');
  const expandViewBtn  = document.getElementById('expand-view-btn');

  const slideshowOverlay = document.getElementById('slideshow-overlay');
  const slideshowClose   = document.getElementById('slideshow-close');
  const slideshowPrev    = document.getElementById('slideshow-prev');
  const slideshowNext    = document.getElementById('slideshow-next');
  const slideshowImg     = document.getElementById('slideshow-img');
  const slideshowCounter = document.getElementById('slideshow-counter');

  if (!expandOverlay) return;

  /* ── Expand ── */
  function openExpand(card) {
    const key = card.dataset.project;
    const proj = PROJECTS[key];
    if (!proj) return;
    currentProject = proj;

    const rect = card.getBoundingClientRect();

    expandBg.style.backgroundImage = `url('${proj.hero}')`;
    expandTitle.textContent    = proj.title;
    expandLocation.textContent = proj.location;
    expandDesc.textContent     = proj.description;
    expandCountdown.textContent = '';
    expandCountdown.style.opacity = '1';
    expandViewBtn.classList.remove('visible');
    expandContent.classList.remove('visible');

    expandOverlay.style.display = 'block';
    expandOverlay.style.top     = rect.top + 'px';
    expandOverlay.style.left    = rect.left + 'px';
    expandOverlay.style.width   = rect.width + 'px';
    expandOverlay.style.height  = rect.height + 'px';
    expandOverlay.setAttribute('aria-hidden', 'false');

    void expandOverlay.offsetHeight;

    expandOverlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    clearCountdown();
    setTimeout(() => {
      expandContent.classList.add('visible');
      startCountdown();
    }, 650);
  }

  function closeExpand() {
    clearCountdown();
    expandContent.classList.remove('visible');
    expandOverlay.classList.remove('is-open');
    expandOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    setTimeout(() => {
      expandOverlay.style.display = 'none';
      currentProject = null;
    }, 650);
  }

  /* ── Countdown ── */
  function startCountdown() {
    let count = 5;
    expandCountdown.textContent = `Opening in ${count}`;

    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        expandCountdown.textContent = `Opening in ${count}`;
      } else {
        clearInterval(countdownTimer);
        countdownTimer = null;
        expandCountdown.style.opacity = '0';
        setTimeout(() => {
          expandCountdown.textContent = '';
          expandViewBtn.classList.add('visible');
        }, 400);
      }
    }, 1000);
  }

  function clearCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  /* ── Slideshow ── */
  function openSlideshow(proj) {
    slideList  = proj.slides;
    slideIndex = 0;

    slideshowImg.style.opacity = '1';
    slideshowImg.src = slideList[0];
    slideshowImg.alt = proj.title;
    updateCounter();

    slideshowOverlay.classList.add('is-open');
    slideshowOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeSlideshow() {
    slideshowOverlay.classList.remove('is-open');
    slideshowOverlay.setAttribute('aria-hidden', 'true');
  }

  function showSlide(index) {
    slideIndex = ((index % slideList.length) + slideList.length) % slideList.length;
    slideshowImg.style.opacity = '0';
    setTimeout(() => {
      slideshowImg.src = slideList[slideIndex];
      updateCounter();
      slideshowImg.style.opacity = '1';
    }, 200);
  }

  function updateCounter() {
    slideshowCounter.textContent = `${slideIndex + 1} / ${slideList.length}`;
  }

  /* ── Event wiring ── */
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.project-card[data-project]').forEach(card => {
      card.addEventListener('click', () => openExpand(card));
    });

    expandClose.addEventListener('click', closeExpand);

    expandViewBtn.addEventListener('click', () => {
      if (currentProject) openSlideshow(currentProject);
    });

    slideshowClose.addEventListener('click', closeSlideshow);
    slideshowPrev.addEventListener('click', () => showSlide(slideIndex - 1));
    slideshowNext.addEventListener('click', () => showSlide(slideIndex + 1));

    /* Keyboard */
    document.addEventListener('keydown', (e) => {
      if (slideshowOverlay.classList.contains('is-open')) {
        if (e.key === 'ArrowLeft')  showSlide(slideIndex - 1);
        if (e.key === 'ArrowRight') showSlide(slideIndex + 1);
        if (e.key === 'Escape')     closeSlideshow();
      } else if (expandOverlay.classList.contains('is-open')) {
        if (e.key === 'Escape') closeExpand();
      }
    });

    /* Touch swipe on slideshow */
    let touchStartX = 0;
    slideshowOverlay.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slideshowOverlay.addEventListener('touchend', (e) => {
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        delta > 0 ? showSlide(slideIndex + 1) : showSlide(slideIndex - 1);
      }
    }, { passive: true });
  });
})();
