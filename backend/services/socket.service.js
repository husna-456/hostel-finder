import { initSocket } from "../config/socket.js";

let ioInstance = null;

/**
 * Initialize socket once
 */
export const startSocket = (httpServer) => {
  console.log("🧪 startSocket() called");
  if (!ioInstance) {
    ioInstance = initSocket(httpServer);
    console.log("🔌 Socket service initialized");
  }
  return ioInstance;
};

/**
 * Get socket instance anywhere
 */
export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
};
