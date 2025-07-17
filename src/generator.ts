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

function detectTestFrameworks(root: string, techStack: string[], files: string[]): string {
    const frameworks: string[] = [];
    const coverageTools: string[] = [];
    const testLibs = [
        { key: 'jest', label: 'Jest' },
        { key: 'mocha', label: 'Mocha' },
        { key: 'chai', label: 'Chai' },
        { key: 'ava', label: 'AVA' },
        { key: 'vitest', label: 'Vitest' },
        { key: 'pytest', label: 'Pytest' },
        { key: 'unittest', label: 'Python unittest' },
        { key: 'nose', label: 'Nose' },
        { key: 'tap', label: 'TAP' }
    ];
    const coverageLibs = [
        { key: 'nyc', label: 'nyc (Istanbul)' },
        { key: 'coverage', label: 'coverage.py' },
        { key: 'c8', label: 'c8' },
        { key: 'codecov', label: 'Codecov' },
        { key: 'coveralls', label: 'Coveralls' }
    ];

    // Check package.json dependencies
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        for (const lib of testLibs) {
            if (allDeps && allDeps[lib.key]) {frameworks.push(lib.label);}
        }
        for (const cov of coverageLibs) {
            if (allDeps && allDeps[cov.key]) {coverageTools.push(cov.label);}
        }
    }
    // Python requirements.txt
    if (fs.existsSync(path.join(root, 'requirements.txt'))) {
        const reqs = fs.readFileSync(path.join(root, 'requirements.txt'), 'utf8').toLowerCase();
        for (const lib of testLibs) {
            if (reqs.includes(lib.key)) {frameworks.push(lib.label);}
        }
        for (const cov of coverageLibs) {
            if (reqs.includes(cov.key)) {coverageTools.push(cov.label);}
        }
    }
    // Check for config files
    if (fs.existsSync(path.join(root, 'jest.config.js'))) {frameworks.push('Jest');}
    if (fs.existsSync(path.join(root, 'mocha.opts'))) {frameworks.push('Mocha');}
    if (fs.existsSync(path.join(root, 'pytest.ini'))) {frameworks.push('Pytest');}
    if (fs.existsSync(path.join(root, '.coveragerc'))) {coverageTools.push('coverage.py');}

    let section = '';
    if (frameworks.length) {
        section += `## 🧪 Test Frameworks\nDetected: ${frameworks.join(', ')}\n\n`;
    }
    if (coverageTools.length) {
        section += `## 📊 Coverage\nDetected: ${coverageTools.join(', ')}\n`;
        // Add badge for Codecov or Coveralls if detected
        if (coverageTools.includes('Codecov')) {
            section += `![Codecov](https://codecov.io/gh/<your-repo>/branch/main/graph/badge.svg)\n`;
        }
        if (coverageTools.includes('Coveralls')) {
            section += `![Coveralls](https://coveralls.io/repos/github/<your-repo>/badge.svg?branch=main)\n`;
        }
    }
    return section;
}

function detectFeatures(root: string): string[] {
    const features: string[] = [];
    const keywords = [
        { key: 'auth', label: 'Authentication' },
        { key: 'login', label: 'Login System' },
        { key: 'register', label: 'Registration' },
        { key: 'api', label: 'API Endpoints' },
        { key: 'database', label: 'Database Integration' },
        { key: 'graphql', label: 'GraphQL Support' },
        { key: 'websocket', label: 'WebSocket Support' },
        { key: 'cache', label: 'Caching' },
        { key: 'test', label: 'Testing' },
        { key: 'i18n', label: 'Internationalization' },
        { key: 'docker', label: 'Docker Support' },
        { key: 'ci', label: 'CI/CD Integration' }
    ];

    function scanFile(filePath: string) {
        try {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            for (const { key, label } of keywords) {
                const regex = new RegExp(`\\b${key}\\b`, 'i');
                if (regex.test(content) && !features.includes(label)) {
                    features.push(label);
                }
            }
        } catch { /* ignore errors */ }
    }

    // Only scan non-ignored files at root
    const filesToScan = getNonIgnoredFiles(root)
    .filter(f => !['package', 'requirements'].includes(f))
        .filter(f => f.endsWith('.md'));

    filesToScan.forEach(f => scanFile(path.join(root, f)));

    return features;
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

function getUsageExamples(root: string): string {
    // Scan examples/ folder
    const examplesDir = path.join(root, 'examples');
    let examplesSection = '';
    if (fs.existsSync(examplesDir)) {
        const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.py') || f.endsWith('.md'));
        if (files.length > 0) {
            examplesSection += '## 📖 Usage Examples\n';
            files.forEach(file => {
                const filePath = path.join(examplesDir, file);
                let content = '';
                try {
                    content = fs.readFileSync(filePath, 'utf8');
                } catch {}
                examplesSection += `### ${file}\n\`\`\`\n${content.substring(0, 500)}\n\`\`\`\n`; // Show first 500 chars
            });
        }
    }
    // Scan README for code blocks
    const readmePath = path.join(root, 'README.md');
    if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf8');
        const codeBlocks = content.match(/```[\s\S]*?```/g);
        if (codeBlocks && codeBlocks.length > 0) {
            examplesSection += '## 📖 Usage Examples from README\n';
            codeBlocks.forEach((block, i) => {
                examplesSection += `### Example ${i + 1}\n${block}\n`;
            });
        }
    }
    return examplesSection;
}

