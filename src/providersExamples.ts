import * as vscode from 'vscode';
import * as cts from './completionTypeExamples';

export function getMultiCompletionTypes() {
  return vscode.languages.registerCompletionItemProvider('plaintext', {

		provideCompletionItems(document: vscode.TextDocument, 
													 position: vscode.Position, 
													 token: vscode.CancellationToken, 
													 context: vscode.CompletionContext) {

			const simpleCompletion = cts.getSimpleCompletion('Hello World!');
			const snippetCompletion = cts.getSnippetCompletion();
			const commitCharacterCompletion = cts.getCommitCharacterCompletion();
			const commandCompletion = cts.getCommandCompletion();

			return [
				simpleCompletion,
				snippetCompletion,
				commitCharacterCompletion,
				commandCompletion
			];
		}
	});
}

export function getCompletionWithOptionsProvider(){
  return vscode.languages.registerCompletionItemProvider(
		'plaintext',
		{
			provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {

				// get all text until the `position` and check if it reads `console.`
				// and if so then complete if `log`, `warn`, and `error`
				const linePrefix = document.lineAt(position).text.substr(0, position.character);
				if (!linePrefix.endsWith('console.')) {
					return undefined;
				}

				return [
					new vscode.CompletionItem('log', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('warn', vscode.CompletionItemKind.Method),
					new vscode.CompletionItem('error', vscode.CompletionItemKind.Method),
				];
			}
		},
		'.' // triggered whenever a '.' is being typed
	);
}