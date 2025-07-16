export function generateMarkdown(data: any[]): string {
    const lines: string[] = ['# 📁 Project Structure'];

    for (const item of data) {
        const indent = '  '.repeat(item.depth);
        const icon = item.isDirectory ? '📂' : '📄';
        lines.push(`${indent}- ${icon} \`${item.path}\``);
    }

    lines.push('\n---\n');
    lines.push('> This README was generated automatically using the VS Code Extension.');

    return lines.join('\n');
}