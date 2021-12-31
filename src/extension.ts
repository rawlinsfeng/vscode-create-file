'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { Base } from './utils/FileManager';
import QuickPick from './utils/QuickPick';
import FsProvider from './utils/FsProvider';

async function getBasePath(): Promise<Base | undefined> {
	const workspaceExists = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
	if (!vscode.window.activeTextEditor && !workspaceExists) {
		vscode.window.showInformationMessage('You do not have any workspaces open.');
		return undefined;
	}

	if (vscode.window.activeTextEditor) {
		return {
			path: vscode.window.activeTextEditor.document.uri,
			type: 'file'
		};
	} else if (vscode.workspace.workspaceFolders.length === 1) {
		return {
			path: vscode.workspace.workspaceFolders[0].uri,
			type: 'workspace'
		};
	} else {
		const ws = await vscode.window.showWorkspaceFolderPick();

		if(!ws) {
			return undefined;
		}

		return {
			path: ws.uri,
			type: 'workspace'
		};
	}
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
	})
}

// this method is called when your extension is deactivated
export function deactivate() {}
