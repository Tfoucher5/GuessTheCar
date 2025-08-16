/* eslint-disable no-undef */
/**
 * Application principale de l'interface d'administration
 * Version 2.0 - Architecture modulaire
 */

class AdminApp {
    constructor() {
        this.initialized = false;
        this.modules = new Map();
        this.refreshInterval = null;
    }

    /**
     * Initialisation de l'application
     */
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

            // Vérifier la disponibilité de l'API
            await this.checkServerConnection();

            // Initialiser les modules de base
            this.initializeCoreModules();

            // Initialiser les modules UI
            this.initializeUIModules();

            // Configurer les gestionnaires d'événements globaux
            this.setupGlobalEventHandlers();

            // Charger l'onglet initial
            const initialTab = this.getInitialTab();
            await window.navigation?.switchTab(initialTab);

            // Démarrer l'auto-refresh
            this.setupAutoRefresh();

            this.initialized = true;
            console.log('✅ Interface d\'administration initialisée avec succès');

            // Notification de bienvenue
            window.notifications?.success('Interface d\'administration chargée', {
                duration: 3000
            });

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Vérifier la connexion au serveur
     */
    async checkServerConnection() {
        try {
            const health = await window.api?.getHealth();
            this.updateServerStatus(health);
            return health;
        } catch (error) {
            this.updateServerStatus({
                status: 'error',
                message: error.message,
                timestamp: new Date().toISOString()
            });
            throw new Error(`Impossible de se connecter au serveur: ${error.message}`);
        }
    }

    /**
     * Initialiser les modules de base
     */
    initializeCoreModules() {
        // Vérifier que les modules de base sont disponibles
        const requiredModules = ['api', 'notifications', 'navigation'];
        const missing = requiredModules.filter(module => !window[module]);

        if (missing.length > 0) {
            throw new Error(`Modules manquants: ${missing.join(', ')}`);
        }

        console.log('✓ Modules de base initialisés');
    }

    /**
     * Initialiser les modules UI avec fallbacks
     */
    initializeUIModules() {
        const uiModules = [
            'dashboardUI',
            'modelsUI',
            'brandsUI',
            'playersUI',
            'gamesUI',
            'systemUI'
        ];

        uiModules.forEach(moduleName => {
            if (!window[moduleName]) {
                console.warn(`Module ${moduleName} non trouvé, création d'un fallback`);
                window[moduleName] = this.createFallbackModule(moduleName);
            }
        });

        console.log('✓ Modules UI initialisés');
    }

