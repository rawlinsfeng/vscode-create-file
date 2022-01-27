'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import getBasePath from './utils/getBasePath';
import QuickPick from './utils/QuickPick';
import FsProvider from './utils/FsProvider';
import { ActivitybarProvider } from './utils/ActivitybarProvider';
import { JsonWebviewPanel,JsonWebviewSerializer } from './utils/JsonWebviewPanel';

function registerTemplateCommand(context: vscode.ExtensionContext) {
	let fsp = new FsProvider();
	[
		{ cmd: 'vueTemplate', languageId: 'vue' },
		{ cmd: 'vueTsTemplate', languageId: 'vueTs' },
		{ cmd: 'vue3Template', languageId: 'vue3' },
	].forEach((e) => {
		let tmplDisposable = vscode.commands.registerCommand('vscode-create-file.' + e.cmd, () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showInformationMessage("Please open a file...");
				return;
			}
			fsp.writeFileContentWithTmpl(`../../assets/templates/${e.languageId}.tmpl`);
		});
		context.subscriptions.push(tmplDisposable);
	});
}

function registerActivitybarCommand(context: vscode.ExtensionContext) {
	['common','template','json'].forEach((element: string) => {
		const activitybarProvider = new ActivitybarProvider(element);
		let clickDisposable;
		const fsp = new FsProvider();
		switch (element) {
			case 'common':
				vscode.window.registerTreeDataProvider('createFile', activitybarProvider);
				clickDisposable = vscode.commands.registerCommand('createFromPanel', async () => {
					const base = await getBasePath();
					if (!base) return;
					const qp = new QuickPick(base);
					qp.show();
				});
				break;
			case 'template':
				[
					{ cmd: 'useVueTemplate', languageId: 'vue' },
					{ cmd: 'useVueTsTemplate', languageId: 'vueTs' },
					{ cmd: 'useVue3Template', languageId: 'vue3' },
					{ cmd: 'useReactTemplate', languageId: 'react' },
				].forEach(ele => {
					vscode.window.registerTreeDataProvider('useTemplate', activitybarProvider);
					clickDisposable = vscode.commands.registerCommand(ele.cmd, () => {
						const editor = vscode.window.activeTextEditor;
						if (!editor) {
							vscode.window.showInformationMessage("Please open a file...");
							return;
						}
						fsp.writeFileContentWithTmpl(`../../assets/templates/${ele.languageId}.tmpl`);
					});
				});
				break;
			case 'json':
				vscode.window.registerTreeDataProvider('createFileFromJson', activitybarProvider);
				clickDisposable = vscode.commands.registerCommand('createBaseonJson', () => {
					JsonWebviewPanel.createOrShow(context.extensionUri);
				});
				break;
		}
		context.subscriptions.push(clickDisposable);
	});
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-create-file" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-create-file.createFromPanel', async () => {
		// The code you place here will be executed every time your command is executed
		const base = await getBasePath();
		if (!base) return;

		const qp = new QuickPick(base);
		qp.show();
	});

	context.subscriptions.push(disposable);

	registerTemplateCommand(context);

	registerActivitybarCommand(context);

	if (vscode.window.registerWebviewPanelSerializer) {
		// 用于恢复webview的内容
		vscode.window.registerWebviewPanelSerializer(JsonWebviewPanel.viewType, new JsonWebviewSerializer(context.extensionUri));
	}
}

// this method is called when your extension is deactivated
export function deactivate() {}
