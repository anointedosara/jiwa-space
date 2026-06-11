import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB ?? "jiva-space";

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Add it to your .env.local file."
  );
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, use a global variable so the MongoClient is preserved across
// module reloads caused by Hot Module Replacement (HMR). In production, it's
// best to not use a global variable.
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

/** Convenience helper that returns the configured database instance. */
export async function getDb(): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}
