-- ============================================
-- Script de migration : Système de rareté INDIVIDUEL v2
-- ============================================
-- Ce script ajoute un système de rareté aux voitures
-- basé sur leur présence INDIVIDUELLE en France
-- Version 2.0 - GARDE TOUS LES MODÈLES, rareté par modèle

-- Étape 1 : Ajouter les colonnes si elles n'existent pas
-- ============================================
ALTER TABLE models
ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) DEFAULT 'commune',
ADD COLUMN IF NOT EXISTS base_points INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS spawn_weight INTEGER DEFAULT 100;

COMMENT ON COLUMN models.rarity IS 'Rareté de la voiture: commune, peu_commune, rare, epique, legendaire';
COMMENT ON COLUMN models.base_points IS 'Points de base gagnés en trouvant cette voiture';
COMMENT ON COLUMN models.spawn_weight IS 'Poids pour la probabilité d''apparition (utilisé pour le random weighted)';

-- ============================================
-- Étape 2 : RARETÉS INDIVIDUELLES - LÉGENDAIRE (1%)
-- ============================================
-- spawn_weight: 10, base_points: 2000 (×10 pour équilibrage)

-- Ferrari (tous légendaires - supercars)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Ferrari');

-- Lamborghini (tous modèles incluant variantes)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lamborghini');

-- Bugatti (hypercars)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Bugatti');

-- McLaren (supercars)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'McLaren');

-- Pagani (hypercars)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Pagani');

-- Koenigsegg (hypercars)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Koenigsegg');

-- Rolls-Royce (ultra-luxury)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Rolls-Royce');

-- Bentley (ultra-luxury)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Bentley');

-- Rimac (hypercars électriques incluant concepts)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Rimac');

-- Aston Martin (supercars de luxe)
UPDATE models SET rarity = 'legendaire', base_points = 2000, spawn_weight = 10
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Aston Martin');

-- ============================================
-- Étape 3 : RARETÉS INDIVIDUELLES - ÉPIQUE (6%)
-- ============================================
-- spawn_weight: 60, base_points: 1000 (×10 pour équilibrage)

-- Porsche sportives (911 GT3, Taycan Turbo, Panamera Turbo, Turbo S, etc.)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Porsche') AND (
    name ILIKE '%GT3%' OR
    name ILIKE '%GT2%' OR
    name ILIKE '%Turbo%' OR
    name ILIKE '%GTS%' OR
    name ILIKE '%Carrera 4%' OR
    name ILIKE '%Carrera S%' OR
    name = '918 Spyder'
);

-- BMW M et i8 (M3, M4, M5, M8, X5 M, X6 M, i8)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'BMW') AND (
    name ILIKE '%M3%' OR
    name ILIKE '%M4%' OR
    name ILIKE '%M5%' OR
    name ILIKE '%M8%' OR
    name ILIKE '%X5 M%' OR
    name ILIKE '%X6 M%' OR
    name ILIKE '%i8%' OR
    name ILIKE '%Competition%'
);

-- Mercedes AMG sportifs (GT, GT 4-Door, AMG S-Class, G 63, AMG variants)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mercedes-Benz') AND (
    name ILIKE '%AMG GT%' OR
    name ILIKE '%G 63%' OR
    name ILIKE '%G 65%' OR
    name ILIKE '%63 AMG%' OR
    name ILIKE '%SLS%'
);

-- Audi RS et R8 (RS3, RS4, RS5, RS6, RS7, RS Q8, R8)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Audi') AND (
    name ILIKE '%R8%' OR
    name ILIKE '%RS%'
);

-- Corvette (sportive américaine)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE name ILIKE '%Corvette%';

-- Dodge performance (Hellcat, Demon, Viper, SRT variants)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Dodge') AND (
    name ILIKE '%Hellcat%' OR
    name ILIKE '%Demon%' OR
    name ILIKE '%Viper%' OR
    name ILIKE '%SRT%'
);

-- Chevrolet trucks et muscle cars (Silverado, Tahoe, Suburban, Camaro ZL1, Camaro SS)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Chevrolet') AND (
    name ILIKE '%Silverado%' OR
    name ILIKE '%Tahoe%' OR
    name ILIKE '%Suburban%' OR
    name ILIKE '%ZL1%' OR
    name ILIKE '%SS%'
);

-- Ford performance (F-150 Raptor, Mustang Shelby, GT variants)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Ford') AND (
    name ILIKE '%Raptor%' OR
    name ILIKE '%Shelby%' OR
    name ILIKE '%GT500%' OR
    name ILIKE '%GT350%' OR
    name = 'GT'
);

