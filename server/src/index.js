import http from "http";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { createApp } from "./app.js";
import { initSocket } from "./socket.js";

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.io on the HTTP server
initSocket(server, env.clientOrigin);

connectDb()
  .then(() => {
    server.listen(env.port, () => {
      console.log(`SocialConnect API + Socket.io running on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
