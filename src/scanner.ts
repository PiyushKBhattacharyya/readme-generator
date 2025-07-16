import * as fs from 'fs';
import * as path from 'path';

export function scanDirectory(dirPath: string): any[] {
    const result: any[] = [];

    const walk = (currentPath: string, depth: number = 0) => {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(dirPath, fullPath);
            const isDir = entry.isDirectory();

            result.push({
                name: entry.name,
                path: relativePath,
                isDirectory: isDir,
                depth,
            });

            if (isDir) walk(fullPath, depth + 1);
        }
    };

    walk(dirPath);
    return result;
}