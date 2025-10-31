import express from "express";
import fs from "fs";
import path from "path";
import { verifyToken } from "../utils/token.js";

const router = express.Router();

// Absolute and safe path resolution
const dataPath = path.resolve("./data/siteData.json");

// Helper functions
const readData = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
            fs.writeFileSync(dataPath, JSON.stringify({ founders: [], roster: [], creators: [], achievements: [], highlights: [] }, null, 2));
        }
        return JSON.parse(fs.readFileSync(dataPath, "utf8"));
    } catch (err) {
        console.error("❌ Error reading siteData.json:", err);
        return {};
    }
};

const writeData = (data) => {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
};

// ✅ GET DATA
router.get("/get-data", (req, res) => {
    const data = readData();
    res.json(data);
});

// ✅ UPDATE DATA
router.post("/update-data", (req, res) => {
    try {
        const { email, token, section, newData } = req.body;

        if (!email || !token || !section) {
            return res.status(400).json({ error: "Missing fields" });
        }

        // Token validation
        const isValid = verifyToken(token, email);
        if (!isValid) {
            console.warn("❌ Invalid token for", email);
            return res.status(403).json({ error: "Invalid token" });
        }

        // Read current data
        const current = readData();

        // Update section safely
        // Clean up empty images
        current[section] = newData.map(item => ({
            ...item,
            image: item.image && item.image.trim() !== "" ? item.image : "/uploads/masked.png"
        }));
        writeData(current);

        res.json({ message: `${section} updated successfully!` });
    } catch (err) {
        console.error("🔥 Error updating data:", err);
        res.status(500).json({ error: "Server error while updating data" });
    }
});

export default router;
