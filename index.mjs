#!/usr/bin/env node
import { startCLI } from "./src/cli.mjs";

startCLI().catch((error) => {
    console.error("Fatal Application Error:", error.message);
    process.exit(1);
});