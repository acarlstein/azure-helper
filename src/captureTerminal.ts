import * as vscode from 'vscode';

let terminalData = {};
let options : vscode.WorkspaceConfiguration;

export function getCaptureTerminal(): vscode.Disposable {
  initCapture();
  return vscode.commands.registerCommand('extension.terminalCapture.runCapture', runCapture);
}

function initCapture(){
	terminalData = {};
	options = vscode.workspace.getConfiguration('terminalCapture');
  
	if (options.get('enable') === false) {
    vscode.window.showWarningMessage('Terminal Capture is disabled');
    return;
	}
	
	console.log('Terminal Capture extension is now active');

  if (options.get('useClipboard') === false) {
    vscode.window.terminals.forEach((terminal: vscode.Terminal) => {
      registerTerminalForCapture(terminal);
    });

    vscode.window.onDidOpenTerminal((terminal: vscode.Terminal)=> {
      registerTerminalForCapture(terminal);
    });
	}
}

function runCapture(){
  if (options.get('enable') === false) {
    vscode.window.showWarningMessage('Capturing terminal is disabled');
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
}

function registerTerminalForCapture(terminal: vscode.Terminal) {
  terminal.processId.then(terminalId => {
		if (terminalId){
			(<any>terminalData)[terminalId] = "";
			(<any>terminal).onDidWriteData((data: any) => {
				(<any>terminalData)[terminalId] += data;
			});	
		} else {
			vscode.window.showWarningMessage("There is no a terminal for which extract data");
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
    vscode.window.showWarningMessage('Cannot capture due missing terminal');
    return;
  }

  terminal.processId.then(terminalId => {
    vscode.commands.executeCommand('workbench.action.files.newUntitledFile').then(() => {
      let editor = vscode.window.activeTextEditor;
      if (editor === undefined) {
        vscode.window.showWarningMessage('No active text editor existent to paste content from terminal');
        return;
      }
			
			if(terminalId){
				let cache = cleanupCacheData((<any>terminalData)[terminalId]);
				editor.edit(builder => {
					builder.insert(new vscode.Position(0, 0), cache);
				});
			} else {
        vscode.window.showWarningMessage("There is no terminal for which we can obtain a cache");
			}
     
    });
  });
}

function cleanupCacheData(data: string): string {
  // 0x1B + "[" + <zero or more numbers, separated by ";"> + character m
  const regexControlSequenceIntroducer = '\x1b\[[0-9;]*m';
  return data.replace(new RegExp(regexControlSequenceIntroducer, 'g'), '');
}