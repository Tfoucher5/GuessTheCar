/* eslint-disable no-undef */
/**
 * Utilitaires globaux pour l'interface d'administration
 */

window.utils = {
    /**
     * Formatage des dates
     */
    formatDate(dateString, format = 'datetime') {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';

        const options = {
            date: {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            },
            datetime: {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit'
            },
            full: {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }
        };

        return date.toLocaleDateString('fr-FR', options[format] || options.datetime);
    },

    /**
     * Formatage des nombres
     */
    formatNumber(number, decimals = 0) {
        if (typeof number !== 'number' || isNaN(number)) return '0';

        return number.toLocaleString('fr-FR', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Formatage des tailles de fichiers
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';

        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Tronquer du texte
     */
    truncateText(text, length = 50, suffix = '...') {
        if (!text || text.length <= length) return text;
        return text.substring(0, length) + suffix;
    },

    /**
     * Échapper le HTML
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
    },

    /**
     * Debounce fonction
     */
    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle fonction
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Manipulation du DOM
     */
    dom: {
        /**
         * Créer un élément avec attributs et contenu
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
                } else if (key === 'style' && typeof value === 'object') {
                    Object.assign(element.style, value);
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

        /**
         * Afficher/masquer des éléments
         */
        show(element) {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            if (element) {
                element.classList.remove('d-none', 'hidden');
                element.classList.add('d-block');
            }
        },

        hide(element) {
            if (typeof element === 'string') {
                element = document.getElementById(element);
            }
            if (element) {
                element.classList.remove('d-block');
                element.classList.add('d-none');
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
                    element.classList.contains('d-none') ? this.show(element) : this.hide(element);
                }
            }
        }
    },

    /**
     * Validation des données
     */
    validation: {
        /**
         * Valider un formulaire selon des règles
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

                // Pattern regex
                if (rule.pattern && !rule.pattern.test(value.toString())) {
                    errors[field] = rule.message || `Le format du champ ${field} est invalide`;
                    return;
                }

                // Validation personnalisée
                if (rule.custom && typeof rule.custom === 'function') {
                    const customError = rule.custom(value);
                    if (customError) {
                        errors[field] = customError;
                    }
                }
            });

            return {
                isValid: Object.keys(errors).length === 0,
                errors
            };
        },

        /**
         * Valider une adresse email
         */
        isValidEmail(email) {
            const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return pattern.test(email);
        },

        /**
         * Valider une URL
         */
        isValidUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }
    },

    /**
     * Gestion des paramètres d'URL
     */
    url: {
        /**
         * Récupérer les paramètres de l'URL
         */
        getParams() {
            return new URLSearchParams(window.location.search);
        },

        /**
         * Récupérer un paramètre spécifique
         */
        getParam(name) {
            return this.getParams().get(name);
        },

        /**
         * Mettre à jour un paramètre d'URL
         */
        setParam(name, value) {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.replaceState({}, '', url);
        },

        /**
         * Supprimer un paramètre d'URL
         */
        removeParam(name) {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.replaceState({}, '', url);
        }
    },

    /**
     * Gestion du stockage local
     */
    storage: {
        /**
         * Sauvegarder des données avec expiration
         */
        set(key, value, ttl = null) {
            const item = {
                value,
                timestamp: Date.now(),
                ttl
            };
            localStorage.setItem(key, JSON.stringify(item));
        },

        /**
         * Récupérer des données
         */
        get(key) {
            try {
                const item = JSON.parse(localStorage.getItem(key));
                if (!item) return null;

                // Vérifier l'expiration
                if (item.ttl && Date.now() - item.timestamp > item.ttl) {
                    localStorage.removeItem(key);
                    return null;
                }

                return item.value;
            } catch {
                return null;
            }
        },

        /**
         * Supprimer des données
         */
        remove(key) {
            localStorage.removeItem(key);
        },

        /**
         * Vider tout le stockage
         */
        clear() {
            localStorage.clear();
        }
    },

    /**
     * Utilitaires pour les tableaux
     */
    array: {
        /**
         * Grouper un tableau par une propriété
         */
        groupBy(array, key) {
            return array.reduce((result, item) => {
                const group = item[key];
                if (!result[group]) {
                    result[group] = [];
                }
                result[group].push(item);
                return result;
            }, {});
        },

        /**
         * Trier un tableau par une propriété
         */
        sortBy(array, key, direction = 'asc') {
            return [...array].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];

                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        },

        /**
         * Filtrer un tableau par recherche textuelle
         */
        search(array, query, fields) {
            if (!query) return array;

            const queryLower = query.toLowerCase();
            return array.filter(item => {
                return fields.some(field => {
                    const value = item[field];
                    return value && value.toString().toLowerCase().includes(queryLower);
                });
            });
        }
    },

    /**
     * Utilitaires pour les couleurs
     */
    color: {
        /**
         * Convertir une couleur hexadécimale en RGB
         */
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        /**
         * Générer une couleur aléatoire
         */
        random() {
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    },

    /**
     * Copier du texte dans le presse-papier
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            window.notifications?.success('Copié dans le presse-papier');
            return true;
        } catch (error) {
            console.error('Erreur lors de la copie:', error);
            window.notifications?.error('Impossible de copier dans le presse-papier');
            return false;
        }
    },

    /**
     * Télécharger des données sous forme de fichier
     */
    downloadFile(data, filename, type = 'text/plain') {
        const blob = new Blob([data], { type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Exporter des données en CSV
     */
    exportToCSV(data, filename = 'export.csv') {
        if (!data || data.length === 0) {
            window.notifications?.warning('Aucune donnée à exporter');
            return;
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row =>
                headers.map(header => {
                    const value = row[header];
                    // Échapper les guillemets et encapsuler si nécessaire
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        this.downloadFile(csvContent, filename, 'text/csv');
    },

    /**
     * Exporter des données en JSON
     */
    exportToJSON(data, filename = 'export.json') {
        if (!data) {
            window.notifications?.warning('Aucune donnée à exporter');
            return;
        }

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json');
    },

    /**
     * Vérifier si une valeur est vide
     */
    isEmpty(value) {
        return value === null ||
            value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && Object.keys(value).length === 0);
    },

    /**
     * Deep clone d'un objet
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));

        const clonedObj = {};
        Object.keys(obj).forEach(key => {
            clonedObj[key] = this.deepClone(obj[key]);
        });
        return clonedObj;
    },

    /**
     * Générer un ID unique
     */
    generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
     * Calculer le temps relatif (il y a X minutes/heures/jours)
     */
    timeAgo(date) {
        if (!date) return 'Jamais';

        const now = new Date();
        const past = new Date(date);
        const diffMs = now - past;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 30) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;

        return this.formatDate(date, 'date');
    }
};
