import { getMainEntry } from './section-generators';

export function detectRunCommandFromTechStack(techStack: string[], projectType: string, files: string[]): string {
    if (projectType === 'VS Code Extension') {return 'Run via VS Code (F5 or Extension Host)';}
    if (projectType === 'Web Application') {return 'Open app.html or index.html in your browser';}
    if (projectType === 'Command Line Tool') {return `node ${getMainEntry('', techStack, files)}`;}
    // Existing logic for frameworks
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