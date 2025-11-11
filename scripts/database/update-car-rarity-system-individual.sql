-- ============================================
-- Script de migration : Système de rareté INDIVIDUEL
-- ============================================
-- Ce script ajoute un système de rareté aux voitures
-- basé sur leur présence INDIVIDUELLE en France
-- Version 2.0 - Rareté par modèle, pas par marque

-- Étape 1 : Ajouter les colonnes si elles n'existent pas
-- ============================================
ALTER TABLE models
ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'commune',
ADD COLUMN IF NOT EXISTS base_points INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS spawn_weight INTEGER DEFAULT 100;

COMMENT ON COLUMN models.rarity IS 'Rareté de la voiture: commune, peu_commune, rare, epique, legendaire';
COMMENT ON COLUMN models.base_points IS 'Points de base gagnés en trouvant cette voiture';
COMMENT ON COLUMN models.spawn_weight IS 'Poids pour la probabilité d''apparition (utilisé pour le random weighted)';

-- Étape 2 : Supprimer les références dans game_sessions pour les variantes
-- ============================================
-- Supprimer les références aux variantes électriques et performance
DELETE FROM game_sessions WHERE car_model_id IN (
    -- Variantes électriques Peugeot
    39, 40,  -- e-208, e-2008

    -- Variantes Tesla Performance
    188, 189, 190,  -- Model S Plaid, Model X Plaid, Model 3 Performance

    -- Variantes Dodge Performance
    257, 258,  -- Challenger Hellcat, Challenger Demon

    -- Variantes Mercedes AMG/Performance (à identifier par nom)
    -- Variantes Porsche Turbo/GT (à identifier par nom)
    -- Variantes Lamborghini (STO, Tecnica, Performante, SVJ)

    -- Concepts cars
    752, 753  -- Concept One, Concept Two
);

-- Étape 3 : Supprimer les variantes de la table models
-- ============================================
-- Supprimer les variantes électriques, performance, concepts
DELETE FROM models WHERE id IN (
    39, 40,           -- e-208, e-2008
    188, 189, 190,    -- Tesla Plaid/Performance
    257, 258,         -- Dodge Hellcat/Demon
    752, 753          -- Concepts Rimac
);

-- Supprimer aussi les variantes par nom (patterns)
DELETE FROM models WHERE
    name ILIKE '%Plaid%' OR
    name ILIKE '%Performance%' OR
    name ILIKE '%Hellcat%' OR
    name ILIKE '%Demon%' OR
    name ILIKE '%Turbo S%' OR
    name ILIKE '%GT3 RS%' OR
    name ILIKE '%GT2 RS%' OR
    name ILIKE '%Carrera 4S%' OR
    name ILIKE '%Carrera S%' OR
    name ILIKE '%STO%' OR
    name ILIKE '%Tecnica%' OR
    name ILIKE '%Performante%' OR
    name ILIKE '%SVJ%' OR
    name ILIKE '%Competition%' OR
    name ILIKE '%M Competition%' OR
    name ILIKE '%JCW%' OR
    name ILIKE '%Brabus%' OR
    name ILIKE '%Dream Edition%' OR
    name ILIKE '%Sapphire%' OR
    name ILIKE '%Grand Touring%' OR
    name ILIKE '%Touring%' OR
    name ILIKE 'EQ%' OR  -- Mercedes EQ variants
    name ILIKE 'e-%' OR  -- Electric variants with e- prefix
    name ILIKE '%Concept%';

-- ============================================
-- Étape 4 : RARETÉS INDIVIDUELLES - LÉGENDAIRE (1%)
-- ============================================
-- spawn_weight: 10, base_points: 200

-- Ferrari (tous légendaires - supercars)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id = 5;  -- Tous les Ferrari

-- Lamborghini (supercars de base uniquement)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE id IN (
    501,  -- Aventador
    502,  -- Huracán
    503,  -- Urus
    504   -- Revuelto
);

-- Bugatti (hypercars)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id = 41;  -- Tous les Bugatti

-- McLaren (supercars)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id = 42;  -- Tous les McLaren

-- Pagani (hypercars)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id = 43;  -- Tous les Pagani

-- Koenigsegg (hypercars)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id = 44;  -- Tous les Koenigsegg

-- Rolls-Royce (ultra-luxury)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id IN (
    SELECT id FROM brands WHERE name = 'Rolls-Royce'
);

-- Bentley (ultra-luxury)
UPDATE models SET rarity = 'legendaire', base_points = 200, spawn_weight = 10, difficulty_level = 3
WHERE brand_id IN (
    SELECT id FROM brands WHERE name = 'Bentley'
);

