// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as providers from './providersExamples';
import * as sh from './shell';
import * as term from './terminal';
import * as captureTerm from './captureTerminal';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const multiCompletionTypes = providers.getMultiCompletionTypes();
	const completionWithOptions = providers.getCompletionWithOptionsProvider();
  const disposableShell = sh.getShellDisposable();
  const sendTextViaTerminal = term.getSendTextViaTerminal();  
  const terminalCaptureCommand = captureTerm.getCaptureTerminal();

  context.subscriptions.push(
    multiCompletionTypes, 
    completionWithOptions, 
    disposableShell,
    sendTextViaTerminal,
    terminalCaptureCommand);	
}



// this method is called when your extension is deactivated
export function deactivate() {
}
