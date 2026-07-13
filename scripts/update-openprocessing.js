const fs = require("fs/promises");
const path = require("path");

const OPENPROCESSING_PROFILE_URL =
  process.env.OPENPROCESSING_PROFILE_URL || "https://openprocessing.org/@u265449#sketches";
const OUTPUT_PATH = path.join(process.cwd(), "data", "openprocessing.json");
const MIN_ITEMS = 5;
const MAX_ITEMS = 12;

async function main() {
  const html = await fetchProfileHtml(OPENPROCESSING_PROFILE_URL);
  const items = extractItems(html).slice(0, MAX_ITEMS);

  if (items.length < MIN_ITEMS) {
    throw new Error(`Expected at least ${MIN_ITEMS} items, received ${items.length}.`);
  }

  const nextJson = `${JSON.stringify(items, null, 2)}\n`;
  const currentJson = await readIfExists(OUTPUT_PATH);

  if (currentJson === nextJson) {
    console.log("openprocessing.json is already up to date.");
    return;
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, nextJson, "utf8");
  console.log(`Updated ${OUTPUT_PATH} with ${items.length} items.`);
}

async function fetchProfileHtml(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; portfolio-bot/1.0; +https://github.com/ma-ring/ma-ring.github.io)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OpenProcessing profile: ${response.status}`);
  }

  return response.text();
}

function extractItems(html) {
  const sources = [
    extractItemsFromNextData(html),
    extractItemsFromLdJson(html),
    extractItemsFromLinks(html)
  ];

  const deduped = [];
  const seen = new Set();

  for (const sourceItems of sources) {
    for (const item of sourceItems) {
      if (!item.url || !item.thumbnail || seen.has(item.url)) {
        continue;
      }

      seen.add(item.url);
      deduped.push(item);
    }
  }

  return deduped;
}

function extractItemsFromNextData(html) {
  const match = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);

  if (!match) {
    return [];
  }

  try {
    const parsed = JSON.parse(match[1]);
    const candidates = [];
    collectObjects(parsed, candidates);
    return candidates
      .map(normalizeCandidate)
      .filter(Boolean);
  } catch (error) {
    console.warn("Failed to parse __NEXT_DATA__:", error.message);
    return [];
  }
}

function extractItemsFromLdJson(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const items = [];

  for (const match of matches) {
    try {
      const parsed = JSON.parse(match[1]);
      const candidates = [];
      collectObjects(parsed, candidates);
      items.push(...candidates.map(normalizeCandidate).filter(Boolean));
    } catch (error) {
      console.warn("Failed to parse JSON-LD block:", error.message);
    }
  }

  return items;
}

function extractItemsFromLinks(html) {
  const linkMatches = [
    ...html.matchAll(/<a[^>]+href=["']([^"']*(?:openprocessing\.org\/(?:sketch\/|@[^/"']+\/)\d+|\/(?:sketch\/|@[^/"']+\/)\d+))["'][^>]*>([\s\S]*?)<\/a>/gi)
  ];

  return linkMatches
    .map((match) => {
      const url = toAbsoluteOpenProcessingUrl(match[1]);
      const title = cleanText(match[2]);

      if (!url) {
        return null;
      }

      const nearbyMarkup = match[0];
      const imageMatch = nearbyMarkup.match(/<img[^>]+src=["']([^"']+)["']/i);
      const thumbnail = imageMatch ? toAbsoluteOpenProcessingUrl(imageMatch[1]) || imageMatch[1] : "";

      if (!thumbnail) {
        return null;
      }

      return {
        title: title || "OpenProcessing Sketch",
        url,
        thumbnail
      };
    })
    .filter(Boolean);
}

function collectObjects(value, bucket) {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectObjects(entry, bucket));
    return;
  }

  if (typeof value === "object") {
    bucket.push(value);
    Object.values(value).forEach((entry) => collectObjects(entry, bucket));
  }
}

function normalizeCandidate(candidate) {
  const url = firstString(candidate.url, candidate.link, candidate.href, candidate.canonicalUrl, candidate.path);
  const thumbnail = firstString(
    candidate.thumbnail,
    candidate.thumbnailUrl,
    candidate.image,
    candidate.imageUrl,
    candidate.cover,
    candidate.coverUrl,
    candidate.poster,
    candidate.posterUrl
  );
  const title = firstString(candidate.title, candidate.name, candidate.sketchName, candidate.caption);

  const normalizedUrl = toAbsoluteOpenProcessingUrl(url);
  const normalizedThumbnail = normalizeThumbnail(thumbnail);

  if (!normalizedUrl || !normalizedThumbnail) {
    return null;
  }

  return {
    title: title || "OpenProcessing Sketch",
    url: normalizedUrl,
    thumbnail: normalizedThumbnail
  };
}

function normalizeThumbnail(thumbnail) {
  if (typeof thumbnail === "string") {
    return toAbsoluteOpenProcessingUrl(thumbnail) || thumbnail;
  }

  if (thumbnail && typeof thumbnail === "object") {
    return firstString(
      thumbnail.url,
      thumbnail.src,
      thumbnail.secure_url,
      thumbnail.contentUrl
    );
  }

  return "";
}

function firstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function toAbsoluteOpenProcessingUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmed = value.trim();

  if (/^https?:\/\/(?:www\.)?openprocessing\.org\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/(?:sketch\/|@)/.test(trimmed)) {
    return new URL(trimmed, "https://openprocessing.org").toString();
  }

  return "";
}

function cleanText(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function readIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
