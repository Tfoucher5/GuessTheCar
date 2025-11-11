-- ============================================
-- Fix : Fonction RPC simplifiée pour Supabase
-- ============================================
-- Solution : Retourner seulement l'ID de la voiture sélectionnée
-- Le join avec brands sera fait côté JavaScript
-- Cela évite les problèmes de structure incompatible avec Supabase RPC

-- Étape 1 : Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS get_random_car_weighted();

-- Étape 2 : Créer une fonction qui retourne seulement l'ID
CREATE OR REPLACE FUNCTION get_random_car_weighted()
RETURNS INTEGER AS $$
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
        RETURN NULL;
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

    -- Retourner l'ID seulement
    RETURN selected_id;
END;
$$ LANGUAGE plpgsql;

-- Test de la fonction
SELECT get_random_car_weighted();

-- ============================================
-- Vérification : Tester plusieurs fois
-- ============================================
SELECT get_random_car_weighted() as car_id FROM generate_series(1, 10);

-- ============================================
-- FIN DU SCRIPT
-- ============================================
