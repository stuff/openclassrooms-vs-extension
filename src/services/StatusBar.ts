import { StatusBarItem, ThemeColor } from 'vscode';

export class StatusBar {
    statusBar: StatusBarItem;
    translationCount = 0;

    constructor(statusBar: StatusBarItem) {
        this.statusBar = statusBar;
        this.setIsLoading(false);
        this.statusBar.show();
    }

    setTranslationCount(count: number) {
        this.translationCount = count;
        this.setStatus();
    }

    setIsLoading(state: boolean) {
        if (state) {
            this.statusBar.text = '$(loading~spin) Translations';
        } else {
            this.setStatus();
        }
    }

    setIsError(state: boolean) {
        if (state) {
            this.statusBar.backgroundColor = new ThemeColor(
                'statusBarItem.errorBackground'
            );
        } else {
            this.statusBar.backgroundColor = undefined;
        }
    }

    setStatus() {
        this.statusBar.text =
            `$(globe) ${this.translationCount} translation` +
            (this.translationCount > 1 ? 's' : '');
    }
}
