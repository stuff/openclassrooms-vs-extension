import {
    TreeDataProvider,
    TreeItem,
    TreeItemCollapsibleState,
    Command,
} from 'vscode';

export class TranslationsProvider implements TreeDataProvider<Translation> {
    getTreeItem(element: Translation): TreeItem {
        return element;
    }

    async getChildren(element?: Translation): Promise<Translation[]> {
        return [
            new Translation('pouet1', TreeItemCollapsibleState.None),
            new Translation('pouet2', TreeItemCollapsibleState.None),
        ];
    }
}

export class Translation extends TreeItem {
    constructor(
        public readonly label: string,
        // private readonly version: string,
        public readonly collapsibleState: TreeItemCollapsibleState // public readonly command?: Command
    ) {
        super(label, collapsibleState);

        // this.tooltip = `${this.label}-${this.version}`;
        // this.description = this.version;
    }

    // iconPath = {
    //     light: path.join(
    //         __filename,
    //         '..',
    //         '..',
    //         'resources',
    //         'light',
    //         'dependency.svg'
    //     ),
    //     dark: path.join(
    //         __filename,
    //         '..',
    //         '..',
    //         'resources',
    //         'dark',
    //         'dependency.svg'
    //     ),
    // };

    contextValue = 'translation';
}
