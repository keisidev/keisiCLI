import fs from "fs-extra";
import pathModule from "path";
import { resolveSafePath } from "../utils/paths.mjs";
import { PROTECTED_FILE_NAMES } from "../constants.mjs";

export async function readFile(path) {
    try {
        const safePath = resolveSafePath(path);

        const basename = pathModule.basename(safePath);

        if (PROTECTED_FILE_NAMES.includes(basename)) {
            throw new Error(`Refusing to read protected file: ${path}`);
        }

        const exists = await fs.pathExists(safePath);

        if (!exists) {
            throw new Error(`File not found: ${path}`);
        }

        return await fs.readFile(safePath, "utf8");
    } catch (error) {
        throw new Error(`Failed to read "${path}": ${error.message}`);
    }
}

export const readFileSchema = {
    type: "function",
    function: {
        name: "readFile",
        description: "Read the contents of an existing file",
        parameters: {
            type: "object",
            properties: {
                path: {
                    type: "string",
                    description: "The file path to read"
                }
            },
            required: ["path"]
        }
    }
};