import { MongoClient, type Db, ObjectId } from "mongodb";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { seedData } from "./seed";

/**
 * Resilient data store.
 *
 * The project is configured for MongoDB, but so the app stays fully functional
 * even when no Mongo server is reachable, we transparently fall back to an
 * in-memory store that exposes the small slice of the Mongo collection API we
 * use. On first access we try to connect (with a short timeout); on failure we
 * seed and serve data from memory.
 *
 * The in-memory fallback is backed by a JSON file on disk so that everything a
 * user does — their account, profile edits, bookings, chat messages and saved
 * spaces — survives a server restart. Read-only seed data (the spaces catalog)
 * is always sourced fresh from `seed.ts`. Either backend exposes the same
 * interface to callers.
 */

export type Doc = Record<string, unknown>;

/** Collections that hold user-generated data and are persisted to disk. */
const PERSISTED = ["users", "bookings", "chats", "notifications"];
const DATA_FILE =
  process.env.JIVA_DATA_FILE ?? join(process.cwd(), ".data", "jiva-store.json");

type SimpleFilter = Record<string, unknown>;

function matches(doc: Doc, filter: SimpleFilter): boolean {
  return Object.entries(filter).every(([key, cond]) => {
    const value = doc[key];
    if (cond && typeof cond === "object" && !(cond instanceof ObjectId)) {
      const c = cond as Record<string, unknown>;
      if ("$in" in c) return (c.$in as unknown[]).some((v) => eq(value, v));
      if ("$ne" in c) return !eq(value, c.$ne);
      if ("$regex" in c) {
        const re = new RegExp(c.$regex as string, (c.$options as string) ?? "");
        return typeof value === "string" && re.test(value);
      }
    }
    return eq(value, cond);
  });
}

function eq(a: unknown, b: unknown): boolean {
  if (a instanceof ObjectId || b instanceof ObjectId) {
    return String(a) === String(b);
  }
  return a === b;
}

class MemoryCollection<T extends Doc = Doc> {
  private docs: Doc[];
  private name: string;
  constructor(seed: Doc[], name = "") {
    this.docs = seed.map((d) => ({ ...d }));
    this.name = name;
  }
  /** Snapshot used by the disk-persistence layer. */
  all(): Doc[] {
    return this.docs;
  }
  find(filter: SimpleFilter = {}) {
    let results = this.docs.filter((d) => matches(d, filter));
    const api = {
      sort(spec: Record<string, 1 | -1>) {
        const [field, dir] = Object.entries(spec)[0] ?? ["_id", 1];
        results = [...results].sort((a, b) => {
          const av = a[field] as number | string;
          const bv = b[field] as number | string;
          if (av < bv) return dir === 1 ? -1 : 1;
          if (av > bv) return dir === 1 ? 1 : -1;
          return 0;
        });
        return api;
      },
      limit(n: number) {
        results = results.slice(0, n);
        return api;
      },
      async toArray() {
        return results.map((d) => ({ ...d })) as T[];
      },
    };
    return api;
  }
  async findOne(filter: SimpleFilter): Promise<T | null> {
    const found = this.docs.find((d) => matches(d, filter));
    return found ? ({ ...found } as T) : null;
  }
  async insertOne(doc: Doc) {
    const _id = doc._id ?? new ObjectId();
    this.docs.push({ ...doc, _id });
    schedulePersist(this.name);
    return { insertedId: _id, acknowledged: true };
  }
  async updateOne(filter: SimpleFilter, update: { $set?: Doc; $push?: Doc }) {
    const doc = this.docs.find((d) => matches(d, filter));
    if (!doc) return { matchedCount: 0, modifiedCount: 0 };
    if (update.$set) Object.assign(doc, update.$set);
    if (update.$push) {
      for (const [k, v] of Object.entries(update.$push)) {
        if (!Array.isArray(doc[k])) doc[k] = [];
        (doc[k] as unknown[]).push(v);
      }
    }
    schedulePersist(this.name);
    return { matchedCount: 1, modifiedCount: 1 };
  }
  async deleteOne(filter: SimpleFilter) {
    const i = this.docs.findIndex((d) => matches(d, filter));
    if (i >= 0) this.docs.splice(i, 1);
    schedulePersist(this.name);
    return { deletedCount: i >= 0 ? 1 : 0 };
  }
  async countDocuments(filter: SimpleFilter = {}) {
    return this.docs.filter((d) => matches(d, filter)).length;
  }
}

/**
 * Minimal, intentionally-loose collection surface shared by the Mongo driver
 * and the in-memory fallback. We avoid Mongo's strict generic operator types so
 * the same calls type-check against both backends.
 */
