import express from "express";
import fs from "fs";
import { sendEmail } from "../utils/mailer.js";
import { createToken } from "../utils/token.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const otpPath = "./temp/otps.json";

// Basic OTP read/write helpers
const readOtps = () => {
    if (!fs.existsSync(otpPath)) fs.writeFileSync(otpPath, "{}");
    return JSON.parse(fs.readFileSync(otpPath, "utf8"));
};
const writeOtps = (data) =>
    fs.writeFileSync(otpPath, JSON.stringify(data, null, 2));


// ✅ Send OTP
router.post("/send-otp", async(req, res) => {
    try {
        const { email } = req.body;
        const allowedEmails = process.env.ADMIN_EMAILS ?
            process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()) :
            [];

        if (!allowedEmails.includes(email)) {
            return res.status(403).json({ error: "Unauthorized email" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // store only the latest OTP (not per email)
        const otps = { otp, expires: Date.now() + 5 * 60 * 1000 };
        writeOtps(otps);

        // Send to your central inbox
        const subject = `Admin OTP Requested by ${email}`;
        const text = `An OTP has been requested by ${email}.\n\nOTP: ${otp}\n\nValid for 5 minutes.`;

        await sendEmail(process.env.SMTP_USER, subject, text);
        console.log(`✅ OTP sent to central inbox for ${email}`);
        res.json({ message: "OTP sent to admin inbox successfully!" });
    } catch (err) {
        console.error("❌ Error sending OTP:", err.message);
        res.status(500).json({ error: "Error sending OTP" });
    }
});


// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const stored = readOtps();

    if (!stored.otp || stored.expires < Date.now() || stored.otp !== otp) {
        return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    const token = createToken(email);
    fs.unlinkSync(otpPath); // clear OTP after success

    res.json({ token });
});

export default router;
