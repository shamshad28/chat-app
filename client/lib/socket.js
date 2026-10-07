import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname || "localhost";
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000";
    }
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:5000`;
    }
    return window.location.origin;
  }
  return "http://localhost:5000";
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