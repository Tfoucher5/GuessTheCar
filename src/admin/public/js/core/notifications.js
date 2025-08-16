/* eslint-disable no-undef */
/**
 * Gestionnaire de notifications pour l'interface d'administration
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaultDuration = window.Config?.UI?.NOTIFICATION_DURATION || 5000;
        this.init();
    }

    init() {
        this.createContainer();
    }

    createContainer() {
        // Chercher le container existant
        this.container = document.getElementById('alert-container');

        // Si pas trouvé, le créer
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'alert-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1050;
                min-width: 300px;
                max-width: 500px;
            `;
            document.body.appendChild(this.container);
        }
    }

    /**
     * Afficher une notification de succès
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Afficher une notification d'erreur
     */
    error(message, options = {}) {
        return this.show(message, 'danger', options);
    }

    /**
     * Afficher une notification d'avertissement
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Afficher une notification d'information
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Afficher une notification générique
     */
    show(message, type = 'info', options = {}) {
        const config = {
            title: options.title || this.getDefaultTitle(type),
            duration: options.duration !== undefined ? options.duration : this.defaultDuration,
            dismissible: options.dismissible !== false,
            persistent: options.persistent === true,
            action: options.action || null,
            id: options.id || this.generateId()
        };

        // Créer l'élément de notification
        const notification = this.createElement(message, type, config);

        // Ajouter au container
        this.container.appendChild(notification);

        // Stocker la référence
        this.notifications.set(config.id, {
            element: notification,
            type,
            message,
            config
        });

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto-suppression si pas persistante
        if (!config.persistent && config.duration > 0) {
            setTimeout(() => {
                this.dismiss(config.id);
            }, config.duration);
        }

        return config.id;
    }

    /**
     * Créer l'élément DOM de la notification
     */
    createElement(message, type, config) {
        const alertClass = `alert-${type}`;
        const iconClass = this.getIconClass(type);

        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade mb-3`;
        notification.setAttribute('role', 'alert');
        notification.dataset.notificationId = config.id;

        const icon = iconClass ? `<i class="bi ${iconClass} me-2"></i>` : '';
        const title = config.title ? `<strong>${config.title}</strong><br>` : '';
        const dismissButton = config.dismissible ? `
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        ` : '';

        const actionButton = config.action ? `
            <div class="mt-2">
                <button type="button" class="btn btn-sm btn-outline-${type}" onclick="${config.action.handler}">
                    ${config.action.text}
                </button>
            </div>
        ` : '';

        notification.innerHTML = `
            ${icon}${title}${message}
            ${actionButton}
            ${dismissButton}
        `;

        // Gérer la fermeture manuelle
        if (config.dismissible) {
            const closeBtn = notification.querySelector('.btn-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.dismiss(config.id);
                });
            }
        }

        return notification;
    }

    /**
     * Fermer une notification
     */
    dismiss(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;

        const element = notification.element;

        // Animation de sortie
        element.classList.remove('show');
        element.classList.add('fade');

        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.notifications.delete(id);
        }, 150);
    }

    /**
     * Fermer toutes les notifications
     */
    dismissAll() {
        this.notifications.forEach((_, id) => {
            this.dismiss(id);
        });
    }

    /**
     * Fermer toutes les notifications d'un type
     */
    dismissByType(type) {
        this.notifications.forEach((notification, id) => {
            if (notification.type === type) {
                this.dismiss(id);
            }
        });
    }

    /**
     * Notification de confirmation avec actions
     */
    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const config = {
                title: options.title || 'Confirmation',
                persistent: true,
                dismissible: false,
                confirmText: options.confirmText || 'Confirmer',
                cancelText: options.cancelText || 'Annuler',
                type: options.type || 'warning'
            };

            const id = this.generateId();
            const notification = document.createElement('div');
            notification.className = `alert alert-${config.type} alert-dismissible fade mb-3`;
            notification.setAttribute('role', 'alert');
            notification.dataset.notificationId = id;

            const icon = this.getIconClass(config.type);
            const iconHtml = icon ? `<i class="bi ${icon} me-2"></i>` : '';

            notification.innerHTML = `
                ${iconHtml}<strong>${config.title}</strong><br>
                ${message}
                <div class="mt-3">
                    <button type="button" class="btn btn-sm btn-${config.type} me-2" data-action="confirm">
                        ${config.confirmText}
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-action="cancel">
                        ${config.cancelText}
                    </button>
                </div>
            `;

            // Gestionnaires d'événements
            notification.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    this.dismiss(id);
                } else if (action === 'cancel') {
                    resolve(false);
                    this.dismiss(id);
                }
            });

            this.container.appendChild(notification);
            this.notifications.set(id, {
                element: notification,
                type: config.type,
                message,
                config
            });

            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
        });
    }

    /**
     * Notification de progression
     */
    progress(message, options = {}) {
        const config = {
            title: options.title || 'Chargement...',
            persistent: true,
            dismissible: false,
            progress: options.progress || 0
        };

        const id = this.generateId();
        const notification = document.createElement('div');
        notification.className = 'alert alert-info fade mb-3';
        notification.dataset.notificationId = id;

        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <div class="flex-grow-1">
                    <strong>${config.title}</strong><br>
                    <small>${message}</small>
                    <div class="progress mt-2" style="height: 6px;">
                        <div class="progress-bar" role="progressbar" style="width: ${config.progress}%"></div>
                    </div>
                </div>
            </div>
        `;

        this.container.appendChild(notification);
        this.notifications.set(id, {
            element: notification,
            type: 'progress',
            message,
            config
        });

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        return {
            id,
            updateProgress: (progress, newMessage) => {
                const stored = this.notifications.get(id);
                if (stored) {
                    const progressBar = stored.element.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.width = `${progress}%`;
                    }
                    if (newMessage) {
                        const messageElement = stored.element.querySelector('small');
                        if (messageElement) {
                            messageElement.textContent = newMessage;
                        }
                    }
                }
            },
            complete: (successMessage) => {
                this.dismiss(id);
                if (successMessage) {
                    this.success(successMessage);
                }
            },
            error: (errorMessage) => {
                this.dismiss(id);
                this.error(errorMessage);
            }
        };
    }

    /**
     * Utilitaires
     */
    getDefaultTitle(type) {
        const titles = {
            success: 'Succès',
            danger: 'Erreur',
            warning: 'Attention',
            info: 'Information'
        };
        return titles[type] || 'Notification';
    }

    getIconClass(type) {
        const icons = {
            success: 'bi-check-circle',
            danger: 'bi-exclamation-triangle',
            warning: 'bi-exclamation-circle',
            info: 'bi-info-circle'
        };
        return icons[type] || '';
    }

    generateId() {
        return 'notification-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Compter les notifications actives
     */
    getCount() {
        return this.notifications.size;
    }

    /**
     * Vérifier si une notification existe
     */
    exists(id) {
        return this.notifications.has(id);
    }
}

// Créer l'instance globale
window.notifications = new NotificationManager();
