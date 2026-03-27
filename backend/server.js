import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { setupSocket } from "./socket/socketHandler.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 📌 Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("API running");
});

// 🔥 CREATE HTTP SERVER
const server = http.createServer(app);

// 🔥 SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite frontend
        methods: ["GET", "POST"],
    },
});

// 🔥 Initialize socket handlers
setupSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);
