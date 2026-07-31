import chalk from "chalk";
import fs from "fs-extra";
import { chat } from "./ai.mjs";
import { config } from "./config.mjs";
import { formatMarkdown } from "./utils/colors.mjs";
import { askQuestion, askMultilineQuestion, closeInput } from "./utils/input.mjs";

const systemMessage = {
    role: "system",
    content: `You are a helpful AI coding assistant running inside a Termux CLI tool called ${config.aiName}. You have access to these tools: readFile, listFiles, createFile, writeFile, deleteFile, renameFile, searchFiles, runCommand.

**RULES:**
1. Use relative paths like "package.json".
2. Use \`readFile\` to read and display file contents when asked.
3. Use \`listFiles\` for directory listings.
4. Use \`createFile\` to create files. Provide \`path\` and optional \`content\`.
5. Use \`writeFile\` to write files. Provide \`path\`, \`content\`, optional \`force\`.
6. Use \`deleteFile\` to delete files. Provide \`path\`, optional \`force\`.
7. Use \`searchFiles\` for text search.
8. Use \`runCommand\` ONLY for scripts, git, installing packages.
9. Be concise and practical.`
};

export async function startCLI() {
    let history = [systemMessage];
    let autoConfirm = false;
    let autoOverwrite = false;

    console.log(chalk.cyan.bold(`\n${config.aiName} — AI coding assistant`));
    console.log(chalk.gray("Type '/' to see commands, or 'exit'/'quit'/'/exit' to leave.\n"));

    while (true) {
        try {
            const input = await askQuestion(chalk.green(`${config.userName}> `));

            if (!input) {
                continue;
            }

            const trimmed = input.trim().toLowerCase();

            if (["exit", "quit", "/exit", "q"].includes(trimmed)) {
                console.log(chalk.gray("Goodbye!"));
                closeInput();
                process.exit(0);
            }

            if (trimmed === "/") {
                console.log(chalk.yellow("Available commands:"));
                console.log("  /auto       — toggle auto-confirm for terminal commands");
                console.log("  /autowrite  — toggle auto-overwrite for file writes");
                console.log("  /clear      — save and clear the conversation");
                console.log("  /load       — restore a saved conversation");
                console.log("  /paste      — paste multi-line content for the AI to use");
                console.log("  /exit       — leave groq-cli");
                console.log("");
                continue;
            }

            if (trimmed === "/auto") {
                autoConfirm = !autoConfirm;
                console.log(
                    chalk.yellow(`Auto-confirm for terminal commands is now ${autoConfirm ? "ON" : "OFF"} (this session only).\n`)
                );
                continue;
            }

            if (trimmed === "/autowrite") {
                autoOverwrite = !autoOverwrite;
                console.log(
                    chalk.yellow(`Auto-overwrite for file writes is now ${autoOverwrite ? "ON" : "OFF"} (this session only).\n`)
                );
                continue;
            }

            if (trimmed === "/clear") {
                const conversation = history.filter((m) => m.role !== "system");

                if (conversation.length === 0) {
                    console.log(chalk.gray("Nothing to clear.\n"));
                    continue;
                }

                await fs.ensureDir("history");
                const filename = `history/${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
                await fs.writeJson(filename, conversation, { spaces: 2 });

                history = [systemMessage];

                console.clear();
                console.log(chalk.cyan.bold(`${config.aiName} — AI coding assistant`));
                console.log(chalk.gray(`Conversation cleared and saved to ${filename}\n`));
                continue;
            }

            if (trimmed === "/load") {
                const exists = await fs.pathExists("history");

                if (!exists) {
                    console.log(chalk.gray("No saved conversations found.\n"));
                    continue;
                }

                const files = (await fs.readdir("history")).filter((f) => f.endsWith(".json"));

                if (files.length === 0) {
                    console.log(chalk.gray("No saved conversations found.\n"));
                    continue;
                }

                console.log(chalk.yellow("Saved conversations:"));
                files.forEach((file, index) => {
                    console.log(`  ${index + 1}. ${file}`);
                });

                const choice = await askQuestion("Enter a number to load (or press Enter to cancel): ");
                const index = parseInt(choice.trim(), 10) - 1;

                if (isNaN(index) || !files[index]) {
                    console.log(chalk.gray("Cancelled.\n"));
                    continue;
                }

                const loaded = await fs.readJson(`history/${files[index]}`);
                history = [systemMessage, ...loaded];

                console.log(chalk.yellow(`Loaded ${files[index]} — conversation restored.\n`));
                continue;
            }

            if (trimmed === "/paste") {
                const pasted = await askMultilineQuestion("Paste your content below:");
                const instruction = await askQuestion(chalk.green("What should I do with this? "));

                const combinedMessage = `Here is some content the user pasted:\n\n${pasted}\n\nInstruction: ${instruction}`;

                history.push({ role: "user", content: combinedMessage });

                console.log(chalk.gray("⏳ Thinking..."));

                try {
                    const response = await chat(history, { autoConfirm, autoOverwrite });
                    history.push({ role: "assistant", content: response });
                    console.log(chalk.magenta(`${config.aiName}> `) + formatMarkdown(response || "") + "\n");
                } catch (error) {
                    console.log(chalk.red(`Error: ${error.message}\n`));
                }
                continue;
            }

            history.push({ role: "user", content: input });

            console.log(chalk.gray("⏳ Thinking..."));

            try {
                const response = await chat(history, { autoConfirm, autoOverwrite });

                history.push({ role: "assistant", content: response });

                console.log(chalk.magenta(`${config.aiName}> `) + formatMarkdown(response || "") + "\n");

            } catch (error) {
                console.log(chalk.red(`Error: ${error.message}\n`));
                history.push({
                    role: "assistant",
                    content: `I encountered an error: ${error.message}. Please try again.`
                });
            }
        } catch (error) {
            console.log(chalk.red(`Input error: ${error.message}\n`));
            continue;
        }
    }
}