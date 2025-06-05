"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
var cp = __toESM(require("child_process"));
var backendProcess;
var webviewPanel;
function activate(context) {
  console.log("Food Facility Permits extension is now active!");
  let disposable = vscode.commands.registerCommand("permits.openSearchUI", async () => {
    console.log("Opening Food Permits Search UI...");
    const backendPath = "/Users/arckex/source/radai/backend";
    console.log("Using backend path:", backendPath);
    if (!fs.existsSync(backendPath)) {
      vscode.window.showErrorMessage(`Backend directory not found at ${backendPath}`);
      return;
    }
    if (!backendProcess) {
      try {
        await startBackend(backendPath);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to start backend: ${error instanceof Error ? error.message : "Unknown error"}`);
        return;
      }
    }
    if (webviewPanel) {
      webviewPanel.reveal(vscode.ViewColumn.One);
      return;
    }
    webviewPanel = vscode.window.createWebviewPanel(
      "permitsSearch",
      "Food Facility Permits",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(path.join(context.extensionPath, "webview", "dist"))
        ],
        enableFindWidget: true,
        enableCommandUris: true
      }
    );
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "webview", "dist"))
      ]
    };
    try {
      const htmlContent = getWebviewContent(webviewPanel, context.extensionUri);
      webviewPanel.webview.html = htmlContent;
      console.log("Webview HTML content set successfully");
    } catch (error) {
      console.error("Failed to set webview HTML:", error);
      vscode.window.showErrorMessage(`Failed to load webview: ${error instanceof Error ? error.message : "Unknown error"}`);
      return;
    }
    webviewPanel.webview.onDidReceiveMessage(
      async (message) => {
        try {
          if (!message.endpoint) {
            throw new Error("No endpoint specified in message");
          }
          const url = new URL(`http://127.0.0.1:8000${message.endpoint}`);
          if (message.params) {
            Object.entries(message.params).forEach(([key, value]) => {
              if (value !== void 0 && value !== null && value !== "") {
                url.searchParams.append(key, String(value));
              }
            });
          }
          console.log("Making request to:", url.toString());
          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              "Accept": "application/json"
            }
          });
          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          console.log("Received response:", data);
          webviewPanel?.webview.postMessage({ type: "response", data });
        } catch (error) {
          console.error("Error handling webview message:", error);
          webviewPanel?.webview.postMessage({
            type: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred"
          });
        }
      },
      void 0,
      context.subscriptions
    );
    webviewPanel.onDidDispose(
      () => {
        webviewPanel = void 0;
      },
      null,
      context.subscriptions
    );
  });
  context.subscriptions.push(disposable);
}
async function startBackend(backendPath) {
  const pythonPath = path.join(backendPath, ".venv", "bin", "python");
  const appPath = path.join(backendPath, "main.py");
  console.log("Starting backend with:", {
    backendPath,
    pythonPath,
    appPath
  });
  if (!fs.existsSync(pythonPath)) {
    throw new Error(`Python not found at ${pythonPath}. Make sure the virtual environment is set up.`);
  }
  if (!fs.existsSync(appPath)) {
    throw new Error(`Backend app not found at ${appPath}`);
  }
  backendProcess = cp.spawn(pythonPath, ["-m", "uvicorn", "main:app", "--reload", "--port", "8000"], {
    cwd: backendPath,
    env: {
      ...process.env,
      PYTHONPATH: backendPath,
      PATH: `${path.join(backendPath, ".venv", "bin")}:${process.env.PATH}`
    }
  });
  backendProcess.stdout?.on("data", (data) => {
    console.log(`Backend stdout: ${data}`);
  });
  backendProcess.stderr?.on("data", (data) => {
    console.error(`Backend stderr: ${data}`);
  });
  backendProcess.on("error", (error) => {
    console.error("Failed to start backend:", error);
    throw error;
  });
  backendProcess.on("exit", (code) => {
    if (code !== 0) {
      console.error(`Backend process exited with code ${code}`);
      backendProcess = void 0;
    }
  });
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Backend server failed to start within 5 seconds"));
    }, 5e3);
    backendProcess?.stdout?.on("data", (data) => {
      const message = data.toString();
      console.log("Backend stdout:", message);
      if (message.includes("Application startup complete")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    backendProcess?.stderr?.on("data", (data) => {
      const message = data.toString();
      console.log("Backend stderr:", message);
      if (message.includes("Application startup complete")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    backendProcess?.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}
function getWebviewContent(panel, extensionUri) {
  try {
    console.log("Extension URI:", extensionUri.fsPath);
    const webviewDistPath = path.join(extensionUri.fsPath, "webview", "dist");
    console.log("Webview dist path:", webviewDistPath);
    if (!fs.existsSync(webviewDistPath)) {
      console.error("Webview dist directory not found at:", webviewDistPath);
      return "<html><body><h1>Error: Webview dist directory not found</h1></body></html>";
    }
    const htmlPath = path.join(webviewDistPath, "index.html");
    console.log("Looking for index.html at:", htmlPath);
    if (!fs.existsSync(htmlPath)) {
      console.error("index.html not found at:", htmlPath);
      return "<html><body><h1>Error: index.html not found</h1></body></html>";
    }
    let htmlContent = fs.readFileSync(htmlPath, "utf8");
    console.log("Found index.html, content length:", htmlContent.length);
    const bundlePath = path.join(webviewDistPath, "bundle.js");
    console.log("Looking for bundle.js at:", bundlePath);
    if (!fs.existsSync(bundlePath)) {
      console.error("bundle.js not found at:", bundlePath);
      return "<html><body><h1>Error: bundle.js not found</h1></body></html>";
    }
    const bundleUri = panel.webview.asWebviewUri(
      vscode.Uri.file(bundlePath)
    );
    console.log("Bundle URI:", bundleUri.toString());
    htmlContent = htmlContent.replace(
      'src="bundle.js"',
      `src="${bundleUri}"`
    );
    console.log("Final HTML content:", htmlContent);
    return htmlContent;
  } catch (error) {
    console.error("Error loading webview HTML:", error);
    return `<html><body><h1>Error loading webview content: ${error instanceof Error ? error.message : "Unknown error"}</h1></body></html>`;
  }
}
function deactivate() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = void 0;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
