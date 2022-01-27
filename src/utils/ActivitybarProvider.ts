import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class ActivitybarProvider implements vscode.TreeDataProvider<ActivitybarItem> {
  onDidChangeTreeData?: vscode.Event<void | ActivitybarItem>;
  constructor(private itemName: string | undefined) {

  }
  getTreeItem(element: ActivitybarItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  getChildren(element?: ActivitybarItem): vscode.ProviderResult<ActivitybarItem[]> {
    const result = [];
    switch (this.itemName) {
      case 'common':
        result.push(new ActivitybarItem('创建文件或目录', '您也可以直接使用快捷键ctrl+alt+i或者cmd+alt+i', vscode.TreeItemCollapsibleState.None, {
          command: 'createFromPanel',
          title: 'show quickPick'
        }));
        break;
      case 'template':
        if (!element) {
          result.push(new ActivitybarItem('使用模板创建文件', '使用以下选项请首先打开一个文件~', vscode.TreeItemCollapsibleState.Collapsed));
        } else {
          result.push(new ActivitybarItem('使用vue模板','',vscode.TreeItemCollapsibleState.None,{
            command: 'useVueTemplate',
            title: 'use vue template'
          }));
          result.push(new ActivitybarItem('使用vue+ts模板','',vscode.TreeItemCollapsibleState.None,{
            command: 'useVueTsTemplate',
            title: 'use vue+ts template'
          }));
          result.push(new ActivitybarItem('使用vue3模板','',vscode.TreeItemCollapsibleState.None,{
            command: 'useVue3Template',
            title: 'use vue3 template'
          }));
          result.push(new ActivitybarItem('使用react模板','',vscode.TreeItemCollapsibleState.None,{
            command: 'useReactTemplate',
            title: 'use react template'
          }));
        }
        break;
      case 'json':
        result.push(new ActivitybarItem('根据json创建目录或文件', '将打开一个webview,您可以在webview中进行操作~', vscode.TreeItemCollapsibleState.None, {
          command: 'createBaseonJson',
          title: 'create file base on json'
        }));
        break;
    }
    return result;
  }
  getParent?(element: ActivitybarItem): vscode.ProviderResult<ActivitybarItem> {
    throw new Error('getParent---Method not implemented.');
  }
  // resolveTreeItem?(item: vscode.TreeItem, element: ActivitybarItem, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
  //   throw new Error('resolveTreeItem---Method not implemented.');
  // }

}

export class ActivitybarItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly tooltip: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);

    // this.tooltip = this.label;
  }

}