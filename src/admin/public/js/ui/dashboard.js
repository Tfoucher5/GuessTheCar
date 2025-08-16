/* eslint-disable no-undef */
/**
 * Module UI pour le tableau de bord administrateur
 */

class DashboardUI {
    constructor() {
        this.data = {
            stats: null,
            topPlayers: [],
            recentGames: [],
            popularModels: [],
            gameStats: null,
            charts: {}
        };
        this.refreshInterval = null;
    }

    /**
     * Rendu principal du dashboard
     */
    async render() {
        const content = `
            <div class="page-header d-flex justify-content-between align-items-center mb-4">
                <h1 class="h2 mb-0">
                    <i class="bi bi-speedometer2"></i> Tableau de bord
                </h1>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-primary btn-sm" onclick="window.dashboardUI.refresh()" id="refresh-btn">
                        <i class="bi bi-arrow-clockwise"></i> Actualiser
                    </button>
                    <div class="d-flex align-items-center">
                        <div id="last-update" class="text-muted small">
                            Dernière mise à jour : Chargement...
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cartes de statistiques principales -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card stats-card text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Marques</h5>
                                    <h2 class="mb-0" id="total-brands">-</h2>
                                    <small>Total enregistrées</small>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-bookmark display-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stats-card text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Modèles</h5>
                                    <h2 class="mb-0" id="total-models">-</h2>
                                    <small>Voitures disponibles</small>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-car-front display-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stats-card text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Joueurs</h5>
                                    <h2 class="mb-0" id="total-players">-</h2>
                                    <small>Utilisateurs actifs</small>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-people display-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card stats-card text-white">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <h5 class="card-title">Parties aujourd'hui</h5>
                                    <h2 class="mb-0" id="today-games">-</h2>
                                    <small><span id="active-games">-</span> en cours</small>
                                </div>
                                <div class="align-self-center">
                                    <i class="bi bi-controller display-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statistiques secondaires -->
            <div class="row mb-4">
                <div class="col-md-2">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-success mb-1" id="completed-games">-</h4>
                            <small class="text-muted">Parties terminées</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="card text-center">
                        <div class="card-body">
                            <h4 class="text-primary mb-1" id="average-score">-</h4>
                            <small class="text-muted">Score moyen</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Répartition par difficulté (7 derniers jours)</h6>
                            <canvas id="difficulty-chart" height="80"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenu principal -->
            <div class="row">
                <!-- Top Joueurs -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-trophy"></i> Top Joueurs
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="top-players-list">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Parties récentes -->
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-clock-history"></i> Parties récentes (24h)
                            </h5>
                        </div>
                        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
                            <div id="recent-games-list">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modèles populaires et système -->
            <div class="row">
                <div class="col-md-8 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-star"></i> Modèles populaires (7 derniers jours)
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="popular-models-list">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Informations système -->
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">
                                <i class="bi bi-cpu"></i> Système
                            </h5>
                        </div>
                        <div class="card-body">
                            <div id="system-info">
                                <div class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Chargement...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Charger les données après avoir rendu le HTML
        setTimeout(() => {
            this.loadData();
        }, 100);

        return content;
    }

    /**
     * Initialiser le module après le rendu
     */
    init() {
        console.log('Dashboard UI initialized');
        this.setupAutoRefresh();
    }

    /**
     * Charger toutes les données du dashboard
     */
    async loadData() {
        try {
            // Afficher le bouton de rechargement comme en cours
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i> Chargement...';
                refreshBtn.disabled = true;
            }

            // Charger les données en parallèle
            const [dashboardData, systemData] = await Promise.all([
                window.api.getDashboardStats().catch(error => {
                    console.warn('Dashboard stats failed:', error);
                    return null;
                }),
                window.api.getSystemInfo().catch(error => {
                    console.warn('System info failed:', error);
                    return null;
                })
            ]);

            // Mettre à jour les données
            if (dashboardData && dashboardData.success) {
                this.data.stats = dashboardData.data.general;
                this.data.topPlayers = dashboardData.data.topPlayers || [];
                this.data.recentGames = dashboardData.data.recentGames || [];
                this.data.popularModels = dashboardData.data.popularModels || [];
                this.data.gameStats = dashboardData.data.gameStats || null;
            }

            // Mettre à jour l'affichage
            this.updateStats();
            this.updateTopPlayers();
            this.updateRecentGames();
            this.updatePopularModels();
            this.updateSystemInfo(systemData);
            this.createCharts();

            // Mettre à jour le timestamp
            this.updateLastUpdateTime();

        } catch (error) {
            console.error('Erreur lors du chargement du dashboard:', error);
            window.notifications?.error('Erreur lors du chargement du tableau de bord');
        } finally {
            // Restaurer le bouton de rechargement
            const refreshBtn = document.getElementById('refresh-btn');
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Actualiser';
                refreshBtn.disabled = false;
            }
        }
    }

    /**
     * Mettre à jour les statistiques principales
     */
    updateStats() {
        if (!this.data.stats) {
            this.data.stats = {
                totalBrands: 0,
                totalModels: 0,
                totalPlayers: 0,
                todayGames: 0,
                activeGames: 0,
                completedGames: 0,
                averageScore: 0
            };
        }

        const elements = {
            'total-brands': this.data.stats.totalBrands || 0,
            'total-models': this.data.stats.totalModels || 0,
            'total-players': this.data.stats.totalPlayers || 0,
            'today-games': this.data.stats.todayGames || 0,
            'active-games': this.data.stats.activeGames || 0,
            'completed-games': this.data.stats.completedGames || 0,
            'average-score': this.data.stats.averageScore || 0
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                this.animateCounter(element, parseInt(value) || 0);
            }
        });
    }

    /**
     * Animation de compteur
     */
    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const increment = Math.ceil((targetValue - currentValue) / 20);

        if (currentValue < targetValue) {
            element.textContent = Math.min(currentValue + increment, targetValue);
            setTimeout(() => this.animateCounter(element, targetValue), 50);
        } else {
            element.textContent = targetValue;
        }
    }

    /**
     * Mettre à jour la liste des top joueurs
     */
    updateTopPlayers() {
        const container = document.getElementById('top-players-list');
        if (!container) return;

        if (!this.data.topPlayers || this.data.topPlayers.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-people display-4 mb-2"></i>
                    <p>Aucun joueur pour le moment</p>
                </div>
            `;
            return;
        }

