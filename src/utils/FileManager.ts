import * as vscode from 'vscode';
import * as path from 'path';
import FsProvider from './FsProvider';

export interface Base {
  path: vscode.Uri;
  type: 'file' | 'workspace';
}

export default class FileManager extends FsProvider {
  private base: vscode.Uri;
  private root: vscode.WorkspaceFolder | undefined;

  constructor(base: Base) {
    super();
    if(base.type === 'file') {
      this.base = vscode.Uri.file(path.dirname(base.path.fsPath));
    } else {
      this.base = base.path;
    }

    this.root = vscode.workspace.getWorkspaceFolder(this.base);
  }

  getContent(path: string = '') {
    return this.readDirectory(this.getUri(path));
  }
  getFileContent(path: string = '') {
    return this.readFile(this.getUri(path));
  }

  getUri(pPath: string = undefined) {
    const isPathValid = pPath !== undefined
    const sufix = isPathValid ? path.sep + pPath : '';

    if(isPathValid && this.root && (pPath.startsWith(path.sep) || pPath.startsWith('/'))) {
      return vscode.Uri.file(this.root.uri.fsPath + sufix);
    }
    const uriFile =  vscode.Uri.file(this.base.fsPath + sufix);
    return uriFile;
  }

  openFile(path: string) {
    const uri = this.getUri(path);

    vscode.window.showTextDocument(uri).then(() => { }, (error) => {
      vscode.window.showWarningMessage(error.message);
    });
  }
}