-- ============================================
-- Étape 5 : RARETÉS INDIVIDUELLES - ÉPIQUE (6%)
-- ============================================
-- spawn_weight: 60, base_points: 100

-- Porsche sportives (911 GT3, Taycan Turbo, Panamera Turbo, etc.)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE brand_id = 7 AND (
    name ILIKE '%GT3%' OR
    name ILIKE '%Turbo%' OR
    name ILIKE '%GTS%' OR
    name ILIKE '%Carrera%'
);

-- BMW M (M3, M4, M5, M8, X5 M, X6 M)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id IN (27, 28);  -- M3, M5

-- Mercedes AMG (GT, GT 4-Door, AMG S-Class, G 63)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id IN (57, 58);  -- AMG GT, SL

-- Audi RS (RS6, RS7, RS Q8, R8)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id IN (88, 90);  -- R8, RS6

-- Corvette (sportive américaine)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id = 97;  -- Corvette

-- Chevrolet trucks (Silverado, Tahoe, Suburban - gros SUVs rares en France)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id IN (95, 98, 99);  -- Silverado, Tahoe, Suburban

-- Camaro (muscle car)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id = 96;  -- Camaro

-- NSX (supercar Honda)
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE id = 79;  -- NSX

-- Tesla Roadster
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE name = 'Roadster' AND brand_id IN (SELECT id FROM brands WHERE name = 'Tesla');

-- Maserati sportives
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Maserati');

-- Aston Martin
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Aston Martin');

-- Lotus
UPDATE models SET rarity = 'epique', base_points = 100, spawn_weight = 60, difficulty_level = 3
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lotus');

-- ============================================
-- Étape 6 : RARETÉS INDIVIDUELLES - RARE (18%)
-- ============================================
-- spawn_weight: 180, base_points: 50

-- Toyota rares en France (Supra, Land Cruiser, Highlander, 4Runner, Tacoma, Tundra)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id IN (4, 6, 7, 9, 10);  -- Highlander, Supra, Land Cruiser, Avalon, Sienna

-- Ford US (F-150, Explorer, Bronco, Expedition, Ranger, Edge, Escape)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id IN (14, 15, 16, 17, 18, 19, 20);  -- F-150, Explorer, Escape, Bronco, Edge, Ranger, Expedition

-- BMW électriques/hybrides (i4, iX, i7)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id IN (29, 30);  -- i4, iX

-- Mercedes SL, CLS (sportives/coupés)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id = 58;  -- SL

-- Audi e-tron
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id = 89;  -- e-tron

-- Honda rares (Pilot, Odyssey, Passport, Ridgeline, Insight)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id IN (75, 76, 77, 78, 80);  -- Pilot, Odyssey, Passport, Ridgeline, Insight

-- Chevrolet standards (Cruze, Malibu, Equinox, Traverse, Blazer)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id IN (91, 92, 93, 94, 100);  -- Cruze, Malibu, Equinox, Traverse, Blazer

-- Porsche non-sportives (Cayenne, Macan, Panamera base)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id = 7 AND (
    name ILIKE '%Cayenne%' OR
    name ILIKE '%Macan%' OR
    (name ILIKE '%Panamera%' AND name NOT ILIKE '%Turbo%')
);

-- Jeep premium (Grand Cherokee, Wrangler)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Jeep') AND (
    name ILIKE '%Grand Cherokee%' OR
    name ILIKE '%Wrangler%'
);

-- Alfa Romeo
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Alfa Romeo');

-- Genesis (marque premium coréenne)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Genesis');

-- Lexus sportifs/premium (LC, RC, LS)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lexus') AND (
    name ILIKE '%LC%' OR
    name ILIKE '%RC%' OR
    name ILIKE '%LS%'
);

-- Tesla Model S et Model X (base)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE id IN (
    SELECT id FROM models WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Tesla')
    AND (name = 'Model S' OR name = 'Model X')
);

-- Jaguar
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Jaguar');

-- Land Rover modèles premium (Range Rover, Range Rover Sport, Defender)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Land Rover') AND (
    name ILIKE '%Range Rover%' OR
    name ILIKE '%Defender%'
);

-- Volvo premium (XC90, S90, V90)
UPDATE models SET rarity = 'rare', base_points = 50, spawn_weight = 180, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volvo') AND (
    name ILIKE '%XC90%' OR
    name ILIKE '%S90%' OR
    name ILIKE '%V90%'
);

