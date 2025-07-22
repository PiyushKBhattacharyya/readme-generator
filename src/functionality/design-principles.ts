// Design principles function moved from generator.ts

export function getDesignPrinciples(techStack: string[], files: string[]): string[] {
    const principles: string[] = [];
    if (techStack.includes('React')) {principles.push('Component-based architecture');}
    if (techStack.includes('Express.js')) {principles.push('RESTful API design');}
    if (techStack.includes('TypeScript')) {principles.push('Type safety and maintainability');}
    if (files.some(f => f.includes('test'))) {principles.push('Test-driven development');}
    if (files.some(f => f.includes('src'))) {principles.push('Separation of concerns');}
    return principles.length ? principles : ['Add your design principles here.'];
} 