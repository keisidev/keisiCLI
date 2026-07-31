import fs from "fs-extra";
import path from "path";
import { resolveSafePath } from "../utils/paths.mjs";

const IGNORE = ["node_modules", ".git"];

export async function listFiles(dirPath = ".") {
    try {
        const safePath = resolveSafePath(dirPath);
        const exists = await fs.pathExists(safePath);

        if (!exists) {
            throw new Error(`Directory not found: ${dirPath}`);
        }

        const stat = await fs.stat(safePath);

        if (!stat.isDirectory()) {
            throw new Error(`Not a directory: ${dirPath}`);
        }

        const entries = await fs.readdir(safePath);
        const filtered = entries.filter((entry) => !IGNORE.includes(entry));

        const results = await Promise.all(
            filtered.map(async (entry) => {
                const fullPath = path.join(safePath, entry);
                const entryStat = await fs.stat(fullPath);

                return {
                    name: entry,
                    type: entryStat.isDirectory() ? "directory" : "file"
                };
            })
        );

        return {
            success: true,
            path: dirPath,
            entries: results
        };

    } catch (error) {
        throw new Error(`Failed to list "${dirPath}": ${error.message}`);
    }
}

export const listFilesSchema = {
    type: "function",
    function: {
        name: "listFiles",
        description: "List files and directories inside a given directory",
        parameters: {
            type: "object",
            properties: {
                dirPath: { type: "string", description: "The directory path to list, defaults to current directory" }
            },
            required: []
        }
    }
};