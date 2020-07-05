import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { resolveEnvironmentVariables } from './environment';

interface IShellConfig {
  shell: string;
  args?: string[];
  label?: string;
  launchName?: string;
  cwd?: string;
  env?: { [key: string]: string | null; };
}

interface IShellLauncherConfig {
  shells: {
      linux: IShellConfig[];
      osx: IShellConfig[];
      windows: IShellConfig[];
  };
}

interface IShellQuickPickItem extends vscode.QuickPickItem {
  _shell: IShellConfig;
}

// Return all shells that the system has available.
// For example: In my system I have: cmd, PowerShell and GitBash
function getShellsInSystem(): IShellConfig[] {
  const config = <IShellLauncherConfig>vscode.workspace.getConfiguration().get('shellLauncher');
  const shells = config.shells;
  if (isWindows()) {
      return shells.windows;
  }
  if (isOsX()) {
      return shells.osx;
  }
  return shells.linux;
}

function isWindows(): boolean{
  return os.platform() === 'win32';
}

function isOsX(): boolean {
  return os.platform() === 'darwin';
}

function getShellLabel(shell: IShellConfig): string {
  if (shell.label) {
      return shell.label;
  }
  return getShellDescription(shell);
}

function getShellDescription(shell: IShellConfig): string {
  if (!shell.args || shell.args.length === 0) {
      return shell.shell;
  }
  return `${shell.shell} ${shell.args.join(' ')}`;
}

function resolveShellVariables(shellConfig: IShellConfig): void {
  const isWindows = os.platform() === 'win32';
  shellConfig.shell = resolveEnvironmentVariables(shellConfig.shell, isWindows);
  if (shellConfig.args) {
      for (let i = 0; i < shellConfig.args.length; ++i) {
          shellConfig.args[i] = resolveEnvironmentVariables(shellConfig.args[i], isWindows);
      }
  }
}

// Here is where the magic begins
function startShell(shell: IShellConfig): void {
  const terminalOptions: vscode.TerminalOptions = {
      cwd: shell.cwd,
      name: shell.launchName,
      shellPath: shell.shell,
      shellArgs: shell.args,
      env: shell.env
  };  
  const terminal = vscode.window.createTerminal(terminalOptions);
  terminal.show();
}

// If the basename is the same assume it's being pulled from the PATH
function isBasenamePulledFromPath(s: { shell: string; }) : boolean{
  return path.basename(s.shell) === s.shell;
}

function doPathExists(s: { shell: string; }) : boolean{
  try {
    // Sysnative virtual folder to access 64bit system System32 on 32bit vscode
    if (os.platform() === 'win32' && process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
        s.shell = s.shell.replace('System32', 'Sysnative');
    }
    fs.accessSync(s.shell, fs.constants.R_OK | fs.constants.X_OK);
  } catch {
      return false;
  }
  return true;
}

export function getShellDisposable(){
  const disposable = vscode.commands.registerCommand('shellLauncher.launch', () => {

    const shells = getShellsInSystem();
    
    // We will use this below when showing options when having multiple shells in 
    // the system
    shells.forEach(s => resolveShellVariables(s));
    
    const options: vscode.QuickPickOptions = {
        placeHolder: 'Select the shell to launch'
    };

    // The items are the different shells avaialble in the system
    // for which we can create the terminal
    const items: IShellQuickPickItem[] = shells.filter(s => {        
        if (isBasenamePulledFromPath(s)) {
            return true;
        }
        // Only show the shell if the path exists
        return doPathExists(s);
    }).map(s => {
        return {
            label: getShellLabel(s),
            description: getShellDescription(s),
            _shell: s
        };
    });

    // If we only have one shell, we create the terminal for that one
    if (items.length === 1) {
        startShell(items[0]._shell);
    } else {
        // If we have more than one shell, we allow the user 
        // to pick which one he wish to use as a terminal
        vscode.window.showQuickPick(items, options).then(item => {
            if (item) {
                startShell(item._shell);
            }
        });
    }
  });
  return disposable;
}
