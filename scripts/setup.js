#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function setup() {
    console.log('🚀 Configuration initiale de Guess The Car Bot...\n');

    try {
        // Créer les dossiers nécessaires
        const directories = [
            'logs',
            'database/migrations',
            'tests/unit',
            'tests/integration',
            'tests/fixtures'
        ];

        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`✅ Dossier créé: ${dir}`);
            } catch (error) {
                if (error.code !== 'EEXIST') {
                    console.error(`❌ Erreur création dossier ${dir}:`, error.message);
                }
            }
        }

        // Vérifier le fichier .env
        try {
            await fs.access('.env');
            console.log('✅ Fichier .env trouvé');
        } catch {
            console.log('⚠️  Fichier .env non trouvé');

            try {
                await fs.copyFile('.env.example', '.env');
                console.log('✅ Fichier .env créé depuis .env.example');
                console.log('📝 Veuillez éditer .env avec vos configurations');
            } catch (error) {
                console.error('❌ Impossible de créer .env:', error.message);
            }
        }

        // Créer un fichier .gitignore s'il n'existe pas
        const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Database
scores.json
*.sqlite
*.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Build outputs
dist/
build/

# Cache
.cache/
.tmp/

# Test outputs
test-results/
`;

        try {
            await fs.access('.gitignore');
            console.log('✅ Fichier .gitignore existe');
        } catch {
            await fs.writeFile('.gitignore', gitignoreContent);
            console.log('✅ Fichier .gitignore créé');
        }

        // Créer un fichier README basique s'il n'existe pas
        const readmeContent = `# Guess The Car Bot v2.0

Un bot Discord pour deviner les marques et modèles de voitures.

## Installation

1. Clonez le repository
2. Installez les dépendances: \`npm install\`
3. Copiez \`.env.example\` vers \`.env\` et configurez vos variables
4. Initialisez la base de données: \`npm run migrate\`
5. Importez les données: \`npm run seed\`
6. Démarrez l'application: \`npm start\`

## Développement

- \`npm run dev\` - Mode développement avec rechargement automatique
- \`npm test\` - Lance les tests
- \`npm run lint\` - Vérifie le code

## Structure du projet

- \`src/api/\` - API REST
- \`src/bot/\` - Bot Discord
- \`src/core/\` - Logique métier
- \`src/shared/\` - Code partagé

## Commands Discord

- \`/guesscar\` - Démarre une partie
- \`/abandon\` - Abandonne la partie
- \`/classement\` - Affiche le classement  
- \`/stats\` - Affiche les statistiques
- \`/aide\` - Affiche l'aide
`;

        try {
            await fs.access('README.md');
            console.log('✅ Fichier README.md existe');
        } catch {
            await fs.writeFile('README.md', readmeContent);
            console.log('✅ Fichier README.md créé');
        }

        console.log('\n🎉 Configuration terminée!');
        console.log('\n📋 Prochaines étapes:');
        console.log('1. Éditez le fichier .env avec vos configurations');
        console.log('2. Initialisez la base de données: npm run migrate');
        console.log('3. Importez les données: npm run seed');
        console.log('4. Démarrez l\'application: npm start');

    } catch (error) {
        console.error('❌ Erreur durant la configuration:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    setup();
}

module.exports = setup;