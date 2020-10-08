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

        if (!selection.isSingleLine) {
          const selectionSpaces = editor.document.lineAt(selectionStart.line).text.substring(0, selectionStart.character);

          // First line
          editBuilder.insert(
            new vscode.Position(selectionStart.line, selectionStart.character), `{% trans -%}\n${selectionSpaces}${tabSizeSpace}`
          );

          // Indent in-between lines
          for (let lineNum = selectionEnd.line - 1; lineNum > selectionStart.line; lineNum--) {
            editBuilder.insert(new vscode.Position(lineNum, 0), tabSizeSpace);
          }

          // Last line
          editBuilder.insert(
            new vscode.Position(selectionEnd.line, selectionEnd.character), `\n${selectionSpaces}{%- endtrans %}`
          );

          // Indent last line
          editBuilder.insert(new vscode.Position(selectionEnd.line, 0), tabSizeSpace);
          editor.selection = new vscode.Selection(selectionEnd, selectionEnd);
        }

        if (selection.isSingleLine) {
          const startPosition = new vscode.Position(selectionEnd.line, selectionStart.character);
          const endPosition = new vscode.Position(selectionEnd.line, selectionEnd.character);

          editBuilder.insert(startPosition, "{{ _('");
          editBuilder.insert(endPosition, "') }}");

          editor.selection = new vscode.Selection(selectionEnd, selectionEnd);
        }
      }
    })
  });
}
