const cs = new CSInterface();
const os = require("os");
const path = require("path");
const fs = require("fs");

function findNodePath() {
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

  // if nvm version not found, check for global node installations
  const possiblePaths = [
    // macOS and Linux
    "/usr/local/bin/node",
    "/opt/homebrew/bin/node",
    "/usr/bin/node",
    // Windows
    "C:\\Program Files\\nodejs\\node.exe",
    "C:\\Program Files (x86)\\nodejs\\node.exe",
    path.join(os.homedir(), "AppData\\Roaming\\nvm\\node.exe"),
  ];

  for (const nodePath of possiblePaths) {
    if (fs.existsSync(nodePath)) return nodePath;
  }

  return "node";
}

function updateCompInfo() {
  cs.evalScript("getCompInfo()", (res) => {
    const info = JSON.parse(res);
    document.getElementById("comp-name").textContent = `${info.name}`;
    document.getElementById("frame-count").textContent = `${Math.floor(
      info.frameCount
    )} frames`;
  });
}

document.getElementById("export-button").addEventListener("click", () => {
  cs.evalScript("renderFrames()", (res) => {
    const [renderPath, outputPath] = JSON.parse(res);
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
      fs.rm(renderPath, { recursive: true, force: true });
      alert(code === 0 ? "Export complete!" : "Export failed.");
    });
  });
});

updateCompInfo();