-- NSX (supercar Honda)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE name = 'NSX';

-- Tesla Roadster
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE name = 'Roadster' AND brand_id IN (SELECT id FROM brands WHERE name = 'Tesla');

-- Tesla variantes performance (Plaid, Performance)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Tesla') AND (
    name ILIKE '%Plaid%' OR
    name ILIKE '%Performance%'
);

-- Maserati sportives
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Maserati');

-- Lotus (sportives britanniques)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lotus');

-- Nissan GT-R (sportive iconique)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE name ILIKE '%GT-R%' AND brand_id IN (SELECT id FROM brands WHERE name = 'Nissan');

-- Lexus LFA (supercar)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE name = 'LFA' AND brand_id IN (SELECT id FROM brands WHERE name = 'Lexus');

-- Acura NSX
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Acura') AND name ILIKE '%NSX%';

-- Lucid Air (toutes variantes - électrique premium rare)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lucid');

-- Polestar (électrique premium suédois rare en France)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Polestar');

-- Rivian (pickups électriques américains très rares en France)
UPDATE models SET rarity = 'epique', base_points = 1000, spawn_weight = 60
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Rivian');

-- ============================================
-- Étape 4 : RARETÉS INDIVIDUELLES - RARE (18%)
-- ============================================
-- spawn_weight: 180, base_points: 500 (×10 pour équilibrage)

-- Toyota rares en France (Supra, Land Cruiser, Highlander, 4Runner, Tacoma, Tundra, Avalon, Sienna)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Toyota') AND (
    name ILIKE '%Supra%' OR
    name ILIKE '%Land Cruiser%' OR
    name ILIKE '%Highlander%' OR
    name ILIKE '%4Runner%' OR
    name ILIKE '%Tacoma%' OR
    name ILIKE '%Tundra%' OR
    name ILIKE '%Avalon%' OR
    name ILIKE '%Sienna%' OR
    name ILIKE '%Sequoia%' OR
    name ILIKE '%GR86%'
);

-- Ford US (F-150 base, Explorer, Bronco, Expedition, Ranger, Edge, Escape large, Flex)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Ford') AND (
    (name ILIKE '%F-150%' AND name NOT ILIKE '%Raptor%') OR
    name ILIKE '%Explorer%' OR
    name ILIKE '%Bronco%' OR
    name ILIKE '%Expedition%' OR
    name ILIKE '%Ranger%' OR
    name ILIKE '%Edge%' OR
    name ILIKE '%Flex%'
);

-- BMW électriques/hybrides (i4, iX, i7, i3, iX3)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'BMW') AND (
    name ILIKE '%i3%' OR
    name ILIKE '%i4%' OR
    name ILIKE '%i7%' OR
    name ILIKE '%iX%'
) AND rarity != 'epique';

-- Mercedes SL, CLS, EQ non-AMG (SL base, CLS, EQC, EQE, EQS base)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mercedes-Benz') AND (
    (name ILIKE '%SL%' AND name NOT ILIKE '%SLS%' AND name NOT ILIKE '%AMG%') OR
    name ILIKE '%CLS%' OR
    (name ILIKE '%EQ%' AND name NOT ILIKE '%AMG%')
) AND rarity != 'epique';

-- Audi e-tron et électriques
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Audi') AND (
    name ILIKE '%e-tron%' OR
    name ILIKE '%Q4 e-tron%'
) AND rarity != 'epique';

-- Honda rares (Pilot, Odyssey, Passport, Ridgeline, Insight, S2000)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Honda') AND (
    name ILIKE '%Pilot%' OR
    name ILIKE '%Odyssey%' OR
    name ILIKE '%Passport%' OR
    name ILIKE '%Ridgeline%' OR
    name ILIKE '%Insight%' OR
    name ILIKE '%S2000%'
);

-- Chevrolet standards (Cruze, Malibu, Equinox, Traverse, Blazer, Colorado, Camaro base)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Chevrolet') AND (
    name ILIKE '%Cruze%' OR
    name ILIKE '%Malibu%' OR
    name ILIKE '%Equinox%' OR
    name ILIKE '%Traverse%' OR
    name ILIKE '%Blazer%' OR
    name ILIKE '%Colorado%' OR
    (name ILIKE '%Camaro%' AND name NOT ILIKE '%ZL1%' AND name NOT ILIKE '%SS%')
) AND rarity != 'epique';

