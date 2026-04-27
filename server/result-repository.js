import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "wfti-user-results.json");

function ensureStoreFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(
        {
          records: {},
        },
        null,
        2
      )
    );
  }
}

function readStore() {
  ensureStoreFile();
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function writeStore(store) {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
}

export function createResultRepository() {
  return {
    saveResult(payload) {
      const store = readStore();
      const existing = store.records[payload.uid] || null;
      const now = new Date().toISOString();
      const idempotentHit =
        Boolean(existing) &&
        existing.computed_at === payload.computed_at &&
        existing.personality_code === payload.personality_code;
      const version = idempotentHit ? existing.version : Number(existing?.version || 0) + 1;
      const record = {
        uid: payload.uid,
        personality_code: payload.personality_code,
        personality_name: payload.personality_name,
        answers: payload.answers,
        raw_scores: payload.raw_scores,
        level_vector: payload.level_vector,
        client_env: payload.client_env,
        computed_at: payload.computed_at,
        updated_at: now,
        version,
        overwrite: Boolean(existing) && !idempotentHit,
        idempotent_hit: idempotentHit,
      };
      store.records[payload.uid] = record;
      writeStore(store);
      return record;
    },
    getLatestResult(uid) {
      const store = readStore();
      return store.records[uid] || null;
    },
  };
}
