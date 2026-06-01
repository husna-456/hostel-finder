// server.js
console.log("🔥 SERVER.JS FILE LOADED");

import http from "http";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import { startSocket } from "./services/socket.service.js";

const PORT = process.env.PORT || 3000;

connectDB();

const server = http.createServer(app);

// 🔥 socket.io
startSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