    /**
     * Créer un module de fallback simple
     */
    createFallbackModule(moduleName) {
        const title = this.getModuleTitle(moduleName);

        return {
            async render() {
                return `
                    <div class="page-header">
                        <h1 class="h2">Gestion ${title}</h1>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <div class="empty-state text-center py-5">
                                <i class="bi bi-tools display-1 text-muted mb-3"></i>
                                <h5>Module en développement</h5>
                                <p class="text-muted">La gestion ${title.toLowerCase()} sera bientôt disponible.</p>
                                <button class="btn btn-primary" onclick="window.navigation.switchTab('dashboard')">
                                    <i class="bi bi-arrow-left"></i> Retour au tableau de bord
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            },
            init() {
                console.log(`Module fallback ${moduleName} initialisé`);
            }
        };
    }

    /**
     * Obtenir le titre d'un module
     */
    getModuleTitle(moduleName) {
        const titles = {
            dashboardUI: 'du Tableau de bord',
            modelsUI: 'des Modèles',
            brandsUI: 'des Marques',
            playersUI: 'des Joueurs',
            gamesUI: 'des Parties',
            systemUI: 'du Système'
        };
        return titles[moduleName] || 'du Module';
    }

    /**
     * Configurer les gestionnaires d'événements globaux
     */
    setupGlobalEventHandlers() {
        // Gestion des erreurs globales
        window.addEventListener('error', (event) => {
            console.error('Erreur JavaScript globale:', event.error);
            window.notifications?.error('Une erreur inattendue s\'est produite');
        });

        // Gestion des promesses rejetées
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesse rejetée non gérée:', event.reason);
            window.notifications?.error('Erreur de communication');
        });

        // Gestion de la perte de connexion
        window.addEventListener('offline', () => {
            window.notifications?.warning('Connexion internet perdue', {
                persistent: true
            });
        });

        window.addEventListener('online', () => {
            window.notifications?.success('Connexion internet rétablie');
            this.checkServerConnection();
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        console.log('✓ Gestionnaires d\'événements globaux configurés');
    }

    /**
     * Gérer les raccourcis clavier
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + R : Actualiser la page courante
        if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
            event.preventDefault();
            window.navigation?.refreshCurrentTab();
        }

        // Ctrl/Cmd + D : Aller au dashboard
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            window.navigation?.switchTab('dashboard');
        }

        // Échap : Fermer les modales
        if (event.key === 'Escape') {
            const modal = document.querySelector('.modal.show, .modal-backdrop');
            if (modal) {
                this.closeModal();
            }
        }
    }

    /**
     * Obtenir l'onglet initial depuis l'URL ou par défaut
     */
    getInitialTab() {
        const urlParams = window.utils?.url?.getParams();
        const tabFromUrl = urlParams?.get('tab');

        const validTabs = ['dashboard', 'models', 'brands', 'players', 'games', 'system'];

        if (tabFromUrl && validTabs.includes(tabFromUrl)) {
            return tabFromUrl;
        }

        return 'dashboard';
    }

    /**
     * Configurer l'actualisation automatique
     */
    setupAutoRefresh() {
        const refreshInterval = window.Config?.REFRESH_INTERVALS?.DASHBOARD || 30000;

        this.refreshInterval = setInterval(() => {
            // Actualiser seulement si on est sur le dashboard et que la page est visible
            if (window.navigation?.getCurrentTab() === 'dashboard' && !document.hidden) {
                this.refreshDashboard();
            }
        }, refreshInterval);

        // Arrêter l'actualisation quand la page est cachée
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.refreshInterval) {
                clearInterval(this.refreshInterval);
            } else if (!document.hidden) {
                this.setupAutoRefresh();
            }
        });

        console.log('✓ Auto-actualisation configurée');
    }

    /**
     * Actualiser le tableau de bord
     */
    async refreshDashboard() {
        try {
            if (window.dashboardUI && window.dashboardUI.refresh) {
                await window.dashboardUI.refresh();
            }
        } catch (error) {
            console.warn('Erreur lors de l\'actualisation du dashboard:', error);
        }
    }

    /**
     * Mettre à jour l'indicateur de statut serveur
     */
    updateServerStatus(health) {
        const statusElement = document.getElementById('server-status');
        if (!statusElement) return;

        const isHealthy = health.status === 'healthy' || health.status === 'ok';
        const statusText = isHealthy ? 'En ligne' : 'Hors ligne';
        const statusClass = isHealthy ? 'text-success' : 'text-danger';
        const iconClass = isHealthy ? 'bi-wifi' : 'bi-wifi-off';

        statusElement.innerHTML = `
            <i class="bi ${iconClass}"></i>
            <span class="${statusClass}">${statusText}</span>
        `;

        // Tooltip avec plus de détails
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltip = new bootstrap.Tooltip(statusElement, {
                title: `Serveur: ${health.status} | ${health.message || 'OK'}`,
                placement: 'bottom'
            });
        }
    }

    /**
     * Gérer les erreurs d'initialisation
     */
    handleInitializationError(error) {
        // Afficher une erreur critique
        const errorContainer = document.getElementById('main-content') || document.body;

        errorContainer.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">
                        <i class="bi bi-exclamation-triangle"></i>
                        Erreur d'initialisation
                    </h4>
                    <p>L'interface d'administration n'a pas pu se charger correctement.</p>
                    <hr>
                    <p class="mb-0">
                        <strong>Erreur:</strong> ${error.message}
                    </p>
                    <div class="mt-3">
                        <button class="btn btn-outline-danger" onclick="window.location.reload()">
                            <i class="bi bi-arrow-clockwise"></i> Recharger la page
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Log pour debug
        console.error('Détails de l\'erreur d\'initialisation:', error);
    }

    /**
     * Fermer une modale
     */
    closeModal() {
        const modal = document.querySelector('.modal.show');
        if (modal && typeof bootstrap !== 'undefined') {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }

    /**
     * Nettoyage lors de la fermeture
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // Nettoyer les modules
        this.modules.forEach(module => {
            if (module.destroy) {
                module.destroy();
            }
        });

        console.log('🧹 Application nettoyée');
    }

    /**
     * Méthodes utilitaires publiques
     */
    isInitialized() {
        return this.initialized;
    }

    getVersion() {
        return '2.0.0';
    }
}

// Créer l'instance globale de l'application
window.adminApp = new AdminApp();

// Initialiser dès que possible
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminApp.init();
    });
} else {
    window.adminApp.init();
}

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', () => {
    window.adminApp.destroy();
});

// Exposer des utilitaires globaux pour compatibilité
window.utils = window.utils || {};
window.formatDate = window.utils.formatDate;
window.formatNumber = window.utils.formatNumber;
window.truncateText = window.utils.truncateText;
