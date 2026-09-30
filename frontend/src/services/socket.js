import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("Socket connection warning:", err.message);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected");
    });
  }

  return socket;
};

export const joinDepartment = (departmentId) => {
  const s = getSocket();
  if (s && departmentId) {
    s.emit("joinDepartment", departmentId);
  }
};

export const leaveDepartment = (departmentId) => {
  const s = getSocket();
  if (s && departmentId) {
    s.emit("leaveDepartment", departmentId);
  }
};
