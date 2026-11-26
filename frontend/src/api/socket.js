import { io } from "socket.io-client";
import { getApiBaseUrl } from "./axiosClient";

let socket;

export const getSocket = () => {
  if (!socket) {
    const apiBase = getApiBaseUrl();
    const socketUrl = apiBase.replace(/\/api\/?$/, "");
    socket = io(socketUrl, {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket.IO connection warning:", err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
