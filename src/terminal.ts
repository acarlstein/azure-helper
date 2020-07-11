import * as vscode from 'vscode';

export function ensureTerminalExists(): boolean {
	if ((<any>vscode.window).terminals.length === 0) {
		vscode.window.showErrorMessage('No active terminals');
		return false;
	}
	return true;
}

export function directTerminal(): vscode.Terminal | undefined {
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	return terminals[0];
}