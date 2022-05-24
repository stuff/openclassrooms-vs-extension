import * as vscode from 'vscode';

import { Translations } from './services/Translations';
import { StatusBar } from './services/StatusBar';
import { forEachTranslateCall } from './services/forEachTranslateCall';
import { createTranslationsFetcher } from './services/createTranslationsFetcher';
import { TranslationListViewProvider } from './views/TranslationListViewProvider';

let myStatusBarItem: vscode.StatusBarItem;

export async function translationsActivate(context: vscode.ExtensionContext) {
  const fetcher = await createTranslationsFetcher();

  if (!fetcher) {
    return;
  }

  const translations = new Translations(fetcher, 'en');

  /* *********************************** */

  const translationListViewProvider = new TranslationListViewProvider(
    translations,
    context
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TranslationListViewProvider.viewType,
      translationListViewProvider
    )
  );

  let timeout: NodeJS.Timer | undefined = undefined;

  const myCommandId = 'ocvscodeplugin.status';
  myStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  myStatusBarItem.command = myCommandId;
  context.subscriptions.push(myStatusBarItem);

  const statusBar = new StatusBar(myStatusBarItem);

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

  translations.onDidUpdateStart(() => {
    statusBar.setIsLoading(true);
  });

  translations.onDidUpdateFinish(() => {
    statusBar.setIsLoading(false);

    async function updateDecorations() {
      if (!activeEditor) {
        return;
      }

      const text = activeEditor.document.getText();
      const translationOKCalls: vscode.DecorationOptions[] = [];
      const translationMissingCalls: vscode.DecorationOptions[] = [];

      await forEachTranslateCall(text, async (key: string, match: any) => {
        if (!activeEditor) {
          return;
        }
        console.log(key, match);
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
      });

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
  });

  await translations.update();
}
