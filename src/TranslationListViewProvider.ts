import {
  WebviewViewProvider,
  WebviewView,
  Webview,
  Uri,
  EventEmitter,
  Event,
  ExtensionContext,
  Range,
  workspace,
  window,
  TextEditorRevealType,
  Selection,
} from 'vscode';
import flat from 'flat';
import { Translations } from './services/Translations';

export class TranslationListViewProvider implements WebviewViewProvider {
  public static readonly viewType = 'openclassrooms.view.translationList';

  private _context: ExtensionContext;
  private _view?: WebviewView;
  private _activeUri?: Uri;

  translations: Translations;

  private _onDidClickFilename = new EventEmitter<void>();
  get onDidClickFilename(): Event<void> {
    return this._onDidClickFilename.event;
  }

  constructor(translations: Translations, context: ExtensionContext) {
    this.translations = translations;
    this._context = context;
  }

  resolveWebviewView(webviewView: WebviewView) {
    this._view = webviewView;
    const activeEditor = window.activeTextEditor;
    if (activeEditor) {
      this._activeUri = activeEditor.document.uri;
    }

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    };

    this._view.onDidChangeVisibility((event) => {
      if (this._view?.visible) {
        this._notifyViewChange();
      }
    });

    this.translations.onDidFileMappingUpdateFinish(() => {
      if (!this._view) {
        return;
      }
      this._notifyViewChange();
    });

    this._view.webview.onDidReceiveMessage(
      (message) => {
        switch (message.type) {
          case 'clickFilename':
            this.openUri(message.uri, message.key);
            return;
        }
      },
      undefined,
      this._context.subscriptions
    );

    window.onDidChangeActiveTextEditor((editor) => {
      if (!editor) {
        return;
      }
      this._activeUri = editor.document.uri;
      this._notifyViewChange();
    });

    webviewView.webview.html = this._getHtmlForWebView(webviewView.webview);

    this._notifyViewChange();
  }

  async openUri(stringUri: string, key: string) {
    const uri = Uri.parse(stringUri);
    const editor = await window.showTextDocument(uri);

    const text = editor.document.getText();
    const match = text.match(new RegExp(`(${key})`));
    if (match && match.index) {
      const doc = editor.document;
      const start = match.index;
      const startPos = doc.positionAt(start);
      const endPos = doc.positionAt(start + key.length);
      const range = new Range(startPos, endPos);
      editor.revealRange(range, TextEditorRevealType.InCenter);
      editor.selection = new Selection(range.start, range.end);
    }
  }

  private async _notifyViewChange() {
    if (!this._view) {
      return;
    }

    const translations = await this.translations.getTranslations();
    const flatTranslations: Record<string, string> = flat(translations);

    this._view.webview.postMessage({
      type: 'updateList',
      translations: Object.keys(flatTranslations).map((k) => ({
        key: k,
        value: flatTranslations[k],
      })),
      filePathsFromTranslations:
        this.translations.getMappingFilePathsFromTranslations(),
      activeFile: this._activeUri?.toString(),
    });
  }

  private _getHtmlForWebView(webview: Webview) {
    const viewsUri = webview.asWebviewUri(
      Uri.joinPath(this._context.extensionUri, 'dist', 'views', 'views.js')
    );

    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              html, body, #root {
                height: 100%;
              }
            </style>
        </head>
        <body>
            <div id="root" data-view="TranslationList"></div>
            <script src="${viewsUri}"></script>
        </body>
        </html>`;
  }
}
