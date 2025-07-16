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

    // Python frameworks
    const reqs = tryReadFile('requirements.txt');
    if (reqs.includes('flask')) {stack.add('Flask');}
    if (reqs.includes('django')) {stack.add('Django');}

    // .NET specific
    if (allFiles.some(f => f.endsWith('.csproj'))) {stack.add('.NET Core');}

    return Array.from(stack);
}