const { execFileSync } = require("node:child_process");

const REQUIRED_EMAIL = "jarvisstarkgpt4@gmail.com";
const REQUIRED_PROJECT = "usi-hub-platform";

function main() {
  const loginList = runFirebase(["login:list"]);
  const activeAccountLine = loginList
    .split(/\r?\n/)
    .find((line) => line.includes(REQUIRED_EMAIL));

  if (!activeAccountLine) {
    fail([
      `Firebase CLI is not logged in with ${REQUIRED_EMAIL}.`,
      "Run:",
      `  firebase login --reauth`,
      `  firebase use ${REQUIRED_PROJECT}`
    ]);
  }

  const activeProject = runFirebase(["use"]).trim();
  if (!activeProject.includes(REQUIRED_PROJECT)) {
    fail([
      `Firebase CLI is not using project ${REQUIRED_PROJECT}.`,
      "Run:",
      `  firebase use ${REQUIRED_PROJECT}`
    ]);
  }

  console.log(`Firebase account/project check passed for ${REQUIRED_EMAIL} on ${REQUIRED_PROJECT}.`);
}

function runFirebase(args) {
  try {
    return execFileSync("firebase", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    fail([
      "Firebase CLI command failed.",
      "Install Firebase CLI and login first:",
      "  npm install -g firebase-tools",
      `  firebase login --reauth`,
      `  firebase use ${REQUIRED_PROJECT}`,
      "",
      error.stderr || error.message
    ]);
  }
}

function fail(lines) {
  console.error(lines.join("\n"));
  process.exit(1);
}

main();
