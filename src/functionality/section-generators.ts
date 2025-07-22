import * as fs from 'fs';
import * as path from 'path';

export function getOverview(root: string): string {
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

export function getDependencies(root: string, techStack: string[]): string[] {
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

export function getSetupSection(techStack: string[], dependencies: string[], root: string): string[] {
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

export function getMainEntry(root: string, techStack: string[], files: string[]): string {
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

export function getUsageExamples(root: string): string {
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
                examplesSection += `### ${file}\n\n${content.substring(0, 500)}\n\n`;
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

export function getCliUsage(root: string): string {
    const pkgPath = path.join(root, 'package.json');
    if (!fs.existsSync(pkgPath)) {return '';}
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.bin) {return '';}
    let usageSection = '## 💻 CLI Usage\n';
    if (typeof pkg.bin === 'string') {
        usageSection += `\n\nbash\nnpx ${path.basename(pkg.bin)} [options]\n\n`;
    } else if (typeof pkg.bin === 'object') {
        Object.keys(pkg.bin).forEach(cmd => {
            usageSection += `\n\nbash\nnpx ${cmd} [options]\n\n`;
        });
    }
    return usageSection;
}

export function getCustomSections(root: string): string {
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

export function getDeploymentSection(root: string): string {
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

export function getDocumentationSection(root: string): string {
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

export function getMediaSection(root: string): string {
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

export function generateTOCFromSections(sections: (string | undefined)[]): string {
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