function getCliUsage(root: string): string {
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) {return '';}
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.bin) {return '';}
    let usageSection = '## 💻 CLI Usage\n';
    if (typeof pkg.bin === 'string') {
        usageSection += `\`\`\`bash\nnpx ${path.basename(pkg.bin)} [options]\n\`\`\`\n`;
    } else if (typeof pkg.bin === 'object') {
        Object.keys(pkg.bin).forEach(cmd => {
            usageSection += `\`\`\`bash\nnpx ${cmd} [options]\n\`\`\`\n`;
        });
    }
    return usageSection;
}

function detectInternationalization(root: string, techStack: string[], files: string[]): string {
    // Check for locales/ folder
    if (fs.existsSync(path.join(root, 'locales')) || fs.existsSync(path.join(root, 'locale'))) {
        return 'This project supports internationalization (i18n) via a locales folder.';
    }
    // Check for common i18n libraries in tech stack or dependencies
    const i18nLibs = ['i18next', 'react-intl', 'vue-i18n', 'next-i18next', 'formatjs', 'gettext', 'polyglot', 'lingui'];
    if (techStack.some(t => i18nLibs.includes(t)) || files.some(f => i18nLibs.some(lib => f.includes(lib)))) {
        return 'Internationalization (i18n) support detected via libraries.';
    }
    // Check package.json dependencies
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies) {
            for (const lib of i18nLibs) {
                if (pkg.dependencies[lib]) {
                    return `Internationalization (i18n) support detected via ${lib}.`;
                }
            }
        }
    }
    return '';
}

function detectSecurityNotes(root: string, techStack: string[], files: string[]): string {
    // Check for .env file
    if (fs.existsSync(path.join(root, '.env'))) {
        return 'Sensitive configuration detected in `.env` file. **Do not commit secrets to version control.**';
    }
    // Check for secrets/ folder
    if (fs.existsSync(path.join(root, 'secrets'))) {
        return 'This project uses a `secrets/` folder. Store sensitive files securely and do not commit them.';
    }
    // Check for common security-related dependencies
    const securityLibs = [
        'helmet', 'cors', 'jsonwebtoken', 'bcrypt', 'argon2', 'passport', 'express-rate-limit',
        'dotenv', 'secure', 'pyjwt', 'cryptography', 'python-dotenv'
    ];
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies) {
            for (const lib of securityLibs) {
                if (pkg.dependencies[lib]) {
                    return `Security library detected: **${lib}**. Follow best practices for authentication and data protection.`;
                }
            }
        }
    }
    return '';
}

function getCustomSections(root: string): string {
    const configPath = path.join(root, 'readmegen.config.json');
    if (!fs.existsSync(configPath)) {return '';}
    try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        let customSections = '';
        if (config.customSections && Array.isArray(config.customSections)) {
            config.customSections.forEach((section: { title: string; content: string }) => {
                if (section.title && section.content) {
                    customSections += `## ${section.title}\n${section.content}\n\n`;
                }
            });
        }
        if (config.additionalNotes) {
            customSections += `## 📝 Additional Notes\n${config.additionalNotes}\n\n`;
        }
        return customSections;
    } catch {
        return '';
    }
}

