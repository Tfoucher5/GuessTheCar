/* eslint-disable no-undef */
class NavigationManager {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        // Tab navigation
        document.querySelectorAll('[data-tab]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.dataset.tab);
            });
        });
    }

    switchTab(tabName) {
        // Update nav
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        this.currentTab = tabName;

        // Load content for tab
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        const mainContent = document.getElementById('main-content');

        // Show loading
        this.showLoading();

        try {
            // Load the appropriate UI module
            switch (tabName) {
            case 'dashboard':
                await window.dashboardUI.render();
                break;
            case 'models':
                await window.modelsUI.render();
                break;
            case 'brands':
                await window.brandsUI.render();
                break;
            case 'players':
                await window.playersUI.render();
                break;
            case 'games':
                await window.gamesUI.render();
                break;
            case 'system':
                await window.systemUI.render();
                break;
            default:
                mainContent.innerHTML = '<div class="alert alert-warning">Page non trouvée</div>';
            }
        } catch (error) {
            console.error('Error loading tab content:', error);
            mainContent.innerHTML = '<div class="alert alert-danger">Erreur lors du chargement</div>';
        } finally {
            this.hideLoading();
        }
    }

    showLoading() {
        document.querySelector('.loading').classList.add('show');
    }

    hideLoading() {
        document.querySelector('.loading').classList.remove('show');
    }

    getCurrentTab() {
        return this.currentTab;
    }
}

window.navigation = new NavigationManager();
