import * as fs from 'fs';
import * as path from 'path';

export function detectProjectType(root: string): string {
    if (fs.existsSync(path.join(root, 'package.json'))) {
        const content = fs.readFileSync(path.join(root, 'package.json'), 'utf8');
        if (content.includes('"react"')) {return 'React App';}
        if (content.includes('"express"')) {return 'Node.js API';}
        return 'Node.js Project';
    }
    if (fs.existsSync(path.join(root, 'Program.cs')) || fs.existsSync(path.join(root, '*.csproj'))) {
        return 'C# .NET Project';
    }
    if (fs.existsSync(path.join(root, 'main.py'))) {
        return 'Python Script';
    }
    return 'Generic Project';
}