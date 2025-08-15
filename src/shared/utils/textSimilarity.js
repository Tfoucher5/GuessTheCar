const gameConfig = require('../config/game');

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
function levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    // Initialisation
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j;
    }

    // Calcul de la distance
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j - 1] + 1,  // substitution
                    dp[i - 1][j] + 1,      // suppression
                    dp[i][j - 1] + 1       // insertion
                );
            }
        }
    }

    return dp[m][n];
}

/**
 * Calcule le pourcentage de similarité entre deux chaînes
 * @param {string} str1
 * @param {string} str2
 * @returns {number} - Pourcentage de 0 à 100
 */
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;

    const distance = levenshteinDistance(str1, str2);
    return ((maxLength - distance) / maxLength) * 100;
}

/**
 * Normalise une chaîne pour la comparaison
 * @param {string} str
 * @returns {string}
 */
function normalizeString(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Supprime la ponctuation
        .replace(/\s+/g, ' ');   // Normalise les espaces
}

/**
 * Vérifie si une réponse est correcte
 * @param {string} userAnswer
 * @param {string} correctAnswer
 * @returns {Object}
 */
function checkAnswer(userAnswer, correctAnswer) {
    if (!userAnswer || !correctAnswer) {
        return {
            isCorrect: false,
            similarity: 0,
            feedback: 'Réponse invalide'
        };
    }

    const normalizedUser = normalizeString(userAnswer);
    const normalizedCorrect = normalizeString(correctAnswer);

    // Vérification exacte
    if (normalizedUser === normalizedCorrect) {
        return {
            isCorrect: true,
            similarity: 100,
            feedback: 'Parfait ! Réponse exacte.'
        };
    }

    const similarity = calculateSimilarity(normalizedUser, normalizedCorrect);

    if (similarity >= gameConfig.SIMILARITY_THRESHOLDS.CORRECT) {
        return {
            isCorrect: true,
            similarity,
            feedback: 'Correct ! La réponse était légèrement différente mais suffisamment proche.'
        };
    } else if (similarity >= gameConfig.SIMILARITY_THRESHOLDS.CLOSE) {
        return {
            isCorrect: false,
            similarity,
            feedback: 'Presque ! Tu es sur la bonne voie.'
        };
    } else {
        return {
            isCorrect: false,
            similarity,
            feedback: 'Pas tout à fait, continue à chercher !'
        };
    }
}

/**
 * Vérifie si deux chaînes sont similaires selon un seuil
 * @param {string} str1
 * @param {string} str2
 * @param {number} threshold - Seuil de similarité (0-100)
 * @returns {boolean}
 */
function areSimilar(str1, str2, threshold = 75) {
    const similarity = calculateSimilarity(
        normalizeString(str1),
        normalizeString(str2)
    );
    return similarity >= threshold;
}

module.exports = {
    levenshteinDistance,
    calculateSimilarity,
    normalizeString,
    checkAnswer,
    areSimilar
};
