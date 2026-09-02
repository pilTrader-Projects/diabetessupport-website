import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/diabetessupport';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Establishes or retrieves a cached Mongoose database connection for serverless runtime efficiency.
 *
 * @usecase Prevents multiple database connection instantiation during Next.js App Router API route executions.
 * @param None Uses process.env.MONGODB_URI or defaults to local MongoDB instance.
 * @dependencies Mongoose ODM library, process.env.MONGODB_URI.
 * @returns {Promise<typeof mongoose>} Resolved active Mongoose connection object.
 * @throws {Error} Throws connection failure error if the database connection fails or times out.
 */
export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
