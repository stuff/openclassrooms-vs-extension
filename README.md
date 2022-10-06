⚠️ Code moves to https://github.com/OpenClassrooms/webtools-extension ⚠️

The extension handles translations, and maybe it would be cool to add other features, so it's setup to be evolutive.
It was quickly coded, and I've learnt to use both vs api and typescript, so probably not best code ever.
The view of the translations tabs is done with react.

There are bugs :)
I didn't use the extension in real daily work (because I don't use translations anymore for months) I know that probably adding or removing files won't made the translations count change. Probably that changing tab an returning will update (or maybe not :p)
If the content of the tab don't show, usually going on another tab and returning refresh it.

### launch vscode watcher
yarn webpack-dev

### launch vscode test window
type F5 (obviously, you need to use Vscode to edit the code :p)

### refresh vscode test window
you can `control-R` to refresh

you have to install `vsce` to package the extension in a `vsix` file in order to install it in Vscode
(see https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

