module.exports = [
    // Fonction pour calculer la distance de Levenshtein
    function levenshteinDistance(str1, str2) {
        const m = str1.length;
        const n = str2.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

        for (let i = 0; i <= m; i++) {
            dp[i][0] = i;
        }
        for (let j = 0; j <= n; j++) {
            dp[0][j] = j;
        }

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
    },

    // Fonction pour calculer le pourcentage de similarité
    function calculateSimilarity(str1, str2) {
        const maxLength = Math.max(str1.length, str2.length);
        const distance = levenshteinDistance(str1, str2);
        return ((maxLength - distance) / maxLength) * 100;
    },

    // Fonction modifiée pour gérer la vérification des réponses
    function checkAnswer(userAnswer, correctAnswer) {
        const similarity = calculateSimilarity(userAnswer.toLowerCase(), correctAnswer.toLowerCase());

        if (similarity >= 75) {
            return {
                isCorrect: true,
                feedback: "Correct ! La réponse était légèrement différente mais suffisamment proche."
            };
        } else if (similarity >= 50) {
            return {
                isCorrect: false,
                feedback: "Presque ! Tu es sur la bonne voie."
            };
        } else {
            return {
                isCorrect: false,
                feedback: "Pas tout à fait, continue à chercher !"
            };
        }
    }
];