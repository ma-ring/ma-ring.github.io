import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PROTOPEDIA_PROFILE_URL } = require("../config.js");

const OUTPUT_PATH = path.join(process.cwd(), "data", "protopedia.json");
const MAX_ITEMS = 20;
const TOKEN = process.env.PROTOPEDIA_API_V2_TOKEN;

async function main() {
  if (!TOKEN) {
    throw new Error("PROTOPEDIA_API_V2_TOKEN is not set.");
  }

  const client = createClient(TOKEN);
  const payload = await client.listPrototypes({
    userNm: "yohaku_make",
    limit: 20,
    offset: 0
  });

  const items = normalizeItems(payload).slice(0, MAX_ITEMS);

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No ProtoPedia items were returned.");
  }

  const nextJson = JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      profileUrl: PROTOPEDIA_PROFILE_URL,
      count: items.length,
      items
    },
    null,
    2
  ) + "\n";

  const currentJson = await readIfExists(OUTPUT_PATH);

  if (currentJson === nextJson) {
    console.log("protopedia.json is already up to date.");
    return;
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, nextJson, "utf8");
  console.log(`Updated ${OUTPUT_PATH} with ${items.length} items.`);
}

function createClient(token) {
  try {
    const { createProtoPediaClient } = require("protopedia-api-v2-client");
    return createProtoPediaClient({ token });
  } catch (error) {
    throw new Error(`Unable to load protopedia-api-v2-client: ${error.message}`);
  }
}

function normalizeItems(payload) {
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : [];

  return candidates
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: String(item.id ?? item.prototypeId ?? item.prototype_id ?? ""),
      title: sanitizeText(item.prototypeNm ?? item.title ?? item.name ?? ""),
      description: sanitizeText(item.summary ?? item.description ?? item.abstract ?? ""),
      url: normalizeUrl(item.prototypeUrl ?? item.url ?? item.mainUrl ?? item.main_url ?? item.link ?? ""),
      thumbnail: normalizeThumbnail(item.mainUrl ?? item.thumbnail ?? item.image ?? item.cover ?? item.imageUrl ?? item.image_url ?? ""),
      status: item.status ?? item.statusCode ?? null,
      releaseDate: sanitizeText(item.releaseDate ?? item.release_date ?? item.releasedAt ?? item.released_at ?? ""),
      createdAt: sanitizeText(item.createDate ?? item.createdAt ?? item.created_at ?? item.created ?? ""),
      updatedAt: sanitizeText(item.updateDate ?? item.updatedAt ?? item.updated_at ?? item.updated ?? ""),
      tags: normalizeStringArray(item.tags),
      materials: normalizeStringArray(item.materials),
      members: normalizeStringArray(item.users ?? item.members),
      team: sanitizeText(item.teamNm ?? item.team ?? item.team_name ?? ""),
      credit: sanitizeText(item.credit ?? item.teamNm ?? item.team ?? "Collaborative work / yohaku")
    }))
    .filter((item) => item.title && item.url)
    .sort((a, b) => compareDates(b.releaseDate || b.updatedAt || b.createdAt, a.releaseDate || a.updatedAt || a.createdAt));
}

function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === "string") {
          return sanitizeText(entry);
        }

        if (entry && typeof entry === "object") {
          return sanitizeText(entry.name ?? entry.title ?? entry.label ?? entry.value ?? "");
        }

        return "";
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return sanitizeText(value) ? [sanitizeText(value)] : [];
  }

  return [];
}

function normalizeUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return "";
  }

  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return new URL(trimmed, PROTOPEDIA_PROFILE_URL).toString();
  }

  return trimmed.includes("prototype") ? `https://protopedia.net/prototype/${trimmed}` : "";
}

function normalizeThumbnail(value) {
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith("/")) {
      return new URL(trimmed, PROTOPEDIA_PROFILE_URL).toString();
    }
  }

  return "";
}

function compareDates(a, b) {
  const aTime = Date.parse(a);
  const bTime = Date.parse(b);

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
    return 0;
  }

  return bTime - aTime;
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