        const playersHtml = this.data.topPlayers.slice(0, 10).map((player, index) => {
            const position = index + 1;
            const badgeClass = position <= 3 ? 'warning' : 'secondary';
            const badgeIcon = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '#' + position;

            const winRate = player.win_rate || 0;
            const brandAccuracy = player.brand_accuracy || 0;
            const modelAccuracy = player.model_accuracy || 0;

            return `
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div class="d-flex align-items-center">
                        <span class="badge bg-${badgeClass} me-2">${badgeIcon}</span>
                        <div>
                            <div class="fw-bold">${window.utils.escapeHtml(player.username || 'Joueur inconnu')}</div>
                            <small class="text-muted">
                                ${player.games_played || 0} parties • ${player.games_won || 0} gagnées
                            </small>
                            <div class="small">
                                <span class="badge bg-success">${winRate}% victoires</span>
                                <span class="badge bg-info">${brandAccuracy}% marques</span>
                                <span class="badge bg-primary">${modelAccuracy}% modèles</span>
                            </div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold text-primary">${window.utils.formatNumber(player.total_difficulty_points || 0)} pts</div>
                        <small class="text-muted">Streak: ${player.best_streak || 0}</small>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = playersHtml;
    }

    /**
     * Mettre à jour la liste des parties récentes
     */
    updateRecentGames() {
        const container = document.getElementById('recent-games-list');
        if (!container) return;

        if (!this.data.recentGames || this.data.recentGames.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-controller display-4 mb-2"></i>
                    <p>Aucune partie récente</p>
                </div>
            `;
            return;
        }

        const gamesHtml = this.data.recentGames.slice(0, 10).map(game => {
            const status = game.status || 'Inconnue';
            const statusClasses = {
                'En cours': 'warning',
                'Terminée': 'success',
                'Abandonnée': 'danger',
                'Timeout': 'secondary',
                'Interrompue': 'dark'
            };
            const statusClass = statusClasses[status] || 'secondary';

            const timeAgo = window.utils.timeAgo(game.started_at);
            const duration = game.duration_seconds ? Math.round(game.duration_seconds / 60) + 'min' : '-';
            const points = game.points_earned ? '+' + game.points_earned + 'pts' : '0pts';

            const difficultyBadge = game.difficulty_level ?
                '<span class="badge bg-' + (game.difficulty_level === 1 ? 'success' : game.difficulty_level === 2 ? 'warning' : 'danger') + '">' +
                (game.difficulty_level === 1 ? 'Facile' : game.difficulty_level === 2 ? 'Moyen' : 'Difficile') + '</span>' : '';

            const progressInfo = [];
            if (game.make_found) progressInfo.push('Marque ✓');
            if (game.model_found) progressInfo.push('Modèle ✓');
            if (game.attempts_make) progressInfo.push(game.attempts_make + ' tent. marque');
            if (game.attempts_model) progressInfo.push(game.attempts_model + ' tent. modèle');

            return `
                <div class="mb-3 p-2 border rounded">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center gap-2 mb-1">
                                <strong>${window.utils.escapeHtml(game.username || 'Joueur inconnu')}</strong>
                                <span class="badge bg-${statusClass}">${status}</span>
                                ${difficultyBadge}
                            </div>
                            <div class="small text-muted mb-1">
                                ${window.utils.escapeHtml(game.car_name || 'Voiture inconnue')}
                            </div>
                            ${progressInfo.length > 0 ? '<div class="small text-info">' + progressInfo.join(' • ') + '</div>' : ''}
                        </div>
                        <div class="text-end">
                            <div class="small text-muted">${timeAgo}</div>
                            <div class="small">${duration} • ${points}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = gamesHtml;
    }

    /**
     * Mettre à jour la liste des modèles populaires
     */
    updatePopularModels() {
        const container = document.getElementById('popular-models-list');
        if (!container) return;

        if (!this.data.popularModels || this.data.popularModels.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="bi bi-car-front display-4 mb-2"></i>
                    <p>Aucun modèle joué récemment</p>
                </div>
            `;
            return;
        }

        const modelsHtml = this.data.popularModels.map((model, index) => {
            const position = index + 1;
            const successRate = model.success_rate || 0;
            const avgDuration = model.avg_duration ? Math.round(model.avg_duration / 60) + 'min' : '-';
            const avgPoints = model.avg_points || 0;

            const difficultyColor = model.difficulty_level === 1 ? 'success' :
                model.difficulty_level === 2 ? 'warning' : 'danger';
            const difficultyText = model.difficulty_level === 1 ? 'Facile' :
                model.difficulty_level === 2 ? 'Moyen' : 'Difficile';

            return `
                <div class="row align-items-center py-2 border-bottom">
                    <div class="col-1">
                        <span class="badge bg-primary">#${position}</span>
                    </div>
                    <div class="col-5">
                        <div class="fw-bold">${window.utils.escapeHtml(model.name)}</div>
                        <small class="text-muted">${window.utils.escapeHtml(model.brand_name)} ${model.year || ''}</small>
                    </div>
                    <div class="col-2 text-center">
                        <span class="badge bg-${difficultyColor}">${difficultyText}</span>
                    </div>
                    <div class="col-2 text-center">
                        <div class="fw-bold">${model.play_count}</div>
                        <small class="text-muted">parties</small>
                    </div>
                    <div class="col-2 text-center">
                        <div class="fw-bold text-success">${successRate}%</div>
                        <small class="text-muted">${avgDuration}</small>
                    </div>
                </div>
            `;
        }).join('');

        const header = `
            <div class="row fw-bold text-muted border-bottom pb-2 mb-2">
                <div class="col-1">#</div>
                <div class="col-5">Modèle</div>
                <div class="col-2 text-center">Difficulté</div>
                <div class="col-2 text-center">Parties</div>
                <div class="col-2 text-center">Succès</div>
            </div>
        `;

        container.innerHTML = header + modelsHtml;
    }

    /**
     * Mettre à jour les informations système
     */
    updateSystemInfo(systemData) {
        const container = document.getElementById('system-info');
        if (!container) return;

        if (!systemData || !systemData.success) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>Informations indisponibles</p>
                </div>
            `;
            return;
        }

        const data = systemData.data;
        const uptime = this.formatUptime(data.uptime || 0);
        const memory = data.memory ? Math.round(data.memory.heapUsed / 1024 / 1024) : 0;

        container.innerHTML = `
            <div class="row g-2">
                <div class="col-12">
                    <div class="d-flex justify-content-between">
                        <span>Uptime:</span>
                        <span class="text-end">${uptime}</span>
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex justify-content-between">
                        <span>Mémoire:</span>
                        <span class="text-end">${memory} MB</span>
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex justify-content-between">
                        <span>Node.js:</span>
                        <span class="text-end">${data.nodeVersion || 'N/A'}</span>
                    </div>
                </div>
                <div class="col-12">
                    <div class="d-flex justify-content-between">
                        <span>Plateforme:</span>
                        <span class="text-end">${data.platform || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Créer les graphiques
     */
    createCharts() {
        this.createDifficultyChart();
    }

    /**
     * Créer le graphique de répartition par difficulté
     */
    createDifficultyChart() {
        const canvas = document.getElementById('difficulty-chart');
        if (!canvas || typeof Chart === 'undefined') return;

        // Détruire le graphique existant
        if (this.data.charts.difficulty) {
            this.data.charts.difficulty.destroy();
        }

        const ctx = canvas.getContext('2d');

        let data = {
            labels: ['Facile', 'Moyen', 'Difficile'],
            datasets: [{
                label: 'Nombre de parties',
                data: [0, 0, 0],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',
                    'rgba(255, 193, 7, 0.8)',
                    'rgba(220, 53, 69, 0.8)'
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 2
            }]
        };

        // Utiliser les vraies données si disponibles
        if (this.data.gameStats && this.data.gameStats.difficultyStats) {
            const diffStats = this.data.gameStats.difficultyStats;
            const chartData = [0, 0, 0];

            diffStats.forEach(stat => {
                if (stat.difficulty_level >= 1 && stat.difficulty_level <= 3) {
                    chartData[stat.difficulty_level - 1] = stat.total_games || 0;
                }
            });

            data.datasets[0].data = chartData;
        } else {
            data.datasets[0].data = [45, 30, 25];
        }

        this.data.charts.difficulty = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Formater le temps d'activité
     */
    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return days + 'j ' + hours + 'h ' + minutes + 'm';
        } else if (hours > 0) {
            return hours + 'h ' + minutes + 'm';
        } else {
            return minutes + 'm';
        }
    }

    /**
     * Mettre à jour l'heure de dernière mise à jour
     */
    updateLastUpdateTime() {
        const element = document.getElementById('last-update');
        if (element) {
            const now = new Date();
            element.textContent = 'Dernière mise à jour : ' + now.toLocaleTimeString('fr-FR');
        }
    }

    /**
     * Configurer l'actualisation automatique
     */
    setupAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            if (!document.hidden) {
                this.loadData();
            }
        }, 30000);
    }

    /**
     * Actualiser manuellement
     */
    async refresh() {
        await this.loadData();
        window.notifications?.success('Tableau de bord actualisé', { duration: 2000 });
    }

    /**
     * Nettoyage
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        Object.values(this.data.charts).forEach(chart => {
            if (chart && chart.destroy) {
                chart.destroy();
            }
        });
    }
}

// Créer l'instance globale
window.dashboardUI = new DashboardUI();
