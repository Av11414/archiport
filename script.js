/* ───────────────────────────────────────────────────────────
   arav-jivani.com
   Scroll reveal + opt-in 3D model viewer.
   ─────────────────────────────────────────────────────────── */

/* ── reveal on scroll ──────────────────────────────────────── */
(function () {
  window.addEventListener('DOMContentLoaded', function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -8% 0px' });

    els.forEach(function (el) { io.observe(el); });
  });
})();

/* ── 3D model viewer ───────────────────────────────────────────
   Loaded only when the visitor asks for it. Three.js and the GLB
   are fetched on click; the renderer is disposed when the section
   scrolls out of view so the WebGL context is not left running.
   ───────────────────────────────────────────────────────────── */
(function () {
  var THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var BASE      = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/';
  var DRACO     = BASE + 'libs/draco/gltf/';
  var DEPS      = ['controls/OrbitControls.js', 'loaders/DRACOLoader.js', 'loaders/GLTFLoader.js'];

  function script(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error(src)); };
      document.head.appendChild(s);
    });
  }

  var booted = null;
  function boot() {
    if (!booted) {
      booted = script(THREE_SRC).then(function () {
        return DEPS.reduce(function (p, d) {
          return p.then(function () { return script(BASE + d); });
        }, Promise.resolve());
      });
    }
    return booted;
  }

  window.addEventListener('DOMContentLoaded', function () {
    var host = document.querySelector('.model[data-model]');
    if (!host) return;

    var btn    = host.querySelector('.model-btn');
    var note   = host.querySelector('.model-note');
    var canvas = host.querySelector('canvas');
    var state  = null;

    function teardown() {
      if (!state) return;
      cancelAnimationFrame(state.raf);
      state.controls.dispose();
      state.scene.traverse(function (o) {
        if (o.isMesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m && m.dispose(); });
        }
      });
      state.renderer.dispose();
      state = null;
      canvas.style.display = 'none';
      note.style.display = 'none';
      btn.style.display = '';
      btn.textContent = 'View 3D model';
    }

    function fitCamera(cam, controls, obj) {
      var box    = new THREE.Box3().setFromObject(obj);
      var centre = box.getCenter(new THREE.Vector3());
      var size   = box.getSize(new THREE.Vector3());
      var maxDim = Math.max(size.x, size.y, size.z) || 1;
      var dist   = (maxDim * 0.5) / Math.tan((cam.fov * Math.PI / 180) * 0.5) * 2.0;

      cam.position.set(centre.x + dist * 0.55, centre.y + dist * 0.42, centre.z + dist * 0.72);
      cam.near = maxDim / 200;
      cam.far  = maxDim * 100;
      cam.updateProjectionMatrix();

      controls.target.copy(centre);
      controls.minDistance = maxDim * 0.3;
      controls.maxDistance = maxDim * 12;
      controls.update();
    }

    function start() {
      var w = host.clientWidth, h = host.clientHeight;

      var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.setClearColor(0x151514, 1);
      renderer.outputEncoding = THREE.sRGBEncoding;

      var scene  = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(40, w / h, 0.01, 2000);

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      var key = new THREE.DirectionalLight(0xffffff, 1.05); key.position.set(6, 12, 8);   scene.add(key);
      var fil = new THREE.DirectionalLight(0xd0e0ff, 0.42); fil.position.set(-10, 4, -6); scene.add(fil);
      var rim = new THREE.DirectionalLight(0xffeedd, 0.26); rim.position.set(2, -4, -8);  scene.add(rim);

      var controls = new THREE.OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.055;
      controls.screenSpacePanning = true;

      state = { renderer: renderer, scene: scene, camera: camera, controls: controls, raf: 0 };

      var draco = new THREE.DRACOLoader();
      draco.setDecoderPath(DRACO);
      var loader = new THREE.GLTFLoader();
      loader.setDRACOLoader(draco);

      loader.load(host.dataset.model, function (gltf) {
        var model = gltf.scene;
        model.traverse(function (c) {
          if (!c.isMesh) return;
          (Array.isArray(c.material) ? c.material : [c.material]).forEach(function (m) {
            if (m && !m.map && m.color) { m.color.set(0x8d8d8a); m.roughness = 0.68; m.metalness = 0.04; m.needsUpdate = true; }
          });
        });
        scene.add(model);
        fitCamera(camera, controls, model);

        btn.style.display = 'none';
        canvas.style.display = 'block';
        note.style.display = 'block';

        (function loop() {
          if (!state) return;
          state.raf = requestAnimationFrame(loop);
          controls.update();
          renderer.render(scene, camera);
        })();
      }, null, function () {
        btn.disabled = true;
        btn.textContent = 'Model unavailable';
        state = null;
      });
    }

    btn.addEventListener('click', function () {
      if (state) return;
      btn.textContent = 'Loading…';
      boot().then(start).catch(function () {
        btn.disabled = true;
        btn.textContent = 'Model unavailable';
      });
    });

    window.addEventListener('resize', function () {
      if (!state) return;
      var w = host.clientWidth, h = host.clientHeight;
      state.renderer.setSize(w, h, false);
      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (!e.isIntersecting) teardown(); });
      }, { threshold: 0 }).observe(host);
    }
  });
})();
