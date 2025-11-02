import express from "express";
import admin from "firebase-admin";
import fs from "fs";
import { verifyToken } from "../utils/token.js";

const router = express.Router();

// 🔹 Load service account JSON
let serviceAccount;
if (process.env.FIREBASE_KEY) {
    // Load from environment variable (Cloud Run)
    serviceAccount = JSON.parse(process.env.FIREBASE_KEY);
} else {
    // Load from local file (for local testing)
    serviceAccount = JSON.parse(
        fs.readFileSync(new URL("../serviceAccountKey.json",
            import.meta.url))
    );
}

// 🔹 Initialize Firebase Admin only once
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();
const siteDataRef = db.collection("data").doc("siteData");

// ✅ GET DATA
router.get("/get-data", async(req, res) => {
    try {
        const doc = await siteDataRef.get();
        if (!doc.exists) return res.status(404).json({ error: "No data found" });
        res.json(doc.data());
    } catch (err) {
        console.error("❌ Error fetching data:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// ✅ UPDATE DATA
router.post("/update-data", async(req, res) => {
    try {
        const { email, token, section, newData } = req.body;

        if (!email || !token || !section) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const isValid = verifyToken(token, email);
        if (!isValid) {
            console.warn("❌ Invalid token for", email);
            return res.status(403).json({ error: "Invalid token" });
        }

        const doc = await siteDataRef.get();
        const current = doc.exists ? doc.data() : {};

        current[section] = newData.map((item) => ({
            ...item,
            image: item.image && item.image.trim() !== "" ?
                item.image :
                "/uploads/masked.png",
        }));

        await siteDataRef.set(current, { merge: true });
        res.json({ message: `${section} updated successfully!` });
    } catch (err) {
        console.error("🔥 Error updating data:", err);
        res.status(500).json({ error: "Server error while updating data" });
    }
});

export default router;
