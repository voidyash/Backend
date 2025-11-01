import express from "express";
import fs from "fs";
import path from "path";
import { verifyToken } from "../utils/token.js";

const router = express.Router();
const dataPath = path.resolve("./data/siteData.json");

let cachedData = null;

// Load data once into memory
const loadData = () => {
    try {
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(path.dirname(dataPath), { recursive: true });
            fs.writeFileSync(
                dataPath,
                JSON.stringify({ founders: [], roster: [], creators: [], achievements: [], highlights: [] }, null, 2)
            );
        }
        const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
        cachedData = data;
        return data;
    } catch (err) {
        console.error("❌ Error reading siteData.json:", err);
        return {};
    }
};

const writeData = (data) => {
    cachedData = data; // update memory cache
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");
};

// Load once at startup
loadData();

// ✅ GET DATA — super fast now
router.get("/get-data", (req, res) => {
    // Optional: allow browser caching too
    res.setHeader("Cache-Control", "public, max-age=60"); // 1 minute

    res.json(cachedData || loadData());
});

// ✅ UPDATE DATA
router.post("/update-data", (req, res) => {
    try {
        const { email, token, section, newData } = req.body;

        if (!email || !token || !section)
            return res.status(400).json({ error: "Missing fields" });

        const isValid = verifyToken(token, email);
        if (!isValid)
            return res.status(403).json({ error: "Invalid token" });

        const current = cachedData || loadData();

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
