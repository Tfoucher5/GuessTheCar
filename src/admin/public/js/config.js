/* eslint-disable no-undef */
window.Config = {
    API: {
        BASE_URL: '/api',
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    CACHE: {
        TTL: 5 * 60 * 1000, // 5 minutes
        MAX_SIZE: 100
    },

    PAGINATION: {
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    MESSAGES: {
        ERRORS: {
            NETWORK: 'Erreur de connexion au serveur',
            TIMEOUT: 'Délai d\'attente dépassé',
            NOT_FOUND: 'Ressource non trouvée',
            UNAUTHORIZED: 'Accès non autorisé',
            SERVER: 'Erreur interne du serveur',
            UNKNOWN: 'Une erreur inattendue s\'est produite'
        },
        SUCCESS: {
            CREATED: 'Élément créé avec succès',
            UPDATED: 'Élément mis à jour avec succès',
            DELETED: 'Élément supprimé avec succès'
        },
        CONFIRM: {
            DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
            RESET: 'Êtes-vous sûr de vouloir réinitialiser ?'
        }
    },

    DIFFICULTIES: {
        1: { label: 'Facile', color: 'success' },
        2: { label: 'Moyen', color: 'warning' },
        3: { label: 'Difficile', color: 'danger' }
    },

    REFRESH_INTERVALS: {
        DASHBOARD: 30000, // 30 seconds
        TABLES: 60000     // 1 minute
    }
};
