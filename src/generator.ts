import * as fs from 'fs';
import * as path from 'path';

export function generateSmartReadme(
  projectName: string,
  projectType: string,
  techStack: string[],
  includeCodespaces: boolean,
  root: string
): string {
  const lines: string[] = [];

  // Determine run command from tech stack only
  const runCommand = detectRunCommandFromTechStack(techStack);

  lines.push(`# 🚀 ${projectName}`);
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

  lines.push(`\n## ⚙️ Setup`);
  lines.push(`\`\`\`bash`);
  lines.push(`git clone <repo-url>`);
  if (
    techStack.includes('Node.js') ||
    techStack.includes('TypeScript') ||
    techStack.includes('React') ||
    techStack.includes('Express.js') ||
    techStack.includes('Next.js') ||
    techStack.includes('NestJS') ||
    techStack.includes('Vite')
  ) {
    lines.push(`cd <project-folder>`);
    lines.push(`npm install`);
  } else if (techStack.includes('.NET Core') || techStack.includes('C# (.NET)')) {
    lines.push(`dotnet restore`);
  } else if (techStack.includes('Python')) {
    lines.push(`pip install -r requirements.txt`);
  }
  lines.push(`\`\`\`\n`);

  lines.push(`## 🏃 Run`);
  lines.push(`\`\`\`bash`);
  lines.push(runCommand);
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

// Only use techStack[] to guess the run command
function detectRunCommandFromTechStack(techStack: string[]): string {
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