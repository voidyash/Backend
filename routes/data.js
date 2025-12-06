import express from "express";
import fs from "fs";
import path from "path";
import { verifyToken } from "../utils/token.js";
import SiteData from "../models/SiteData.js";

const router = express.Router();

// ✅ Create uploads directory if it doesn't exist
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ GET DATA
router.get("/get-data", async (req, res) => {
    try {
        const allData = await SiteData.find({});
        const formattedData = {};
        allData.forEach(doc => {
            formattedData[doc.section] = doc.items;
        });
        res.json(formattedData);
    } catch (err) {
        console.error("❌ Error fetching data:", err);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// ✅ UPDATE DATA
router.post("/update-data", async (req, res) => {
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

        const updatedItems = [];
        for (const item of newData) {
            let imageUrl = item.image;

            if (imageUrl && imageUrl.startsWith("data:image")) {
                const base64Data = imageUrl.split(";base64,").pop();
                const fileName = `${Date.now()}_${Math.random()
                    .toString(36)
                    .substring(2, 10)}.jpg`;
                const filePath = path.join(uploadDir, fileName);

                fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
                imageUrl = `/uploads/${fileName}`;

                console.log(`✅ Uploaded image for ${section}: ${imageUrl}`);
            }

            updatedItems.push({
                ...item,
                image: imageUrl && imageUrl.trim() !== "" ? imageUrl : "/uploads/masked.png",
            });
        }

        await SiteData.findOneAndUpdate(
            { section },
            { section, items: updatedItems },
            { upsert: true, new: true }
        );

        res.json({ message: `${section} updated successfully!` });
    } catch (err) {
        console.error("🔥 Error updating data:", err);
        res.status(500).json({ error: "Server error while updating data" });
    }
});

export default router;
