import fs from "fs-extra";
import readlineSync from "readline-sync";
import { logger } from "../utils/logger.mjs";
import { resolveSafePath } from "../utils/paths.mjs";
import { stopSpinner } from "../utils/spinner.mjs";

export async function writeFile(path, content, force = false) {
    try {
        const safePath = resolveSafePath(path);
        const exists = await fs.pathExists(safePath);

        if (exists && !force) {
            stopSpinner();
            logger.warn(`⚠ Warning: "${path}" already exists and will be overwritten.`);

            const confirm = readlineSync.question(
                `Overwrite "${path}"? (y/n): `
            );

            if (!["y", "yes"].includes(confirm.trim().toLowerCase())) {
                return {
                    success: false,
                    message: `Write cancelled: ${path}`
                };
            }
        }

        await fs.writeFile(safePath, content, "utf8");

        return {
            success: true,
            message: `File written successfully: ${path}`
        };

    } catch (error) {
        throw new Error(`Failed to write "${path}": ${error.message}`);
    }
}

export const writeFileSchema = {
    type: "function",
    function: {
        name: "writeFile",
        description: "Write content to a file, creating it if missing or overwriting if present",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "The file path to write to" },
                content: { type: "string", description: "The content to write into the file" },
                force: { type: "boolean", description: "Bypass confirmation when overwriting" }
            },
            required: ["path", "content"]
        }
    }
};