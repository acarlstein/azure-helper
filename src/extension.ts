// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as providers from './providersExamples';
import * as sh from './shell';
import * as term from './terminal';

let terminalData = {};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const multiCompletionTypes = providers.getMultiCompletionTypes();
	const completionWithOptions = providers.getCompletionWithOptionsProvider();
	const disposableShell = sh.getShellDisposable();
	context.subscriptions.push(multiCompletionTypes, completionWithOptions, disposableShell);	

  context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendText', () => {
    if (term.ensureTerminalExists()){
      term.directTerminal()?.sendText("echo 'Hola!!! Enfermera!' > output.txt 2>&1 ");	
    } else { 
      console.error("No Terminal Exists");
    }
  }));

	/********************/
	/* Terminal Capture */
	/********************/
	terminalData = {};
	let options = vscode.workspace.getConfiguration('terminalCapture');
  
	if (options.get('enable') === false) {
    console.log('Terminal Capture is disabled');
    return;
	}
	
	console.log('Terminal Capture extension is now active');

  if (options.get('useClipboard') === false) {
    vscode.window.terminals.forEach(t => {
      registerTerminalForCapture(t);
    });

    vscode.window.onDidOpenTerminal(t=> {
      registerTerminalForCapture(t);
    });
	}
	
	context.subscriptions.push(vscode.commands.registerCommand('extension.terminalCapture.runCapture', () => {
    if (options.get('enable') === false) {
      console.log('Command has been disabled, not running');
    }

    const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
    if (terminals.length <= 0) {
      vscode.window.showWarningMessage('No terminals found, cannot run copy');
      return;
    }

    if (options.get('useClipboard') === true) {
      runClipboardMode();
    } else {
      runCacheMode();
    }
  }));
}

function registerTerminalForCapture(terminal: vscode.Terminal) {
  terminal.processId.then(terminalId => {
		if (terminalId){
			(<any>terminalData)[terminalId] = "";
			(<any>terminal).onDidWriteData((data: any) => {
				// TODO:
				//   - Need to remove (or handle) backspace
				//   - not sure what to do about carriage return???
				//   - might have some odd output
				(<any>terminalData)[terminalId] += data;
			});	
		} else {
			console.error("terminalId is nt available");
		}
  });
}

function runClipboardMode() {
  vscode.commands.executeCommand('workbench.action.terminal.selectAll').then(() => {
    vscode.commands.executeCommand('workbench.action.terminal.copySelection').then(() => {
      vscode.commands.executeCommand('workbench.action.terminal.clearSelection').then(() => {
        vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
          vscode.commands.executeCommand('editor.action.clipboardPasteAction');
        });
      });
    });
  });
}

function runCacheMode() {
  let terminal = vscode.window.activeTerminal;
  if (terminal === undefined) {
    vscode.window.showWarningMessage('No active terminal found, can not capture');
    return;
  }

  terminal.processId.then(terminalId => {
    vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
      let editor = vscode.window.activeTextEditor;
      if (editor === undefined) {
        vscode.window.showWarningMessage('Failed to find active editor to paste terminal content');
        return;
      }
			
			if(terminalId){
				let cache = cleanupCacheData((<any>terminalData)[terminalId]);
				editor.edit(builder => {
					builder.insert(new vscode.Position(0, 0), cache);
				});
			} else {
				console.error("No terminalId to obtain cache from");
			}
     
    });
  });
}

function cleanupCacheData(data: string): string {
  return data.replace(new RegExp('\x1b\[[0-9;]*m', 'g'), '');
}

// this method is called when your extension is deactivated
export function deactivate() {
	terminalData = {};
}
