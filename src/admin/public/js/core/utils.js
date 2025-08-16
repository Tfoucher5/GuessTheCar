/* eslint-disable no-undef */
/**
 * Fonctions utilitaires pour l'interface d'administration
 */

window.utils = {
    /**
     * Formatage des données
     */
    formatNumber(num, decimals = 0) {
        if (num === null || num === undefined || isNaN(num)) return '-';
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    },

    formatPercent(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) return '-';
        return new Intl.NumberFormat('fr-FR', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value / 100);
    },

    formatDate(date, format = 'short') {
        if (!date) return '-';

        const d = new Date(date);
        if (isNaN(d.getTime())) return '-';

        const options = {
            short: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            },
            long: {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        };

        return new Intl.DateTimeFormat('fr-FR', options[format] || options.short).format(d);
    },

    formatDuration(seconds) {
        if (!seconds || seconds < 0) return '-';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    formatUptime(seconds) {
        if (!seconds || seconds < 0) return '-';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}j ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    },

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Manipulation du DOM
     */
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);

        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else {
                element.setAttribute(key, value);
            }
        });

        if (content) {
            if (typeof content === 'string') {
                element.innerHTML = content;
            } else {
                element.appendChild(content);
            }
        }

        return element;
    },

    show(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove('hidden', 'hide');
            element.classList.add('show');
        }
    },

    hide(element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.classList.remove('show');
            element.classList.add('hidden');
        }
    },

    toggle(element, force) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            if (force !== undefined) {
                force ? this.show(element) : this.hide(element);
            } else {
                element.classList.contains('hidden') ? this.show(element) : this.hide(element);
            }
        }
    },

    /**
     * Validation des données
     */
    validateForm(formData, rules) {
        const errors = {};

        Object.entries(rules).forEach(([field, rule]) => {
            const value = formData[field];

            // Champ requis
            if (rule.required && (!value || value.toString().trim() === '')) {
                errors[field] = `Le champ ${field} est requis`;
                return;
            }

            // Si pas de valeur et pas requis, skip les autres validations
            if (!value && !rule.required) return;

            // Type
            if (rule.type && typeof value !== rule.type) {
                errors[field] = `Le champ ${field} doit être de type ${rule.type}`;
                return;
            }

            // Longueur minimum
            if (rule.minLength && value.toString().length < rule.minLength) {
                errors[field] = `Le champ ${field} doit contenir au moins ${rule.minLength} caractères`;
                return;
            }

            // Longueur maximum
            if (rule.maxLength && value.toString().length > rule.maxLength) {
                errors[field] = `Le champ ${field} ne peut pas dépasser ${rule.maxLength} caractères`;
                return;
            }

            // Valeur minimum
            if (rule.min !== undefined && Number(value) < rule.min) {
                errors[field] = `Le champ ${field} doit être supérieur ou égal à ${rule.min}`;
                return;
            }

            // Valeur maximum
            if (rule.max !== undefined && Number(value) > rule.max) {
                errors[field] = `Le champ ${field} doit être inférieur ou égal à ${rule.max}`;
                return;
            }

            // Pattern regex
            if (rule.pattern && !rule.pattern.test(value.toString())) {
                errors[field] = `Le format du champ ${field} est invalide`;
                return;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Gestion des URLs et paramètres
     */
    getURLParams() {
        return new URLSearchParams(window.location.search);
    },

    setURLParam(key, value) {
        const url = new URL(window.location);
        url.searchParams.set(key, value);
        window.history.replaceState({}, '', url);
    },

    removeURLParam(key) {
        const url = new URL(window.location);
        url.searchParams.delete(key);
        window.history.replaceState({}, '', url);
    },

    /**
     * Utilitaires pour les tableaux
     */
    sortArray(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = this.getNestedValue(a, key);
            let bVal = this.getNestedValue(b, key);

            // Gestion des valeurs nulles/undefined
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';

            // Conversion en string pour tri naturel
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (direction === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    },

    filterArray(array, filters) {
        return array.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;

                const itemValue = this.getNestedValue(item, key);
                if (itemValue === null || itemValue === undefined) return false;

                if (typeof value === 'string') {
                    return itemValue.toString().toLowerCase().includes(value.toLowerCase());
                } else {
                    return itemValue === value;
                }
            });
        });
    },

    paginateArray(array, page, pageSize) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return {
            data: array.slice(startIndex, endIndex),
            total: array.length,
            page,
            pageSize,
            totalPages: Math.ceil(array.length / pageSize)
        };
    },

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    },

    /**
     * Debounce et throttle
     */
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
    },

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Export/Import
     */
    downloadBlob(blob, filename) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    generateFilename(prefix, extension) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
        return `${prefix}${timestamp}.${extension}`;
    },

    /**
     * Copier dans le presse-papier
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Erreur lors de la copie:', err);
            return false;
        }
    },

    /**
     * Générateurs d'éléments UI
     */
    createDifficultyBadge(level) {
        const labels = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' };
        const classes = { 1: 'difficulty-1', 2: 'difficulty-2', 3: 'difficulty-3' };

        return this.createElement('span', {
            className: `difficulty-badge ${classes[level] || ''}`
        }, labels[level] || 'Inconnu');
    },

    createStatusBadge(status, customLabels = {}) {
        const defaultLabels = {
            active: 'Actif',
            inactive: 'Inactif',
            completed: 'Terminé',
            abandoned: 'Abandonné',
            timeout: 'Timeout',
            online: 'En ligne',
            offline: 'Hors ligne'
        };

        const labels = { ...defaultLabels, ...customLabels };

        return this.createElement('span', {
            className: `status-badge status-${status}`
        }, labels[status] || status);
    },

    createActionButton(icon, tooltip, onclick, className = 'btn btn-sm btn-secondary') {
        return this.createElement('button', {
            className,
            title: tooltip,
            onclick
        }, `<i class="fas fa-${icon}"></i>`);
    },

    /**
     * Loading states
     */
    showLoading(element, message = 'Chargement...') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-spinner loading-spinner text-2xl mb-2"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    },

    showError(element, message = 'Une erreur est survenue') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8 text-red-500">
                    <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn-sm btn-primary mt-4">
                        Réessayer
                    </button>
                </div>
            `;
        }
    },

    showEmpty(element, message = 'Aucune donnée disponible') {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        if (element) {
            element.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-2xl mb-2"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }
};