-- ============================================
-- Étape 7 : RARETÉS INDIVIDUELLES - PEU COMMUNE (30%)
-- ============================================
-- spawn_weight: 300, base_points: 25

-- Peugeot moyens (508, 3008, 5008)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (33, 34, 36);  -- 3008, 5008, 508

-- Renault moyens (Kadjar, Talisman, Koleos, Arkana, Espace)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (64, 66, 67, 68);  -- Kadjar, Talisman, Koleos, Arkana

-- Toyota courants premium (Camry, RAV4, Prius, Highlander base)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (2, 3, 5);  -- Camry, RAV4, Prius

-- Ford courants (Mustang, Kuga, Mondeo)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id = 13;  -- Mustang

-- BMW standards (Série 5, X3, X5, Série 4)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (22, 23, 24);  -- Série 5, X3, X5

-- Mercedes standards (Classe E, GLC, GLE, Classe S, EQS base)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (53, 55, 56, 60, 59);  -- Classe E, GLC, GLE, Classe S, EQS

-- Audi standards (A4, A6, Q3, Q5, Q7, TT)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (82, 83, 84, 85, 86, 87);  -- A4, A6, Q3, Q5, Q7, TT

-- Honda standards (Accord, CR-V, HR-V, Jazz)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE id IN (72, 73, 74);  -- Accord, CR-V, HR-V

-- Volkswagen premium (Passat, Tiguan, Touareg, Arteon)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volkswagen') AND (
    name ILIKE '%Passat%' OR
    name ILIKE '%Tiguan%' OR
    name ILIKE '%Touareg%' OR
    name ILIKE '%Arteon%'
);

-- Nissan premium (Qashqai, X-Trail, Leaf, Ariya)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Nissan') AND (
    name ILIKE '%Qashqai%' OR
    name ILIKE '%X-Trail%' OR
    name ILIKE '%Leaf%' OR
    name ILIKE '%Ariya%'
);

-- Hyundai premium (Tucson, Santa Fe, Ioniq 5, Kona)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Hyundai') AND (
    name ILIKE '%Tucson%' OR
    name ILIKE '%Santa Fe%' OR
    name ILIKE '%Ioniq 5%' OR
    name ILIKE '%Kona%'
);

-- Kia premium (Sportage, Sorento, EV6, Niro)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Kia') AND (
    name ILIKE '%Sportage%' OR
    name ILIKE '%Sorento%' OR
    name ILIKE '%EV6%' OR
    name ILIKE '%Niro%'
);

-- Mazda premium (CX-5, CX-60, Mazda6, MX-5)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mazda') AND (
    name ILIKE '%CX-5%' OR
    name ILIKE '%CX-60%' OR
    name ILIKE '%6%' OR
    name ILIKE '%MX-5%'
);

-- Seat/Cupra
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name IN ('Seat', 'Cupra'));

-- Skoda premium (Octavia, Superb, Kodiaq)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Skoda') AND (
    name ILIKE '%Octavia%' OR
    name ILIKE '%Superb%' OR
    name ILIKE '%Kodiaq%'
);

-- Mini (tous modèles base)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mini');

-- Volvo standards (XC40, XC60, V60, S60)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volvo') AND (
    name ILIKE '%XC40%' OR
    name ILIKE '%XC60%' OR
    name ILIKE '%V60%' OR
    name ILIKE '%S60%'
);

-- Tesla Model 3, Model Y (base)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Tesla') AND (
    name = 'Model 3' OR name = 'Model Y'
);

-- Lexus standards (NX, RX, UX, ES)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lexus') AND (
    name ILIKE '%NX%' OR
    name ILIKE '%RX%' OR
    name ILIKE '%UX%' OR
    name ILIKE '%ES%'
);

-- Porsche 911 base (Carrera base)
UPDATE models SET rarity = 'peu_commune', base_points = 25, spawn_weight = 300, difficulty_level = 2
WHERE brand_id = 7 AND name = '911';

-- ============================================
-- Étape 8 : RARETÉS INDIVIDUELLES - COMMUNE (45%)
-- ============================================
-- spawn_weight: 450, base_points: 10

-- Peugeot courants (208, 308, 2008, Rifter, Partner, 107, 206, 207, 3008)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id IN (31, 32, 35, 37, 38);  -- 208, 308, 2008, Rifter, Partner

-- Renault courants (Clio, Megane, Captur, Scenic, Zoe, Twingo, Kangoo)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id IN (61, 62, 63, 65, 69, 70);  -- Clio, Megane, Captur, Scenic, Zoe, Twingo

-- Toyota courants (Corolla, Yaris, Aygo)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id IN (1, 8);  -- Corolla, Yaris

