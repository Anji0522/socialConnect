import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb(uri = env.mongoUri) {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
  } catch (err) {
    if (env.nodeEnv !== "production") {
      console.warn(`[mongo] Local MongoDB not reachable at ${uri}. Launching embedded in-memory MongoDB...`);
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mem = await MongoMemoryServer.create();
      globalThis.__MONGO_INSTANCE__ = mem;
      await mongoose.connect(mem.getUri());
      console.log("[mongo] Connected to embedded MongoDB successfully.");
      return;
    }
    throw err;
  }
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (globalThis.__MONGO_INSTANCE__) {
    await globalThis.__MONGO_INSTANCE__.stop();
    globalThis.__MONGO_INSTANCE__ = null;
  }
}
