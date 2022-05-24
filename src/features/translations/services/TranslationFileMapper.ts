import { workspace, Uri, EventEmitter, Event } from 'vscode';
import { mapLimit } from 'async';
import _ from 'lodash';
import flat from 'flat';
import { forEachTranslateCall } from './forEachTranslateCall';

const MAX_FILE_READ = 10;

export class TranslationFileMapper {
  private filepathToKeys: Record<string, string[]> = {};
  private keyToFilePaths: Record<string, string[]> | undefined = undefined;
  // private unusedKeys: string[] = [];
  // private missingdKeys: string[] = [];

  public translationsPromise: Promise<Record<string, unknown>> | null = null;

  private _onDidUpdateStart = new EventEmitter<void>();
  get onDidUpdateStart(): Event<void> {
    return this._onDidUpdateStart.event;
  }

  private _onDidUpdate = new EventEmitter<void>();
  get onDidUpdate(): Event<void> {
    return this._onDidUpdate.event;
  }

  static async getTranslationsFromUri(uri: Uri) {
    const content = (await workspace.fs.readFile(uri)).toString();
    const keys: string[] = [];
    await forEachTranslateCall(content, (key: string) => {
      keys.push(key);
    });

    return keys;
  }

  async updateTranslations(
    translations: Promise<Record<string, unknown>> | null
  ) {
    const translationProviderKeys = Object.keys(
      flat((await translations) || {})
    );

    this._onDidUpdateStart.fire();

    const files = await workspace.findFiles('**/*.{jsx,tsx}', '/node_modules/');

    const filesKeys = await mapLimit(
      files,
      MAX_FILE_READ,
      TranslationFileMapper.getTranslationsFromUri
    );

    this.filepathToKeys = files.reduce(
      (acc: Record<string, string[]>, uri, n) => {
        if (filesKeys[n].length > 0) {
          acc[uri.toString()] = filesKeys[n];
        }
        return acc;
      },
      {}
    );

    this.keyToFilePaths = files.reduce(
      (acc: Record<string, string[]>, uri, n) => {
        if (filesKeys[n].length > 0) {
          for (const key of filesKeys[n]) {
            acc[key] = acc[key] ?? [];
            const uriString = uri.toString();
            if (!acc[key].includes(uriString)) {
              acc[key].push(uri.toString());
            }
          }
        }
        return acc;
      },
      {}
    );

    // this.unusedKeys = _.difference(
    //   translationProviderKeys,
    //   Object.keys(this.keyToFilePaths)
    // );

    // const UsedInFilesKeys = Object.keys(this.keyToFilePaths);

    // this.missingdKeys = _.difference(UsedInFilesKeys, translationProviderKeys);

    this._onDidUpdate.fire();
  }

  getTranslationKeysFromUri(uri: Uri): string[] {
    return this.filepathToKeys[uri.toString()];
  }

  getUrisFromTranslation(key: string): Uri[] {
    const uriStrings = this.keyToFilePaths?.[key] || [];
    return uriStrings.map((str) => Uri.parse(str));
  }

  // getUnusedKeys(): string[] {
  //   return this.unusedKeys;
  // }

  // getMissingKeys(): string[] {
  //   return this.missingdKeys;
  // }

  getFilePathsFromTranslations(): Record<string, string[]> | undefined {
    return this.keyToFilePaths;
  }
}
