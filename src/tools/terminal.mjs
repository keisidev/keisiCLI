import { exec } from "child_process";
import readlineSync from "readline-sync";
import { logger } from "../utils/logger.mjs";
import { stopSpinner } from "../utils/spinner.mjs";
import {
    DANGEROUS_PATTERNS,
    PROTECTED_FILE_PATTERNS,
    SELF_INVOCATION_PATTERNS
} from "../constants.mjs";

const TIMEOUT_MS = 15000;

export async function runCommand(command, force = false) {
    return new Promise((resolve, reject) => {
        try {
            const isDangerous = DANGEROUS_PATTERNS.some((pattern) =>
                pattern.test(command)
            );

            if (isDangerous) {
                return reject(
                    new Error(`Blocked potentially destructive command: ${command}`)
                );
            }

            const isSelfInvocation = SELF_INVOCATION_PATTERNS.some((pattern) =>
                pattern.test(command)
            );

            if (isSelfInvocation) {
                return reject(
                    new Error(`Blocked: "${command}" would start another groq-cli session. Use "cat index.mjs" to view the file instead.`)
                );
            }

            const touchesProtectedFile = PROTECTED_FILE_PATTERNS.some((pattern) =>
                pattern.test(command)
            );

            if (touchesProtectedFile) {
                logger.warn(`⚠ Warning: command may expose sensitive file contents: ${command}`);
            }

            if (!force) {
                stopSpinner();
                const confirm = readlineSync.question(
                    `Run command: "${command}"? (y/n): `
                );

                if (!["y", "yes"].includes(confirm.trim().toLowerCase())) {
                    return resolve({
                        success: false,
                        message: `Command cancelled: ${command}`
                    });
                }
            }

            exec(command, { timeout: TIMEOUT_MS }, (error, stdout, stderr) => {
                if (error) {
                    return resolve({
                        success: false,
                        command,
                        stdout: stdout.trim(),
                        stderr: stderr.trim(),
                        exitCode: error.code ?? null,
                        message: `Command failed: ${command}`
                    });
                }

                resolve({
                    success: true,
                    command,
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    exitCode: 0,
                    message: `Command executed: ${command}`
                });
            });

        } catch (error) {
            reject(new Error(`Failed to run "${command}": ${error.message}`));
        }
    });
}

export const runCommandSchema = {
    type: "function",
    function: {
        name: "runCommand",
        description: "Execute a shell command, returning stdout, stderr, and exit code",
        parameters: {
            type: "object",
            properties: {
                command: { type: "string", description: "The shell command to execute" },
                force: { type: "boolean", description: "Bypass prompt and force execution" }
            },
            required: ["command"]
        }
    }
};