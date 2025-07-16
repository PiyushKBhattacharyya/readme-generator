import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { loadGitIgnore } from './gitignore-utils';
import { detectProjectType } from './project-analyzer';
import { generateSmartReadme } from './generator';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('extension.generateReadme', async () => {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            vscode.window.showErrorMessage('No folder open');
            return;
        }

        const root = folders[0].uri.fsPath;
        const gitignore = loadGitIgnore(root);
        const projectType = detectProjectType(root);

        const inCodespaces = !!process.env.CODESPACES;
        const markdown = generateSmartReadme(projectType, inCodespaces);

        const filePath = path.join(root, 'README.md');
        fs.writeFileSync(filePath, markdown);

        const doc = await vscode.workspace.openTextDocument(filePath);
        vscode.window.showTextDocument(doc);
    });

    context.subscriptions.push(disposable);
}