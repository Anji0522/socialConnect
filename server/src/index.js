import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";

const app = createApp();

connectDb()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`SocialConnect API on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
