import dotenv from "dotenv";

dotenv.config();

const requiredVars = ["GROQ_API_KEY"];

for (const key of requiredVars) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

export const config = {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    aiName: process.env.AI_NAME || "groq-cli",
    userName: process.env.USER_NAME || "you"
};