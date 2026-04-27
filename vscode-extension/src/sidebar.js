const vscode = require("vscode");
const path   = require("path");
const fs     = require("fs");

class SidebarProvider {
  constructor(extensionUri) {
    this._extensionUri = extensionUri;
    this._view = null;
  }

  resolveWebviewView(webviewView) {
    this._view = webviewView;
    webviewView.webview.options = { enableScripts: true };
    webviewView.webview.html    = this._getHtml();

    webviewView.webview.onDidReceiveMessage(async (msg) => {
      const config  = vscode.workspace.getConfiguration("bugpilot");
      const apiUrl  = config.get("apiUrl");
      const token   = config.get("apiToken");

      if (msg.type === "ANALYZE") {
        if (!token) {
          this._view.webview.postMessage({
            type: "ERROR",
            message: "Set your API token in VS Code settings → BugPilot AI → Api Token",
          });
          return;
        }

        try {
          const { callApi } = require("./api");
          const result = await callApi(apiUrl, token, {
            inputType: "code",
            textInput:  msg.text,
            language:   msg.language || "other",
            mode:       msg.mode     || "analyze",
          });
          this._view.webview.postMessage({ type: "RESULT", payload: result });
        } catch (err) {
          this._view.webview.postMessage({ type: "ERROR", message: err.message });
        }
      }

      if (msg.type === "OPEN_SETTINGS") {
        vscode.commands.executeCommand(
          "workbench.action.openSettings", "bugpilot.apiToken"
        );
      }
    });
  }

  postMessage(msg) {
    this._view?.webview.postMessage(msg);
  }

  _getHtml() {
    const htmlPath = path.join(this._extensionUri.fsPath, "media", "sidebar.html");
    return fs.readFileSync(htmlPath, "utf8");
  }
}

module.exports = { SidebarProvider };