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

(function () {
  const PROJECTS = {
    meditation: {
      title: 'The House of Meditation',
      location: 'Tokyo, Japan',
      hero: 'images/meditation-hero.webp',
      description: 'The House of Meditation is an experimental architecture project designed around a compact retreat defined by compression, vertical release, and controlled light. Movement slows the body before opening into a single meditation chamber. A circular roof aperture introduces a moving beam of sunlight, making time the primary spatial element.',
      slides: [
        'images/meditation-hero.webp',
        'images/meditation-slide-02.webp',
        'images/meditation-slide-03.webp',
        'images/meditation-slide-04.webp',
        { type: '3d', src: 'images/meditation-model.glb' },
        'images/meditation-slide-05.webp'
      ],
      url: 'meditation.html'
    },
    monolith: {
      title: 'Get-away Monolith',
      location: 'Remote hill top',
      hero: 'images/monolith-hero.webp',
      description: 'An experimental architecture/interior design project based on location and privacy. The house is set in a remote location to serve as a get-away for a weekend or vacation. Designed with a black obsidian color design, the house is a destimulator in a fast moving world, allowing the occupant to slow down in luxury while enjoying nature around them.',
      slides: [
        'images/monolith-hero.webp',
        'images/monolith-slide-02.webp',
        'images/monolith-slide-03.webp',
        { type: '3d', src: 'images/monolith-model.glb' },
        'images/monolith-slide-04.webp'
      ],
      url: 'monolith.html'
    },
    garden: {
      title: 'Garden Intellectual Space',
      location: 'Kampala, Uganda',
      hero: 'images/garden-hero.webp',
      description: 'An architecture/interior design exploration project done to study materials and how it can affect interior environments. A personal test to discover if I can design for purpose. The purpose of this space is to support working conditions and productivity.',
      slides: [
        'images/garden-hero.webp',
        'images/garden-slide-02.webp',
        'images/garden-slide-03.webp',
        { type: '3d', src: 'images/garden-model.glb' },
        'images/garden-slide-04.webp'
      ],
      url: 'garden.html'
    }
  };


  let currentProject = null;
  let countdownTimer = null;
  let slideIndex = 0;
  let slideList = [];


  let threeRenderer = null;
  let threeScene = null;
  let threeCamera = null;
  let threeControls = null;
  let threeAnimId = null;
  let modelCache = {};
  let currentModelObject = null;
  let instrHideTimer = null;


  const expandOverlay   = document.getElementById('expand-overlay');
  const expandBg        = document.getElementById('expand-bg');
  const expandClose     = document.getElementById('expand-close');
  const expandContent   = document.getElementById('expand-content');
  const expandTitle     = document.getElementById('expand-title');
  const expandLocation  = document.getElementById('expand-location');
  const expandDesc      = document.getElementById('expand-description');
  const expandCountdown = document.getElementById('expand-countdown');
  const expandViewBtn   = document.getElementById('expand-view-btn');

  const slideshowOverlay = document.getElementById('slideshow-overlay');
  const slideshowClose   = document.getElementById('slideshow-close');
  const slideshowPrev    = document.getElementById('slideshow-prev');
  const slideshowNext    = document.getElementById('slideshow-next');
  const slideshowImg     = document.getElementById('slideshow-img');
  const slideshowCounter = document.getElementById('slideshow-counter');

  const modelCanvas  = document.getElementById('model-canvas');
  const modelLoading = document.getElementById('model-loading');
  const modelLabel   = document.getElementById('model-label');
  const modelInstr   = document.getElementById('model-instructions');
  const modelSpinner = document.getElementById('model-spinner');

  if (!expandOverlay) return;



  function initThree() {
    if (threeRenderer) return;

    threeRenderer = new THREE.WebGLRenderer({ canvas: modelCanvas, antialias: true, alpha: false });
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRenderer.setClearColor(0x0d0d0d, 1);
    threeRenderer.outputEncoding = THREE.sRGBEncoding;
    threeRenderer.physicallyCorrectLights = true;

    threeScene = new THREE.Scene();

    threeCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 2000);


    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    threeScene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
    keyLight.position.set(6, 12, 8);
    threeScene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd0e0ff, 0.45);
    fillLight.position.set(-10, 4, -6);
    threeScene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffeedd, 0.25);
    rimLight.position.set(2, -4, -8);
    threeScene.add(rimLight);

    threeControls = new THREE.OrbitControls(threeCamera, modelCanvas);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.055;
    threeControls.screenSpacePanning = true;
    threeControls.minDistance = 0.5;
    threeControls.maxDistance = 500;
    threeControls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };
  }

  function resizeThree() {
    if (!threeRenderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    threeRenderer.setSize(w, h);
    threeCamera.aspect = w / h;
    threeCamera.updateProjectionMatrix();
  }

  function startRenderLoop() {
    if (threeAnimId) return;
    (function loop() {
      threeAnimId = requestAnimationFrame(loop);
      threeControls.update();
      threeRenderer.render(threeScene, threeCamera);
    })();
  }

  function stopRenderLoop() {
    if (threeAnimId) {
      cancelAnimationFrame(threeAnimId);
      threeAnimId = null;
    }
  }

  function applyArchitecturalMaterial(object) {
    object.traverse(child => {
      if (!child.isMesh) return;
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(mat => {
        if (!mat) return;
        if (!mat.map) {
          mat.color.set(0x888888);
          mat.roughness = 0.65;
          mat.metalness = 0.05;
        }
        mat.needsUpdate = true;
      });
    });
  }

  function fitCameraToModel(object) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const fov = threeCamera.fov * (Math.PI / 180);
    const dist = (maxDim * 0.5) / Math.tan(fov * 0.5) * 2.0;

    threeCamera.position.set(
      center.x + dist * 0.55,
      center.y + dist * 0.42,
      center.z + dist * 0.72
    );
    threeCamera.near = maxDim / 200;
    threeCamera.far  = maxDim * 100;
    threeCamera.updateProjectionMatrix();

    threeControls.target.copy(center);
    threeControls.minDistance = maxDim * 0.3;
    threeControls.maxDistance = maxDim * 12;
    threeControls.update();
  }

  function clearModelFromScene() {
    if (currentModelObject) {
      threeScene.remove(currentModelObject);
      currentModelObject = null;
    }
  }

  function show3DSlide(modelUrl) {
    modelCanvas.style.display  = 'block';
    modelCanvas.style.opacity  = '0';
    modelCanvas.style.transition = '';
    modelLoading.style.display = 'block';
    modelSpinner.style.display = 'block';
    modelLabel.style.display   = 'block';
    modelInstr.style.display   = 'block';
    modelInstr.style.opacity   = '1';
    modelInstr.style.transition = '';

    initThree();
    resizeThree();
    clearModelFromScene();
    startRenderLoop();

    function onLoaded(gltf) {
      clearModelFromScene();

      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      model.scale.set(1, 1, 1);

      applyArchitecturalMaterial(model);
      threeScene.add(model);
      currentModelObject = model;

      fitCameraToModel(model);

      modelLoading.style.display = 'none';
      modelSpinner.style.display = 'none';


      requestAnimationFrame(() => {
        modelCanvas.style.transition = 'opacity 0.7s ease';
        modelCanvas.style.opacity = '1';
      });


      clearTimeout(instrHideTimer);
      instrHideTimer = setTimeout(() => {
        modelInstr.style.transition = 'opacity 0.8s ease';
        modelInstr.style.opacity = '0';
        setTimeout(() => {
          modelInstr.style.display = 'none';
          modelInstr.style.opacity = '1';
          modelInstr.style.transition = '';
        }, 820);
      }, 4000);
    }

    if (modelCache[modelUrl]) {
      onLoaded(modelCache[modelUrl]);
    } else {
      const dracoLoader = new THREE.DRACOLoader();
      dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/gltf/');
      const loader = new THREE.GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load(modelUrl, (gltf) => {
        modelCache[modelUrl] = gltf;
        onLoaded(gltf);
      }, undefined, () => {
        modelLoading.textContent = 'Model unavailable';
        modelSpinner.style.display = 'none';
      });
    }
  }

  function hide3DSlide() {
    stopRenderLoop();
    clearTimeout(instrHideTimer);
    modelCanvas.style.display  = 'none';
    modelCanvas.style.opacity  = '0';
    modelLoading.style.display = 'none';
      modelSpinner.style.display = 'none';
    modelLabel.style.display   = 'none';
    modelInstr.style.display   = 'none';
    modelInstr.style.opacity   = '1';
    modelInstr.style.transition = '';
    modelLoading.textContent = 'Loading model...';
  }

  window.addEventListener('resize', () => {
    if (modelCanvas && modelCanvas.style.display === 'block') resizeThree();
  });



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



  function isModelSlide(slide) {
    return slide && typeof slide === 'object' && slide.type === '3d';
  }

  function openSlideshow(proj) {
    slideList  = proj.slides;
    slideIndex = 0;

    const first = slideList[0];
    if (isModelSlide(first)) {
      slideshowImg.style.opacity = '0';
      show3DSlide(first.src);
    } else {
      slideshowImg.style.opacity = '1';
      slideshowImg.src = first;
      slideshowImg.alt = proj.title;
    }

    updateCounter();
    slideshowOverlay.classList.add('is-open');
    slideshowOverlay.setAttribute('aria-hidden', 'false');
  }

  function closeSlideshow() {
    if (isModelSlide(slideList[slideIndex])) hide3DSlide();
    slideshowOverlay.classList.remove('is-open');
    slideshowOverlay.setAttribute('aria-hidden', 'true');
  }

  function showSlide(index) {
    const prevSlide = slideList[slideIndex];
    const prevIs3D  = isModelSlide(prevSlide);

    slideIndex = ((index % slideList.length) + slideList.length) % slideList.length;
    const slide   = slideList[slideIndex];
    const currIs3D = isModelSlide(slide);

    if (prevIs3D) hide3DSlide();

    if (currIs3D) {
      slideshowImg.style.opacity = '0';
      show3DSlide(slide.src);
    } else if (prevIs3D) {

      slideshowImg.style.opacity = '0';
      slideshowImg.src = slide;
      updateCounter();
      requestAnimationFrame(() => {
        slideshowImg.style.transition = 'opacity 0.2s ease';
        slideshowImg.style.opacity = '1';
        setTimeout(() => { slideshowImg.style.transition = ''; }, 220);
      });
    } else {
      slideshowImg.style.opacity = '0';
      setTimeout(() => {
        slideshowImg.src = slide;
        updateCounter();
        slideshowImg.style.opacity = '1';
      }, 200);
    }

    if (!currIs3D) updateCounter();
  }

  function updateCounter() {
    slideshowCounter.textContent = `${slideIndex + 1} / ${slideList.length}`;
  }



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


    document.addEventListener('keydown', (e) => {
      if (slideshowOverlay && slideshowOverlay.classList.contains('is-open')) {
        if (e.key === 'ArrowLeft')  showSlide(slideIndex - 1);
        if (e.key === 'ArrowRight') showSlide(slideIndex + 1);
        if (e.key === 'Escape')     closeSlideshow();
      } else if (expandOverlay && expandOverlay.classList.contains('is-open')) {
        if (e.key === 'Escape') closeExpand();
      }
    });


    let touchStartX = 0;
    slideshowOverlay.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    slideshowOverlay.addEventListener('touchend', (e) => {
      if (isModelSlide(slideList[slideIndex])) return;
      const delta = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 50) {
        delta > 0 ? showSlide(slideIndex + 1) : showSlide(slideIndex - 1);
      }
    }, { passive: true });
  });
})();