-- Ford courants (Focus, Fiesta, Puma)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id IN (11, 12);  -- Focus, Fiesta

-- BMW courants (Série 1, Série 3, X1, Série 2)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id IN (25, 21, 26);  -- Série 1, Série 3, X1

-- Mercedes courants (Classe A, Classe C, GLA, GLB, Classe B)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id IN (51, 52, 54);  -- Classe A, Classe C, GLA

-- Audi courants (A3, A1, Q2)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id = 81;  -- A3

-- Honda courants (Civic, Jazz)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE id = 71;  -- Civic

-- Volkswagen courants (Golf, Polo, T-Roc, ID.3, ID.4)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volkswagen') AND (
    name ILIKE '%Golf%' OR
    name ILIKE '%Polo%' OR
    name ILIKE '%T-Roc%' OR
    name ILIKE '%ID.3%' OR
    name ILIKE '%ID.4%'
);

-- Nissan courants (Juke, Micra)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Nissan') AND (
    name ILIKE '%Juke%' OR
    name ILIKE '%Micra%'
);

-- Hyundai courants (i20, i30, Bayon)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Hyundai') AND (
    name ILIKE '%i20%' OR
    name ILIKE '%i30%' OR
    name ILIKE '%Bayon%'
);

-- Kia courants (Picanto, Rio, Ceed, Stonic, XCeed)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Kia') AND (
    name ILIKE '%Picanto%' OR
    name ILIKE '%Rio%' OR
    name ILIKE '%Ceed%' OR
    name ILIKE '%Stonic%' OR
    name ILIKE '%XCeed%'
);

-- Opel courants (Corsa, Astra, Mokka, Crossland)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Opel');

-- Citroën courants (C3, C4, C5 Aircross, Berlingo)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Citroën');

-- Dacia (tous modèles - marque économique)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Dacia');

-- Fiat courants (500, Panda, Tipo)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Fiat') AND (
    name ILIKE '%500%' OR
    name ILIKE '%Panda%' OR
    name ILIKE '%Tipo%'
);

-- Suzuki courants (Swift, Vitara, Ignis)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Suzuki');

-- Mazda courants (CX-30, Mazda3, Mazda2)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mazda') AND (
    name ILIKE '%CX-30%' OR
    name ILIKE '%3%' OR
    name ILIKE '%2%'
);

-- Skoda courants (Fabia, Kamiq, Scala)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Skoda') AND (
    name ILIKE '%Fabia%' OR
    name ILIKE '%Kamiq%' OR
    name ILIKE '%Scala%'
);

-- Smart (tous modèles)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Smart');

-- DS Automobiles (marque française premium mais assez courante)
UPDATE models SET rarity = 'commune', base_points = 10, spawn_weight = 450, difficulty_level = 1
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'DS Automobiles');

-- ============================================
-- Étape 9 : Créer les index pour améliorer les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_models_rarity ON models(rarity);
CREATE INDEX IF NOT EXISTS idx_models_spawn_weight ON models(spawn_weight);
CREATE INDEX IF NOT EXISTS idx_models_base_points ON models(base_points);

-- ============================================
-- Étape 10 : Créer une vue pour les statistiques de rareté
-- ============================================
CREATE OR REPLACE VIEW v_rarity_statistics AS
SELECT
    rarity,
    COUNT(*) as total_models,
    AVG(base_points) as avg_points,
    SUM(spawn_weight) as total_weight,
    ROUND((SUM(spawn_weight)::numeric / (SELECT SUM(spawn_weight) FROM models WHERE spawn_weight > 0) * 100), 2) as percentage
FROM models
WHERE spawn_weight > 0
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
-- Étape 11 : Afficher les statistiques
-- ============================================
SELECT
    rarity,
    total_models,
    ROUND(avg_points, 0) as avg_points,
    percentage || '%' as spawn_probability
FROM v_rarity_statistics;

-- ============================================
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
WHERE m.spawn_weight > 0
ORDER BY
    CASE m.rarity
        WHEN 'commune' THEN 1
        WHEN 'peu_commune' THEN 2
        WHEN 'rare' THEN 3
        WHEN 'epique' THEN 4
        WHEN 'legendaire' THEN 5
    END,
    b.name,
    m.name
LIMIT 100;

-- ============================================
-- Étape 13 : Vérifier les voitures sans rareté
-- ============================================
SELECT
    b.name as brand,
    m.name as model,
    m.id
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.rarity IS NULL OR m.spawn_weight = 0 OR m.base_points = 0
ORDER BY b.name, m.name;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
