import * as vscode from 'vscode';
import { Base } from './FileManager';

export default async function getBasePath(): Promise<Base | undefined> {
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