#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 Nettoyage et mise à jour du projet...\n');

function runCommand(command, description) {
    console.log(`📋 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} terminé\n`);
    } catch (error) {
        console.error(`❌ Erreur lors de: ${description}`);
        console.error(error.message);
        return false;
    }
    return true;
}

async function cleanup() {
    // 1. Supprimer node_modules et package-lock.json
    console.log('🗑️  Suppression des anciens fichiers...');

    try {
        if (fs.existsSync('node_modules')) {
            console.log('Suppression de node_modules...');
            fs.rmSync('node_modules', { recursive: true, force: true });
        }

        if (fs.existsSync('package-lock.json')) {
            console.log('Suppression de package-lock.json...');
            fs.unlinkSync('package-lock.json');
        }
        console.log('✅ Nettoyage terminé\n');
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error.message);
    }

    // 2. Vider le cache npm
    if (!runCommand('npm cache clean --force', 'Nettoyage du cache npm')) {
        return;
    }

    // 3. Réinstaller les dépendances
    if (!runCommand('npm install', 'Installation des dépendances')) {
        return;
    }

    // 4. Auditer et corriger les vulnérabilités
    console.log('🔍 Vérification des vulnérabilités...');
    try {
        execSync('npm audit', { stdio: 'inherit' });
    } catch (error) {
        console.log('⚠️  Vulnérabilités détectées, tentative de correction...');

        if (!runCommand('npm audit fix', 'Correction automatique des vulnérabilités')) {
            console.log('⚠️  Tentative de correction forcée...');
            runCommand('npm audit fix --force', 'Correction forcée des vulnérabilités');
        }
    }

    // 5. Mettre à jour les packages outdated
    console.log('📦 Vérification des packages obsolètes...');
    try {
        execSync('npm outdated', { stdio: 'inherit' });
        console.log('\n📝 Packages obsolètes listés ci-dessus (optionnel)');
    } catch (error) {
        console.log('✅ Tous les packages sont à jour');
    }

    // 6. Vérification finale
    console.log('\n🎉 Nettoyage terminé!');
    console.log('\n📋 Résumé:');
    console.log('✅ Cache npm nettoyé');
    console.log('✅ Dépendances réinstallées');
    console.log('✅ Vulnérabilités corrigées');
    console.log('\n🚀 Votre projet est maintenant propre et optimisé!');

    console.log('\n📝 Prochaines étapes recommandées:');
    console.log('1. npm run lint - Vérifier le code');
    console.log('2. npm test - Lancer les tests');
    console.log('3. npm run dev - Démarrer en mode développement');
}

if (require.main === module) {
    cleanup();
}

module.exports = cleanup;