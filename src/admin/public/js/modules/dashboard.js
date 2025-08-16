/* eslint-disable no-undef */
/**
 * Module Dashboard - Vue d'ensemble et statistiques
 */

window.dashboard = {
    data: {
        stats: null,
        health: null,
        topPlayers: [],
        recentActivity: []
    },

    autoRefresh: true,

    async init() {
        console.log('📊 Initialisation du dashboard...');
        await this.loadData();
        this.setupEventListeners();
    },

    async render() {
        return `
            <div class="dashboard-container">
                <!-- En-tête -->
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-2">Vue d'ensemble</h2>
                    <p class="text-gray-600">Statistiques globales et monitoring du système</p>
                </div>

                <!-- Cartes de statistiques -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-cards">
                    ${this.renderStatsCards()}
                </div>

                <!-- Graphiques et données -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <!-- Top Joueurs -->
                    <div class="lg:col-span-1">
                        <div class="card p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">Top 10 Joueurs</h3>
                                <button onclick="window.app.showTab('players')" class="text-primary hover:text-blue-700 text-sm">
                                    Voir tous <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                            <div id="top-players-list">
                                ${this.renderTopPlayers()}
                            </div>
                        </div>
                    </div>

                    <!-- Activité récente -->
                    <div class="lg:col-span-1">
                        <div class="card p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-semibold text-gray-900">Activité Récente</h3>
                                <button onclick="window.app.showTab('games')" class="text-primary hover:text-blue-700 text-sm">
                                    Voir toutes <i class="fas fa-arrow-right ml-1"></i>
                                </button>
                            </div>
                            <div id="recent-activity-list">
                                ${this.renderRecentActivity()}
                            </div>
                        </div>
                    </div>

                    <!-- Statistiques système -->
                    <div class="lg:col-span-1">
                        <div class="card p-6">
                            <h3 class="text-lg font-semibold text-gray-900 mb-4">Système</h3>
                            <div id="system-stats">
                                ${this.renderSystemStats()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Graphiques détaillés -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Répartition par difficulté -->
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Répartition par Difficulté</h3>
                        <div id="difficulty-chart" class="h-64">
                            ${this.renderDifficultyChart()}
                        </div>
                    </div>

                    <!-- Marques populaires -->
                    <div class="card p-6">
                        <h3 class="text-lg font-semibold text-gray-900 mb-4">Marques Populaires</h3>
                        <div id="brands-chart" class="h-64">
                            ${this.renderBrandsChart()}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderStatsCards() {
        if (!this.data.stats) {
            return this.renderStatsCardsSkeleton();
        }

        const cards = [
            {
                title: 'Marques',
                value: this.data.stats.totalBrands || 0,
                icon: 'fa-industry',
                color: 'blue',
                change: this.data.stats.brandsChange || 0
            },
            {
                title: 'Modèles',
                value: this.data.stats.totalModels || 0,
                icon: 'fa-car',
                color: 'green',
                change: this.data.stats.modelsChange || 0
            },
            {
                title: 'Joueurs',
                value: this.data.stats.totalPlayers || 0,
                icon: 'fa-users',
                color: 'purple',
                change: this.data.stats.playersChange || 0
            },
            {
                title: 'Parties',
                value: this.data.stats.totalGames || 0,
                icon: 'fa-gamepad',
                color: 'orange',
                change: this.data.stats.gamesChange || 0
            }
        ];

        return cards.map(card => `
            <div class="metric-card rounded-xl p-6 card-hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900">${window.utils.formatNumber(card.value)}</p>
                        ${card.change !== 0 ? `
                            <p class="text-sm ${card.change > 0 ? 'text-green-600' : 'text-red-600'}">
                                <i class="fas fa-${card.change > 0 ? 'arrow-up' : 'arrow-down'} mr-1"></i>
                                ${Math.abs(card.change)}% cette semaine
                            </p>
                        ` : ''}
                    </div>
                    <div class="p-3 bg-${card.color}-100 rounded-full">
                        <i class="fas ${card.icon} text-${card.color}-600 text-xl"></i>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderStatsCardsSkeleton() {
        return Array(4).fill(0).map(() => `
            <div class="metric-card rounded-xl p-6">
                <div class="animate-pulse">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                            <div class="h-8 bg-gray-200 rounded w-20 mb-2"></div>
                            <div class="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderTopPlayers() {
        if (!this.data.topPlayers || this.data.topPlayers.length === 0) {
            return '<div class="text-center py-8 text-gray-500">Aucun joueur trouvé</div>';
        }

        return this.data.topPlayers.slice(0, 10).map((player, index) => `
            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex items-center">
                    <div class="w-8 h-8 ${this.getRankColor(index)} rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-bold text-white">${index + 1}</span>
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${player.username}</p>
                        <p class="text-sm text-gray-500">${player.games_played || 0} parties</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold text-green-600">${window.utils.formatNumber(player.total_points || 0)} pts</p>
                    <p class="text-sm text-gray-500">${this.getWinRate(player)}% réussite</p>
                </div>
            </div>
        `).join('');
    },

    renderRecentActivity() {
        if (!this.data.recentActivity || this.data.recentActivity.length === 0) {
            return '<div class="text-center py-8 text-gray-500">Aucune activité récente</div>';
        }

        return this.data.recentActivity.slice(0, 10).map(activity => `
            <div class="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div class="flex-shrink-0 w-8 h-8 ${this.getActivityColor(activity.type)} rounded-full flex items-center justify-center mr-3">
                    <i class="fas ${this.getActivityIcon(activity.type)} text-white text-sm"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">${activity.description}</p>
                    <p class="text-xs text-gray-500">${window.utils.formatDate(activity.created_at, 'long')}</p>
                </div>
            </div>
        `).join('');
    },

    renderSystemStats() {
        if (!this.data.health) {
            return '<div class="text-center py-4 text-gray-500">Chargement...</div>';
        }

        const stats = [
            {
                label: 'Uptime',
                value: window.utils.formatUptime(this.data.health.uptime || 0)
            },
            {
                label: 'Mémoire',
                value: this.formatMemory(this.data.health.memory)
            },
            {
                label: 'Version Node',
                value: this.data.health.nodeVersion || 'N/A'
            },
            {
                label: 'Plateforme',
                value: this.data.health.platform || 'N/A'
            }
        ];

        return stats.map(stat => `
            <div class="flex justify-between items-center py-2">
                <span class="text-gray-600">${stat.label}:</span>
                <span class="font-medium text-gray-900">${stat.value}</span>
            </div>
        `).join('');
    },

    renderDifficultyChart() {
        if (!this.data.stats || !this.data.stats.difficultyBreakdown) {
            return '<div class="text-center py-16 text-gray-500">Données non disponibles</div>';
        }

        const breakdown = this.data.stats.difficultyBreakdown;
        const total = Object.values(breakdown).reduce((sum, count) => sum + count, 0);

        if (total === 0) {
            return '<div class="text-center py-16 text-gray-500">Aucune donnée</div>';
        }

        const levels = [
            { key: '1', label: 'Facile', color: 'bg-green-500' },
            { key: '2', label: 'Moyen', color: 'bg-yellow-500' },
            { key: '3', label: 'Difficile', color: 'bg-red-500' }
        ];

        return `
            <div class="space-y-4">
                ${levels.map(level => {
        const count = breakdown[level.key] || 0;
        const percentage = total > 0 ? (count / total * 100) : 0;
        return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600">${level.label}</span>
                                <span class="font-medium">${window.utils.formatNumber(count)} (${percentage.toFixed(1)}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="${level.color} h-2 rounded-full transition-all duration-1000" 
                                     style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        `;
    },

    renderBrandsChart() {
        if (!this.data.stats || !this.data.stats.popularBrands) {
            return '<div class="text-center py-16 text-gray-500">Données non disponibles</div>';
        }

        const brands = this.data.stats.popularBrands.slice(0, 8);
        if (brands.length === 0) {
            return '<div class="text-center py-16 text-gray-500">Aucune donnée</div>';
        }

        const maxCount = Math.max(...brands.map(b => b.count));

        return `
            <div class="space-y-3">
                ${brands.map(brand => {
        const percentage = maxCount > 0 ? (brand.count / maxCount * 100) : 0;
        return `
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="text-gray-600">${brand.name}</span>
                                <span class="font-medium">${window.utils.formatNumber(brand.count)} modèles</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                                     style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
    }).join('')}
            </div>
        `;
    },

    async loadData() {
        try {
            // Charger toutes les données en parallèle
            const [dashboardData, healthData] = await Promise.all([
                window.api.getDashboardStats().catch(() => null),
                window.api.getSystemInfo().catch(() => null)
            ]);

            this.data.stats = dashboardData?.data || null;
            this.data.health = healthData?.data || null;
            this.data.topPlayers = dashboardData?.data?.topPlayers || [];
            this.data.recentActivity = dashboardData?.data?.recentActivity || [];

            // Mettre à jour l'affichage
            this.updateDisplay();

        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
            window.notifications?.error('Erreur lors du chargement des données du dashboard');
        }
    },

    updateDisplay() {
        // Mettre à jour les cartes de stats
        const statsContainer = document.getElementById('stats-cards');
        if (statsContainer) {
            statsContainer.innerHTML = this.renderStatsCards();
        }

        // Mettre à jour le top joueurs
        const topPlayersContainer = document.getElementById('top-players-list');
        if (topPlayersContainer) {
            topPlayersContainer.innerHTML = this.renderTopPlayers();
        }

        // Mettre à jour l'activité récente
        const activityContainer = document.getElementById('recent-activity-list');
        if (activityContainer) {
            activityContainer.innerHTML = this.renderRecentActivity();
        }

        // Mettre à jour les stats système
        const systemStatsContainer = document.getElementById('system-stats');
        if (systemStatsContainer) {
            systemStatsContainer.innerHTML = this.renderSystemStats();
        }

        // Mettre à jour les graphiques
        const difficultyChart = document.getElementById('difficulty-chart');
        if (difficultyChart) {
            difficultyChart.innerHTML = this.renderDifficultyChart();
        }

        const brandsChart = document.getElementById('brands-chart');
        if (brandsChart) {
            brandsChart.innerHTML = this.renderBrandsChart();
        }
    },

    setupEventListeners() {
        // Auto-refresh si la page est visible
        if (this.autoRefresh) {
            const refreshInterval = setInterval(() => {
                if (!document.hidden && window.app.currentTab === 'dashboard') {
                    this.refresh();
                }
            }, 60000); // Refresh toutes les minutes

            // Nettoyer l'interval lors du changement d'onglet
            this.cleanupInterval = () => clearInterval(refreshInterval);
        }
    },

    async refresh() {
        await this.loadData();
    },

    // Méthodes utilitaires
    getRankColor(index) {
        const colors = [
            'bg-yellow-500',  // 1er - Or
            'bg-gray-400',    // 2ème - Argent
            'bg-yellow-600',  // 3ème - Bronze
            'bg-blue-500',    // 4ème+
            'bg-blue-500',
            'bg-blue-500',
            'bg-blue-500',
            'bg-blue-500',
            'bg-blue-500',
            'bg-blue-500'
        ];
        return colors[index] || 'bg-blue-500';
    },

    getWinRate(player) {
        if (!player.games_played || player.games_played === 0) return 0;
        return Math.round((player.games_won || 0) / player.games_played * 100);
    },

    getActivityColor(type) {
        const colors = {
            game_completed: 'bg-green-500',
            game_started: 'bg-blue-500',
            player_joined: 'bg-purple-500',
            achievement: 'bg-yellow-500',
            error: 'bg-red-500'
        };
        return colors[type] || 'bg-gray-500';
    },

    getActivityIcon(type) {
        const icons = {
            game_completed: 'fa-check',
            game_started: 'fa-play',
            player_joined: 'fa-user-plus',
            achievement: 'fa-trophy',
            error: 'fa-exclamation'
        };
        return icons[type] || 'fa-info';
    },

    formatMemory(memory) {
        if (!memory) return 'N/A';
        const used = memory.heapUsed || 0;
        const total = memory.heapTotal || 0;
        return `${window.utils.formatFileSize(used)} / ${window.utils.formatFileSize(total)}`;
    },

    destroy() {
        if (this.cleanupInterval) {
            this.cleanupInterval();
        }
    }
};
