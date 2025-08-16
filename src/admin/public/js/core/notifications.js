/* eslint-disable no-undef */
/**
 * Système de notifications toast
 */

class NotificationManager {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.defaultDuration = window.Config.UI.NOTIFICATION_DURATION;
        this.init();
    }

    init() {
        // Créer le container s'il n'existe pas
        this.container = document.getElementById('notifications-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notifications-container';
            this.container.className = 'fixed top-20 right-4 z-50 space-y-2';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Créer une notification
     */
    create(message, type = 'info', duration = null, options = {}) {
        const id = this.generateId();
        const notification = this.buildNotification(id, message, type, options);
        // Ajouter au container
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('notification');
        }, 10);

        // Auto-suppression
        if (duration !== 0) {
            const timeoutDuration = duration || this.defaultDuration;
            setTimeout(() => {
                this.remove(id);
            }, timeoutDuration);
        }

        // Limiter le nombre de notifications
        this.limitNotifications();

        return id;
    }

    /**
     * Construire l'élément notification
     */
    buildNotification(id, message, type, options) {
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = `notification notification-${type} rounded-lg shadow-lg`;
        notification.setAttribute('data-type', type);

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const icon = icons[type] || icons.info;

        notification.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <i class="fas ${icon} text-lg"></i>
                </div>
                <div class="ml-3 flex-1">
                    ${options.title ? `<h4 class="font-medium mb-1">${options.title}</h4>` : ''}
                    <p class="text-sm">${message}</p>
                    ${options.actions ? `
                        <div class="mt-2 flex gap-2">
                            ${options.actions}
                        </div>
                    ` : ''}
                </div>
                <div class="ml-3 flex-shrink-0">
                    <button onclick="window.notifications.remove('${id}')" 
                            class="text-current opacity-70 hover:opacity-100 transition-opacity">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            ${options.progress ? `
                <div class="mt-2">
                    <div class="w-full bg-black bg-opacity-20 rounded-full h-1">
                        <div class="bg-current h-1 rounded-full transition-all duration-1000" 
                             style="width: ${options.progress}%"></div>
                    </div>
                </div>
            ` : ''}
        `;

        // Événements
        notification.addEventListener('click', () => {
            if (options.onClick) {
                options.onClick();
            }
        });

        return notification;
    }

    /**
     * Supprimer une notification
     */
    remove(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            // Animation de sortie
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    /**
     * Supprimer toutes les notifications
     */
    clear() {
        this.notifications.forEach((_, id) => {
            this.remove(id);
        });
    }

    /**
     * Limiter le nombre de notifications affichées
     */
    limitNotifications(max = 5) {
        if (this.notifications.size > max) {
            const oldestId = this.notifications.keys().next().value;
            this.remove(oldestId);
        }
    }

    /**
     * Générer un ID unique
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Méthodes raccourcies pour chaque type
     */
    success(message, duration, options = {}) {
        return this.create(message, 'success', duration, options);
    }

    error(message, duration, options = {}) {
        return this.create(message, 'error', duration, options);
    }

    warning(message, duration, options = {}) {
        return this.create(message, 'warning', duration, options);
    }

    info(message, duration, options = {}) {
        return this.create(message, 'info', duration, options);
    }

    /**
     * Notifications spécialisées
     */
    loading(message = 'Chargement...', options = {}) {
        return this.create(message, 'info', 0, {
            ...options,
            title: options.title || 'Traitement en cours',
            progress: 0
        });
    }

    updateProgress(id, progress, message) {
        const notification = this.notifications.get(id);
        if (notification) {
            const progressBar = notification.querySelector('.bg-current');
            const messageElement = notification.querySelector('p');
            if (progressBar) {
                progressBar.style.width = `${progress}%`;
            }
            if (messageElement && message) {
                messageElement.textContent = message;
            }
        }
    }

    confirmAction(message, onConfirm, onCancel = null) {
        const actions = `
            <button onclick="window.notifications.handleConfirm('${this.generateId()}', true)" 
                    class="btn btn-sm btn-danger">
                Confirmer
            </button>
            <button onclick="window.notifications.handleConfirm('${this.generateId()}', false)" 
                    class="btn btn-sm btn-secondary ml-2">
                Annuler
            </button>
        `;

        const id = this.create(message, 'warning', 0, {
            title: 'Confirmation requise',
            actions
        });

        // Stocker les callbacks
        this._confirmCallbacks = this._confirmCallbacks || new Map();
        this._confirmCallbacks.set(id, { onConfirm, onCancel });

        return id;
    }

    handleConfirm(id, confirmed) {
        const callbacks = this._confirmCallbacks?.get(id);
        if (callbacks) {
            if (confirmed && callbacks.onConfirm) {
                callbacks.onConfirm();
            } else if (!confirmed && callbacks.onCancel) {
                callbacks.onCancel();
            }
            this._confirmCallbacks.delete(id);
        }
        this.remove(id);
    }

    /**
     * Notification avec action personnalisée
     */
    action(message, actionText, actionCallback, options = {}) {
        const actionId = this.generateId();
        const actions = `
            <button onclick="window.notifications.handleAction('${actionId}')" 
                    class="btn btn-sm btn-primary">
                ${actionText}
            </button>
        `;

        const id = this.create(message, options.type || 'info', options.duration, {
            ...options,
            actions
        });

        // Stocker le callback
        this._actionCallbacks = this._actionCallbacks || new Map();
        this._actionCallbacks.set(actionId, actionCallback);

        return id;
    }

    handleAction(actionId) {
        const callback = this._actionCallbacks?.get(actionId);
        if (callback) {
            callback();
            this._actionCallbacks.delete(actionId);
        }
    }

    /**
     * Notifications système spécialisées
     */
    networkError() {
        return this.error(
            'Problème de connexion réseau. Vérifiez votre connexion.',
            0,
            {
                title: 'Erreur réseau',
                actions: `
                    <button onclick="location.reload()" class="btn btn-sm btn-primary">
                        Recharger
                    </button>
                `
            }
        );
    }

    serverError() {
        return this.error(
            'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.',
            0,
            {
                title: 'Erreur serveur'
            }
        );
    }

    dataLoaded(count, type = 'éléments') {
        return this.success(`${count} ${type} chargé(s) avec succès`);
    }

    dataSaved(type = 'Données') {
        return this.success(`${type} sauvegardées avec succès`);
    }

    dataDeleted(type = 'Élément') {
        return this.success(`${type} supprimé avec succès`);
    }

    validationError(errors) {
        const errorList = Object.values(errors).join('<br>');
        return this.error(errorList, 0, {
            title: 'Erreurs de validation'
        });
    }

    exportComplete(filename) {
        return this.success(
            `Export terminé: ${filename}`,
            0,
            {
                title: 'Export réussi',
                actions: `
                    <button onclick="window.notifications.remove(this.closest('.notification').id.replace('notification-', ''))" 
                            class="btn btn-sm btn-primary">
                        OK
                    </button>
                `
            }
        );
    }
}

// Ajouter les styles CSS pour les animations
const notificationStyles = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Instance globale
window.notifications = new NotificationManager();