-- Dodge base (Charger base, Challenger base, Durango)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Dodge') AND (
    name ILIKE '%Charger%' OR
    name ILIKE '%Durango%' OR
    (name ILIKE '%Challenger%' AND name NOT ILIKE '%Hellcat%' AND name NOT ILIKE '%Demon%' AND name NOT ILIKE '%SRT%')
) AND rarity != 'epique';

-- Jeep premium (Grand Cherokee, Wrangler, Gladiator)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Jeep') AND (
    name ILIKE '%Grand Cherokee%' OR
    name ILIKE '%Wrangler%' OR
    name ILIKE '%Gladiator%'
);

-- Porsche non-sportives (Cayenne, Macan, Panamera base, 911 base)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Porsche') AND (
    name ILIKE '%Cayenne%' OR
    name ILIKE '%Macan%' OR
    (name ILIKE '%Panamera%' AND name NOT ILIKE '%Turbo%') OR
    (name = '911' OR name = 'Carrera')
) AND rarity != 'epique';

-- Alfa Romeo (sportives italiennes)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Alfa Romeo');

-- Genesis (marque premium coréenne)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Genesis');

-- Lexus sportifs/premium (LC, RC, LS, IS)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lexus') AND (
    name ILIKE '%LC%' OR
    name ILIKE '%RC%' OR
    name ILIKE '%LS%' OR
    name ILIKE '%IS%'
) AND rarity != 'epique';

-- Tesla Model S et Model X (base)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Tesla') AND (
    name = 'Model S' OR name = 'Model X'
) AND rarity != 'epique';

-- Jaguar
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Jaguar');

-- Land Rover modèles premium (Range Rover, Range Rover Sport, Defender)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Land Rover') AND (
    name ILIKE '%Range Rover%' OR
    name ILIKE '%Defender%'
);

-- Volvo premium (XC90, S90, V90)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volvo') AND (
    name ILIKE '%XC90%' OR
    name ILIKE '%S90%' OR
    name ILIKE '%V90%'
);

-- Infiniti (marque premium japonaise)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Infiniti');

-- Cadillac (marque américaine de luxe)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Cadillac');

-- Lincoln (marque américaine de luxe)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lincoln');

-- GMC (trucks américains)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'GMC');

-- Ram (trucks américains)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Ram');

-- Subaru WRX, BRZ (sportives)
UPDATE models SET rarity = 'rare', base_points = 500, spawn_weight = 180
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Subaru') AND (
    name ILIKE '%WRX%' OR
    name ILIKE '%BRZ%' OR
    name ILIKE '%STI%'
);

-- ============================================
-- Étape 5 : RARETÉS INDIVIDUELLES - PEU COMMUNE (30%)
-- ============================================
-- spawn_weight: 300, base_points: 250 (×10 pour équilibrage)

-- Peugeot moyens et électriques (508, 3008, 5008, e-208, e-2008)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Peugeot') AND (
    name ILIKE '%508%' OR
    name ILIKE '%3008%' OR
    name ILIKE '%5008%' OR
    name ILIKE '%e-208%' OR
    name ILIKE '%e-2008%'
);

-- Renault moyens (Kadjar, Talisman, Koleos, Arkana, Espace)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Renault') AND (
    name ILIKE '%Kadjar%' OR
    name ILIKE '%Talisman%' OR
    name ILIKE '%Koleos%' OR
    name ILIKE '%Arkana%' OR
    name ILIKE '%Espace%'
);

-- Toyota courants premium (Camry, RAV4, Prius, C-HR, Corolla Cross)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Toyota') AND (
    name ILIKE '%Camry%' OR
    name ILIKE '%RAV4%' OR
    name ILIKE '%Prius%' OR
    name ILIKE '%C-HR%' OR
    name ILIKE '%Corolla Cross%'
) AND rarity != 'rare';

-- Ford courants (Mustang base, Kuga, Mondeo, S-Max, Galaxy)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Ford') AND (
    (name ILIKE '%Mustang%' AND rarity != 'epique') OR
    name ILIKE '%Kuga%' OR
    name ILIKE '%Mondeo%' OR
    name ILIKE '%S-Max%' OR
    name ILIKE '%Galaxy%'
);

