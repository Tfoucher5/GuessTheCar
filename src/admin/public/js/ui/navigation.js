/* eslint-disable no-undef */
/**
 * Gestionnaire de navigation pour l'interface d'administration
 */

class NavigationManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.tabContents = new Map();
        this.init();
    }

    init() {
        this.setupTabListeners();
        this.setupSearchHandlers();
    }

    setupTabListeners() {
        // Gestionnaire pour les liens de navigation
        document.addEventListener('click', (e) => {
            const tabLink = e.target.closest('[data-tab]');
            if (tabLink) {
                e.preventDefault();
                const tabName = tabLink.dataset.tab;
                this.switchTab(tabName);
            }
        });

        // Gestion de l'historique du navigateur
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.tab) {
                this.switchTab(e.state.tab, false);
            }
        });
    }

    setupSearchHandlers() {
        // Recherche globale (si présente)
        const globalSearch = document.querySelector('#global-search');
        if (globalSearch) {
            globalSearch.addEventListener('input', this.debounce((e) => {
                this.handleGlobalSearch(e.target.value);
            }, 300));
        }
    }

    async switchTab(tabName, updateHistory = true) {
        if (this.currentTab === tabName) return;

        try {
            // Afficher le loading
            this.showLoading(true);

            // Retirer la classe active de tous les liens
            document.querySelectorAll('[data-tab]').forEach(link => {
                link.classList.remove('active');
            });

            // Ajouter la classe active au lien courant
            const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }

            // Charger le contenu de l'onglet
            await this.loadTabContent(tabName);

            // Mettre à jour l'historique
            if (updateHistory) {
                const url = new URL(window.location);
                url.searchParams.set('tab', tabName);
                window.history.pushState({ tab: tabName }, '', url);
            }

            this.currentTab = tabName;

        } catch (error) {
            console.error('Erreur lors du changement d\'onglet:', error);
            window.notifications?.error('Erreur lors du chargement de la page');
        } finally {
            this.showLoading(false);
        }
    }

    async loadTabContent(tabName) {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            throw new Error('Container main-content non trouvé');
        }

        // Vérifier le cache
        if (this.tabContents.has(tabName) && this.shouldUseCache(tabName)) {
            mainContent.innerHTML = this.tabContents.get(tabName);
            this.initializeTabModule(tabName);
            return;
        }

        // Charger le contenu selon l'onglet
        let content = '';

        switch (tabName) {
        case 'dashboard':
            content = await this.loadDashboard();
            break;
        case 'models':
            content = await this.loadModels();
            break;
        case 'brands':
            content = await this.loadBrands();
            break;
        case 'players':
            content = await this.loadPlayers();
            break;
        case 'games':
            content = await this.loadGames();
            break;
        case 'system':
            content = await this.loadSystem();
            break;
        default:
            content = this.getNotFoundContent(tabName);
        }

        // Mettre à jour le contenu
        mainContent.innerHTML = content;

        // Mettre en cache
        this.tabContents.set(tabName, content);

        // Initialiser le module spécifique
        this.initializeTabModule(tabName);
    }

    async loadDashboard() {
        try {
            const data = await window.api.get('/admin/dashboard');
            return window.dashboardUI ? window.dashboardUI.render(data.data) : this.getLoadingContent('Dashboard');
        } catch (error) {
            return this.getErrorContent('dashboard', error);
        }
    }

    async loadModels() {
        try {
            return window.modelsUI ? window.modelsUI.render() : this.getLoadingContent('Modèles');
        } catch (error) {
            return this.getErrorContent('models', error);
        }
    }

    async loadBrands() {
        try {
            return window.brandsUI ? window.brandsUI.render() : this.getLoadingContent('Marques');
        } catch (error) {
            return this.getErrorContent('brands', error);
        }
    }

    async loadPlayers() {
        try {
            return window.playersUI ? window.playersUI.render() : this.getLoadingContent('Joueurs');
        } catch (error) {
            return this.getErrorContent('players', error);
        }
    }

    async loadGames() {
        try {
            return window.gamesUI ? window.gamesUI.render() : this.getLoadingContent('Parties');
        } catch (error) {
            return this.getErrorContent('games', error);
        }
    }

    async loadSystem() {
        try {
            return window.systemUI ? window.systemUI.render() : this.getLoadingContent('Système');
        } catch (error) {
            return this.getErrorContent('system', error);
        }
    }

    initializeTabModule(tabName) {
        // Initialiser les événements spécifiques selon l'onglet
        switch (tabName) {
        case 'dashboard':
            if (window.dashboardUI && window.dashboardUI.init) {
                window.dashboardUI.init();
            }
            break;
        case 'models':
            if (window.modelsUI && window.modelsUI.init) {
                window.modelsUI.init();
            }
            break;
        case 'brands':
            if (window.brandsUI && window.brandsUI.init) {
                window.brandsUI.init();
            }
            break;
        case 'players':
            if (window.playersUI && window.playersUI.init) {
                window.playersUI.init();
            }
            break;
        case 'games':
            if (window.gamesUI && window.gamesUI.init) {
                window.gamesUI.init();
            }
            break;
        case 'system':
            if (window.systemUI && window.systemUI.init) {
                window.systemUI.init();
            }
            break;
        }

        // Réinitialiser les tooltips Bootstrap si présents
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function(tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
    }

    shouldUseCache(tabName) {
        // Certains onglets ne devraient pas utiliser le cache
        const noCacheList = ['dashboard', 'system'];
        return !noCacheList.includes(tabName);
    }

    showLoading(show) {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            if (show) {
                loadingElement.classList.add('show');
            } else {
                loadingElement.classList.remove('show');
            }
        }
    }

    getLoadingContent(title) {
        return `
            <div class="page-header">
                <h1 class="h2">${title}</h1>
            </div>
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
                <div class="mt-3">Chargement des données...</div>
            </div>
        `;
    }

    getErrorContent(module, error) {
        return `
            <div class="page-header">
                <h1 class="h2">Erreur</h1>
            </div>
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Erreur de chargement</h4>
                <p>Impossible de charger le module ${module}.</p>
                <hr>
                <p class="mb-0">
                    <small>Erreur: ${error.message}</small>
                </p>
                <div class="mt-3">
                    <button class="btn btn-outline-danger" onclick="window.navigation.refreshCurrentTab()">
                        Réessayer
                    </button>
                </div>
            </div>
        `;
    }

    getNotFoundContent(tabName) {
        return `
            <div class="page-header">
                <h1 class="h2">Page non trouvée</h1>
            </div>
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Module non trouvé</h4>
                <p>Le module "${tabName}" n'existe pas ou n'est pas encore implémenté.</p>
                <div class="mt-3">
                    <button class="btn btn-primary" onclick="window.navigation.switchTab('dashboard')">
                        Retour au tableau de bord
                    </button>
                </div>
            </div>
        `;
    }

    refreshCurrentTab() {
        // Vider le cache pour l'onglet courant
        this.tabContents.delete(this.currentTab);
        // Recharger
        this.switchTab(this.currentTab, false);
    }

    clearCache() {
        this.tabContents.clear();
    }

    handleGlobalSearch(query) {
        // Implémentation de la recherche globale
        console.log('Recherche globale:', query);
        // TODO: Implémenter la recherche selon l'onglet actuel
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Méthodes utilitaires publiques
    getCurrentTab() {
        return this.currentTab;
    }

    isTabLoaded(tabName) {
        return this.tabContents.has(tabName);
    }
}

// Initialiser le gestionnaire de navigation
window.navigation = new NavigationManager();
