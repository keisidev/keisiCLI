import fs from "fs-extra";
import path from "path";
import { resolveSafePath } from "../utils/paths.mjs";
import { PROTECTED_FILE_NAMES } from "../constants.mjs";

const IGNORE = ["node_modules", ".git"];

async function walk(dirPath) {
    const entries = await fs.readdir(dirPath);
    let files = [];

    for (const entry of entries) {
        if (IGNORE.includes(entry)) continue;

        const fullPath = path.join(dirPath, entry);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            files = files.concat(await walk(fullPath));
        } else {
            files.push(fullPath);
        }
    }

    return files;
}

export async function searchFiles(query, rootPath = ".") {
    try {
        const safeRootPath = resolveSafePath(rootPath);
        const exists = await fs.pathExists(safeRootPath);

        if (!exists) {
            throw new Error(`Directory not found: ${rootPath}`);
        }

        const files = await walk(safeRootPath);
        const matches = [];
        const needle = query.toLowerCase();

        for (const file of files) {
            const filename = path.basename(file);
            if (PROTECTED_FILE_NAMES.includes(filename)) continue;

            let content;
            try {
                content = await fs.readFile(file, "utf8");
            } catch {
                continue;
            }

            const lines = content.split("\n");

            lines.forEach((lineText, index) => {
                if (lineText.toLowerCase().includes(needle)) {
                    matches.push({
                        file: path.relative(process.cwd(), file),
                        line: index + 1,
                        text: lineText.trim()
                    });
                }
            });
        }

        return {
            success: true,
            query,
            matches
        };

    } catch (error) {
        throw new Error(`Failed to search "${query}": ${error.message}`);
    }
}

export const searchFilesSchema = {
    type: "function",
    function: {
        name: "searchFiles",
        description: "Search recursively for text across files in a directory",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "The text to search for" },
                rootPath: { type: "string", description: "Directory to search, defaults to current directory" }
            },
            required: ["query"]
        }
    }
};