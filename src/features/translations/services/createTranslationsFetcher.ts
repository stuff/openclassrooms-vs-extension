import * as vscode from 'vscode';
import yaml from 'js-yaml';
import { PhraseFetcher } from './PhraseFetcher';

export async function createTranslationsFetcher() {
  if (!vscode.workspace.workspaceFolders) {
    return;
  }

  let conf: any;
  const configurationFilename = '.phrase.yml';
  const fetcher = new PhraseFetcher();

  for (const workspaceFolder of vscode.workspace.workspaceFolders) {
    const basePathUri = workspaceFolder.uri;
    const u = vscode.Uri.joinPath(basePathUri, configurationFilename);

    try {
      const a = await vscode.workspace.fs.readFile(u);
      conf = yaml.load(a.toString());
    } catch {
      // TODO: error handling
    }
  }

  if (!conf) {
    vscode.window.showErrorMessage(`${configurationFilename} not found.`);
    return;
  }

  fetcher.configure(
    {
      accessToken: conf.phrase.access_token,
    },
    conf.phrase.project_id
  );

  return fetcher;
}
