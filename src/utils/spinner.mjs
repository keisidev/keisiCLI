import ora from "ora";

let currentSpinner = null;

export function startSpinner(text = "Thinking...") {
    currentSpinner = ora(text).start();
    return currentSpinner;
}

export function stopSpinner() {
    if (currentSpinner) {
        currentSpinner.stop();
        currentSpinner = null;
    }
}