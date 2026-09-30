const { Server } = require("socket.io");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join department room for targeted queue updates
    socket.on("joinDepartment", (departmentId) => {
      if (departmentId) {
        socket.join(`department_${departmentId}`);
        console.log(`Socket ${socket.id} joined department_${departmentId}`);
      }
    });

    // Leave department room
    socket.on("leaveDepartment", (departmentId) => {
      if (departmentId) {
        socket.leave(`department_${departmentId}`);
        console.log(`Socket ${socket.id} left department_${departmentId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const notifyQueueUpdate = (departmentId, eventName, payload) => {
  if (!io) return;

  try {
    // Emit global event
    io.emit(eventName, payload);
    io.emit("queueUpdated", { departmentId, timestamp: new Date() });

    // Emit to specific department room if departmentId is provided
    if (departmentId) {
      io.to(`department_${departmentId}`).emit(eventName, payload);
      io.to(`department_${departmentId}`).emit("queueUpdated", { departmentId, timestamp: new Date() });
    }
  } catch (error) {
    console.error("Socket notification error:", error.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  notifyQueueUpdate,
};
