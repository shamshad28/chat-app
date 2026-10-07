const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const isPortOpen = (port, pathName = "/") =>
  new Promise((resolve) => {
    const req = http.get(
      { hostname: "127.0.0.1", port, path: pathName, timeout: 1500 },
      (res) => resolve(res.statusCode >= 200 && res.statusCode < 500)
    );
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
  });

const start = async () => {
  console.log("\x1b[36m%s\x1b[0m", "==================================================");
  console.log("\x1b[36m%s\x1b[0m", "         STARTING PULSECHAT APPLICATION           ");
  console.log("\x1b[36m%s\x1b[0m", "==================================================");

  const children = [];

  // 1. Backend Server
  const backendRunning = await isPortOpen(5000, "/api/health");
  if (backendRunning) {
    console.log("\x1b[32m%s\x1b[0m", "✔ Backend server already running on http://localhost:5000");
  } else {
    console.log("\x1b[33m%s\x1b[0m", "⏳ Starting backend server on http://localhost:5000...");
    const serverDevScript = path.join(__dirname, "server", "dev.js");
    const serverProc = spawn(process.execPath, [serverDevScript], {
      cwd: path.join(__dirname, "server"),
      stdio: "inherit",
      shell: false,
    });
    children.push(serverProc);
  }

  // 2. Next.js Client
  const frontendRunning = await isPortOpen(3000, "/");
  if (frontendRunning) {
    console.log("\x1b[32m%s\x1b[0m", "✔ Frontend client already running on http://localhost:3000");
  } else {
    console.log("\x1b[33m%s\x1b[0m", "⏳ Starting Next.js client on http://localhost:3000...");
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
    const clientProc = spawn(npmCmd, ["run", "dev"], {
      cwd: path.join(__dirname, "client"),
      stdio: "inherit",
      shell: true,
    });
    children.push(clientProc);
  }

  console.log("\n\x1b[35m%s\x1b[0m", "➜ Open in your browser: http://localhost:3000");
  console.log("\x1b[36m%s\x1b[0m", "==================================================\n");

  const cleanup = () => {
    console.log("\nShutting down dev processes...");
    for (const child of children) {
      try {
        child.kill();
      } catch {}
    }
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  if (children.length === 0) {
    console.log("\x1b[36m%s\x1b[0m", "Active processes detected. Press Ctrl+C in this terminal to exit.");
    setInterval(() => {}, 1000000);
  }
};

start();

