import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async(to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Astra Admin" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
        });
        console.log(`✅ Email sent successfully to ${to}`);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        console.error(error);
        throw error;
    }
};