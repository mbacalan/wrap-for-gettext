import * as vscode from "vscode";

function getTabString(editor: vscode.TextEditor): string {
  if (<boolean>editor.options.insertSpaces) {
    return ' '.repeat(<number>editor.options.tabSize);
  }

  return '\t';
}

export function activate() {
  vscode.commands.registerCommand("extension.wrapForGettext", () => {
    // The code here executes every time the command in VSC is called
    const editor = vscode.window.activeTextEditor;
    const tabSizeSpace = getTabString(editor);

    if (editor == null) {
      return;
    }

    // Start wrapping
    editor.edit((editBuilder) => {
      const selections = editor.selections;

      for (const [i, selection] of selections.entries()) {
        const selectionStart = selection.start;
        const selectionEnd = selection.end;

        if (selectionEnd.line !== selectionStart.line) {
          // For blocks
          const selectionSpaces = editor.document.lineAt(selectionStart.line).text.substring(0, selectionStart.character);

          // Last line
          editBuilder.insert(
            new vscode.Position(selectionEnd.line, selectionEnd.character), `\n${selectionSpaces}{% endtrans %}`
          );
          editBuilder.insert(new vscode.Position(selectionEnd.line, 0), tabSizeSpace);

          for (let lineNum = selectionEnd.line - 1; lineNum > selectionStart.line; lineNum--) {
            editBuilder.insert(new vscode.Position(lineNum, 0), tabSizeSpace);
          }

          // First line
          editBuilder.insert(
            new vscode.Position(selectionStart.line, selectionStart.character), `{% trans %}\n${selectionSpaces}${tabSizeSpace}`
          );
        } else {
          // For inline
          const startPosition = new vscode.Position(selectionEnd.line, selectionStart.character);
          const endPosition = new vscode.Position(selectionEnd.line, selectionEnd.character);

          editBuilder.insert(startPosition, "{{ _('");
          editBuilder.insert(endPosition, "') }}");
        }
      }
    })
  });
}
