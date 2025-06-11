const cs = new CSInterface();
const os = require("os");
const path = require("path");
const fs = require("fs");

function findNodePath() {
  // Common locations for macOS and Linux
  const possiblePaths = [
    "/usr/local/bin/node",
    "/opt/homebrew/bin/node",
    "/usr/bin/node",
  ];

  // nvm: find highest version in ~/.nvm/versions/node/
  const nvmDir = path.join(os.homedir(), ".nvm/versions/node");
  if (fs.existsSync(nvmDir)) {
    const versions = fs
      .readdirSync(nvmDir)
      .filter((v) => v.startsWith("v"))
      .sort((a, b) => {
        // Sort by version number descending
        const pa = a.replace(/^v/, "").split(".").map(Number);
        const pb = b.replace(/^v/, "").split(".").map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
          if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
        }
        return 0;
      });
    if (versions.length > 0) {
      const nvmNode = path.join(nvmDir, versions[0], "bin/node");
      if (fs.existsSync(nvmNode)) return nvmNode;
    }
  }

  // Windows default install
  possiblePaths.push(
    "C:\\Program Files\\nodejs\\node.exe",
    "C:\\Program Files (x86)\\nodejs\\node.exe",
    path.join(os.homedir(), "AppData\\Roaming\\nvm\\node.exe")
  );

  // Check each path
  for (const nodePath of possiblePaths) {
    if (fs.existsSync(nodePath)) return nodePath;
  }

  // Fallback: just "node" (relies on PATH)
  return "node";
}

function updateCompInfo() {
  cs.evalScript("getCompInfo()", (res) => {
    const info = JSON.parse(res);
    document.getElementById("comp-info").textContent = `${
      info.name
    } (${Math.floor(info.frameCount)} frames)`;
  });
}

document.getElementById("export-button").addEventListener("click", () => {
  cs.evalScript("renderFrames()", (params) => {
    try {
      const [renderPath, outputPath] = params.split(",");
      const rootDir = cs.getSystemPath(SystemPath.EXTENSION);
      const nodeScriptPath = rootDir + "/node/sprite-sheet.js";
      const nodePath = findNodePath();

      const { spawn } = require("child_process");
      const child = spawn(nodePath, [nodeScriptPath, renderPath, outputPath], {
        stdio: "inherit",
      });
      child.on("error", (err) => {
        alert("Error starting node script: " + err.message);
      });
      child.on("close", (code) => {
        fs.rm(renderPath, { recursive: true, force: true }, (err) => {
          alert(err);
        });
        alert(code === 0 ? "Export complete!" : "Export failed.");
      });
    } catch (e) {
      alert("Error: " + e.message);
      return;
    }
  });
});

updateCompInfo();
