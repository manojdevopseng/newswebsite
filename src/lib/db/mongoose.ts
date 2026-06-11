import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | null;
}

async function dbConnect(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not defined");

  if (!global._mongoosePromise) {
    global._mongoosePromise = mongoose.connect(uri, {
      bufferCommands: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 45_000,
      socketTimeoutMS: 45_000,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  return global._mongoosePromise;
}

export default dbConnect;
