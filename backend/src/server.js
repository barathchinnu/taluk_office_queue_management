require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

const server = http.createServer(app);
const { initSocket } = require("./sockets/socket");
initSocket(server);

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});