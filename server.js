import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";

dotenv.config();

// ✅ Connect to Mongo Database
connectDB();

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ✅ Routes (import *after* app is initialized)
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";
import uploadRoutes from "./routes/upload.js";

app.use("/api", authRoutes);
app.use("/api", dataRoutes);
app.use("/api", uploadRoutes);

// ✅ Static Frontend Serve
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const frontendPath = path.join(__dirname, "../dist");
app.use(express.static(frontendPath));

app.get("/", (_, res) =>
    res.sendFile(path.join(frontendPath, "index.html"))
);

// ✅ Server Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`✅ Server running on port ${PORT}`));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});