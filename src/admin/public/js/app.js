/* eslint-disable no-undef */
// Application principale
class AdminApp {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            console.log('🚀 Initialisation de l\'interface d\'administration...');

            // Attendre que le DOM soit prêt
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialiser les modules UI restants
            this.initializeRemainingModules();

            // Charger le tableau de bord par défaut
            await window.navigation.loadTabContent('dashboard');

            // Configuration des rafraîchissements automatiques
            this.setupAutoRefresh();

            // Gestion des erreurs globales
            this.setupErrorHandlers();

            this.initialized = true;
            console.log('✅ Interface d\'administration initialisée');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            window.notifications?.error('Erreur lors de l\'initialisation de l\'interface');
        }
    }

    initializeRemainingModules() {
        // Créer les modules UI manquants (versions simplifiées)
        if (!window.brandsUI) {
            window.brandsUI = this.createSimpleUIModule('brands', 'Marques');
        }
        if (!window.playersUI) {
            window.playersUI = this.createSimpleUIModule('players', 'Joueurs');
        }
        if (!window.gamesUI) {
            window.gamesUI = this.createSimpleUIModule('games', 'Parties');
        }
        if (!window.systemUI) {
            window.systemUI = this.createSystemUI();
        }
    }

    createSimpleUIModule(type, title) {
        return {
            async render() {
                const mainContent = document.getElementById('main-content');
                mainContent.innerHTML = `
                    <div class="page-header">
                        <h1 class="h2">Gestion des ${title}</h1>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="empty-state">
                                <i class="bi bi-tools"></i>
                                <h5>Module en développement</h5>
                                <p>La gestion des ${title.toLowerCase()} sera bientôt disponible.</p>
                                <button class="btn btn-primary" onclick="window.navigation.switchTab('dashboard')">
                                    Retour au tableau de bord
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        };
    }

    createSystemUI() {
        return {
            async render() {
                const mainContent = document.getElementById('main-content');

                mainContent.innerHTML = `
                    <div class="page-header d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
                        <h1 class="h2">Informations système</h1>
                        <button class="btn btn-outline-primary" onclick="window.systemUI.refresh()">
                            <i class="bi bi-arrow-clockwise"></i> Actualiser
                        </button>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5>Serveur</h5>
                                </div>
                                <div class="card-body">
                                    <table class="table table-sm">
                                        <tr>
                                            <td>Node.js</td>
                                            <td id="node-version">-</td>
                                        </tr>
                                        <tr>
                                            <td>Plateforme</td>
                                            <td id="platform">-</td>
                                        </tr>
                                        <tr>
                                            <td>Architecture</td>
                                            <td id="arch">-</td>
                                        </tr>
                                        <tr>
                                            <td>Temps de fonctionnement</td>
                                            <td id="uptime">-</td>
                                        </tr>
                                        <tr>
                                            <td>Environnement</td>
                                            <td id="env">-</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h5>Base de données</h5>
                                </div>
                                <div class="card-body">
                                    <table class="table table-sm">
                                        <tr>
                                            <td>Statut</td>
                                            <td><span class="status-online">● Connecté</span></td>
                                        </tr>
                                        <tr>
                                            <td>Hôte</td>
                                            <td id="db-host">-</td>
                                        </tr>
                                        <tr>
                                            <td>Base</td>
                                            <td id="db-name">-</td>
                                        </tr>
                                        <tr>
                                            <td>Marques</td>
                                            <td id="db-brands">-</td>
                                        </tr>
                                        <tr>
                                            <td>Modèles</td>
                                            <td id="db-models">-</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                await this.loadSystemInfo();
            },

            async loadSystemInfo() {
                try {
                    const [systemInfo, dbStats] = await Promise.all([
                        window.api.get('/admin/system/info').catch(() => ({ success: false })),
                        window.api.get('/admin/system/stats')
                    ]);

                    if (systemInfo.success) {
                        const server = systemInfo.data.server || {};
                        const database = systemInfo.data.database || {};

                        document.getElementById('node-version').textContent = server.nodeVersion || 'N/A';
                        document.getElementById('platform').textContent = server.platform || 'N/A';
                        document.getElementById('arch').textContent = server.arch || 'N/A';
                        document.getElementById('uptime').textContent = server.uptime ?
                            this.formatDuration(server.uptime) : 'N/A';
                        document.getElementById('env').textContent = server.env || 'N/A';
                        document.getElementById('db-host').textContent = database.host || 'N/A';
                        document.getElementById('db-name').textContent = database.name || 'N/A';
                    }

                    if (dbStats.success) {
                        document.getElementById('db-brands').textContent = dbStats.data.brands || '0';
                        document.getElementById('db-models').textContent = dbStats.data.models || '0';
                    }
                } catch (error) {
                    console.error('Error loading system info:', error);
                    window.notifications.error('Erreur lors du chargement des informations système');
                }
            },

            formatDuration(seconds) {
                if (seconds < 60) {
                    return `${Math.round(seconds)}s`;
                } else if (seconds < 3600) {
                    const minutes = Math.floor(seconds / 60);
                    const remainingSeconds = Math.round(seconds % 60);
                    return `${minutes}m ${remainingSeconds}s`;
                } else {
                    const hours = Math.floor(seconds / 3600);
                    const minutes = Math.floor((seconds % 3600) / 60);
                    return `${hours}h ${minutes}m`;
                }
            },

            async refresh() {
                await this.loadSystemInfo();
                window.notifications.info('Informations système actualisées');
            }
        };
    }

    setupAutoRefresh() {
        // Rafraîchissement automatique du tableau de bord
        setInterval(() => {
            if (window.navigation.getCurrentTab() === 'dashboard') {
                window.dashboardUI.refresh();
            }
        }, window.Config.REFRESH_INTERVALS.DASHBOARD);
    }

    setupErrorHandlers() {
        // Gestion des erreurs non capturées
        window.addEventListener('error', (e) => {
            console.error('Erreur non capturée:', e.error);
            window.notifications?.error('Une erreur inattendue s\'est produite');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesse rejetée non gérée:', e.reason);
            window.notifications?.error('Erreur de communication avec le serveur');
        });
    }

    // Méthodes utilitaires globales
    static formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static formatNumber(number) {
        if (typeof number !== 'number') return '0';
        return number.toLocaleString('fr-FR');
    }

    static truncateText(text, length = 50) {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
}

// Initialiser l'application
const app = new AdminApp();

// Fonction d'initialisation globale
window.addEventListener('load', () => {
    app.init().catch(error => {
        console.error('Erreur fatale lors de l\'initialisation:', error);
    });
});

// Exposer l'application pour debug
window.adminApp = app;

// Utilitaires globaux
window.utils = {
    formatDate: AdminApp.formatDate,
    formatNumber: AdminApp.formatNumber,
    truncateText: AdminApp.truncateText
};
