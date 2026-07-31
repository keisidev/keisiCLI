import fs from "fs-extra";
import chalk from "chalk";

const LOG_DIR = "logs";

function getLogFilePath() {
    const date = new Date().toISOString().split("T")[0];
    return `${LOG_DIR}/${date}.log`;
}

async function writeToFile(level, message) {
    await fs.ensureDir(LOG_DIR);
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    await fs.appendFile(getLogFilePath(), line);
}

export const logger = {
    info: (message) => {
        console.log(chalk.blue(message));
        writeToFile("info", message).catch(() => {});
    },

    success: (message) => {
        console.log(chalk.green(message));
        writeToFile("success", message).catch(() => {});
    },

    warn: (message) => {
        console.log(chalk.yellow(message));
        writeToFile("warn", message).catch(() => {});
    },

    error: (message) => {
        console.log(chalk.red(message));
        writeToFile("error", message).catch(() => {});
    }
};