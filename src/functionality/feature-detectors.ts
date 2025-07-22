import * as fs from 'fs';
import * as path from 'path';

export function detectTestFrameworks(root: string, techStack: string[], files: string[]): string {
    const frameworks: string[] = [];
    const coverageTools: string[] = [];
    const testLibs = [
        { key: 'jest', label: 'Jest' },
        { key: 'mocha', label: 'Mocha' },
        { key: 'chai', label: 'Chai' },
        { key: 'ava', label: 'AVA' },
        { key: 'vitest', label: 'Vitest' },
        { key: 'pytest', label: 'Pytest' },
        { key: 'unittest', label: 'Python unittest' },
        { key: 'nose', label: 'Nose' },
        { key: 'tap', label: 'TAP' }
    ];
    const coverageLibs = [
        { key: 'nyc', label: 'nyc (Istanbul)' },
        { key: 'coverage', label: 'coverage.py' },
        { key: 'c8', label: 'c8' },
        { key: 'codecov', label: 'Codecov' },
        { key: 'coveralls', label: 'Coveralls' }
    ];

    // Check package.json dependencies
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        for (const lib of testLibs) {
            if (allDeps && allDeps[lib.key]) {frameworks.push(lib.label);}
        }
        for (const cov of coverageLibs) {
            if (allDeps && allDeps[cov.key]) {coverageTools.push(cov.label);}
        }
    }
    // Python requirements.txt
    if (fs.existsSync(path.join(root, 'requirements.txt'))) {
        const reqs = fs.readFileSync(path.join(root, 'requirements.txt'), 'utf8').toLowerCase();
        for (const lib of testLibs) {
            if (reqs.includes(lib.key)) {frameworks.push(lib.label);}
        }
        for (const cov of coverageLibs) {
            if (reqs.includes(cov.key)) {coverageTools.push(cov.label);}
        }
    }
    // Check for config files
    if (fs.existsSync(path.join(root, 'jest.config.js'))) {frameworks.push('Jest');}
    if (fs.existsSync(path.join(root, 'mocha.opts'))) {frameworks.push('Mocha');}
    if (fs.existsSync(path.join(root, 'pytest.ini'))) {frameworks.push('Pytest');}
    if (fs.existsSync(path.join(root, '.coveragerc'))) {coverageTools.push('coverage.py');}

    let section = '';
    if (frameworks.length) {
        section += `## 🧪 Test Frameworks\nDetected: ${frameworks.join(', ')}\n\n`;
    }
    if (coverageTools.length) {
        section += `## 📊 Coverage\nDetected: ${coverageTools.join(', ')}\n`;
        // Add badge for Codecov or Coveralls if detected
        if (coverageTools.includes('Codecov')) {
            section += `![Codecov](https://codecov.io/gh/<your-repo>/branch/main/graph/badge.svg)\n`;
        }
        if (coverageTools.includes('Coveralls')) {
            section += `![Coveralls](https://coveralls.io/repos/github/<your-repo>/badge.svg?branch=main)\n`;
        }
    }
    return section;
}

export function detectFeatures(root: string): string[] {
    const features: string[] = [];
    const keywords = [
        { key: 'auth', label: 'Authentication' },
        { key: 'login', label: 'Login System' },
        { key: 'register', label: 'Registration' },
        { key: 'api', label: 'API Endpoints' },
        { key: 'database', label: 'Database Integration' },
        { key: 'graphql', label: 'GraphQL Support' },
        { key: 'websocket', label: 'WebSocket Support' },
        { key: 'cache', label: 'Caching' },
        { key: 'test', label: 'Testing' },
        { key: 'i18n', label: 'Internationalization' },
        { key: 'docker', label: 'Docker Support' },
        { key: 'ci', label: 'CI/CD Integration' }
    ];

    function scanFile(filePath: string) {
        try {
            const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
            for (const { key, label } of keywords) {
                const regex = new RegExp(`\\b${key}\\b`, 'i');
                if (regex.test(content) && !features.includes(label)) {
                    features.push(label);
                }
            }
        } catch { /* ignore errors */ }
    }

    // Only scan non-ignored files at root
    const filesToScan = getNonIgnoredFiles(root)
    .filter(f => !['package', 'requirements'].includes(f))
        .filter(f => f.endsWith('.md'));

    filesToScan.forEach(f => scanFile(path.join(root, f)));

    return features;
}

export function detectInternationalization(root: string, techStack: string[], files: string[]): string {
    // Check for locales/ folder
    if (fs.existsSync(path.join(root, 'locales')) || fs.existsSync(path.join(root, 'locale'))) {
        return 'This project supports internationalization (i18n) via a locales folder.';
    }
    // Check for common i18n libraries in tech stack or dependencies
    const i18nLibs = ['i18next', 'react-intl', 'vue-i18n', 'next-i18next', 'formatjs', 'gettext', 'polyglot', 'lingui'];
    if (techStack.some(t => i18nLibs.includes(t)) || files.some(f => i18nLibs.some(lib => f.includes(lib)))) {
        return 'Internationalization (i18n) support detected via libraries.';
    }
    // Check package.json dependencies
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies) {
            for (const lib of i18nLibs) {
                if (pkg.dependencies[lib]) {
                    return `Internationalization (i18n) support detected via ${lib}.`;
                }
            }
        }
    }
    return '';
}

export function detectSecurityNotes(root: string, techStack: string[], files: string[]): string {
    // Check for .env file
    if (fs.existsSync(path.join(root, '.env'))){
        return 'Sensitive configuration detected in `.env` file. **Do not commit secrets to version control.**';
    }
    // Check for secrets/ folder
    if (fs.existsSync(path.join(root, 'secrets'))){
        return 'This project uses a `secrets/` folder. Store sensitive files securely and do not commit them.';
    }
    // Check for common security-related dependencies
    const securityLibs = [
        'helmet', 'cors', 'jsonwebtoken', 'bcrypt', 'argon2', 'passport', 'express-rate-limit',
        'dotenv', 'secure', 'pyjwt', 'cryptography', 'python-dotenv'
    ];
    const pkgPath = path.join(root, 'package.json');
    if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.dependencies) {
            for (const lib of securityLibs) {
                if (pkg.dependencies[lib]) {
                    return `Security library detected: **${lib}**. Follow best practices for authentication and data protection.`;
                }
            }
        }
    }
    return '';
}

function getNonIgnoredFiles(root: string): string[] {
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