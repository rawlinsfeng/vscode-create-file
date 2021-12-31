import * as vscode from 'vscode';
import * as path from 'path';
import FileManager, { Base } from './FileManager';

interface FileQuickPickItem extends vscode.QuickPickItem {
  directory: boolean;
  name: string;
  fullPath: string;
}

class Fuzzy {
  /**
   * Searches for a given string in another string. The string does not
   * have to match exactlly, the method uses a "fuzzy matching".
   *
   * According to implementation of: https://github.com/bevacqua/fuzzysearch
   */
  static search(needle: string, haystack: string): boolean {
    needle = needle.toLowerCase()
    haystack = haystack.toLowerCase()
    const hlen = haystack.length
    const nlen = needle.length

    if (nlen > hlen) {
      return false
    }

    if (nlen === hlen) {
      return needle === haystack
    }

    outer: for (let i = 0, j = 0; i < nlen; i += 1) {
      const nch = needle.charCodeAt(i)
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer
        }
      }
      return false
    }
    return true
  }
}

export default class QuickPick {
  quickPick: vscode.QuickPick<FileQuickPickItem>;
  fm: FileManager;
  oldPath: string;
  config: vscode.WorkspaceConfiguration;
  items: FileQuickPickItem[];

  constructor(base: Base) {
    this.fm = new FileManager(base);
    this.oldPath = null;
    this.config = vscode.workspace.getConfiguration('vscode-create-file');
    this.items = [];

    this.quickPick = vscode.window.createQuickPick<FileQuickPickItem>();

    this.quickPick.onDidHide(() => this.quickPick.dispose());
    this.quickPick.onDidAccept(() => {
      const selected = this.quickPick.selectedItems[0];

      // A hack for ignoring duplicate firing of the event when items
      // are changed. Need to investigate whether it's a bug in the code.
      if (!selected && this.quickPick.activeItems.length > 0) {
        return
      }

      this.accept(selected);
    });

    this.quickPick.onDidChangeValue((value) => {
      this.changePath(value);
    });
  }

  async changePath(input: string) {
    // The "gibberish" part is for getting around the fact, that `.dirname()` does omit the directory seperator at the end. We don't want that.
    const newPath = path.normalize(path.dirname(this.fm.getUri(input).fsPath + '__gibberish__'));

    if(newPath !== this.oldPath) {
      if(input) {
        const regex = new RegExp(`^(.\\${path.sep})`);
        this.quickPick.value = path.normalize(input).replace(regex, '');
      }
      await this.setItems(newPath);
    }

    this.filterItems(input);

    this.oldPath = newPath;
  }

  filterItems(input: string) {
    const filename = path.basename(input + '__gibberish__').replace('__gibberish__', '');
    if(!filename) {
      this.quickPick.items = this.items;
      return;
    }

    this.quickPick.items = this.items.filter(item => {
      return Fuzzy.search(filename, item.name);
    });
  }

  sortItems() {
    this.items.sort((a, b) => {
      if(a.directory > b.directory) return -1;
      if(a.directory < b.directory) return 1;

      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;

      return 0;
    });
  }

  async accept(selected: FileQuickPickItem) {
    if (selected === undefined) {
      const path = await this.createNew();
      if(path) {
        this.fm.openFile(path);
      }
      this.quickPick.hide();
    } else {
      if (selected.directory) {
        this.changePath(selected.fullPath + path.sep);
      } else {
        this.fm.openFile(selected.fullPath);
      }
    }
  }

  async createNew(): Promise<string | undefined> {
    const filePath = this.quickPick.value.trim();
    const uri = this.fm.getUri(filePath);
    try {
      if(filePath.endsWith(path.sep)) {
        await this.fm.createDirectory(uri);
        return undefined;
      } else {
        if(path.extname(filePath) === '.vue') {
          let fileContent = await this.fm.getTmplContent(path.resolve(__dirname, '../../assets/templates/vue.txt'));
          await this.fm.writeFile(uri, fileContent, { create: true, overwrite: false });
        } else await this.fm.writeFile(uri, new Uint8Array(0), { create: true, overwrite: false });
        return filePath;
      }
    } catch(e) {
      console.error(e);
    }
  }

  async show() {
    const defaultPath = this.config.get<string>('defaultPath');
    this.quickPick.show();
    this.changePath(defaultPath);
  }

  async setItems(pPath: string) {
    const directory = path.relative(this.fm.getUri().fsPath, pPath);
    const relativeToRoot = path.relative(this.fm.getUri('/').fsPath, pPath);

    let content = []
    try {
      content = await this.fm.getContent(directory);
      content.push(['..', vscode.FileType.Directory]);
    } catch(e) {
      // Isn't there some better method for checking of which type the error is?
      if(e.name !== 'EntryNotFound (FileSystemError)') {
        console.error(e);
      }
    }

    const showDetails = this.config.get<boolean>('showDetails');
    this.items = content.map(item => {
      const isDir = item[1] === vscode.FileType.Directory;
      const icon = isDir ? '$(file-directory)' : '$(file-code)';

      return {
        name: item[0],
        label: `${icon}  ${item[0]}`,
        fullPath: path.join(directory, item[0]),
        directory: isDir,
        alwaysShow: true,
        detail: showDetails ? path.join(relativeToRoot, item[0]) : undefined,
      };
    });

    this.sortItems();
  }
}