-- BMW standards (Série 5, X3, X5, Série 4, X4, X6, Série 7)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'BMW') AND (
    name ILIKE '%Série 5%' OR name ILIKE '%5 Series%' OR
    name ILIKE '%X3%' OR
    name ILIKE '%X5%' OR
    name ILIKE '%Série 4%' OR name ILIKE '%4 Series%' OR
    name ILIKE '%X4%' OR
    name ILIKE '%X6%' OR
    name ILIKE '%Série 7%' OR name ILIKE '%7 Series%' OR
    name ILIKE '%X7%'
) AND rarity NOT IN ('epique', 'rare');

-- Mercedes standards (Classe E, GLC, GLE, Classe S, GLB, GLS)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mercedes-Benz') AND (
    name ILIKE '%Classe E%' OR name ILIKE '%E-Class%' OR
    name ILIKE '%GLC%' OR
    name ILIKE '%GLE%' OR
    name ILIKE '%Classe S%' OR name ILIKE '%S-Class%' OR
    name ILIKE '%GLB%' OR
    name ILIKE '%GLS%'
) AND rarity NOT IN ('epique', 'rare', 'legendaire');

-- Audi standards (A4, A6, Q3, Q5, Q7, Q8, TT, A5, A7)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Audi') AND (
    name ILIKE '%A4%' OR
    name ILIKE '%A5%' OR
    name ILIKE '%A6%' OR
    name ILIKE '%A7%' OR
    name ILIKE '%Q3%' OR
    name ILIKE '%Q5%' OR
    name ILIKE '%Q7%' OR
    name ILIKE '%Q8%' OR
    name ILIKE '%TT%'
) AND rarity NOT IN ('epique', 'rare');

-- Honda standards (Accord, CR-V, HR-V, Jazz)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Honda') AND (
    name ILIKE '%Accord%' OR
    name ILIKE '%CR-V%' OR
    name ILIKE '%HR-V%' OR
    name ILIKE '%Jazz%' OR
    name ILIKE '%Fit%'
) AND rarity NOT IN ('epique', 'rare');

-- Volkswagen premium (Passat, Tiguan, Touareg, Arteon, ID.5)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volkswagen') AND (
    name ILIKE '%Passat%' OR
    name ILIKE '%Tiguan%' OR
    name ILIKE '%Touareg%' OR
    name ILIKE '%Arteon%' OR
    name ILIKE '%ID.5%'
);

-- Nissan premium (Qashqai, X-Trail, Leaf, Ariya)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Nissan') AND (
    name ILIKE '%Qashqai%' OR
    name ILIKE '%X-Trail%' OR
    name ILIKE '%Leaf%' OR
    name ILIKE '%Ariya%'
) AND rarity != 'epique';

-- Hyundai premium (Tucson, Santa Fe, Ioniq 5, Kona, Ioniq)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Hyundai') AND (
    name ILIKE '%Tucson%' OR
    name ILIKE '%Santa Fe%' OR
    name ILIKE '%Ioniq 5%' OR
    name ILIKE '%Kona%' OR
    (name ILIKE '%Ioniq%' AND name NOT ILIKE '%Ioniq 5%')
);

-- Kia premium (Sportage, Sorento, EV6, Niro)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Kia') AND (
    name ILIKE '%Sportage%' OR
    name ILIKE '%Sorento%' OR
    name ILIKE '%EV6%' OR
    name ILIKE '%Niro%'
);

-- Mazda premium (CX-5, CX-60, Mazda6, MX-5, CX-9)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mazda') AND (
    name ILIKE '%CX-5%' OR
    name ILIKE '%CX-60%' OR
    name ILIKE '%6%' OR
    name ILIKE '%MX-5%' OR
    name ILIKE '%CX-9%'
);

-- Seat/Cupra (marques espagnoles)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name IN ('Seat', 'Cupra'));

-- Skoda premium (Octavia, Superb, Kodiaq, Enyaq)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Skoda') AND (
    name ILIKE '%Octavia%' OR
    name ILIKE '%Superb%' OR
    name ILIKE '%Kodiaq%' OR
    name ILIKE '%Enyaq%'
);

-- Mini (tous modèles)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mini');

-- Volvo standards (XC40, XC60, V60, S60)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volvo') AND (
    name ILIKE '%XC40%' OR
    name ILIKE '%XC60%' OR
    name ILIKE '%V60%' OR
    name ILIKE '%S60%'
) AND rarity != 'rare';

-- Tesla Model 3, Model Y (base)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Tesla') AND (
    name = 'Model 3' OR name = 'Model Y'
) AND rarity NOT IN ('epique', 'rare');

