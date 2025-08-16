/* eslint-disable no-undef */
/**
 * Configuration globale de l'interface d'administration
 */

window.Config = {
    // Configuration de l'API
    API: {
        BASE_URL: '/api',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // Configuration de l'interface
    UI: {
        REFRESH_INTERVAL: 30000, // 30 secondes
        NOTIFICATION_DURATION: 5000, // 5 secondes
        TABLE_PAGE_SIZE: 25,
        MAX_TABLE_HEIGHT: '70vh',
        DEBOUNCE_DELAY: 300
    },

    // Configuration des modules
    MODULES: {
        dashboard: {
            autoRefresh: true,
            refreshInterval: 30000
        },
        brands: {
            pageSize: 25,
            sortBy: 'name',
            sortOrder: 'asc'
        },
        models: {
            pageSize: 25,
            sortBy: 'name',
            sortOrder: 'asc',
            showImages: true
        },
        players: {
            pageSize: 25,
            sortBy: 'total_points',
            sortOrder: 'desc'
        },
        games: {
            pageSize: 25,
            sortBy: 'started_at',
            sortOrder: 'desc',
            showDetails: false
        },
        analytics: {
            autoRefresh: true,
            refreshInterval: 60000,
            chartAnimations: true
        }
    },

    // Configuration du cache
    CACHE: {
        ENABLED: true,
        TTL: 300000, // 5 minutes
        MAX_SIZE: 100,
        KEYS: {
            DASHBOARD_STATS: 'dashboard_stats',
            BRANDS_LIST: 'brands_list',
            MODELS_LIST: 'models_list',
            PLAYERS_LIST: 'players_list',
            GAMES_LIST: 'games_list',
            ANALYTICS_DATA: 'analytics_data'
        }
    },

    // Messages d'erreur
    MESSAGES: {
        ERRORS: {
            NETWORK: 'Erreur de connexion réseau',
            SERVER: 'Erreur serveur interne',
            TIMEOUT: 'Délai d\'attente dépassé',
            UNAUTHORIZED: 'Accès non autorisé',
            NOT_FOUND: 'Ressource non trouvée',
            VALIDATION: 'Données invalides',
            UNKNOWN: 'Une erreur inattendue s\'est produite'
        },
        SUCCESS: {
            SAVE: 'Données sauvegardées avec succès',
            DELETE: 'Élément supprimé avec succès',
            UPDATE: 'Mise à jour effectuée avec succès',
            CREATE: 'Élément créé avec succès',
            EXPORT: 'Export terminé avec succès',
            IMPORT: 'Import terminé avec succès'
        },
        INFO: {
            LOADING: 'Chargement en cours...',
            SAVING: 'Sauvegarde en cours...',
            DELETING: 'Suppression en cours...',
            REFRESHING: 'Actualisation en cours...'
        }
    },

    // Configuration des validations
    VALIDATION: {
        BRAND: {
            name: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s\-&.]+$/
            },
            country: {
                required: true,
                minLength: 2,
                maxLength: 50
            }
        },
        MODEL: {
            name: {
                required: true,
                minLength: 1,
                maxLength: 100
            },
            brand_id: {
                required: true,
                type: 'number'
            },
            year: {
                required: false,
                min: 1900,
                max: new Date().getFullYear() + 2
            },
            difficulty_level: {
                required: true,
                min: 1,
                max: 3
            },
            image_url: {
                required: false,
                pattern: /^https?:\/\/.+/
            }
        },
        PLAYER: {
            user_id: {
                required: true,
                maxLength: 20,
                pattern: /^\d+$/
            },
            username: {
                required: true,
                minLength: 2,
                maxLength: 32
            }
        }
    },

    // Configuration des formats d'affichage
    FORMATS: {
        DATE: {
            SHORT: 'dd/MM/yyyy',
            LONG: 'dd/MM/yyyy HH:mm',
            TIME: 'HH:mm:ss'
        },
        NUMBER: {
            DECIMAL_PLACES: 2,
            THOUSAND_SEPARATOR: ' ',
            DECIMAL_SEPARATOR: ','
        }
    },

    // Configuration des couleurs par thème
    THEMES: {
        light: {
            primary: '#3b82f6',
            secondary: '#1e293b',
            success: '#10b981',
            danger: '#ef4444',
            warning: '#f59e0b',
            info: '#06b6d4'
        },
        dark: {
            primary: '#60a5fa',
            secondary: '#374151',
            success: '#34d399',
            danger: '#f87171',
            warning: '#fbbf24',
            info: '#22d3ee'
        }
    },

    // Configuration des permissions
    PERMISSIONS: {
        BRANDS: {
            VIEW: true,
            CREATE: true,
            EDIT: true,
            DELETE: true
        },
        MODELS: {
            VIEW: true,
            CREATE: true,
            EDIT: true,
            DELETE: true
        },
        PLAYERS: {
            VIEW: true,
            CREATE: true,
            EDIT: true,
            DELETE: true,
            RESET_STATS: true
        },
        GAMES: {
            VIEW: true,
            DELETE: true,
            EXPORT: true
        },
        ANALYTICS: {
            VIEW: true,
            EXPORT: true
        },
        MAINTENANCE: {
            VIEW: true,
            EXECUTE: true,
            BACKUP: true,
            CLEAR_CACHE: true
        }
    },

    // Configuration des exports
    EXPORT: {
        FORMATS: ['CSV', 'JSON', 'Excel'],
        MAX_ROWS: 10000,
        FILENAME_PREFIX: 'guessthecar_export_',
        DATE_FORMAT: 'YYYY-MM-DD_HH-mm-ss'
    },

    // Configuration du développement
    DEV: {
        ENABLED: window.location.hostname === 'localhost',
        LOG_LEVEL: 'debug',
        MOCK_DATA: false,
        PERFORMANCE_MONITORING: true
    }
};
