/* eslint-disable no-undef */
class DashboardUI {
    constructor() {
        this.charts = {};
    }

    async render() {
        const mainContent = document.getElementById('main-content');

        mainContent.innerHTML = `
            <div class="page-header d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center">
                <h1 class="h2">Tableau de bord</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <button class="btn btn-outline-primary" onclick="window.dashboardUI.refresh()">
                        <i class="bi bi-arrow-clockwise"></i> Actualiser
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <i class="bi bi-people fs-1 mb-2"></i>
                            <h3 id="total-players">-</h3>
                            <p class="mb-0">Joueurs</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <i class="bi bi-car-front fs-1 mb-2"></i>
                            <h3 id="total-models">-</h3>
                            <p class="mb-0">Modèles</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <i class="bi bi-controller fs-1 mb-2"></i>
                            <h3 id="total-games">-</h3>
                            <p class="mb-0">Parties</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card stats-card">
                        <div class="card-body text-center">
                            <i class="bi bi-bookmark fs-1 mb-2"></i>
                            <h3 id="total-brands">-</h3>
                            <p class="mb-0">Marques</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="row">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Activité des joueurs</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="playersChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5>Parties par difficulté</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="difficultyChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.loadData();
    }

    async loadData() {
        try {
            const [dashboardData, systemStats] = await Promise.all([
                window.api.get('/admin/dashboard').catch(() => ({ success: false })),
                window.api.get('/admin/system/stats')
            ]);

            if (systemStats.success) {
                this.updateStats(systemStats.data);
            }

            this.createCharts();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            window.notifications.error('Erreur lors du chargement du tableau de bord');
        }
    }

    updateStats(data) {
        document.getElementById('total-players').textContent = data.players || '0';
        document.getElementById('total-models').textContent = data.models || '0';
        document.getElementById('total-games').textContent = data.games || '0';
        document.getElementById('total-brands').textContent = data.brands || '0';
    }

    createCharts() {
        this.createPlayersChart();
        this.createDifficultyChart();
    }

    createPlayersChart() {
        const ctx = document.getElementById('playersChart');
        if (!ctx) return;

        if (this.charts.players) {
            this.charts.players.destroy();
        }

        this.charts.players = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                datasets: [{
                    label: 'Joueurs actifs',
                    data: [12, 19, 3, 5, 2, 3, 10],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createDifficultyChart() {
        const ctx = document.getElementById('difficultyChart');
        if (!ctx) return;

        if (this.charts.difficulty) {
            this.charts.difficulty.destroy();
        }

        this.charts.difficulty = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Facile', 'Moyen', 'Difficile'],
                datasets: [{
                    data: [45, 35, 20],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    async refresh() {
        await this.loadData();
        window.notifications.info('Tableau de bord actualisé');
    }
}

window.dashboardUI = new DashboardUI();
