import * as fs from 'fs';
import * as path from 'path';

export function wrapDetails(title: string, content: string, threshold: number = 10): string {
    const lines = content.split('\n').filter(Boolean);
    if (lines.length > threshold) {
        return `<details><summary>${title}</summary>\n\n${lines.join('\n')}\n\n</details>`;
    }
    return content;
}

export function getNonIgnoredFiles(root: string): string[] {
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