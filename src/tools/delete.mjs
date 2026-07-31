import fs from "fs-extra";
import readlineSync from "readline-sync";
import { resolveSafePath } from "../utils/paths.mjs";
import { stopSpinner } from "../utils/spinner.mjs";

export async function deleteFile(path, force = false) {
    try {
        const safePath = resolveSafePath(path);
        const exists = await fs.pathExists(safePath);

        if (!exists) {
            throw new Error(`File not found: ${path}`);
        }

        if (!force) {
            stopSpinner();
            const confirm = readlineSync.question(
                `Are you sure you want to delete "${path}"? (y/n): `
            );

            if (!["y", "yes"].includes(confirm.trim().toLowerCase())) {
                return {
                    success: false,
                    message: `Deletion cancelled: ${path}`
                };
            }
        }

        await fs.remove(safePath);

        return {
            success: true,
            message: `File deleted successfully: ${path}`
        };

    } catch (error) {
        throw new Error(`Failed to delete "${path}": ${error.message}`);
    }
}

export const deleteFileSchema = {
    type: "function",
    function: {
        name: "deleteFile",
        description: "Delete a file or directory after user confirmation",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "The file path to delete" },
                force: { type: "boolean", description: "Bypass confirmation prompt" }
            },
            required: ["path"]
        }
    }
};