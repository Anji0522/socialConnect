import mongoose from "mongoose";
import { createApp } from "../app.js";

export async function startTestApp() {
  const uri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;
  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
      const collections = mongoose.connection.collections;
      for (const name in collections) {
        await collections[name].deleteMany({});
      }
      const app = createApp();
      return {
        app,
        async stop() {
          await mongoose.disconnect();
        },
      };
    } catch {
      // If local/remote URI is not reachable, fall back to MongoMemoryServer
    }
  }

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  const app = createApp();
  return {
    app,
    async stop() {
      await mongoose.disconnect();
      await mongo.stop();
    },
  };
}
