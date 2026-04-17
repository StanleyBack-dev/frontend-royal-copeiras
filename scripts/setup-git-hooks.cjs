const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const hooksPath = ".githooks";
const hookFilePath = path.join(repoRoot, hooksPath, "pre-push");

function isGitRepository() {
  try {
    execFileSync("git", ["rev-parse", "--is-inside-work-tree"], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function ensureExecutable(filePath) {
  if (process.platform === "win32") {
    return;
  }

  fs.chmodSync(filePath, 0o755);
}

if (!isGitRepository()) {
  console.log("[setup-hooks] Git repository not detected. Skipping hook setup.");
  process.exit(0);
}

if (!fs.existsSync(hookFilePath)) {
  console.warn(
    `[setup-hooks] Expected hook file not found: ${path.relative(repoRoot, hookFilePath)}`,
  );
  process.exit(0);
}

ensureExecutable(hookFilePath);

execFileSync("git", ["config", "core.hooksPath", hooksPath], {
  cwd: repoRoot,
  stdio: "ignore",
});

console.log(`[setup-hooks] core.hooksPath configured to ${hooksPath}`);