import fs from "fs-extra";
import { resolveSafePath } from "../utils/paths.mjs";

export async function createFile(path, content = "") {
    try {
        const safePath = resolveSafePath(path);

        const exists = await fs.pathExists(safePath);

        if (exists) {
            throw new Error(`File already exists: ${path}`);
        }

        await fs.writeFile(safePath, content, "utf8");

        return {
            success: true,
            message: `File created successfully: ${path}`
        };

    } catch (error) {
        throw new Error(`Failed to create "${path}": ${error.message}`);
    }
}

export const createFileSchema = {
    type: "function",
    function: {
        name: "createFile",
        description: "Create a new file, refusing if the file already exists",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "The file path to create" },
                content: { type: "string", description: "Initial content for the new file" }
            },
            required: ["path"]
        }
    }
};