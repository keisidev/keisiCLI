import OpenAI from "openai";
import { config } from "./config.mjs";

import { readFile } from "./tools/read.mjs";
import { writeFile } from "./tools/write.mjs";
import { createFile } from "./tools/create.mjs";
import { deleteFile } from "./tools/delete.mjs";
import { renameFile } from "./tools/rename.mjs";
import { listFiles } from "./tools/list.mjs";
import { searchFiles } from "./tools/search.mjs";
import { runCommand } from "./tools/terminal.mjs";

const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
});

const tools = [
    {
        type: "function",
        function: {
            name: "readFile",
            description: "Read the contents of an existing file and return it as text.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string", description: "Path to the file." }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "writeFile",
            description: "Write content to a file, creating it if missing or overwriting if present. Overwrite confirmation is handled by the user's session settings, not by this call.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    content: { type: "string" }
                },
                required: ["path", "content"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "createFile",
            description: "Create a new file (fails if it already exists).",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    content: { type: "string" }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "deleteFile",
            description: "Delete a file. Confirmation is handled by the user's session settings, not by this call.",
            parameters: {
                type: "object",
                properties: {
                    path: { type: "string" }
                },
                required: ["path"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "renameFile",
            description: "Rename or move a file.",
            parameters: {
                type: "object",
                properties: {
                    oldPath: { type: "string" },
                    newPath: { type: "string" }
                },
                required: ["oldPath", "newPath"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "listFiles",
            description: "List files and directories inside a given directory. Defaults to the current directory.",
            parameters: {
                type: "object",
                properties: {
                    dirPath: { type: "string" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "searchFiles",
            description: "Search recursively for text across files in a directory.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string" },
                    rootPath: { type: "string" }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "runCommand",
            description: "Execute a shell command and return its output. Confirmation is handled by the user's session settings, not by this call.",
            parameters: {
                type: "object",
                properties: {
                    command: { type: "string" }
                },
                required: ["command"]
            }
        }
    }
];

function buildToolFunctions(autoConfirm, autoOverwrite) {
    return {
        readFile: (args) => {
            if (!args || !args.path) return { success: false, message: "Missing 'path' argument." };
            return readFile(args.path);
        },
        writeFile: (args) => {
            if (!args || !args.path || args.content === undefined) return { success: false, message: "Missing 'path' or 'content'." };
            return writeFile(args.path, args.content, autoOverwrite);
        },
        createFile: (args) => {
            if (!args || !args.path) return { success: false, message: "Missing 'path' argument." };
            return createFile(args.path, args.content || "");
        },
        deleteFile: (args) => {
            if (!args || !args.path) return { success: false, message: "Missing 'path' argument." };
            return deleteFile(args.path, autoConfirm);
        },
        renameFile: (args) => {
            if (!args || !args.oldPath || !args.newPath) return { success: false, message: "Missing 'oldPath' or 'newPath'." };
            return renameFile(args.oldPath, args.newPath);
        },
        listFiles: (args) => listFiles((args && args.dirPath) || "."),
        searchFiles: (args) => {
            if (!args || !args.query) return { success: false, message: "Missing 'query' argument." };
            return searchFiles(args.query, (args && args.rootPath) || ".");
        },
        runCommand: (args) => {
            if (!args || !args.command) return { success: false, message: "Missing 'command' argument." };
            return runCommand(args.command, autoConfirm);
        }
    };
}

export async function chat(messages, options = {}) {
    const { autoConfirm = false, autoOverwrite = false } = options;
    const toolFunctions = buildToolFunctions(autoConfirm, autoOverwrite);
    let currentMessages = [...messages];

    while (true) {
        const response = await client.chat.completions.create({
            model: config.model,
            messages: currentMessages,
            tools: tools,
            tool_choice: "auto"
        });

        const message = response.choices[0].message;
        currentMessages.push(message);

        if (!message.tool_calls) {
            return message.content || "";
        }

        for (const toolCall of message.tool_calls) {
            const { name, arguments: argsJson } = toolCall.function;
            console.log(`🔧 Tool call: ${name}(${argsJson})`);

            let args = {};
            try {
                args = JSON.parse(argsJson);
            } catch (e) {
                currentMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ success: false, message: `Invalid JSON: ${e.message}` })
                });
                continue;
            }

            let result;
            try {
                const fn = toolFunctions[name];
                if (!fn) throw new Error(`Tool "${name}" not found.`);
                result = await fn(args);
            } catch (error) {
                result = { success: false, message: error.message };
            }

            currentMessages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result)
            });
        }
    }
}