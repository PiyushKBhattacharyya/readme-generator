import * as fs from 'fs';
import * as path from 'path';

export function loadGitIgnore(root: string): Set<string> {
    const ignorePath = path.join(root, '.gitignore');
    if (!fs.existsSync(ignorePath)) {
        return new Set();
    }

    const patterns = fs.readFileSync(ignorePath, 'utf8')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

    return new Set(patterns);
}
