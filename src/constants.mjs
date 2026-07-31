// src/constants.mjs

// Exact filenames to block from reading / searching
export const PROTECTED_FILE_NAMES = [
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    "id_rsa",
    "id_ed25519",
    "id_dsa",
    "id_ecdsa",
    ".ssh",
    "known_hosts",
    "authorized_keys"
];

// Regex patterns for terminal commands (warns when these appear)
export const PROTECTED_FILE_PATTERNS = [
    /\.env(\.\w+)?\b/,
    /id_rsa/,
    /id_ed25519/,
    /id_dsa/,
    /id_ecdsa/,
    /\.ssh\b/,
    /known_hosts/,
    /authorized_keys/
];

// Dangerous commands (hard block)
export const DANGEROUS_PATTERNS = [
    /rm\s+-rf\s+\//,
    /:\(\)\s*\{\s*:\|:&\s*\}\s*;\s*:/,
    /mkfs/,
    /dd\s+if=/,
    />\s*\/dev\/sd/
];

// Self‑invocation patterns (hard blocked – no prompt)
export const SELF_INVOCATION_PATTERNS = [
    /index\.mjs/,
    /groq-cli/,
    /node\s+\./,
    /node\s+index/,
    /npm\s+start/,
    /node\s+\.\/index/,
    /node\s+index\.mjs/
];