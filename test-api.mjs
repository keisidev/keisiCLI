import OpenAI from "openai";
import { config } from "./src/config.mjs";

const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
});

try {
    const response = await client.chat.completions.create({
        model: config.model,
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 10
    });
    console.log("✅ API works:", response.choices[0].message.content);
} catch (error) {
    console.error("❌ API error:", error.message);
}