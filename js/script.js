const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");

const OPENPROCESSING_PROFILE_URL = "https://openprocessing.org/@u265449#sketches";
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/_ma_ring_drawing_/";
const GALLERY_LIMIT = 5;
const protopediaRuntimeConfig = window.PROTOPEDIA_CONFIG || {};
const PROTOPEDIA_PROFILE_URL = protopediaRuntimeConfig.PROTOPEDIA_PROFILE_URL || "https://protopedia.net/prototyper/yohaku_make";

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

async function loadGallerySection({
  sectionSelector,
  containerSelector,
  jsonUrl,
  limit = GALLERY_LIMIT,
  fallbackAlt,
  showTitle = true,
  cardLabel = "OpenProcessing"
}) {
  const section = document.querySelector(sectionSelector);
  const container = document.querySelector(containerSelector);

  if (!section || !container) {
    return;
  }

  try {
    const response = await fetch(jsonUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load ${jsonUrl}: ${response.status}`);
    }

    const items = await response.json();
    const normalizedItems = normalizeGalleryItems(items).slice(0, limit);

    if (normalizedItems.length === 0) {
      section.hidden = true;
      return;
    }

    const fragment = document.createDocumentFragment();

    normalizedItems.forEach((item) => {
      fragment.appendChild(createGalleryCard({ item, fallbackAlt, showTitle, cardLabel }));
    });

    container.replaceChildren(fragment);
    section.hidden = false;
  } catch (error) {
    console.error(error);
    section.hidden = true;
  }
}

function normalizeGalleryItems(items) {
  const sourceItems = Array.isArray(items)
    ? items
    : Array.isArray(items?.items)
      ? items.items
      : [];

  return sourceItems
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const normalizedUrl = typeof item.url === "string" ? item.url.trim() : "";
      const normalizedThumbnail = typeof item.thumbnail === "string" ? item.thumbnail.trim() : "";
      const normalizedThumbnailUrl = normalizeThumbnailUrl(normalizedThumbnail);
      const normalizedTitle = typeof item.title === "string" ? item.title.trim() : "";
      const normalizedDescription = typeof item.description === "string" ? item.description.trim() : "";
      const normalizedDate = typeof item.date === "string" ? item.date.trim() : "";

      return {
        ...item,
        url: normalizedUrl,
        thumbnail: normalizedThumbnailUrl,
        title: normalizedTitle,
        description: normalizedDescription,
        date: normalizedDate
      };
    })
    .filter((item) => item.url && (item.thumbnail || item.image))
    .map((item) => ({
      ...item,
      thumbnail: item.thumbnail || item.image || ""
    }));
}

function normalizeThumbnailUrl(thumbnail) {
  if (!thumbnail) {
    return "";
  }

  if (/^https?:\/\//i.test(thumbnail)) {
    return thumbnail;
  }

  if (thumbnail.startsWith("./")) {
    return thumbnail.replace(/^\.\//, "");
  }

  return thumbnail;
}

function createGalleryCard({ item, fallbackAlt, showTitle, cardLabel }) {
  const card = document.createElement("a");
  card.className = `gallery-card${showTitle ? "" : " image-only"}`;
  card.href = item.url;
  card.target = "_blank";
  card.rel = "noopener noreferrer";

  const itemTitle = typeof item.title === "string" && item.title.trim() ? item.title.trim() : "";
  const imageAlt = itemTitle || fallbackAlt;
  const screenReaderLabel = itemTitle
    ? `${itemTitle} を外部サイトで開く`
    : `${fallbackAlt} を外部サイトで開く`;

  card.setAttribute("aria-label", screenReaderLabel);

  const thumb = document.createElement("div");
  thumb.className = "gallery-thumb";

  const image = document.createElement("img");
  image.src = item.thumbnail;
  image.alt = imageAlt;
  image.loading = "lazy";

  thumb.appendChild(image);
  card.appendChild(thumb);

  if (showTitle) {
    const body = document.createElement("div");
    body.className = "gallery-body";

    const label = document.createElement("p");
    label.className = "gallery-label";
    label.textContent = cardLabel;

    const title = document.createElement("h3");
    title.className = "gallery-title";
    title.textContent = itemTitle || fallbackAlt;

    body.append(label, title);

    if (typeof item.description === "string" && item.description.trim()) {
      const description = document.createElement("p");
      description.className = "gallery-description";
      description.textContent = item.description;
      body.appendChild(description);
    }

    if (typeof item.date === "string" && item.date.trim()) {
      const date = document.createElement("p");
      date.className = "gallery-date";
      date.textContent = item.date;
      body.appendChild(date);
    }

    card.appendChild(body);
  }

  return card;
}

document.querySelectorAll('[href="https://openprocessing.org/@u265449#sketches"]').forEach((link) => {
  link.href = OPENPROCESSING_PROFILE_URL;
});

document.querySelectorAll('[href="https://www.instagram.com/_ma_ring_drawing_/"]').forEach((link) => {
  link.href = INSTAGRAM_PROFILE_URL;
});

document.querySelectorAll('[data-protopedia-link]').forEach((link) => {
  link.href = PROTOPEDIA_PROFILE_URL;
});

loadGallerySection({
  sectionSelector: "#creative-coding",
  containerSelector: "#creative-coding [data-gallery-container]",
  jsonUrl: "data/openprocessing.json",
  fallbackAlt: "Creative coding work"
});


loadGallerySection({
  sectionSelector: "#illustration",
  containerSelector: "#illustration [data-gallery-container]",
  jsonUrl: "data/illustrations.json",
  fallbackAlt: "Illustration",
  showTitle: true,
  cardLabel:"Instagram"
});



loadGallerySection({
  sectionSelector: "#protopedia",
  containerSelector: "#protopedia [data-protopedia-container]",
  jsonUrl: "data/protopedia.json",
  fallbackAlt: "Collaborative prototype",
  cardLabel: "Collaborative work / yohaku",
});