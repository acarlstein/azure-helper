import * as vscode from 'vscode';

export function getSimpleCompletion(text: string): vscode.CompletionItem {
  return new vscode.CompletionItem(text);
}

// a completion item that inserts its text as snippet,
// the `insertText`-property is a `SnippetString` which will be
// honored by the editor.
export function getSnippetCompletion(): vscode.CompletionItem {
  const snippetCompletion = new vscode.CompletionItem('Good part of the day');
  snippetCompletion.insertText = new vscode.SnippetString('Good ${1|morning,afternoon,evening|}. It is ${1}, right?');
  snippetCompletion.documentation = new vscode.MarkdownString("Inserts a snippet that lets you select the _appropriate_ part of the day for your greeting.");
  return snippetCompletion;
}

// a completion item that can be accepted by a commit character,
// the `commitCharacters`-property is set which means that the completion will
// be inserted and then the character will be typed.
export function getCommitCharacterCompletion(): vscode.CompletionItem {
  const commitCharacterCompletion = new vscode.CompletionItem('console');
  commitCharacterCompletion.commitCharacters = ['.'];
  commitCharacterCompletion.documentation = new vscode.MarkdownString('Press `.` to get `console.`');
  return commitCharacterCompletion;
}

// a completion item that retriggers IntelliSense when being accepted,
// the `command`-property is set which the editor will execute after 
// completion has been inserted. Also, the `insertText` is set so that 
// a space is inserted after `new`
export function getCommandCompletion(): vscode.CompletionItem {
  const commandCompletion = new vscode.CompletionItem('new');
  commandCompletion.kind = vscode.CompletionItemKind.Keyword;
  commandCompletion.insertText = 'new ';
  commandCompletion.command = { command: 'editor.action.triggerSuggest', title: 'Re-trigger completions...' };
  return commandCompletion;  
}

