// Source: apnbc.ca/wp-content/plugins/apnbc-network-background-fixed/assets/apnbc-network.js?ver=1.0.1
// Drawing/update math is preserved; WordPress boot is replaced by React lifecycle.
type Point = { x: number; y: number };
type Particle = Point & { vx: number; vy: number; size: number };

export function mountAPNBCNetwork(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const context = ctx;
  const config = { particleCount: 48, maxDistance: 120, mouseDistance: 160, speed: 0.3 };
  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  const mouse: { x: number | null; y: number | null } = { x: null, y: null };
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let frame: number | null = null;

  function initParticles() {
    particles = [];
    const count = width < 768 ? 28 : config.particleCount;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed,
        size: Math.random() * 2 + 1,
      });
    }
  }

  function drawParticle(p: Particle) {
    context.beginPath();
    context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    context.fillStyle = "rgba(79,125,240,0.75)";
    context.fill();
  }

  function drawLine(a: Point, b: Point, alpha: number) {
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.lineTo(b.x, b.y);
    context.strokeStyle = "rgba(79,125,240," + alpha + ")";
    context.lineWidth = 1;
    context.stroke();
  }

  function draw(move: boolean) {
    context.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (move) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;
      }
      drawParticle(p);
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < config.maxDistance) {
          drawLine(p, q, (1 - dist / config.maxDistance) * 0.22);
        }
      }
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < config.mouseDistance) {
          drawLine(p, { x: mouse.x, y: mouse.y }, (1 - mdist / config.mouseDistance) * 0.35);
        }
      }
    }
  }

  function animate() {
    frame = null;
    if (document.hidden || motion.matches) return;
    draw(true);
    frame = window.requestAnimationFrame(animate);
  }

  function stop() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
  }

  function syncAnimation() {
    stop();
    if (document.hidden) return;
    if (motion.matches) draw(false);
    else animate();
  }

  function resizeCanvas() {
    // A fixed viewport replaces the original hero section's dimensions.
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * window.devicePixelRatio);
    canvas.height = Math.floor(height * window.devicePixelRatio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    initParticles();
    syncAnimation();
  }

  function mousemove(event: MouseEvent) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
    // Reduced motion keeps the particles still, but retains mouse connections.
    if (motion.matches && !document.hidden) draw(false);
  }

  function mouseleave() {
    mouse.x = null;
    mouse.y = null;
    if (motion.matches && !document.hidden) draw(false);
  }

  // Content receives input; the decorative canvas itself remains pointer-events:none.
  window.addEventListener("mousemove", mousemove);
  document.documentElement.addEventListener("mouseleave", mouseleave);
  window.addEventListener("blur", mouseleave);
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", syncAnimation);
  motion.addEventListener("change", syncAnimation);
  resizeCanvas();

  return () => {
    stop();
    window.removeEventListener("mousemove", mousemove);
    document.documentElement.removeEventListener("mouseleave", mouseleave);
    window.removeEventListener("blur", mouseleave);
    window.removeEventListener("resize", resizeCanvas);
    document.removeEventListener("visibilitychange", syncAnimation);
    motion.removeEventListener("change", syncAnimation);
    context.clearRect(0, 0, width, height);
  };
}