-- Lexus standards (NX, RX, UX, ES)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Lexus') AND (
    name ILIKE '%NX%' OR
    name ILIKE '%RX%' OR
    name ILIKE '%UX%' OR
    name ILIKE '%ES%'
) AND rarity NOT IN ('epique', 'rare');

-- Land Rover Evoque, Discovery Sport
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Land Rover') AND (
    name ILIKE '%Evoque%' OR
    name ILIKE '%Discovery Sport%'
);

-- Subaru standards (Outback, Forester, XV/Crosstrek, Impreza)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Subaru') AND (
    name ILIKE '%Outback%' OR
    name ILIKE '%Forester%' OR
    name ILIKE '%XV%' OR
    name ILIKE '%Crosstrek%' OR
    name ILIKE '%Impreza%'
) AND rarity != 'rare';

-- Mitsubishi (Outlander, ASX, Eclipse Cross)
UPDATE models SET rarity = 'peu_commune', base_points = 250, spawn_weight = 300
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mitsubishi');

-- ============================================
-- Étape 6 : RARETÉS INDIVIDUELLES - COMMUNE (45%)
-- ============================================
-- spawn_weight: 450, base_points: 100 (×10 pour équilibrage)

-- Peugeot courants (208, 308, 2008, Rifter, Partner, 107, 206, 207)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Peugeot') AND (
    name ILIKE '%208%' OR
    name ILIKE '%308%' OR
    name ILIKE '%2008%' OR
    name ILIKE '%Rifter%' OR
    name ILIKE '%Partner%' OR
    name ILIKE '%107%' OR
    name ILIKE '%206%' OR
    name ILIKE '%207%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Renault courants (Clio, Megane, Captur, Scenic, Zoe, Twingo, Kangoo)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Renault') AND (
    name ILIKE '%Clio%' OR
    name ILIKE '%Megane%' OR
    name ILIKE '%Captur%' OR
    name ILIKE '%Scenic%' OR
    name ILIKE '%Zoe%' OR
    name ILIKE '%Twingo%' OR
    name ILIKE '%Kangoo%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Citroën (tous modèles)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Citroën');

-- DS Automobiles (marque française premium mais assez courante)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'DS Automobiles');

-- Toyota courants (Corolla, Yaris, Aygo)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Toyota') AND (
    name ILIKE '%Corolla%' OR
    name ILIKE '%Yaris%' OR
    name ILIKE '%Aygo%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Ford courants (Focus, Fiesta, Puma)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Ford') AND (
    name ILIKE '%Focus%' OR
    name ILIKE '%Fiesta%' OR
    name ILIKE '%Puma%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- BMW courants (Série 1, Série 3, X1, Série 2, Série 2 Active Tourer)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'BMW') AND (
    name ILIKE '%Série 1%' OR name ILIKE '%1 Series%' OR
    name ILIKE '%Série 3%' OR name ILIKE '%3 Series%' OR
    name ILIKE '%X1%' OR
    (name ILIKE '%Série 2%' OR name ILIKE '%2 Series%')
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Mercedes courants (Classe A, Classe C, GLA, Classe B, CLA)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mercedes-Benz') AND (
    name ILIKE '%Classe A%' OR name ILIKE '%A-Class%' OR
    name ILIKE '%Classe C%' OR name ILIKE '%C-Class%' OR
    name ILIKE '%GLA%' OR
    name ILIKE '%Classe B%' OR name ILIKE '%B-Class%' OR
    name ILIKE '%CLA%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique', 'legendaire');

-- Audi courants (A3, A1, Q2)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Audi') AND (
    name ILIKE '%A3%' OR
    name ILIKE '%A1%' OR
    name ILIKE '%Q2%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Honda courants (Civic)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Honda') AND (
    name ILIKE '%Civic%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Volkswagen courants (Golf, Polo, T-Roc, ID.3, ID.4, T-Cross)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Volkswagen') AND (
    name ILIKE '%Golf%' OR
    name ILIKE '%Polo%' OR
    name ILIKE '%T-Roc%' OR
    name ILIKE '%T-Cross%' OR
    name ILIKE '%ID.3%' OR
    name ILIKE '%ID.4%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Nissan courants (Juke, Micra)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Nissan') AND (
    name ILIKE '%Juke%' OR
    name ILIKE '%Micra%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Hyundai courants (i20, i30, Bayon, i10)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Hyundai') AND (
    name ILIKE '%i20%' OR
    name ILIKE '%i30%' OR
    name ILIKE '%i10%' OR
    name ILIKE '%Bayon%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Kia courants (Picanto, Rio, Ceed, Stonic, XCeed)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Kia') AND (
    name ILIKE '%Picanto%' OR
    name ILIKE '%Rio%' OR
    name ILIKE '%Ceed%' OR
    name ILIKE '%Stonic%' OR
    name ILIKE '%XCeed%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Opel (tous modèles)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Opel');

