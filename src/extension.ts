import * as vscode from 'vscode';

import { translationsActivate } from './features/translations/translationsActivate';

// this method is called when vs code is activated
export async function activate(context: vscode.ExtensionContext) {
  translationsActivate(context);
}
