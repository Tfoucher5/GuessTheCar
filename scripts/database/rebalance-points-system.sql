-- ============================================
-- Script de rééquilibrage du système de points
-- ============================================
-- Multiplie les points par 10 pour une progression plus rapide
-- Temps estimé pour Prestige 0 : ~1 mois de jeu régulier (2h/jour)

-- ============================================
-- Étape 1 : Multiplier les points de base par 10
-- ============================================

UPDATE models
SET base_points = base_points * 10
WHERE base_points IS NOT NULL;

-- Vérification des nouveaux points :
-- Commune :      10 → 100 points
-- Peu commune :  25 → 250 points
-- Rare :         50 → 500 points
-- Épique :      100 → 1,000 points
-- Légendaire :  200 → 2,000 points

-- ============================================
-- Étape 2 : Afficher les nouvelles statistiques
-- ============================================

SELECT
    rarity,
    MIN(base_points) as min_points,
    MAX(base_points) as max_points,
    AVG(base_points) as avg_points,
    COUNT(*) as total_models
FROM models
WHERE rarity IS NOT NULL
GROUP BY rarity
ORDER BY
    CASE rarity
        WHEN 'commune' THEN 1
        WHEN 'peu_commune' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epique' THEN 4
        WHEN 'legendaire' THEN 5
    END;

-- ============================================
-- Étape 3 : Calculer la moyenne pondérée par spawn_weight
-- ============================================

SELECT
    ROUND(SUM(base_points * spawn_weight) / SUM(spawn_weight)::numeric, 2) as moyenne_ponderee,
    ROUND(MIN(base_points), 0) as min_pts,
    ROUND(MAX(base_points), 0) as max_pts
FROM models
WHERE spawn_weight > 0 AND base_points > 0;

-- ============================================
-- Analyse de progression estimée
-- ============================================

-- Avec la nouvelle échelle :
-- - Moyenne pondérée : ~500-600 points/partie
-- - Niveau 20 (Prestige 0) : 1,000,000 points
-- - Parties nécessaires : ~1,800 parties
-- - À 2 min/partie : 60 heures de jeu
-- - À 2h/jour : 30 jours ✅

-- Avec bonus parfait sur légendaire :
-- - Base : 2,000 pts
-- - Vitesse x2.5 : 5,000 pts
-- - Premier coup x2.0 : 10,000 pts
-- - Sans aide x1.3 : 13,000 pts
-- - Déterminé x1.2 : 15,600 pts
-- - Jeu parfait x3.0 : 46,800 pts 🔥

-- ============================================
-- FIN DU SCRIPT
-- ============================================

COMMENT ON COLUMN models.base_points IS 'Points de base par rareté (×10 pour équilibrage): commune=100, peu_commune=250, rare=500, epique=1000, legendaire=2000';
