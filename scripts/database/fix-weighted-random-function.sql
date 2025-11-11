-- ============================================
-- Fix : Fonction RPC corrigée pour Supabase
-- ============================================
-- Problème : La fonction précédente avait une structure incompatible avec Supabase RPC
-- Solution : Utiliser un type composite et simplifier le retour

-- Étape 1 : Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS get_random_car_weighted();

-- Étape 2 : Créer la nouvelle fonction optimisée pour Supabase
CREATE OR REPLACE FUNCTION get_random_car_weighted()
RETURNS SETOF models AS $$
DECLARE
    total_weight BIGINT;
    random_value BIGINT;
    selected_id INTEGER;
BEGIN
    -- Calculer le poids total de tous les modèles
    SELECT SUM(spawn_weight) INTO total_weight
    FROM models
    WHERE spawn_weight > 0 AND rarity IS NOT NULL;

    -- Si aucun modèle n'a de poids, retourner null
    IF total_weight IS NULL OR total_weight = 0 THEN
        RETURN;
    END IF;

    -- Générer un nombre aléatoire entre 0 et total_weight
    random_value := floor(random() * total_weight)::BIGINT;

    -- Sélectionner l'ID de la voiture correspondant au poids cumulatif
    SELECT id INTO selected_id
    FROM (
        SELECT
            m.id,
            SUM(m.spawn_weight) OVER (ORDER BY m.id) AS cumulative_weight
        FROM models m
        WHERE m.spawn_weight > 0 AND m.rarity IS NOT NULL
    ) cw
    WHERE cw.cumulative_weight >= random_value
    ORDER BY cw.cumulative_weight
    LIMIT 1;

    -- Retourner la ligne complète de models
    RETURN QUERY
    SELECT * FROM models WHERE id = selected_id;
END;
$$ LANGUAGE plpgsql;

-- Test de la fonction
SELECT * FROM get_random_car_weighted();

-- ============================================
-- FIN DU SCRIPT
-- ============================================
