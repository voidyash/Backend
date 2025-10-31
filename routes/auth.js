import express from "express";
import fs from "fs";
import { sendEmail } from "../utils/mailer.js";
import { createToken } from "../utils/token.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const otpPath = "./temp/otps.json";

const readOtps = () => {
    if (!fs.existsSync(otpPath)) fs.writeFileSync(otpPath, "{}");
    return JSON.parse(fs.readFileSync(otpPath, "utf8"));
};
const writeOtps = (data) => fs.writeFileSync(otpPath, JSON.stringify(data, null, 2));

// ✅ Send OTP
router.post("/send-otp", async(req, res) => {
    const { email } = req.body;
    const allowedEmails = process.env.ADMIN_EMAILS ?
        process.env.ADMIN_EMAILS.split(",") : [];

    if (!allowedEmails.includes(email)) {
        return res.status(403).json({ error: "Unauthorized email" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otps = readOtps();
    otps[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
    writeOtps(otps);

    await sendEmail(process.env.SMTP_USER, "Astra Admin OTP", `Your OTP is: ${otp} (for ${email})`);
    res.json({ message: "OTP sent successfully!" });
});


// ✅ Verify OTP
router.post("/verify-otp", (req, res) => {
    const { email, otp } = req.body;
    const otps = readOtps();
    const entry = otps[email];

    if (!entry || entry.expires < Date.now() || entry.otp !== otp)
        return res.status(401).json({ error: "Invalid or expired OTP" });

    const token = createToken(email);
    delete otps[email];
    writeOtps(otps);

    res.json({ token });
});

export default router;