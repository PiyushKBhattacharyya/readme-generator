import * as fs from 'fs';
import * as path from 'path';

export function detectProjectType(files: string[], root: string): string {
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        // VS Code Extension
        if (pkg.engines && pkg.engines.vscode) {
            let extDetails = 'VS Code Extension';
            if (pkg.contributes) {
                const contributes = [];
                if (pkg.contributes.commands) {contributes.push('Commands');}
                if (pkg.contributes.menus) {contributes.push('Menus');}
                if (pkg.contributes.keybindings) {contributes.push('Keybindings');}
                if (pkg.contributes.configuration) {contributes.push('Settings');}
                if (contributes.length)
                    {extDetails += ` (Contributes: ${contributes.join(', ')})`;}
            }
            return extDetails;
        }
        // Node/JS Frameworks
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
    // Build tools
    if (fs.existsSync(path.join(root, 'tsconfig.json'))) {return 'TypeScript Project';}
    if (fs.existsSync(path.join(root, 'webpack.config.js'))) {return 'Webpack Project';}
    if (fs.existsSync(path.join(root, 'gulpfile.js'))) {return 'Gulp Project';}
    // Docker
    if (fs.existsSync(path.join(root, 'Dockerfile'))) {return 'Dockerized Project';}
    // CI/CD
    if (fs.existsSync(path.join(root, '.github')) && fs.existsSync(path.join(root, '.github', 'workflows'))) {return 'Project with GitHub Actions/CI';}
    // Folder structure analysis
    if (files.includes('public')) {return 'Web Application (public folder detected)';}
    if (files.includes('src') && files.includes('test')) {return 'Library/Package (src & test folders)';}
    if (files.includes('docs')) {return 'Documented Project (docs folder)';}
    // VS Code Workspace
    if (files.includes('.vscode') || fs.existsSync(path.join(root, '.vscode'))) {
        const vscodeFiles = fs.readdirSync(path.join(root, '.vscode'));
        if (vscodeFiles.includes('launch.json')) {return 'VS Code Workspace/Project';}
        if (vscodeFiles.includes('tasks.json')) {return 'VS Code Workspace/Project';}
    }
    // Python
    if (files.includes('requirements.txt') || files.includes('main.py')) {return 'Python Application';}
    // Web
    if (files.includes('app.html') || files.includes('index.html')) {return 'Web Application';}
    // Node
    if (files.includes('server.js') || files.includes('app.js')) {return 'Node.js Application';}
    // CLI
    if (files.includes('cli.js')) {return 'Command Line Tool';}
    return 'Unknown';
}

export function detectMonorepo(root: string): string {
    const pkgPath = path.join(root, 'package.json');
    let section = '';
    // Check for packages/ folder
    if (fs.existsSync(path.join(root, 'packages'))) {
        section += '## 🗂️ Monorepo Structure\nThis project is a monorepo. It contains multiple packages:\n\n';
        const packagesDir = path.join(root, 'packages');
        const packageFolders = fs.readdirSync(packagesDir).filter(f => fs.statSync(path.join(packagesDir, f)).isDirectory());
        // Collect dependency graph
        const depGraph: Record<string, string[]> = {};
        packageFolders.forEach(pkgName => {
            const pkgJsonPath = path.join(packagesDir, pkgName, 'package.json');
            let pkgInfo = `- **${pkgName}**`;
            let pkgDeps: string[] = [];
            if (fs.existsSync(pkgJsonPath)) {
                try {
                    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                    if (pkgJson.description) {
                        pkgInfo += `: ${pkgJson.description}`;
                    }
                    // Collect workspace dependencies
                    if (pkgJson.dependencies) {
                        pkgDeps = Object.keys(pkgJson.dependencies).filter(dep =>
                            packageFolders.includes(dep)
                        );
                        if (pkgDeps.length) {
                            pkgInfo += ` (Depends on: ${pkgDeps.join(', ')})`;
                        }
                        depGraph[pkgName] = pkgDeps;
                    }
                } catch {}
            }
            section += `${pkgInfo}\n`;
            // Show per-package README summary/link
            const pkgReadmePath = path.join(packagesDir, pkgName, 'README.md');
            if (fs.existsSync(pkgReadmePath)) {
                try {
                    const readmeContent = fs.readFileSync(pkgReadmePath, 'utf8');
                    const firstPara = readmeContent.split('\n\n')[0].replace(/^#.*\n/, '').trim();
                    section += `  - [README.md](./packages/${pkgName}/README.md): ${firstPara}\n`;
                } catch {}
            }
        });
        section += '\n';
        // Optionally, show a simple dependency graph
        if (Object.keys(depGraph).length) {
            section += '### Package Dependency Graph\n';
            Object.entries(depGraph).forEach(([pkg, deps]) => {
                section += `- \`${pkg}\` → ${deps.length ? deps.map(d => `\`${d}\``).join(', ') : 'No internal deps'}\n`;
            });
            section += '\n';
        }
    }
    // Check for workspaces in root package.json
    if (fs.existsSync(pkgPath)) {
        try {
            const rootPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (rootPkg.workspaces && Array.isArray(rootPkg.workspaces)) {
                section += '### Yarn/NPM Workspaces detected:\n';
                rootPkg.workspaces.forEach((ws: string) => {
                    section += `- \`${ws}\`\n`;
                });
                section += '\n';
            }
        } catch {}
    }
    return section;
} 