function getDeploymentSection(root: string): string {
    let section = '';
    // Docker
    if (fs.existsSync(path.join(root, 'Dockerfile'))) {
        section += [
            '## 🚢 Deployment: Docker',
            'This project includes a `Dockerfile`. You can build and run the container with:',
            '```bash',
            'docker build -t <your-image-name> .',
            'docker run -p 3000:3000 <your-image-name>',
            '```',
            ''
        ].join('\n');
    }
    // GitHub Actions
    if (fs.existsSync(path.join(root, '.github', 'workflows'))) {
        section += [
            '## ⚙️ CI/CD: GitHub Actions',
            'This project uses GitHub Actions for CI/CD.',
            '![GitHub Workflow Status](https://github.com/<your-repo>/actions/workflows/main.yml/badge.svg)',
            ''
        ].join('\n');
    }
    // Vercel
    if (fs.existsSync(path.join(root, 'vercel.json'))) {
        section += [
            '## ▲ Deployment: Vercel',
            'This project includes a `vercel.json` for Vercel deployment.',
            '[![Vercel](https://vercelbadge.vercel.app/api/<your-repo>)](https://vercel.com)',
            ''
        ].join('\n');
    }
    // Netlify
    if (fs.existsSync(path.join(root, 'netlify.toml'))) {
        section += [
            '## 🚀 Deployment: Netlify',
            'This project includes a `netlify.toml` for Netlify deployment.',
            '[![Netlify Status](https://api.netlify.com/api/v1/badges/<your-badge-id>/deploy-status)](https://app.netlify.com/sites/<your-site>/deploys)',
            ''
        ].join('\n');
    }
    return section;
}

