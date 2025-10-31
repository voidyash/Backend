import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

export const createToken = (email) =>
    crypto.createHash("sha256").update(process.env.SECRET_KEY + email).digest("hex");

export const verifyToken = (token, email) =>
    token === createToken(email);