import * as fs from 'fs';
import * as path from 'path';

function getOverview(root: string): string {
    // Try to extract from existing README.md
    const readmePath = path.join(root, 'README.md');
    if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        const firstPara = content.split('\n\n')[0].replace(/^#.*\n/, '').trim();
        if (firstPara) {
            return firstPara;
        }
    }
    // Fallback
    return 'A brief description of this project. Update this section with more details.';
}

function getDesignPrinciples(techStack: string[], files: string[]): string[] {
    const principles: string[] = [];
    if (techStack.includes('React')) {principles.push('Component-based architecture');}
    if (techStack.includes('Express.js')) {principles.push('RESTful API design');}
    if (techStack.includes('TypeScript')) {principles.push('Type safety and maintainability');}
    if (files.some(f => f.includes('test'))) {principles.push('Test-driven development');}
    if (files.some(f => f.includes('src'))) {principles.push('Separation of concerns');}
    return principles.length ? principles : ['Add your design principles here.'];
}

function getTestInstructions(root: string, techStack: string[]): string {
    if (fs.existsSync(path.join(root, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        if (pkg.scripts && pkg.scripts.test) {return 'npm test';}
    }
    if (techStack.includes('Python') && fs.existsSync(path.join(root, 'tests'))) {
        return 'pytest';
    }
    return 'Add your test instructions here.';
}

function getDependencies(root: string, techStack: string[]): string[] {
    const deps: string[] = [];
    if (fs.existsSync(path.join(root, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        if (pkg.dependencies) {deps.push(...Object.keys(pkg.dependencies));}
        if (pkg.devDependencies) {deps.push(...Object.keys(pkg.devDependencies));}
    }
    if (fs.existsSync(path.join(root, 'requirements.txt'))) {
        const reqs = fs.readFileSync(path.join(root, 'requirements.txt'), 'utf8')
            .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        deps.push(...reqs);
    }
    return deps;
}

function getSetupSection(techStack: string[], dependencies: string[], root: string): string[] {
    const setupLines: string[] = [
        'git clone <repo-url>',
        'cd <project-folder>',
    ];

    if (techStack.includes('Node.js')) {
        setupLines.push('npm install');
        if (dependencies.length) {
            setupLines.push('// Installs:');
            setupLines.push(...dependencies.map(dep => `npm install ${dep}`));
        }
    } else if (techStack.includes('Python')) {
        setupLines.push('pip install -r requirements.txt');
        if (dependencies.length) {
            setupLines.push('// Installs:');
            setupLines.push(...dependencies.map(dep => `pip install ${dep}`));
        }
    }
    // Add more tech stack setup instructions as needed

    return setupLines;
}

function detectProjectType(files: string[], root: string): string {
    // VS Code Extension: package.json with "vscode" engine or "extension.ts"
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.engines && pkg.engines.vscode) {return 'VS Code Extension';}
        if (pkg.dependencies) {
            if (pkg.dependencies.react || pkg.dependencies['react-dom']) {return 'React Web Application';}
            if (pkg.dependencies['next']) {return 'Next.js Web Application';}
            if (pkg.dependencies['express']) {return 'Express.js Backend';}
            if (pkg.dependencies['nestjs']) {return 'NestJS Backend';}
            if (pkg.dependencies['vite']) {return 'Vite Web Application';}
        }
        if (pkg.main && pkg.main.endsWith('.js')) {return 'Node.js Application';}
        if (pkg.bin) {return 'Command Line Tool';}
    }
    // VS Code Workspace
    if (files.includes('.vscode') || fs.existsSync(path.join(root, '.vscode'))) {
        // Check for launch.json or tasks.json for extension/workspace
        const vscodeFiles = fs.readdirSync(path.join(root, '.vscode'));
        if (vscodeFiles.includes('launch.json')) {return 'VS Code Workspace/Project';}
        if (vscodeFiles.includes('tasks.json')) {return 'VS Code Workspace/Project';}
    }
    // Python
    if (files.includes('requirements.txt') || files.includes('main.py')) {return 'Python Application';}
    // Web
    if (files.includes('app.html') || files.includes('index.html') || files.includes('public')) {return 'Web Application';}
    // Node
    if (files.includes('server.js') || files.includes('app.js')) {return 'Node.js Application';}
    // CLI
    if (files.includes('cli.js')) {return 'Command Line Tool';}
    // Library
    if (files.includes('src') && files.includes('tests')) {return 'Library/Package';}
    return 'Unknown';
}

function getMainEntry(root: string, techStack: string[], files: string[]): string {
    if (files.includes('app.html')) {return 'app.html';}
    if (files.includes('index.html')) {return 'index.html';}
    if (files.includes('main.py')) {return 'main.py';}
    if (files.includes('extension.ts')) {return 'extension.ts';}
    if (fs.existsSync(path.join(root, 'package.json'))) {
        const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
        if (pkg.main) {return pkg.main;}
    }
    return files.find(f => f.endsWith('.js') || f.endsWith('.ts')) || 'src/index.js';
}

export function generateSmartReadme(
    projectName: string,
    _projectType: string, // Remove this param, use detected type
    techStack: string[],
    includeCodespaces: boolean,
    root: string
): string {
    const files = fs.readdirSync(root);
    const projectType = detectProjectType(files, root);
    const overview = getOverview(root);
    const designPrinciples = getDesignPrinciples(techStack, files);
    const testInstructions = getTestInstructions(root, techStack);
    const dependencies = getDependencies(root, techStack);
    const mainEntry = getMainEntry(root, techStack, files);
    const runCommand = detectRunCommandFromTechStack(techStack, projectType, files);

    // .gitignore section
    const gitignorePath = path.join(root, '.gitignore');
    let gitignoreSection = '';
    if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8')
            .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        if (gitignore.length) {
            gitignoreSection = `## 🚫 Ignored Files & Folders\nThese files/folders are excluded from version control:\n${gitignore.map(i => `- \`${i}\``).join('\n')}\n`;
        }
    }

    // Improved setup section
    const setupSection = [
        '## ⚙️ Setup',
        '```bash',
        ...getSetupSection(techStack, dependencies, root),
        '```',
        '',
    ].join('\n');

    return [
        `# 🚀 ${projectName}`,
        overview,
        '',
        `## 🧠 Project Type`,
        `> This project appears to be a **${projectType}**`,
        '',
        `## 📦 Technologies`,
        techStack.length ? techStack.map(t => `- ${t}`).join('\n') : '- Could not detect tech stack - Manually add technologies here.',
        '',
        `## 📂 Main Entry Point`,
        `\`${mainEntry}\``,
        '',
        `## 📚 Dependencies`,
        dependencies.length ? dependencies.map(d => `- ${d}`).join('\n') : '- No dependencies detected.',
        '',
        setupSection,
        `## 🏃 Run`,
        '```bash',
        runCommand,
        '```',
        '',
        `## 🧪 Test`,
        '```bash',
        testInstructions,
        '```',
        '',
        `## 🏗️ Design Principles`,
        designPrinciples.map(p => `- ${p}`).join('\n'),
        '',
        includeCodespaces ? [
            `## 💻 Codespaces`,
            `This project supports GitHub Codespaces!`,
            `- Just open in Codespaces and it will auto-install dependencies.`,
            `- Customize devcontainer if needed.`,
            ''
        ].join('\n') : '',
        gitignoreSection,
        `## 📄 License`,
        `This project is licensed under the MIT License - see the LICENSE file for details.`
    ].filter(Boolean).join('\n');
}

// Only use techStack[] to guess the run command
function detectRunCommandFromTechStack(techStack: string[], projectType: string, files: string[]): string {
    if (projectType === 'VS Code Extension') {return 'Run via VS Code (F5 or Extension Host)';}
    if (projectType === 'Web Application') {return 'Open app.html or index.html in your browser';}
    if (projectType === 'Command Line Tool') {return `node ${getMainEntry('', techStack, files)}`;}
    // Existing logic for frameworks
    if (techStack.includes('Next.js')) {return 'npm run dev';}
    if (techStack.includes('Vite')) {return 'npm run dev';}
    if (techStack.includes('React')) {return 'npm start';}
    if (techStack.includes('NestJS')) {return 'npm run start';}
    if (techStack.includes('Express.js')) {return 'npm run dev';}
    if (techStack.includes('Node.js') || techStack.includes('TypeScript')) {return 'node index.js';}
    if (techStack.includes('Flask')) {return 'python app.py';}
    if (techStack.includes('Django')) {return 'python manage.py runserver';}
    if (techStack.includes('.NET Core') || techStack.includes('C# (.NET)')) {return 'dotnet run';}
    return '# Replace this with your run command';
}