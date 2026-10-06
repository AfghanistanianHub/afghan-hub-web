(function () {
  function ensureLayer(section) {
    if (!section) return null;

    var existing = null;
    for (var i = 0; i < section.children.length; i++) {
      if (section.children[i].classList && section.children[i].classList.contains('apnbc-network-html')) {
        existing = section.children[i];
        break;
      }
    }
    if (existing) return existing;

    var wrap = document.createElement('div');
    wrap.className = 'apnbc-network-html';
    wrap.setAttribute('aria-hidden', 'true');

    var layer = document.createElement('div');
    layer.id = 'apnbc-network-layer';

    var canvas = document.createElement('canvas');
    canvas.id = 'apnbc-network-canvas';

    layer.appendChild(canvas);
    wrap.appendChild(layer);
    section.insertBefore(wrap, section.firstChild);
    return wrap;
  }

  function initAPNNetwork() {
    var section = document.getElementById('apnbc-hero-section');
    if (!section) return;

    ensureLayer(section);

    var canvas = document.getElementById('apnbc-network-canvas');
    if (!canvas) return;

    if (canvas.dataset.apnbcInit === '1') return;
    canvas.dataset.apnbcInit = '1';

    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var particles = [];
    var mouse = { x: null, y: null };

    var config = {
      particleCount: 48,
      maxDistance: 120,
      mouseDistance: 160,
      speed: 0.3
    };

    function resizeCanvas() {
      width = section.offsetWidth;
      height = section.offsetHeight;

      canvas.width = Math.floor(width * window.devicePixelRatio);
      canvas.height = Math.floor(height * window.devicePixelRatio);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      initParticles();
    }

    function initParticles() {
      particles = [];
      var count = width < 768 ? 28 : config.particleCount;

      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          size: Math.random() * 2 + 1
        });
      }
    }

    function drawParticle(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79,125,240,0.75)';
      ctx.fill();
    }

    function drawLine(a, b, alpha) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = 'rgba(79,125,240,' + alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        drawParticle(p);

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x;
          var dy = p.y - q.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < config.maxDistance) {
            drawLine(p, q, (1 - dist / config.maxDistance) * 0.22);
          }
        }

        if (mouse.x !== null && mouse.y !== null) {
          var mdx = p.x - mouse.x;
          var mdy = p.y - mouse.y;
          var mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < config.mouseDistance) {
            drawLine(p, mouse, (1 - mdist / config.mouseDistance) * 0.35);
          }
        }
      }

      requestAnimationFrame(animate);
    }

    section.addEventListener('mousemove', function (e) {
      var rect = section.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    section.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
  }

  function boot() {
    initAPNNetwork();

    if (window.elementorFrontend && window.elementorFrontend.hooks) {
      window.elementorFrontend.hooks.addAction('frontend/element_ready/global', function () {
        setTimeout(initAPNNetwork, 100);
      });
    }

    setTimeout(initAPNNetwork, 300);
    setTimeout(initAPNNetwork, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
