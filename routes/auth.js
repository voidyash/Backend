import express from "express";
import fs from "fs";
import { sendEmail } from "../utils/mailer.js";
import { createToken } from "../utils/token.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const otpPath = "./temp/otps.json";

// 🔹 Helpers for local OTP storage
const readOtps = () => {
    if (!fs.existsSync(otpPath)) fs.writeFileSync(otpPath, "{}");
    return JSON.parse(fs.readFileSync(otpPath, "utf8"));
};

const writeOtps = (data) => {
    fs.writeFileSync(otpPath, JSON.stringify(data, null, 2));
};

// ✅ Send OTP
router.post("/send-otp", async(req, res) => {
    try {
        const { email } = req.body;
        const allowedEmails = process.env.ADMIN_EMAILS ?
            process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()) :
            [];

        // Only allow pre-approved admin emails
        if (!allowedEmails.includes(email)) {
            return res.status(403).json({ error: "Unauthorized email" });
        }

        // Generate and store OTP for this email
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otps = readOtps();
        otps[email] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // valid 5 min
        writeOtps(otps);

        // Send OTP directly to the requesting admin
        const subject = "Astra Admin OTP";
        const text = `Your OTP is: ${otp}\n\nValid for 5 minutes.`;

        await sendEmail(email, subject, text);
        console.log(`✅ OTP sent to ${email}`);
        res.json({ message: "OTP sent successfully!" });
    } catch (err) {
        console.error("❌ Error sending OTP:", err.message);
        res.status(500).json({ error: "Error sending OTP" });
    }
});

// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const otps = readOtps();
    const entry = otps[email];

    // Validate OTP existence, expiry, and match
    if (!entry || entry.expires < Date.now() || entry.otp !== otp) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // Generate access token and clean up used OTP
    const token = createToken(email);
    delete otps[email];
    writeOtps(otps);

    res.json({ token });
});

export default router;
