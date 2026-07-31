import readline from "node:readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

export function askQuestion(promptText) {
    return new Promise((resolve) => {
        rl.question(promptText, (answer) => {
            resolve(answer);
        });
    });
}

const END_MARKER = ":::end";

export function askMultilineQuestion(promptText) {
    return new Promise((resolve) => {
        console.log(promptText);
        console.log(`(Paste your content, then type ${END_MARKER} on its own line to finish)`);

        const lines = [];

        function onLine(line) {
            if (line.trim() === END_MARKER) {
                rl.removeListener("line", onLine);
                resolve(lines.join("\n"));
            } else {
                lines.push(line);
            }
        }

        rl.on("line", onLine);
    });
}

export function closeInput() {
    rl.close();
}