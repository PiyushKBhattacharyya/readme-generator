export function generateSmartReadme(
  projectType: string,
  techStack: string[],
  includeCodespaces: boolean
): string {
    const lines: string[] = [];

    lines.push(`# 🚀 Project Title`);
    lines.push(`A brief description of your ${projectType} project.\n`);

    lines.push(`## 🧠 Project Type`);
    lines.push(`> This project appears to be a **${projectType}**\n`);

    lines.push(`## 📦 Technologies`);
    if (techStack.length > 0) {
        for (const tech of techStack) {
            lines.push(`- ${tech}`);
        }
    } else {
        lines.push(`- Could not detect tech stack - Manually add technologies here.`);
    }

    lines.push(`## ⚙️ Setup`);
    lines.push(`\`\`\`bash`);
    lines.push(`git clone <repo-url>`);
    if (projectType.includes('Node')) {
        lines.push(`cd <project-folder>`);
        lines.push(`npm install`);
    } else if (projectType.includes('.NET')) {
        lines.push(`dotnet restore`);
    }
    lines.push(`\`\`\`\n`);

    lines.push(`## 🏃 Run`);
    lines.push(`\`\`\`bash`);
    if (projectType.includes('React')) {
        lines.push(`npm start`);
    } else if (projectType.includes('API')) {
        lines.push(`npm run dev`);
    } else if (projectType.includes('.NET')) {
        lines.push(`dotnet run`);
    } else {
        lines.push(`# Replace this with your run command`);
    }
    lines.push(`\`\`\`\n`);

    if (includeCodespaces) {
        lines.push(`## 💻 Codespaces`);
        lines.push(`This project supports GitHub Codespaces!`);
        lines.push(`- Just open in Codespaces and it will auto-install dependencies.`);
        lines.push(`- Customize devcontainer if needed.\n`);
    }

    lines.push(`## 📄 License`);
    lines.push(`This project is licensed under the MIT License - see the LICENSE file for details.`);

    return lines.join('\n');
}