-- Dacia (tous modèles - marque économique)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Dacia');

-- Fiat (500, Panda, Tipo, etc.)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Fiat');

-- Suzuki (Swift, Vitara, Ignis, etc.)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Suzuki');

-- Mazda courants (CX-30, Mazda3, Mazda2)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Mazda') AND (
    name ILIKE '%CX-30%' OR
    name ILIKE '%3%' OR
    name ILIKE '%2%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Skoda courants (Fabia, Kamiq, Scala)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Skoda') AND (
    name ILIKE '%Fabia%' OR
    name ILIKE '%Kamiq%' OR
    name ILIKE '%Scala%'
) AND rarity NOT IN ('peu_commune', 'rare', 'epique');

-- Smart (tous modèles)
UPDATE models SET rarity = 'commune', base_points = 100, spawn_weight = 450
WHERE brand_id IN (SELECT id FROM brands WHERE name = 'Smart');

-- ============================================
-- Étape 7 : Créer la fonction de sélection aléatoire pondérée
-- ============================================
-- Cette fonction PostgreSQL sélectionne une voiture aléatoire en respectant les probabilités définies par spawn_weight
CREATE OR REPLACE FUNCTION get_random_car_weighted()
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    year INTEGER,
    difficulty_level INTEGER,
    image_url VARCHAR,
    brand_id INTEGER,
    brand_name VARCHAR,
    country VARCHAR,
    rarity VARCHAR,
    base_points INTEGER,
    spawn_weight INTEGER
) AS $$
DECLARE
    total_weight BIGINT;
    random_value BIGINT;
BEGIN
    -- Calculer le poids total de tous les modèles
    SELECT SUM(m.spawn_weight) INTO total_weight
    FROM models m
    WHERE m.spawn_weight > 0;

    -- Si aucun modèle n'a de poids, retourner null
    IF total_weight IS NULL OR total_weight = 0 THEN
        RETURN;
    END IF;

    -- Générer un nombre aléatoire entre 0 et total_weight
    random_value := floor(random() * total_weight)::BIGINT;

    -- Sélectionner la voiture correspondant au poids cumulatif
    RETURN QUERY
    WITH cumulative_weights AS (
        SELECT
            m.id,
            m.name,
            m.year,
            m.difficulty_level,
            m.image_url,
            m.brand_id,
            b.name AS brand_name,
            b.country,
            m.rarity,
            m.base_points,
            m.spawn_weight,
            SUM(m.spawn_weight) OVER (ORDER BY m.id) AS cumulative_weight
        FROM models m
        JOIN brands b ON m.brand_id = b.id
        WHERE m.spawn_weight > 0
    )
    SELECT
        cw.id,
        cw.name,
        cw.year,
        cw.difficulty_level,
        cw.image_url,
        cw.brand_id,
        cw.brand_name,
        cw.country,
        cw.rarity,
        cw.base_points,
        cw.spawn_weight
    FROM cumulative_weights cw
    WHERE cw.cumulative_weight >= random_value
    ORDER BY cw.cumulative_weight
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Étape 8 : Créer les index pour améliorer les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_models_rarity ON models(rarity);
CREATE INDEX IF NOT EXISTS idx_models_spawn_weight ON models(spawn_weight);
CREATE INDEX IF NOT EXISTS idx_models_base_points ON models(base_points);

-- ============================================
-- Étape 9 : Créer une vue pour les statistiques de rareté
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
-- Étape 10 : Afficher les statistiques
-- ============================================
SELECT
    rarity,
    total_models,
    ROUND(avg_points, 0) as avg_points,
    percentage || '%' as spawn_probability
FROM v_rarity_statistics;

-- ============================================
-- Étape 11 : Vérifier les voitures sans rareté assignée
-- ============================================
SELECT
    b.name as brand,
    m.name as model,
    m.id,
    m.rarity
FROM models m
JOIN brands b ON m.brand_id = b.id
WHERE m.rarity IS NULL
ORDER BY b.name, m.name;

-- ============================================
-- FIN DU SCRIPT
-- ============================================
