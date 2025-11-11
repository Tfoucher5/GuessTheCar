-- ============================================
-- Script de migration : Système de rareté
-- ============================================
-- Ce script ajoute un système de rareté aux voitures
-- basé sur leur présence en France

-- Étape 1 : Ajouter la colonne rarity
-- ============================================
ALTER TABLE models
ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'commune',
ADD COLUMN IF NOT EXISTS base_points INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS spawn_weight INTEGER DEFAULT 100;

-- Ajouter un commentaire sur la colonne
COMMENT ON COLUMN models.rarity IS 'Rareté de la voiture: commune, peu_commune, rare, epique, legendaire';
COMMENT ON COLUMN models.base_points IS 'Points de base gagnés en trouvant cette voiture';
COMMENT ON COLUMN models.spawn_weight IS 'Poids pour la probabilité d''apparition (utilisé pour le random weighted)';

-- Étape 2 : Supprimer les variantes électriques de la table game_sessions
-- ============================================
-- Supprimer les références dans game_sessions pour e-208 et e-2008
DELETE FROM game_sessions WHERE car_model_id IN (39, 40);

-- Étape 3 : Supprimer les variantes électriques
-- ============================================
DELETE FROM models WHERE id IN (39, 40);

-- Étape 4 : Mettre à jour les raretés - COMMUNE (45% de chance)
-- ============================================
-- spawn_weight: 450 (45%)

-- Peugeot - Très courantes en France
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (31, 32, 33, 34, 35, 37, 38);
-- 208, 308, 3008, 5008, 2008, Rifter, Partner

-- Renault - Très courantes en France
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (61, 62, 63, 65, 69, 70);
-- Clio, Megane, Captur, Scenic, Zoe, Twingo

-- Toyota - Modèles courants
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (1, 8);
-- Corolla, Yaris

-- Ford - Modèles courants
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (11, 12);
-- Focus, Fiesta

-- BMW - Modèles courants
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (25, 21, 26);
-- Serie 1, Serie 3, X1

-- Mercedes - Modèles courants
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (51, 52, 54);
-- Classe A, Classe C, GLA

-- Audi - Modèles courants
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (81);
-- A3

-- Honda
UPDATE models SET
    rarity = 'commune',
    base_points = 10,
    spawn_weight = 450,
    difficulty_level = 1
WHERE id IN (71);
-- Civic

-- Étape 5 : Mettre à jour les raretés - PEU COMMUNE (30% de chance)
-- ============================================
-- spawn_weight: 300 (30%)

-- Peugeot
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (36);
-- 508

-- Renault
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (64, 66, 67, 68);
-- Kadjar, Talisman, Koleos, Arkana

-- Toyota
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (2, 3, 5);
-- Camry, RAV4, Prius

-- Ford
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (13);
-- Mustang

-- BMW
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (22, 23, 24);
-- Serie 5, X3, X5

-- Mercedes
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (53, 55, 56, 60, 59);
-- Classe E, GLC, GLE, Classe S, EQS

-- Audi
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (82, 83, 84, 85, 86, 87);
-- A4, A6, Q3, Q5, Q7, TT

-- Honda
UPDATE models SET
    rarity = 'peu_commune',
    base_points = 25,
    spawn_weight = 300,
    difficulty_level = 2
WHERE id IN (72, 73, 74);
-- Accord, CR-V, HR-V

-- Étape 6 : Mettre à jour les raretés - RARE (18% de chance)
-- ============================================
-- spawn_weight: 180 (18%)

-- Toyota
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 2
WHERE id IN (4, 6, 7, 9, 10);
-- Highlander, Supra, Land Cruiser, Avalon, Sienna

-- Ford - Modèles US rares en France
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 2
WHERE id IN (14, 15, 16, 17, 18, 19, 20);
-- F-150, Explorer, Escape, Bronco, Edge, Ranger, Expedition

-- BMW
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 2
WHERE id IN (27, 29, 30);
-- M3, i4, iX

-- Mercedes
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 3
WHERE id IN (57, 58);
-- AMG GT, SL

-- Audi
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 2
WHERE id IN (89);
-- e-tron

-- Honda
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 2
WHERE id IN (75, 76, 77, 78, 80);
-- Pilot, Odyssey, Passport, Ridgeline, Insight

-- Chevrolet - Tous rares en France sauf sportives
UPDATE models SET
    rarity = 'rare',
    base_points = 50,
    spawn_weight = 180,
    difficulty_level = 2
WHERE id IN (91, 92, 93, 94, 100);
-- Cruze, Malibu, Equinox, Traverse, Blazer

-- Étape 7 : Mettre à jour les raretés - ÉPIQUE (6% de chance)
-- ============================================
-- spawn_weight: 60 (6%)

-- BMW
UPDATE models SET
    rarity = 'epique',
    base_points = 100,
    spawn_weight = 60,
    difficulty_level = 3
WHERE id IN (28);
-- M5

-- Audi
UPDATE models SET
    rarity = 'epique',
    base_points = 100,
    spawn_weight = 60,
    difficulty_level = 3
WHERE id IN (88, 90);
-- R8, RS6

-- Chevrolet - Sportives
UPDATE models SET
    rarity = 'epique',
    base_points = 100,
    spawn_weight = 60,
    difficulty_level = 3
WHERE id IN (95, 96, 97, 98, 99);
-- Silverado, Camaro, Corvette, Tahoe, Suburban

-- Honda
UPDATE models SET
    rarity = 'epique',
    base_points = 100,
    spawn_weight = 60,
    difficulty_level = 3
WHERE id IN (79);
-- NSX

-- Étape 8 : Mettre à jour les raretés - LÉGENDAIRE (1% de chance)
-- ============================================
-- spawn_weight: 10 (1%)

-- Ferrari - Tous les modèles sont légendaires
UPDATE models SET
    rarity = 'legendaire',
    base_points = 200,
    spawn_weight = 10,
    difficulty_level = 3
WHERE brand_id = 5;
-- Tous les Ferrari

-- Étape 9 : Créer un index pour améliorer les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_models_rarity ON models(rarity);
CREATE INDEX IF NOT EXISTS idx_models_spawn_weight ON models(spawn_weight);

-- Étape 10 : Créer une vue pour les statistiques de rareté
-- ============================================
CREATE OR REPLACE VIEW v_rarity_statistics AS
SELECT
    rarity,
    COUNT(*) as total_models,
    AVG(base_points) as avg_points,
    SUM(spawn_weight) as total_weight,
    ROUND((SUM(spawn_weight)::numeric / (SELECT SUM(spawn_weight) FROM models) * 100), 2) as percentage
FROM models
GROUP BY rarity
ORDER BY
    CASE rarity
        WHEN 'commune' THEN 1
        WHEN 'peu_commune' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epique' THEN 4
        WHEN 'legendaire' THEN 5
    END;

-- Étape 11 : Afficher les statistiques
-- ============================================
SELECT
    rarity,
    total_models,
    avg_points,
    percentage || '%' as spawn_probability
FROM v_rarity_statistics;

-- Étape 12 : Afficher un échantillon par rareté
-- ============================================
SELECT
    m.rarity,
    b.name as brand,
    m.name as model,
    m.base_points,
    m.spawn_weight,
    m.difficulty_level
FROM models m
JOIN brands b ON m.brand_id = b.id
ORDER BY
    CASE m.rarity
        WHEN 'commune' THEN 1
        WHEN 'peu_commune' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epique' THEN 4
        WHEN 'legendaire' THEN 5
    END,
    b.name,
    m.name;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
