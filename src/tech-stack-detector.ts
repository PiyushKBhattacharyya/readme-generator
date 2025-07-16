import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, allFiles: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
            walk(fullPath, allFiles);
        } else {
            allFiles.push(fullPath);
        }
    }
    return allFiles;
}

export function detectTechStack(root: string): string[] {
    const stack = new Set<string>();
    const tryReadFile = (filename: string): string => {
        try {
            return fs.readFileSync(path.join(root, filename), 'utf8');
        } catch {
            return '';
        }
    };

    const allFiles = walk(root);

    // Language detection from file extensions
    if (allFiles.some(f => f.endsWith('.ts'))) {stack.add('TypeScript');}
    if (allFiles.some(f => f.endsWith('.js'))) {stack.add('JavaScript');}
    if (allFiles.some(f => f.endsWith('.py'))) {stack.add('Python');}
    if (allFiles.some(f => f.endsWith('.cs'))) {stack.add('C# (.NET)');}
    if (allFiles.some(f => f.endsWith('.java'))) {stack.add('Java');}

    // Frameworks from package.json
    const pkg = tryReadFile('package.json');
    if (pkg.includes('"react"')) {stack.add('React');}
    if (pkg.includes('"vite"')) {stack.add('Vite');}
    if (pkg.includes('"next"')) {stack.add('Next.js');}
    if (pkg.includes('"express"')) {stack.add('Express.js');}
    if (pkg.includes('"nestjs"')) {stack.add('NestJS');}
    if (pkg.includes('"typescript"')) {stack.add('TypeScript');}
    if (pkg.includes('"angular"') || allFiles.some(f => f.endsWith('angular.json'))) {stack.add('Angular');}
    if (pkg.includes('"vue"') || allFiles.some(f => f.endsWith('vue.config.js'))) {stack.add('Vue.js');}
    if (pkg.includes('"svelte"') || allFiles.some(f => f.endsWith('svelte.config.js'))) {stack.add('Svelte');}
    if (pkg.includes('"electron"') || allFiles.some(f => f.endsWith('electron.js') || f.endsWith('main.js'))) {stack.add('Electron');}
    if (pkg.includes('"storybook"')) {stack.add('Storybook');}
    if (pkg.includes('"graphql"')) {stack.add('GraphQL');}
    if (pkg.includes('"mongodb"')) {stack.add('MongoDB');}
    if (pkg.includes('"sequelize"') || pkg.includes('"typeorm"')) {stack.add('ORM');}
    if (pkg.includes('"jest"') || pkg.includes('"mocha"')) {stack.add('Testing Framework');}
    if (pkg.includes('"eslint"')) {stack.add('ESLint');}
    if (pkg.includes('"prettier"')) {stack.add('Prettier');}
    if (pkg.includes('"webpack"')) {stack.add('Webpack');}
    if (pkg.includes('"gulp"')) {stack.add('Gulp');}
    if (pkg.includes('"babel"')) {stack.add('Babel');}
    if (pkg.includes('"socket.io"')) {stack.add('WebSockets');}
    if (pkg.includes('"passport"')) {stack.add('Authentication');}
    if (pkg.includes('"dotenv"')) {stack.add('Environment Variables');}

    // Python frameworks
    const reqs = tryReadFile('requirements.txt');
    if (reqs.includes('flask')) {stack.add('Flask');}
    if (reqs.includes('django')) {stack.add('Django');}

    // .NET specific
    if (allFiles.some(f => f.endsWith('.csproj'))) {stack.add('.NET Core');}

    return Array.from(stack);
}