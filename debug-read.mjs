// debug-read.mjs
import { readFile } from "./src/tools/read.mjs";

try {
    const result = await readFile("package.json");
    console.log("✅ readFile result:");
    console.log("Type:", typeof result);
    console.log("Length:", result ? result.length : 0);
    console.log("First 200 chars:", result ? result.substring(0, 200) : "null");
    console.log("Full content:\n", result);
} catch (error) {
    console.log("❌ Error:", error.message);
}