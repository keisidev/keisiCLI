import { askMultilineQuestion, closeInput } from "./src/utils/input.mjs";

const answer = await askMultilineQuestion("Paste something:");
console.log("\n--- You entered ---");
console.log(answer);
console.log("--- end ---");
closeInput();