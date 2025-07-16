import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { scanDirectory } from './scanner';
import { generateMarkdown } from './generator';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.generateReadme', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Open a folder first');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const data = scanDirectory(rootPath);
        const markdown = generateMarkdown(data);

        const readmePath = path.join(rootPath, 'README.md');
        fs.writeFileSync(readmePath, markdown, 'utf-8');

        vscode.window.showInformationMessage('README.md generated!');
        vscode.workspace.openTextDocument(readmePath).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}