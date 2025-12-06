import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("SMTP Configuration:");
console.log("Host:", process.env.SMTP_HOST);
console.log("Port:", process.env.SMTP_PORT);
console.log("User:", process.env.SMTP_USER);
console.log("Pass:", process.env.SMTP_PASS ? "***" + process.env.SMTP_PASS.slice(-4) : "Not set");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

console.log("\nTesting SMTP connection...");
transporter.verify(function (error, success) {
    if (error) {
        console.log("❌ SMTP Error:", error);
    } else {
        console.log("✅ Server is ready to take our messages");
        
        // Try sending a test email
        transporter.sendMail({
            from: process.env.SMTP_USER,
            to: "rudrasaha305@gmail.com",
            subject: "Test OTP",
            text: "Your OTP is: 123456",
        }, (err, info) => {
            if (err) {
                console.log("❌ Send Error:", err);
            } else {
                console.log("✅ Email sent:", info.response);
            }
        });
    }
});
