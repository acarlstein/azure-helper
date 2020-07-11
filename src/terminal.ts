import * as vscode from 'vscode';

function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}

function directTerminal(): vscode.Terminal | undefined {
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	return terminals[0];
}

function terminal(){
	if (ensureTerminalExists()){
		directTerminal()?.sendText("echo 'Hola!!! Enfermera!' > output.txt 2>&1 ");	
	} else { 
		console.error("No Terminal Exists");
	}
}
export function getSendTextViaTerminal(): vscode.Disposable {
	return vscode.commands.registerCommand('terminalTest.sendText', terminal);
}