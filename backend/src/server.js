require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const server = http.createServer(app);
const { initSocket } = require("./sockets/socket");
initSocket(server);

connectDB().then(() => {
  const { seedInitialLocations } = require("./controllers/locationController");
  seedInitialLocations().catch((err) => console.error("Initial seed error:", err));
});

const PORT = process.env.PORT || 5000;

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n❌ Error: Port ${PORT} is already in use by another process!`);
    console.error(`👉 You already have an instance of the backend running (e.g. 'npm run dev' or another terminal).`);
    console.error(`👉 Solution: Stop the existing backend terminal, or close any process using port ${PORT}.\n`);
    process.exit(1);
  } else {
    console.error("❌ Server Error:", error);
    process.exit(1);
  }
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});