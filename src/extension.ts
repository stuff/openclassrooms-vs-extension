import * as vscode from 'vscode';
import _ from 'lodash';
import yaml from 'js-yaml';

import { PhraseFetcher } from './services/PhraseFetcher';
import { Translations } from './services/Translations';
import { StatusBar } from './services/StatusBar';
import { TranslationsProvider } from './TranslationsProvider';
import { TranslationListViewProvider } from './TranslationListViewProvider';

let myStatusBarItem: vscode.StatusBarItem;

// this method is called when vs code is activated
export async function activate(context: vscode.ExtensionContext) {
    const fetcher = await createTranslationsFetcher();
    const translations = new Translations(fetcher, 'en');

    translations.onDidUpdateStart(() => {
        statusBar.setIsLoading(true);
    });

    translations.onDidUpdateFinish(() => {
        statusBar.setIsLoading(false);
    });

    // if (vscode.workspace?.workspaceFolders?.[0]) {
    //     const a = vscode.workspace.createFileSystemWatcher(
    //         new vscode.RelativePattern(
    //             vscode.workspace.workspaceFolders[0],
    //             '**/*.jsx'
    //         )
    //     );
    // }

    // vscode.workspace.findFiles('*.jsx', '/node_modules/').then((y) => {
    //     console.log(y); //test
    // });

    /* *********************************** */

    const translationListViewProvider = new TranslationListViewProvider(
        translations,
        context.extensionUri
    );

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            TranslationListViewProvider.viewType,
            translationListViewProvider
        )
    );

    /* *********************************** */

    const provider = new InfoViewProvider();

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            InfoViewProvider.viewType,
            provider
        )
    );

    /* *********************************** */

    const nodeDependenciesProvider = new TranslationsProvider();
    vscode.window.registerTreeDataProvider(
        'openclassrooms.view.info2',
        nodeDependenciesProvider
    );

    /* *********************************** */

    let timeout: NodeJS.Timer | undefined = undefined;
    console.log('POUET 2');

    const myCommandId = 'ocvscodeplugin.status';
    myStatusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    myStatusBarItem.command = myCommandId;
    context.subscriptions.push(myStatusBarItem);

    const statusBar = new StatusBar(myStatusBarItem);

    await translations.update();

    // ----------------------------------

    const translationKeyOKDecorationType =
        vscode.window.createTextEditorDecorationType({
            backgroundColor: '#00FF0022',
            before: {
                contentText: '🟩',
            },
        });

    const translationKeyMissingDecorationType =
        vscode.window.createTextEditorDecorationType({
            backgroundColor: '#FF000022',
            overviewRulerColor: 'red',
            before: {
                contentText: '🔴',
            },
        });

    let activeEditor = vscode.window.activeTextEditor;

    async function updateDecorations() {
        if (!activeEditor || !translations.isInitialized) {
            return;
        }

        const text = activeEditor.document.getText();
        let match;

        const translationCallRegEx = [
            /(translate\()('(\w+\.\w+.*?)')(\))/g,
            /(<Translate.*content=)("(\w+\.\w+.*?))(")/gms,
        ];
        const translationOKCalls: vscode.DecorationOptions[] = [];
        const translationMissingCalls: vscode.DecorationOptions[] = [];

        for (const reg of translationCallRegEx) {
            if (!activeEditor) {
                return;
            }

            while ((match = reg.exec(text))) {
                const key = match[3];
                const translation = await translations.getTranslationByKey(key);
                const isExisting = Boolean(translation);
                const start = match.index + match[1].length;
                const startPos = activeEditor.document.positionAt(start);
                const endPos = activeEditor.document.positionAt(
                    start + match[2].length
                );
                const decoration = {
                    range: new vscode.Range(startPos, endPos),
                    hoverMessage: translation ?? '',
                };

                if (isExisting) {
                    translationOKCalls.push(decoration);
                } else {
                    translationMissingCalls.push(decoration);
                }
            }
        }

        activeEditor.setDecorations(
            translationKeyOKDecorationType,
            translationOKCalls
        );
        activeEditor.setDecorations(
            translationKeyMissingDecorationType,
            translationMissingCalls
        );

        statusBar.setIsError(translationMissingCalls.length > 0);
        statusBar.setTranslationCount(
            translationMissingCalls.length + translationOKCalls.length
        );
    }

    function triggerUpdateDecorations(throttle = false) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        if (throttle) {
            timeout = setTimeout(updateDecorations, 500);
        } else {
            updateDecorations();
        }
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            activeEditor = editor;
            if (editor) {
                triggerUpdateDecorations();
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidChangeTextDocument(
        (event) => {
            if (activeEditor && event.document === activeEditor.document) {
                triggerUpdateDecorations(true);
            }
        },
        null,
        context.subscriptions
    );
}

class InfoViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'openclassrooms.view.info';

    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.html = 'pouet';
    }
}

async function createTranslationsFetcher() {
    const fetcher = new PhraseFetcher();

    const basePathUri = vscode.workspace.workspaceFolders?.[0].uri;

    if (basePathUri) {
        const u = vscode.Uri.joinPath(basePathUri, '.phrase.yml');
        const a = await vscode.workspace.fs.readFile(u);

        const conf: any = yaml.load(a.toString());

        fetcher.configure(
            {
                accessToken: conf.phrase.access_token,
            },
            conf.phrase.project_id
        );
    }

    return fetcher;
}
