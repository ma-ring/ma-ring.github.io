import fs from "fs/promises";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { PROTOPEDIA_PROFILE_URL } = require("../config.js");

const OUTPUT_PATH = path.join(process.cwd(), "data", "protopedia.json");
const MAX_ITEMS = 5;
const TOKEN = "8c6382274c0c828a5a51e6d3cca5860e";//process.env.PROTOPEDIA_API_V2_TOKEN;
const API_URL = process.env.PROTOPEDIA_API_URL || "https://protopedia.net/v2/api/";

async function main() {
  if (!TOKEN) {
    console.warn("PROTOPEDIA_API_V2_TOKEN is not set; skipping ProtoPedia update.");
    return;
  }

  let payload;

  try {
    payload = await loadPayload(TOKEN);
  } catch (error) {
    console.warn(`ProtoPedia update skipped: ${error.message}`);
    return;
  }

  const items = normalizeItems(payload).slice(0, MAX_ITEMS);

  if (!Array.isArray(items) || items.length === 0) {
    console.warn("No ProtoPedia items were returned; keeping existing JSON.");
    return;
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

async function loadPayload(token) {
  try {
    const client = await createClient(token);
    if (client && typeof client.listPrototypes === "function") {
      return await client.listPrototypes({
        userNm: "yohaku_make",
        limit: 20,
        offset: 0
      });
    }
  } catch (error) {
    console.warn(`ProtoPedia client unavailable, falling back to REST fetch: ${error.message}`);
  }

  return loadPayloadViaRest(token);
}

async function createClient(token) {
  try {
    const module = await import("protopedia-api-v2-client");
    const createProtoPediaClient = module.createProtoPediaClient ?? module.default?.createProtoPediaClient;
    if (typeof createProtoPediaClient !== "function") {
      throw new Error("createProtoPediaClient is not exported.");
    }
    return createProtoPediaClient({ token });
  } catch (error) {
    throw new Error(`Unable to load protopedia-api-v2-client: ${error.message}`);
  }
}

async function loadPayloadViaRest(token) {
  const urls = [
    `${API_URL.replace(/\/$/, "")}/prototypes?userNm=yohaku_make&limit=20&offset=0`,
    `${API_URL.replace(/\/$/, "")}?userNm=yohaku_make&limit=20&offset=0`,
    API_URL
  ];

  let lastError;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        lastError = new Error(`REST request failed with ${response.status}`);
        continue;
      }

      const payload = await response.json();
      console.log("ProtoPedia REST payload sample:", JSON.stringify(payload).slice(0, 1200));
      if (isPayloadUsable(payload)) {
        return payload;
      }

      lastError = new Error("REST response did not contain usable ProtoPedia data.");
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to load ProtoPedia data from the API.");
}

function isPayloadUsable(payload) {
  return Array.isArray(payload) || Array.isArray(payload?.items) || Array.isArray(payload?.data);
}

function normalizeItems(payload) {
  const candidates = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.items)
        ? payload.items
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

  return candidates
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      id: String(item.id ?? item.prototypeId ?? item.prototype_id ?? ""),
      title: sanitizeText(item.prototypeNm ?? item.title ?? item.name ?? ""),
      description: sanitizeText(item.summary ?? item.description ?? item.abstract ?? ""),
      url: normalizePrototypeUrl(item.id ?? item.prototypeId ?? item.prototype_id ?? ""),
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
    .sort((a, b) => compareDates(normalizeDateValue(a.releaseDate || a.updatedAt || a.createdAt), normalizeDateValue(b.releaseDate || b.updatedAt || b.createdAt)));
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

function normalizePrototypeUrl(id) {
  if (typeof id !== "string" && typeof id !== "number") {
    return "";
  }

  const normalizedId = String(id).trim();
  return normalizedId ? `https://protopedia.net/prototype/${normalizedId}` : "";
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
  const aTime = Date.parse(normalizeDateValue(a));
  const bTime = Date.parse(normalizeDateValue(b));

  if (Number.isNaN(aTime) || Number.isNaN(bTime)) {
    return 0;
  }

  return bTime - aTime;
}

function normalizeDateValue(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\s+/g, " ");
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
