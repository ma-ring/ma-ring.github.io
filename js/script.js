const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let particles = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  createParticles();
}

function createParticles() {
  particles = [];
  const count = Math.min(150, Math.floor(width / 8));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.4,
      a: Math.random() * Math.PI * 2,
      s: Math.random() * 0.25 + 0.08,
      hue: Math.random() > 0.5 ? 205 : 330
    });
  }
}

function drawWave(t) {
  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 1;

  for (let j = 0; j < 6; j++) {
    ctx.beginPath();

    for (let x = -50; x < width + 50; x += 12) {
      const y =
        height * 0.38 +
        Math.sin(x * 0.008 + t * 0.001 + j) * 45 +
        Math.sin(x * 0.018 + t * 0.0007) * 18 +
        j * 20;

      if (x === -50) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = `hsla(${195 + j * 12}, 80%, 58%, 0.35)`;
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles(t) {
  particles.forEach((p) => {
    p.a += p.s * 0.01;

    const driftX = Math.cos(p.a + t * 0.0003) * 0.25;
    const driftY = Math.sin(p.a + t * 0.0004) * 0.2;

    p.x += driftX;
    p.y += driftY;

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, 0.35)`;
    ctx.fill();
  });
}

function drawGradientBlob(t) {
  const x = width * 0.72 + Math.sin(t * 0.0004) * 80;
  const y = height * 0.28 + Math.cos(t * 0.0005) * 50;

  const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(width, height) * 0.45);
  g.addColorStop(0, "rgba(255, 184, 216, 0.45)");
  g.addColorStop(0.35, "rgba(162, 213, 255, 0.26)");
  g.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

function animate(t) {
  ctx.clearRect(0, 0, width, height);

  drawGradientBlob(t);
  drawWave(t);
  drawParticles(t);

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);

resize();
requestAnimationFrame(animate);