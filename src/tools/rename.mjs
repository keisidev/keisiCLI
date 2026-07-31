import fs from "fs-extra";
import { resolveSafePath } from "../utils/paths.mjs";

export async function renameFile(oldPath, newPath) {
    try {
        const safeOldPath = resolveSafePath(oldPath);
        const safeNewPath = resolveSafePath(newPath);

        const oldExists = await fs.pathExists(safeOldPath);

        if (!oldExists) {
            throw new Error(`File not found: ${oldPath}`);
        }

        const newExists = await fs.pathExists(safeNewPath);

        if (newExists) {
            throw new Error(`Cannot rename, target already exists: ${newPath}`);
        }

        await fs.move(safeOldPath, safeNewPath);

        return {
            success: true,
            message: `Renamed "${oldPath}" to "${newPath}"`
        };

    } catch (error) {
        throw new Error(`Failed to rename "${oldPath}": ${error.message}`);
    }
}

export const renameFileSchema = {
    type: "function",
    function: {
        name: "renameFile",
        description: "Rename or move a file, refusing if destination exists",
        parameters: {
            type: "object",
            properties: {
                oldPath: { type: "string", description: "The current file path" },
                newPath: { type: "string", description: "The new file path" }
            },
            required: ["oldPath", "newPath"]
        }
    }
};