/* eslint-disable no-undef */
/**
 * Module UI pour la gestion des marques
 */

class BrandsUI {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalPages = 1;
        this.searchQuery = '';
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.brands = [];
    }

    /**
     * Rendu principal de la page des marques
     */
    async render() {
        const content = `
            <div class="page-header d-flex justify-content-between align-items-center mb-4">
                <h1 class="h2 mb-0">
                    <i class="bi bi-bookmark"></i> Gestion des marques
                </h1>
                <div class="d-flex gap-2">
                    <button class="btn btn-success" onclick="window.brandsUI.showCreateModal()">
                        <i class="bi bi-plus-circle"></i> Nouvelle marque
                    </button>
                    <button class="btn btn-outline-primary" onclick="window.brandsUI.refresh()">
                        <i class="bi bi-arrow-clockwise"></i> Actualiser
                    </button>
                </div>
            </div>

            <!-- Filtres et recherche -->
            <div class="card mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label">Rechercher</label>
                            <input type="text" 
                                   class="form-control" 
                                   id="search-input"
                                   placeholder="Nom de marque..."
                                   value="${this.searchQuery}">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Trier par</label>
                            <select class="form-select" id="sort-select">
                                <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Nom</option>
                                <option value="country" ${this.sortBy === 'country' ? 'selected' : ''}>Pays</option>
                                <option value="model_count" ${this.sortBy === 'model_count' ? 'selected' : ''}>Nb modèles</option>
                                <option value="created_at" ${this.sortBy === 'created_at' ? 'selected' : ''}>Date création</option>
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">Ordre</label>
                            <select class="form-select" id="order-select">
                                <option value="asc" ${this.sortOrder === 'asc' ? 'selected' : ''}>Croissant</option>
                                <option value="desc" ${this.sortOrder === 'desc' ? 'selected' : ''}>Décroissant</option>
                            </select>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button class="btn btn-primary w-100" onclick="window.brandsUI.applyFilters()">
                                <i class="bi bi-funnel"></i> Appliquer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tableau des marques -->
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Liste des marques</h5>
                    <div id="brands-count" class="text-muted">
                        Chargement...
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Logo</th>
                                    <th>Nom</th>
                                    <th>Pays</th>
                                    <th>Modèles</th>
                                    <th>Créée le</th>
                                    <th width="150">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="brands-table-body">
                                <tr>
                                    <td colspan="6" class="text-center py-4">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Chargement...</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="card-footer">
                    <div id="pagination-container">
                        <!-- Pagination sera générée ici -->
                    </div>
                </div>
            </div>

            <!-- Modal pour créer/éditer une marque -->
            <div class="modal fade" id="brandModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="brandModalTitle">Nouvelle marque</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="brandForm">
                                <input type="hidden" id="brandId">
                                <div class="mb-3">
                                    <label for="brandName" class="form-label">Nom de la marque *</label>
                                    <input type="text" class="form-control" id="brandName" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="brandCountry" class="form-label">Pays *</label>
                                    <input type="text" class="form-control" id="brandCountry" required>
                                    <div class="invalid-feedback"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="brandLogo" class="form-label">URL du logo (optionnel)</label>
                                    <input type="url" class="form-control" id="brandLogo">
                                    <div class="form-text">URL vers l'image du logo de la marque</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                            <button type="button" class="btn btn-primary" onclick="window.brandsUI.saveBrand()">
                                <span id="saveButtonText">Créer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Charger les données après le rendu
        setTimeout(() => {
            this.loadBrands();
            this.setupEventListeners();
        }, 100);

        return content;
    }

    /**
     * Initialiser le module après le rendu
     */
    init() {
        console.log('Brands UI initialized');
    }

    /**
     * Configurer les gestionnaires d'événements
     */
    setupEventListeners() {
        // Recherche en temps réel avec debounce
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', window.utils.debounce((e) => {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadBrands();
            }, 300));
        }

        // Changement de tri
        const sortSelect = document.getElementById('sort-select');
        const orderSelect = document.getElementById('order-select');

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                this.sortBy = sortSelect.value;
                this.currentPage = 1;
                this.loadBrands();
            });
        }

        if (orderSelect) {
            orderSelect.addEventListener('change', () => {
                this.sortOrder = orderSelect.value;
                this.currentPage = 1;
                this.loadBrands();
            });
        }
    }

    /**
     * Charger la liste des marques
     */
    async loadBrands() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                search: this.searchQuery,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
            };

            const response = await window.api.getBrands(params);

            if (response.success) {
                this.brands = response.data.brands;
                this.totalPages = response.data.pagination.totalPages;
                this.updateTable();
                this.updatePagination(response.data.pagination);
                this.updateCount(response.data.pagination.total);
            } else {
                throw new Error(response.error || 'Erreur lors du chargement');
            }

        } catch (error) {
            console.error('Erreur lors du chargement des marques:', error);
            this.showError('Erreur lors du chargement des marques');
        }
    }

    /**
     * Mettre à jour le tableau
     */
    updateTable() {
        const tbody = document.getElementById('brands-table-body');
        if (!tbody) return;

        if (this.brands.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-muted">
                            <i class="bi bi-bookmark display-4 mb-2"></i>
                            <p>Aucune marque trouvée</p>
                            <button class="btn btn-primary" onclick="window.brandsUI.showCreateModal()">
                                Créer la première marque
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.brands.map(brand => {
            const logoImg = brand.logo_url ?
                `<img src="${brand.logo_url}" alt="${brand.name}" class="img-thumbnail" style="width: 40px; height: 40px; object-fit: contain;">` :
                `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="bi bi-image text-muted"></i>
                </div>`;

            return `
                <tr>
                    <td>${logoImg}</td>
                    <td>
                        <div class="fw-bold">${window.utils.escapeHtml(brand.name)}</div>
                    </td>
                    <td>
                        <span class="badge bg-secondary">${window.utils.escapeHtml(brand.country || 'N/A')}</span>
                    </td>
                    <td>
                        <span class="badge bg-primary">${brand.model_count || 0} modèles</span>
                    </td>
                    <td>
                        <small class="text-muted">${window.utils.formatDate(brand.created_at, 'date')}</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary" 
                                    onclick="window.brandsUI.editBrand(${brand.id})"
                                    title="Modifier">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-info" 
                                    onclick="window.brandsUI.viewBrand(${brand.id})"
                                    title="Voir détails">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-danger" 
                                    onclick="window.brandsUI.deleteBrand(${brand.id}, '${window.utils.escapeHtml(brand.name)}')"
                                    title="Supprimer">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Mettre à jour la pagination
     */
    updatePagination(pagination) {
        const container = document.getElementById('pagination-container');
        if (!container) return;

        if (pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const current = pagination.page;
        const total = pagination.totalPages;

        let paginationHtml = '<nav><ul class="pagination justify-content-center mb-0">';

        // Bouton précédent
        paginationHtml += `
            <li class="page-item ${current <= 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="window.brandsUI.goToPage(${current - 1})" ${current <= 1 ? 'disabled' : ''}>
                    Précédent
                </button>
            </li>
        `;

        // Pages
        const startPage = Math.max(1, current - 2);
        const endPage = Math.min(total, current + 2);

        if (startPage > 1) {
            paginationHtml += `
                <li class="page-item">
                    <button class="page-link" onclick="window.brandsUI.goToPage(1)">1</button>
                </li>
            `;
            if (startPage > 2) {
                paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <li class="page-item ${i === current ? 'active' : ''}">
                    <button class="page-link" onclick="window.brandsUI.goToPage(${i})">${i}</button>
                </li>
            `;
        }

        if (endPage < total) {
            if (endPage < total - 1) {
                paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            paginationHtml += `
                <li class="page-item">
                    <button class="page-link" onclick="window.brandsUI.goToPage(${total})">${total}</button>
                </li>
            `;
        }

        // Bouton suivant
        paginationHtml += `
            <li class="page-item ${current >= total ? 'disabled' : ''}">
                <button class="page-link" onclick="window.brandsUI.goToPage(${current + 1})" ${current >= total ? 'disabled' : ''}>
                    Suivant
                </button>
            </li>
        `;

        paginationHtml += '</ul></nav>';
        container.innerHTML = paginationHtml;
    }

    /**
     * Mettre à jour le compteur
     */
    updateCount(total) {
        const countElement = document.getElementById('brands-count');
        if (countElement) {
            countElement.textContent = `${total} marque${total !== 1 ? 's' : ''} au total`;
        }
    }

    /**
     * Aller à une page spécifique
     */
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.currentPage = page;
            this.loadBrands();
        }
    }

    /**
     * Appliquer les filtres
     */
    applyFilters() {
        this.currentPage = 1;
        this.loadBrands();
    }

    /**
     * Actualiser la liste
     */
    async refresh() {
        await this.loadBrands();
        window.notifications?.success('Liste des marques actualisée', { duration: 2000 });
    }

    /**
     * Afficher le modal de création
     */
    showCreateModal() {
        this.resetForm();
        document.getElementById('brandModalTitle').textContent = 'Nouvelle marque';
        document.getElementById('saveButtonText').textContent = 'Créer';

        const modal = new bootstrap.Modal(document.getElementById('brandModal'));
        modal.show();
    }

    /**
     * Modifier une marque
     */
    async editBrand(id) {
        try {
            const response = await window.api.getBrand(id);

            if (response.success) {
                const brand = response.data;

                document.getElementById('brandId').value = brand.id;
                document.getElementById('brandName').value = brand.name;
                document.getElementById('brandCountry').value = brand.country || '';
                document.getElementById('brandLogo').value = brand.logo_url || '';

                document.getElementById('brandModalTitle').textContent = 'Modifier la marque';
                document.getElementById('saveButtonText').textContent = 'Modifier';

                const modal = new bootstrap.Modal(document.getElementById('brandModal'));
                modal.show();
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la marque:', error);
            window.notifications?.error('Erreur lors du chargement de la marque');
        }
    }

    /**
     * Voir les détails d'une marque
     */
    async viewBrand(id) {
        try {
            const response = await window.api.getBrand(id);

            if (response.success) {
                const brand = response.data;

                window.notifications?.info(`
                    <strong>${brand.name}</strong><br>
                    Pays: ${brand.country || 'N/A'}<br>
                    Modèles: ${brand.model_count || 0}<br>
                    Créée le: ${window.utils.formatDate(brand.created_at)}
                `, {
                    title: 'Détails de la marque',
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
            window.notifications?.error('Erreur lors du chargement des détails');
        }
    }

    /**
     * Supprimer une marque
     */
    async deleteBrand(id, name) {
        const confirmed = await window.notifications?.confirm(
            `Êtes-vous sûr de vouloir supprimer la marque "${name}" ?`,
            {
                title: 'Confirmer la suppression',
                confirmText: 'Supprimer',
                cancelText: 'Annuler',
                type: 'danger'
            }
        );

        if (confirmed) {
            try {
                const response = await window.api.deleteBrand(id);

                if (response.success) {
                    window.notifications?.success(`Marque "${name}" supprimée avec succès`);
                    await this.loadBrands();
                } else {
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                window.notifications?.error('Erreur lors de la suppression de la marque');
            }
        }
    }

    /**
     * Sauvegarder une marque
     */
    async saveBrand() {
        const form = document.getElementById('brandForm');
        const formData = new FormData(form);

        const brandData = {
            name: formData.get('brandName') || document.getElementById('brandName').value,
            country: formData.get('brandCountry') || document.getElementById('brandCountry').value,
            logo_url: formData.get('brandLogo') || document.getElementById('brandLogo').value
        };

        // Validation
        const errors = this.validateBrandData(brandData);
        if (Object.keys(errors).length > 0) {
            this.showValidationErrors(errors);
            return;
        }

        const brandId = document.getElementById('brandId').value;
        const isEdit = brandId && brandId !== '';

        try {
            let response;
            if (isEdit) {
                response = await window.api.updateBrand(brandId, brandData);
            } else {
                response = await window.api.createBrand(brandData);
            }

            if (response.success) {
                const action = isEdit ? 'modifiée' : 'créée';
                window.notifications?.success(`Marque "${brandData.name}" ${action} avec succès`);

                // Fermer le modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('brandModal'));
                modal.hide();

                // Recharger la liste
                await this.loadBrands();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            window.notifications?.error('Erreur lors de la sauvegarde de la marque');
        }
    }

    /**
     * Valider les données de marque
     */
    validateBrandData(data) {
        const errors = {};

        if (!data.name || data.name.trim().length === 0) {
            errors.name = 'Le nom de la marque est requis';
        } else if (data.name.length > 50) {
            errors.name = 'Le nom ne peut pas dépasser 50 caractères';
        }

        if (!data.country || data.country.trim().length === 0) {
            errors.country = 'Le pays est requis';
        }

        if (data.logo_url && !window.utils.validation.isValidUrl(data.logo_url)) {
            errors.logo_url = 'L\'URL du logo n\'est pas valide';
        }

        return errors;
    }

    /**
     * Afficher les erreurs de validation
     */
    showValidationErrors(errors) {
        // Nettoyer les erreurs précédentes
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

        Object.entries(errors).forEach(([field, message]) => {
            let inputId;
            switch (field) {
            case 'name': inputId = 'brandName'; break;
            case 'country': inputId = 'brandCountry'; break;
            case 'logo_url': inputId = 'brandLogo'; break;
            }

            if (inputId) {
                const input = document.getElementById(inputId);
                const feedback = input.nextElementSibling;

                if (input) {
                    input.classList.add('is-invalid');
                    if (feedback && feedback.classList.contains('invalid-feedback')) {
                        feedback.textContent = message;
                    }
                }
            }
        });
    }

    /**
     * Réinitialiser le formulaire
     */
    resetForm() {
        const form = document.getElementById('brandForm');
        if (form) {
            form.reset();
        }

        document.getElementById('brandId').value = '';

        // Nettoyer les classes d'erreur
        document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }

    /**
     * Afficher une erreur
     */
    showError(message) {
        const tbody = document.getElementById('brands-table-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-danger">
                            <i class="bi bi-exclamation-triangle display-4 mb-2"></i>
                            <p>${message}</p>
                            <button class="btn btn-outline-primary" onclick="window.brandsUI.loadBrands()">
                                Réessayer
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }
}

// Créer l'instance globale
window.brandsUI = new BrandsUI();
