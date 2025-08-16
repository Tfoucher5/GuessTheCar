/* eslint-disable no-undef */
/**
 * Application principale de l'interface d'administration
 */

class AdminApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.modules = new Map();
        this.refreshInterval = null;
        this.isInitialized = false;
    }

    /**
     * Initialisation de l'application
     */
    async init() {
        try {
            console.log('🚀 Initialisation de l\'interface d\'administration...');

            // Vérifier la disponibilité de l'API
            await this.checkServerStatus();

            // Initialiser les modules
            this.initializeModules();

            // Configurer les événements
            this.setupEventListeners();

            // Charger l'onglet par défaut
            const urlParams = window.utils.getURLParams();
            const initialTab = urlParams.get('tab') || 'dashboard';
            await this.showTab(initialTab);

            // Démarrer l'auto-refresh
            this.startAutoRefresh();

            this.isInitialized = true;
            console.log('✅ Interface d\'administration initialisée');

        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showInitializationError(error);
        }
    }

    /**
     * Vérification du statut du serveur
     */
    async checkServerStatus() {
        try {
            const health = await window.api.getHealth();
            this.updateServerStatus(health);
            return health;
        } catch (error) {
            this.updateServerStatus({ status: 'error', message: error.message });
            throw error;
        }
    }

    /**
     * Mise à jour de l'indicateur de statut serveur
     */
    updateServerStatus(health) {
        const statusElement = document.getElementById('server-status');
        if (!statusElement) return;

        const isHealthy = health.status === 'healthy';
        const statusClass = isHealthy ? 'status-online' : 'status-offline';
        const statusText = isHealthy ? 'En ligne' : 'Problème';
        const iconClass = isHealthy ? 'bg-green-500' : 'bg-red-500';

        statusElement.className = `flex items-center px-3 py-2 rounded-full text-sm ${statusClass}`;
        statusElement.innerHTML = `
            <div class="w-2 h-2 ${iconClass} rounded-full mr-2 ${!isHealthy ? 'animate-pulse' : ''}"></div>
            <span>${statusText}</span>
        `;

        // Mettre à jour les compteurs dans la sidebar
        if (health.stats) {
            this.updateSidebarCounts(health.stats);
        }
    }

    /**
     * Mise à jour des compteurs dans la sidebar
     */
    updateSidebarCounts(stats) {
        const updates = {
            'brands-count': stats.totalBrands || 0,
            'models-count': stats.totalModels || 0,
            'players-count': stats.totalPlayers || 0,
            'games-count': stats.totalGames || 0
        };

        Object.entries(updates).forEach(([id, count]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = window.utils.formatNumber(count);
            }
        });
    }

    /**
     * Initialisation des modules
     */
    initializeModules() {
        // Enregistrer les modules disponibles
        const availableModules = [
            'dashboard', 'brands', 'models', 'players',
            'games', 'analytics', 'maintenance', 'logs'
        ];

        availableModules.forEach(moduleName => {
            if (window[moduleName] && typeof window[moduleName].init === 'function') {
                this.modules.set(moduleName, window[moduleName]);
                console.log(`📦 Module ${moduleName} enregistré`);
            }
        });
    }

    /**
     * Configuration des événements globaux
     */
    setupEventListeners() {
        // Gestion des erreurs globales
        window.addEventListener('error', (event) => {
            console.error('Erreur globale:', event.error);
            if (window.notifications) {
                window.notifications.error('Une erreur inattendue s\'est produite');
            }
        });

        // Gestion des erreurs de promesses
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promesse rejetée:', event.reason);
            if (window.notifications) {
                window.notifications.error('Erreur de traitement des données');
            }
        });

        // Gestion du changement de visibilité (pour pause/resume auto-refresh)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoRefresh();
            } else {
                this.resumeAutoRefresh();
            }
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                case 'r':
                    event.preventDefault();
                    this.refreshAll();
                    break;
                case 'h':
                    event.preventDefault();
                    this.showTab('dashboard');
                    break;
                }
            }
        });

        // Clic sur les liens de navigation
        document.addEventListener('click', (event) => {
            const navItem = event.target.closest('[data-tab]');
            if (navItem) {
                event.preventDefault();
                const tab = navItem.dataset.tab;
                this.showTab(tab);
            }
        });
    }

    /**
     * Affichage d'un onglet
     */
    async showTab(tabName) {
        try {
            // Vérifier que le module existe
            if (!this.modules.has(tabName)) {
                throw new Error(`Module ${tabName} non trouvé`);
            }

            // Mettre à jour l'URL
            window.utils.setURLParam('tab', tabName);

            // Mettre à jour la navigation
            this.updateNavigation(tabName);

            // Afficher le loader
            this.showTabLoader();

            // Charger le module
            const module = this.modules.get(tabName);
            const container = document.getElementById('tab-container');

            if (module.render) {
                const content = await module.render();
                container.innerHTML = content;
            }

            if (module.init) {
                await module.init();
            }

            // Mettre à jour l'onglet actuel
            this.currentTab = tabName;

            console.log(`📄 Onglet ${tabName} chargé`);

        } catch (error) {
            console.error(`Erreur lors du chargement de l'onglet ${tabName}:`, error);
            this.showTabError(error);
        }
    }

    /**
     * Mise à jour de la navigation active
     */
    updateNavigation(activeTab) {
        // Retirer la classe active de tous les éléments
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            item.classList.remove('text-white', 'bg-primary');
            item.classList.add('text-gray-700', 'hover:bg-gray-100');
        });

        // Ajouter la classe active à l'élément sélectionné
        const activeItem = document.querySelector(`[data-tab="${activeTab}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.classList.remove('text-gray-700', 'hover:bg-gray-100');
            activeItem.classList.add('text-white', 'bg-primary');
        }
    }

    /**
     * Affichage du loader pour un onglet
     */
    showTabLoader() {
        const container = document.getElementById('tab-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <i class="fas fa-spinner loading-spinner text-4xl text-primary mb-4"></i>
                    <p class="text-gray-500 text-lg">Chargement du module...</p>
                </div>
            `;
        }
    }

    /**
     * Affichage d'une erreur de chargement d'onglet
     */
    showTabError(error) {
        const container = document.getElementById('tab-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                    <p class="text-gray-500 mb-6">${error.message}</p>
                    <button onclick="window.app.showTab('${this.currentTab}')" class="btn btn-primary">
                        <i class="fas fa-redo mr-2"></i>Réessayer
                    </button>
                </div>
            `;
        }
    }

    /**
     * Affichage d'une erreur d'initialisation
     */
    showInitializationError(error) {
        const container = document.getElementById('tab-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">Erreur d'initialisation</h3>
                    <p class="text-gray-500 mb-6">Impossible de se connecter au serveur</p>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                        <p class="text-red-700 text-sm">${error.message}</p>
                    </div>
                    <button onclick="location.reload()" class="btn btn-primary">
                        <i class="fas fa-redo mr-2"></i>Réessayer
                    </button>
                </div>
            `;
        }
    }

    /**
     * Actualisation de toutes les données
     */
    async refreshAll() {
        try {
            console.log('🔄 Actualisation globale...');

            // Vider le cache API
            window.api.clearCache();

            // Actualiser le statut serveur
            await this.checkServerStatus();

            // Actualiser le module actuel
            if (this.modules.has(this.currentTab)) {
                const module = this.modules.get(this.currentTab);
                if (module.refresh) {
                    await module.refresh();
                } else {
                    // Recharger complètement le module
                    await this.showTab(this.currentTab);
                }
            }

            if (window.notifications) {
                window.notifications.success('Données actualisées');
            }

        } catch (error) {
            console.error('Erreur lors de l\'actualisation:', error);
            if (window.notifications) {
                window.notifications.error('Erreur lors de l\'actualisation');
            }
        }
    }

    /**
     * Gestion de l'auto-refresh
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(async() => {
            if (!document.hidden && this.isInitialized) {
                try {
                    await this.checkServerStatus();

                    // Refresh automatique des modules qui le supportent
                    if (this.modules.has(this.currentTab)) {
                        const module = this.modules.get(this.currentTab);
                        if (module.autoRefresh && module.refresh) {
                            await module.refresh();
                        }
                    }
                } catch (error) {
                    console.warn('Erreur auto-refresh:', error);
                }
            }
        }, window.Config.UI.REFRESH_INTERVAL);
    }

    pauseAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    resumeAutoRefresh() {
        if (!this.refreshInterval) {
            this.startAutoRefresh();
        }
    }

    /**
     * Gestion des thèmes
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('admin-theme', newTheme);

        // Mettre à jour l'icône du bouton
        const themeButton = document.querySelector('[onclick="window.app.toggleTheme()"]');
        if (themeButton) {
            const icon = themeButton.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    /**
     * Initialisation du thème
     */
    initTheme() {
        const savedTheme = localStorage.getItem('admin-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    /**
     * Méthodes utilitaires pour les modules
     */
    showLoading(message = 'Chargement...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.querySelector('p').textContent = message;
            overlay.classList.remove('hidden');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    /**
     * Gestion des modales
     */
    showModal(content, options = {}) {
        const container = document.getElementById('modal-container');
        if (!container) return;

        const modalHTML = `
            <div class="modal-backdrop" onclick="${options.closeOnBackdrop !== false ? 'window.app.closeModal()' : ''}">
                <div class="modal-content ${options.size || 'max-w-2xl'}" onclick="event.stopPropagation()">
                    ${options.showHeader !== false ? `
                        <div class="modal-header">
                            <h3 class="text-lg font-semibold">${options.title || 'Modal'}</h3>
                            <button onclick="window.app.closeModal()" class="text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    ` : ''}
                    <div class="modal-body">
                        ${content}
                    </div>
                    ${options.footer ? `
                        <div class="modal-footer">
                            ${options.footer}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        container.innerHTML = modalHTML;
        container.classList.remove('hidden');

        // Focus sur le premier input si présent
        setTimeout(() => {
            const firstInput = container.querySelector('input, select, textarea');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeModal() {
        const container = document.getElementById('modal-container');
        if (container) {
            container.classList.add('hidden');
            container.innerHTML = '';
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
}

// Instance globale de l'application
window.app = new AdminApp();

// Initialiser le thème dès le chargement
document.addEventListener('DOMContentLoaded', () => {
    window.app.initTheme();
});

// Nettoyage lors de la fermeture de la page
window.addEventListener('beforeunload', () => {
    window.app.destroy();
});
