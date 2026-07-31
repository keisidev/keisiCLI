import chalk from "chalk";

export function formatMarkdown(text) {
    let formatted = text;

    const codeBlocks = [];

    // Replace triple-backtick code blocks first, using a placeholder
    // that cannot collide with bold/italic markdown syntax.
    formatted = formatted.replace(/```([\s\S]*?)```/g, (_, code) => {
        codeBlocks.push(chalk.bgBlack.green(code.trim()));
        return `\u0000CODEBLOCK${codeBlocks.length - 1}\u0000`;
    });

    // Inline code: `code`
    formatted = formatted.replace(/`([^`]+)`/g, (_, code) =>
        chalk.bgBlack.yellow(` ${code} `)
    );

    // Bold: **text**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, (_, boldText) =>
        chalk.bold(boldText)
    );

    // Italic: *text* or _text_
    formatted = formatted.replace(/(?:\*([^*]+)\*|_([^_]+)_)/g, (_, a, b) =>
        chalk.italic(a || b)
    );

    // Restore code blocks
    codeBlocks.forEach((block, index) => {
        formatted = formatted.replace(`\u0000CODEBLOCK${index}\u0000`, block);
    });

    return formatted;
}