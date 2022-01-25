import * as vscode from 'vscode';
import getNonce from './getNonce';

export class JsonWebviewPanel {
  /**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
  public static currentPanel: JsonWebviewPanel | undefined;

  public static readonly viewType = 'jsonPanel';

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionUri: vscode.Uri;

  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._extensionUri = extensionUri;

    // Set the webview's initial html content
		this._update();
  }

  public static webviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
      enableScripts: true, // Enable javascript in the webview
      // localResourceRoots ---> restrict the webview to only loading content
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'assets'),vscode.Uri.joinPath(extensionUri, 'out', 'dist')],
    };
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    console.log('extensionUri::', extensionUri, vscode.window.activeTextEditor)
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

    // If we already have a panel, show it.
    if (JsonWebviewPanel.currentPanel) {
      JsonWebviewPanel.currentPanel._panel.reveal(column);
      return;
    }
    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      JsonWebviewPanel.viewType,
      'Create File Base on Json',
      column || vscode.ViewColumn.One,
      this.webviewOptions(extensionUri),
    );
    JsonWebviewPanel.currentPanel = new JsonWebviewPanel(panel, extensionUri);
  }

  public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    JsonWebviewPanel.currentPanel = new JsonWebviewPanel(panel, extensionUri);
  }

  private _update() {
    const webview = this._panel.webview;
    this._panel.title = 'Create File Base on Json';
    this._panel.webview.html = this._getHtmlForWebview(webview);
  }
  private _getHtmlForWebview(webview: vscode.Webview) {
    // Local path to main script run in the webview
    const scriptPath = vscode.Uri.joinPath(this._extensionUri, 'out', 'dist', 'render_bundle.js');

    // the uri we use to load this script in the webview
    // const scriptUri = (scriptPath).with({ 'scheme': 'vscode-resource' });
    const scriptUri = webview.asWebviewUri(scriptPath);

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(this._extensionUri, 'assets', 'webview', 'reset.css');
		const stylesPathMainPath = vscode.Uri.joinPath(this._extensionUri, 'assets', 'webview', 'main.css');

    // local path to img src
    const imgSrcPath = vscode.Uri.joinPath(this._extensionUri, 'assets', 'images', 'logo.png');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
		const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    // Uri to load images into webview
    const imgSrcUri = webview.asWebviewUri(imgSrcPath);

    // Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce. 内容安全策略: 只允许从https或我们的插件目录加载图片，并且只允许加载具有特定随机数的script.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${stylesResetUri}" rel="stylesheet">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>React Webview</title>
			</head>
			<body>
				<h2 id="webview-header"><img src="${imgSrcUri}" />Enjoy The Webview!</h2>
        <div id="root"></div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

export class JsonWebviewSerializer implements vscode.WebviewPanelSerializer {
  private extensionUri: vscode.Uri;
  public constructor(extensionUri: vscode.Uri) {
    this.extensionUri = extensionUri;
  }
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: unknown): Promise<void> {
    console.log('got state::', state)
    // Reset the webview options so we use latest uri for `localResourceRoots`.
    webviewPanel.webview.options = JsonWebviewPanel.webviewOptions(this.extensionUri);
    JsonWebviewPanel.revive(webviewPanel, this.extensionUri);
  }
}