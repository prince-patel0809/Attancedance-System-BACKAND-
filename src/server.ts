import dotenv from "dotenv";
import app from "./app";
import pool from "./config/db";

import http from "http";
import { Server } from "socket.io";

dotenv.config();

// ===============================
// ✅ CREATE HTTP SERVER
// ===============================
const server = http.createServer(app);

// ===============================
// ✅ SOCKET.IO SETUP
// ===============================
export const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// ===============================
// ✅ SOCKET EVENTS
// ===============================
io.on("connection", (socket) => {

    console.log("User connected:", socket.id);

    // 🔥 Join lecture room
    socket.on("join_lecture", (lectureId) => {
        socket.join(lectureId);
        console.log("Joined lecture:", lectureId);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// ===============================
// ✅ TEST DB CONNECTION
// ===============================
pool.query("SELECT NOW()", (err, res) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to Neon DB:", res.rows[0]);
    }
});

// ===============================
// ✅ START SERVER
// ===============================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});