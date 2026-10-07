import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "localhost";
    const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return envUrl;
    }
    const protocol = window.location.protocol || "http:";
    return `${protocol}//${hostname}:5000`;
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
};

const socket = io(getSocketUrl(), {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

export const connectSocket = (user) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("chat_token");
    socket.auth = {
      token,
      userId: user?._id || user?.id,
    };
  }

  if (!socket.connected) {
    socket.connect();
  }

  if (user) {
    socket.emit("setup", user);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;