function detectMonorepo(root: string): string {
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

function getDocumentationSection(root: string): string {
    let section = '';
    // Detect docs/ or documentation/ folder
    const docsFolders = ['docs', 'documentation'].filter(folder => fs.existsSync(path.join(root, folder)));
    docsFolders.forEach(folder => {
        section += `## 📖 Documentation\nSee the [${folder}/](./${folder}) folder for detailed documentation.\n\n`;
        // List markdown files in docs folder
        const docsDir = path.join(root, folder);
        const docFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
        if (docFiles.length) {
            section += '### Key Documents:\n';
            docFiles.forEach(file => {
                section += `- [${file}](./${folder}/${file})\n`;
            });
            section += '\n';
        }
    });

    // Detect Swagger/OpenAPI files
    const swaggerFiles = ['swagger.json', 'swagger.yaml', 'openapi.json', 'openapi.yaml']
        .filter(f => fs.existsSync(path.join(root, f)));
    if (swaggerFiles.length) {
        section += '## 🗂️ API Documentation\n';
        swaggerFiles.forEach(file => {
            section += `- [${file}](./${file}) (Swagger/OpenAPI)\n`;
        });
        section += '\n';
    }

    return section;
}

function getMediaSection(root: string): string {
    let section = '';
    // Screenshots folder
    const screenshotsDir = path.join(root, 'screenshots');
    if (fs.existsSync(screenshotsDir)) {
        const images = fs.readdirSync(screenshotsDir).filter(f =>
            /\.(png|jpg|jpeg|gif)$/i.test(f)
        );
        if (images.length) {
            section += '## 🖼️ Screenshots\n';
            images.forEach(img => {
                section += `![Screenshot](${path.join('screenshots', img).replace(/\\/g, '/')})\n\n`;
            });
        }
    }
    // Demo GIF/Video
    const demoFiles = ['demo.gif', 'demo.mp4', 'demo.webm'].filter(f => fs.existsSync(path.join(root, f)));
    if (demoFiles.length) {
        section += '## 🎬 Demo\n';
        demoFiles.forEach(file => {
            if (file.endsWith('.gif')) {
                section += `![Demo](${file})\n\n`;
            } else {
                section += `<video src="${file}" controls width="600"></video>\n\n`;
            }
        });
    }
    return section;
}

function generateTOCFromSections(sections: (string | undefined)[]): string {
    // Only include section headings (lines starting with ##)
    const toc = sections
        .filter((line): line is string => typeof line === 'string' && line.startsWith('##'))
        .map(line => {
            // TypeScript now knows line is always a string
            const clean = line.replace(/^#+\s*/, '').replace(/\n/g, '').trim();
            const anchor = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            return `- [${clean}](#${anchor})`;
        });
    return ['## 📑 Table of Contents', ...toc].join('\n');
}

// Helper to wrap long lists in <details>
function wrapDetails(title: string, content: string, threshold: number = 10): string {
    const lines = content.split('\n').filter(Boolean);
    if (lines.length > threshold) {
        return `<details><summary>${title}</summary>\n\n${lines.join('\n')}\n\n</details>`;
    }
    return content;
}

// Filter out files/folders in .gitignore for feature detection
function getNonIgnoredFiles(root: string): string[] {
    const gitignorePath = path.join(root, '.gitignore');
    let ignored = new Set<string>();
    if (fs.existsSync(gitignorePath)) {
        ignored = new Set(
            fs.readFileSync(gitignorePath, 'utf8')
                .split('\n')
                .map(l => l.trim())
                .filter(l => l && !l.startsWith('#'))
        );
    }
    return fs.readdirSync(root).filter(f => !ignored.has(f));
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
    const testFrameworkSection = detectTestFrameworks(root, techStack, files);
    const dependencies = getDependencies(root, techStack);
    const mainEntry = getMainEntry(root, techStack, files);
    const runCommand = detectRunCommandFromTechStack(techStack, projectType, files);
    const features = detectFeatures(root);
    const usageExamples = getUsageExamples(root);
    const cliUsage = getCliUsage(root); 
    const i18nSupport = detectInternationalization(root, techStack, files);
    const securityNotes = detectSecurityNotes(root, techStack, files);
    const customSections = getCustomSections(root);
    const deploymentSection = getDeploymentSection(root);
    const monorepoSection = detectMonorepo(root);
    const documentationSection = getDocumentationSection(root);
    const mediaSection = getMediaSection(root);

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

    // Contribution & Community sections
    let contributingSection = '';
    const contributingPath = path.join(root, 'CONTRIBUTING.md');
    if (fs.existsSync(contributingPath)) {
        contributingSection = [
            '## 🤝 Contributing',
            'We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.',
            ''
        ].join('\n');
    }

    let codeOfConductSection = '';
    const codeOfConductPath = path.join(root, 'CODE_OF_CONDUCT.md');
    if (fs.existsSync(codeOfConductPath)) {
        codeOfConductSection = [
            '## 🧑‍💼 Code of Conduct',
            'Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.',
            ''
        ].join('\n');
    }

    const readmeSections = [
        `## 🧠 Project Type`,
        customSections ? '## Custom Sections' : '',
        monorepoSection.trim() ? '## Monorepo Structure' : '',
        documentationSection.trim() ? '## Documentation' : '',
        mediaSection.trim() ? '## Screenshots & Demo' : '',
        `## 📦 Technologies`,
        i18nSupport ? '## 🌐 Internationalization' : '',
        features.length ? '## ✨ Features' : '',
        deploymentSection.trim() ? '## Deployment' : '',
        files.includes(mainEntry) ? '## 📂 Main Entry Point' : '',
        usageExamples.trim() ? '## Usage Examples' : '',
        cliUsage.trim() ? '## CLI Usage' : '',
        `## 📚 Dependencies`,
        securityNotes ? '## 🔒 Security' : '',
        '## ⚙️ Setup',
        '## 🏃 Run',
        testFrameworkSection.trim() ? '## 🧪 Test Frameworks' : '',
        '## 🏗️ Design Principles',
        contributingSection ? '## 🤝 Contributing' : '',
        codeOfConductSection ? '## 🧑‍💼 Code of Conduct' : '',
        includeCodespaces ? '## 💻 Codespaces' : '',
        gitignoreSection ? '## 🚫 Ignored Files & Folders' : '',
        '## 📄 License'
    ];
    const tableOfContents = generateTOCFromSections(readmeSections);

    return [
        `# 🚀 ${projectName}`,
        overview,
        '',
        tableOfContents,
        `## 🧠 Project Type`,
        `> This project appears to be a **${projectType}**`,
        '',
        customSections,
        monorepoSection.trim() ? monorepoSection : '',
        documentationSection.trim() ? documentationSection : '',
        mediaSection.trim() ? mediaSection : '',
        `## 📦 Technologies`,
        techStack.length ? techStack.map(t => `- ${t}`).join('\n') : '- Could not detect tech stack - Manually add technologies here.',
        '',
        i18nSupport ? `## 🌐 Internationalization\n${i18nSupport}\n` : '',
        features.length ? `## ✨ Features\n${features.map(f => `- ${f}`).join('\n')}\n` : '',
        deploymentSection.trim() ? deploymentSection : '',
        files.includes(mainEntry) ? `## 📂 Main Entry Point\n\`${mainEntry}\`\n` : '',
        usageExamples.trim() ? usageExamples : '',
        cliUsage.trim() ? cliUsage : '',
        `## 📚 Dependencies`,
        dependencies.length ? dependencies.map(d => `- ${d}`).join('\n') : '- No dependencies detected.',
        '',
        securityNotes ? `## 🔒 Security\n${securityNotes}\n` : '',
        setupSection,
        `## 🏃 Run`,
        '```bash',
        runCommand,
        '```',
        '',
        testFrameworkSection.trim() ? testFrameworkSection : '',
        '',
        `## 🏗️ Design Principles`,
        designPrinciples.map(p => `- ${p}`).join('\n'),
        '',
        contributingSection,
        codeOfConductSection,
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