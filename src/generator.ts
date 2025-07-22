import * as fs from 'fs';
import * as path from 'path';
import { detectTestFrameworks, detectFeatures, detectInternationalization, detectSecurityNotes } from './functionality/feature-detectors';
import { getOverview, getDependencies, getSetupSection, getMainEntry, getUsageExamples, getCliUsage, getCustomSections, getDeploymentSection, getDocumentationSection, getMediaSection, generateTOCFromSections } from './functionality/section-generators';
import { detectProjectType, detectMonorepo } from './functionality/project-type';
import { getDesignPrinciples } from './functionality/design-principles';
import { detectRunCommandFromTechStack } from './functionality/run-command';

export function generateSmartReadme(
    projectName: string,
    _projectType: string, // Remove this param, use detected type
    techStack: string[],
    includeCodespaces: boolean,
    root: string
): string {
    const files = fs.readdirSync(root);
    const projectType = detectProjectType(files, root);
    const overview = getOverview(root);
    const designPrinciples = getDesignPrinciples(techStack, files);
    const testFrameworkSection = detectTestFrameworks(root, techStack, files);
    const dependencies = getDependencies(root, techStack);
    const mainEntry = getMainEntry(root, techStack, files);
    const runCommand = detectRunCommandFromTechStack(techStack, projectType, files);
    const features = detectFeatures(root);
    const usageExamples = getUsageExamples(root);
    const cliUsage = getCliUsage(root); 
    const i18nSupport = detectInternationalization(root, techStack, files);
    const securityNotes = detectSecurityNotes(root, techStack, files);
    const customSections = getCustomSections(root);
    const deploymentSection = getDeploymentSection(root);
    const monorepoSection = detectMonorepo(root);
    const documentationSection = getDocumentationSection(root);
    const mediaSection = getMediaSection(root);

    // .gitignore section
    const gitignorePath = path.join(root, '.gitignore');
    let gitignoreSection = '';
    if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf8')
            .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
        if (gitignore.length) {
            gitignoreSection = `## 🚫 Ignored Files & Folders\nThese files/folders are excluded from version control:\n${gitignore.map(i => `- \`${i}\``).join('\n')}\n`;
        }
    }

    // Improved setup section
    const setupSection = [
        '## ⚙️ Setup',
        '```bash',
        ...getSetupSection(techStack, dependencies, root),
        '```',
        '',
    ].join('\n');

    // Contribution & Community sections
    let contributingSection = '';
    const contributingPath = path.join(root, 'CONTRIBUTING.md');
    if (fs.existsSync(contributingPath)) {
        contributingSection = [
            '## 🤝 Contributing',
            'We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.',
            ''
        ].join('\n');
    }

    let codeOfConductSection = '';
    const codeOfConductPath = path.join(root, 'CODE_OF_CONDUCT.md');
    if (fs.existsSync(codeOfConductPath)) {
        codeOfConductSection = [
            '## 🧑‍💼 Code of Conduct',
            'Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.',
            ''
        ].join('\n');
    }

    const readmeSections = [
        `## 🧠 Project Type`,
        customSections ? '## Custom Sections' : '',
        monorepoSection.trim() ? '## Monorepo Structure' : '',
        documentationSection.trim() ? '## Documentation' : '',
        mediaSection.trim() ? '## Screenshots & Demo' : '',
        `## 📦 Technologies`,
        i18nSupport ? '## 🌐 Internationalization' : '',
        features.length ? '## ✨ Features' : '',
        deploymentSection.trim() ? '## Deployment' : '',
        files.includes(mainEntry) ? '## 📂 Main Entry Point' : '',
        usageExamples.trim() ? '## Usage Examples' : '',
        cliUsage.trim() ? '## CLI Usage' : '',
        `## 📚 Dependencies`,
        securityNotes ? '## 🔒 Security' : '',
        '## ⚙️ Setup',
        '## 🏃 Run',
        testFrameworkSection.trim() ? '## 🧪 Test Frameworks' : '',
        '## 🏗️ Design Principles',
        contributingSection ? '## 🤝 Contributing' : '',
        codeOfConductSection ? '## 🧑‍💼 Code of Conduct' : '',
        includeCodespaces ? '## 💻 Codespaces' : '',
        gitignoreSection ? '## 🚫 Ignored Files & Folders' : '',
        '## 📄 License'
    ];
    const tableOfContents = generateTOCFromSections(readmeSections);

    return [
        `# 🚀 ${projectName}`,
        overview,
        '',
        tableOfContents,
        `## 🧠 Project Type`,
        `> This project appears to be a **${projectType}**`,
        '',
        customSections,
        monorepoSection.trim() ? monorepoSection : '',
        documentationSection.trim() ? documentationSection : '',
        mediaSection.trim() ? mediaSection : '',
        `## 📦 Technologies`,
        techStack.length ? techStack.map(t => `- ${t}`).join('\n') : '- Could not detect tech stack - Manually add technologies here.',
        '',
        i18nSupport ? `## 🌐 Internationalization\n${i18nSupport}\n` : '',
        features.length ? `## ✨ Features\n${features.map(f => `- ${f}`).join('\n')}\n` : '',
        deploymentSection.trim() ? deploymentSection : '',
        files.includes(mainEntry) ? `## 📂 Main Entry Point\n\`${mainEntry}\`\n` : '',
        usageExamples.trim() ? usageExamples : '',
        cliUsage.trim() ? cliUsage : '',
        `## 📚 Dependencies`,
        dependencies.length ? dependencies.map(d => `- ${d}`).join('\n') : '- No dependencies detected.',
        '',
        securityNotes ? `## 🔒 Security\n${securityNotes}\n` : '',
        setupSection,
        `## 🏃 Run`,
        '```bash',
        runCommand,
        '```',
        '',
        testFrameworkSection.trim() ? testFrameworkSection : '',
        '',
        `## 🏗️ Design Principles`,
        designPrinciples.map(p => `- ${p}`).join('\n'),
        '',
        contributingSection,
        codeOfConductSection,
        includeCodespaces ? [
            `## 💻 Codespaces`,
            `This project supports GitHub Codespaces!`,
            `- Just open in Codespaces and it will auto-install dependencies.`,
            `- Customize devcontainer if needed.`,
            ''
        ].join('\n') : '',
        gitignoreSection,
        `## 📄 License`,
        `This project is licensed under the MIT License - see the LICENSE file for details.`
    ].filter(Boolean).join('\n');
}