type FindCursor<T> = {
  sort(spec: Record<string, 1 | -1>): FindCursor<T>;
  limit(n: number): FindCursor<T>;
  toArray(): Promise<T[]>;
};

export type StoreCollection<T extends Doc = Doc> = {
  find(filter?: SimpleFilter): FindCursor<T>;
  findOne(filter: SimpleFilter): Promise<T | null>;
  insertOne(doc: Doc): Promise<{ insertedId: unknown }>;
  updateOne(
    filter: SimpleFilter,
    update: { $set?: Doc; $push?: Doc }
  ): Promise<{ matchedCount: number; modifiedCount: number }>;
  deleteOne(filter: SimpleFilter): Promise<{ deletedCount: number }>;
  countDocuments(filter?: SimpleFilter): Promise<number>;
};

type Store = {
  collection<T extends Doc = Doc>(name: string): Promise<StoreCollection<T>>;
};

const memoryCollections = new Map<string, MemoryCollection>();

// ---- Disk persistence for the in-memory fallback -------------------------

/** ObjectId values are stored as `{ $oid }` so they round-trip through JSON. */
function serializeDoc(doc: Doc): unknown {
  const out: Record<string, unknown> = { ...doc };
  if (doc._id instanceof ObjectId) out._id = { $oid: String(doc._id) };
  return out;
}
function reviveDoc(doc: Record<string, unknown>): Doc {
  const id = doc._id as { $oid?: string } | undefined;
  if (id && typeof id === "object" && id.$oid) {
    return { ...doc, _id: new ObjectId(id.$oid) };
  }
  return doc;
}

function loadPersisted(): Record<string, Doc[]> {
  try {
    if (!existsSync(DATA_FILE)) return {};
    const raw = JSON.parse(readFileSync(DATA_FILE, "utf8")) as Record<
      string,
      Record<string, unknown>[]
    >;
    const out: Record<string, Doc[]> = {};
    for (const [name, docs] of Object.entries(raw)) {
      out[name] = docs.map(reviveDoc);
    }
    return out;
  } catch {
    return {};
  }
}

function schedulePersist(name: string) {
  if (!PERSISTED.includes(name)) return;
  // Flush synchronously within the request. A deferred setTimeout flush is
  // unreliable here because the dev/server runtime can suspend pending
  // macrotasks once the response has been sent.
  flushToDisk();
}
function flushToDisk() {
  try {
    const out: Record<string, unknown[]> = {};
    for (const name of PERSISTED) {
      const col = memoryCollections.get(name);
      if (col) out[name] = col.all().map(serializeDoc);
    }
    mkdirSync(dirname(DATA_FILE), { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(out, null, 2));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[jiva] failed to persist store:", err);
    }
  }
}

function memoryStore(): Store {
  if (memoryCollections.size === 0) {
    const persisted = loadPersisted();
    for (const [name, docs] of Object.entries(seedData())) {
      // Restore user-generated collections from disk; keep read-only seed data.
      const initial =
        PERSISTED.includes(name) && persisted[name] ? persisted[name] : docs;
      memoryCollections.set(name, new MemoryCollection(initial, name));
    }
  }
  return {
    async collection<T extends Doc>(name: string) {
      if (!memoryCollections.has(name)) {
        memoryCollections.set(name, new MemoryCollection([], name));
      }
      return memoryCollections.get(name) as unknown as StoreCollection<T>;
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var _jivaStore: Promise<Store> | undefined;
}

async function connectMongo(): Promise<Store> {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB ?? "jiva-space";
  if (!uri) throw new Error("no uri");

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 1500 });
  await client.connect();
  const db: Db = client.db(dbName);
  await ensureSeeded(db);
  return {
    async collection<T extends Doc>(name: string) {
      return db.collection(name) as unknown as StoreCollection<T>;
    },
  };
}

async function ensureSeeded(db: Db) {
  for (const [name, docs] of Object.entries(seedData())) {
    const col = db.collection(name);
    if ((await col.countDocuments()) === 0 && docs.length) {
      await col.insertMany(docs.map((d) => ({ ...d })));
    }
  }
}

async function resolveStore(): Promise<Store> {
  try {
    return await connectMongo();
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[jiva] MongoDB unavailable — using in-memory store.");
    }
    return memoryStore();
  }
}

export function getStore(): Promise<Store> {
  if (!global._jivaStore) {
    global._jivaStore = resolveStore();
  }
  return global._jivaStore;
}

export async function getCollection<T extends Doc = Doc>(
  name: string
): Promise<StoreCollection<T>> {
  const store = await getStore();
  return store.collection<T>(name);
}

export { ObjectId };
