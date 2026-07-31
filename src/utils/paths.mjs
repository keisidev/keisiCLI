import path from "path";

const PROJECT_ROOT = process.cwd();

export function resolveSafePath(inputPath) {
    const resolved = path.resolve(PROJECT_ROOT, inputPath);
    const relative = path.relative(PROJECT_ROOT, resolved);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new Error(`Access denied: path is outside project directory: ${inputPath}`);
    }

    return resolved;
}