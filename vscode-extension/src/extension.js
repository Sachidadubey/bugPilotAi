const vscode = require("vscode");
const { SidebarProvider } = require("./sidebar");
const { callApi }         = require("./api");

function activate(context) {
  const provider = new SidebarProvider(context.extensionUri);

  // Register sidebar webview
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("bugpilot.sidebar", provider)
  );

  // Command: analyze selected code
  context.subscriptions.push(
    vscode.commands.registerCommand("bugpilot.analyzeSelection", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) { vscode.window.showWarningMessage("No active editor"); return; }

      const selected = editor.document.getText(editor.selection);
      if (!selected.trim()) {
        vscode.window.showWarningMessage("Select some code first");
        return;
      }

      const config   = vscode.workspace.getConfiguration("bugpilot");
      const apiUrl   = config.get("apiUrl");
      const token    = config.get("apiToken");
      const language = editor.document.languageId;

      if (!token) {
        vscode.window.showErrorMessage(
          "Set your BugPilot AI token in Settings → BugPilot AI → Api Token"
        );
        return;
      }

      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: "BugPilot AI analyzing..." },
        async () => {
          try {
            const result = await callApi(apiUrl, token, {
              inputType: "code",
              textInput:  selected,
              language,
              mode:       "analyze",
            });

            if (result.success) {
              provider.postMessage({ type: "RESULT", payload: result });
              // Focus sidebar
              vscode.commands.executeCommand("bugpilot.sidebar.focus");
            } else {
              vscode.window.showErrorMessage(result.message);
            }
          } catch (err) {
            vscode.window.showErrorMessage(`BugPilot AI Error: ${err.message}`);
          }
        }
      );
    })
  );

  // Command: open panel
  context.subscriptions.push(
    vscode.commands.registerCommand("bugpilot.openPanel", () => {
      vscode.commands.executeCommand("bugpilot.sidebar.focus");
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };