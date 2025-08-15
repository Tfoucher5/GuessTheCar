module.exports = {
    GAME_TIMEOUT: 5 * 60 * 1000, // 5 minutes en millisecondes
    MAX_ATTEMPTS: 10,
    MAX_CAR_CHANGES: 3,
    THREAD_CLOSE_DELAY: 60 * 1000, // 1 minute

    DIFFICULTY: {
        EASY: 1,
        MEDIUM: 2,
        HARD: 3
    },

    DIFFICULTY_MULTIPLIERS: {
        1: 1,     // Facile
        2: 1.5,   // Moyen
        3: 2      // Difficile
    },

    POINTS: {
        FULL_SUCCESS: 1,
        PARTIAL_SUCCESS: 0.5
    },

    HINTS: {
        FIRST_LETTER_ATTEMPT: 5,
        LAST_LETTER_ATTEMPT: 7
    },

    LEADERBOARD_SIZE: 10,

    SIMILARITY_THRESHOLDS: {
        CORRECT: 75,
        CLOSE: 50
    }
};
