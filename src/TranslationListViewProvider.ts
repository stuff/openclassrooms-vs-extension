import { WebviewViewProvider, WebviewView, Webview, Uri } from 'vscode';
import flat from 'flat';
import { Translations } from './services/Translations';

export class TranslationListViewProvider implements WebviewViewProvider {
    public static readonly viewType = 'openclassrooms.view.translationList';

    private _extensionUri: Uri;
    private _view?: WebviewView;

    translations: Translations;

    constructor(translations: Translations, extensionUri: Uri) {
        this.translations = translations;
        this._extensionUri = extensionUri;
        console.log('OK POUET');
        // translations.onDidUpdateFinish(() => {
        //     this._updateList();
        // });
    }

    resolveWebviewView(webviewView: WebviewView) {
        console.log('OK RENDERING');
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._getHtmlForWebView(webviewView.webview);
        this._updateList();
    }

    private async _updateList() {
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
        });
    }

    private _getHtmlForWebView(webview: Webview) {
        const lodashUri = webview.asWebviewUri(
            Uri.joinPath(this._extensionUri, 'media', 'lodash.min.js')
        );

        const scriptUri = webview.asWebviewUri(
            Uri.joinPath(
                this._extensionUri,
                'media',
                'translationList',
                'script.js'
            )
        );

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
            <title>Translation list</title>
        </head>
        <body>
            <div id="root"></div>

            <script src="${lodashUri}"></script>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }
}
