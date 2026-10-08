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
    // 1. Join department room for targeted queue updates
    socket.on("joinDepartment", (departmentId) => {
      if (departmentId) {
        socket.join(`department_${departmentId}`);
      }
    });

    socket.on("leaveDepartment", (departmentId) => {
      if (departmentId) {
        socket.leave(`department_${departmentId}`);
      }
    });

    // 2. Join private citizen/user room for personalized notifications
    socket.on("joinUser", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    socket.on("leaveUser", (userId) => {
      if (userId) {
        socket.leave(`user_${userId}`);
      }
    });

    // 3. Join office room
    socket.on("joinOffice", (officeId) => {
      if (officeId) {
        socket.join(`office_${officeId}`);
      }
    });

    socket.on("leaveOffice", (officeId) => {
      if (officeId) {
        socket.leave(`office_${officeId}`);
      }
    });

    socket.on("disconnect", () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Queue update broadcaster (supports both new standardized and legacy event names)
const notifyQueueUpdate = (departmentId, eventName, payload) => {
  if (!io) return;

  try {
    const timestamp = new Date();

    // Standardized event mappings
    const standardEventMap = {
      tokenCreated: "token:generated",
      tokenCalled: "token:called",
      serviceStarted: "token:serving",
      serviceCompleted: "token:completed",
      tokenSkipped: "token:skipped",
    };

    const standardEvent = standardEventMap[eventName] || eventName || "queue:updated";

    // 1. Emit legacy event name for existing frontend listeners
    if (eventName) {
      io.emit(eventName, payload);
    }
    io.emit("queueUpdated", { departmentId, timestamp });

    // 2. Emit standardized modern event
    io.emit(standardEvent, payload);
    io.emit("queue:updated", { departmentId, timestamp, payload });

    // 3. Emit to specific department room
    if (departmentId) {
      const room = `department_${departmentId}`;
      if (eventName) {
        io.to(room).emit(eventName, payload);
      }
      io.to(room).emit("queueUpdated", { departmentId, timestamp });
      io.to(room).emit(standardEvent, payload);
      io.to(room).emit("queue:updated", { departmentId, timestamp, payload });
    }
  } catch (error) {
    console.error("Socket notification error:", error.message);
  }
};

// Private user notification broadcaster
const emitUserNotification = (userId, notification) => {
  if (!io || !userId) return;

  try {
    io.to(`user_${userId}`).emit("notification:new", notification);
  } catch (error) {
    console.error("Socket user notification error:", error.message);
  }
};

module.exports = {
  initSocket,
  getIO,
  notifyQueueUpdate,
  emitUserNotification,
};
