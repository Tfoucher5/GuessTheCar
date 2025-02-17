-- Supprime les anciennes données
DELETE FROM modeles;
DELETE FROM marques;

-- Réinitialise les ID auto-incrémentés
ALTER TABLE modeles AUTO_INCREMENT = 1;
ALTER TABLE marques AUTO_INCREMENT = 1;

-- Insertion des marques sans doublons
INSERT INTO marques (nom, pays)
VALUES
    ('Toyota', 'Japon'),           -- 1
    ('Ford', 'USA'),              -- 2
    ('BMW', 'Allemagne'),         -- 3
    ('Peugeot', 'France'),        -- 4
    ('Ferrari', 'Italie'),        -- 5
    ('Mercedes', 'Allemagne'),    -- 6
    ('Renault', 'France'),        -- 7
    ('Honda', 'Japon'),           -- 8
    ('Audi', 'Allemagne'),        -- 9
    ('Chevrolet', 'USA'),         -- 10
    ('Volkswagen', 'Allemagne'),  -- 11
    ('Nissan', 'Japon'),          -- 12
    ('Porsche', 'Allemagne'),     -- 13
    ('Lamborghini', 'Italie'),    -- 14
    ('Mitsubishi', 'Japon'),      -- 15
    ('Subaru', 'Japon'),          -- 16
    ('Mazda', 'Japon'),           -- 17
    ('Jaguar', 'Royaume-Uni'),    -- 18
    ('Tesla', 'USA'),             -- 19
    ('Bugatti', 'France'),        -- 20
    ('Alfa Romeo', 'Italie'),     -- 21
    ('Aston Martin', 'Royaume-Uni'), -- 22
    ('Bentley', 'Royaume-Uni'),   -- 23
    ('Citroën', 'France'),        -- 24
    ('Dacia', 'Roumanie'),        -- 25
    ('Dodge', 'USA'),             -- 26
    ('Fiat', 'Italie'),           -- 27
    ('Genesis', 'Corée du Sud'),  -- 28
    ('GMC', 'USA'),               -- 29
    ('Hyundai', 'Corée du Sud'),  -- 30
    ('Infiniti', 'Japon'),        -- 31
    ('Jeep', 'USA'),              -- 32
    ('Kia', 'Corée du Sud'),      -- 33
    ('Lancia', 'Italie'),         -- 34
    ('Land Rover', 'Royaume-Uni'), -- 35
    ('Lexus', 'Japon'),           -- 36
    ('Lincoln', 'USA'),           -- 37
    ('Lotus', 'Royaume-Uni'),     -- 38
    ('Maserati', 'Italie'),       -- 39
    ('McLaren', 'Royaume-Uni'),   -- 40
    ('Mini', 'Royaume-Uni'),      -- 41
    ('Opel', 'Allemagne'),        -- 42
    ('Pagani', 'Italie'),         -- 43
    ('Polestar', 'Suède'),        -- 44
    ('Ram', 'USA'),               -- 45
    ('Rivian', 'USA'),            -- 46
    ('Rolls-Royce', 'Royaume-Uni'), -- 47
    ('Saab', 'Suède'),            -- 48
    ('SEAT', 'Espagne'),          -- 49
    ('Skoda', 'République tchèque'), -- 50
    ('Acura', 'Japon'),           -- 51
    ('Abarth', 'Italie'),         -- 52
    ('BAIC', 'Chine'),            -- 53
    ('Baojun', 'Chine'),          -- 54
    ('Brabus', 'Allemagne'),      -- 55
    ('Caterham', 'Royaume-Uni'),  -- 56
    ('Chery', 'Chine'),           -- 57
    ('Daewoo', 'Corée du Sud'),   -- 58
    ('Daihatsu', 'Japon'),        -- 59
    ('DeLorean', 'USA'),          -- 60
    ('Fisker', 'USA'),            -- 61
    ('Geely', 'Chine'),           -- 62
    ('Great Wall', 'Chine'),      -- 63
    ('Haval', 'Chine'),           -- 64
    ('Koenigsegg', 'Suède'),      -- 65
    ('Lada', 'Russie'),           -- 66
    ('Lucid', 'USA'),             -- 67
    ('Mahindra', 'Inde'),         -- 68
    ('Maybach', 'Allemagne'),     -- 69
    ('MG', 'Royaume-Uni'),        -- 70
    ('Morgan', 'Royaume-Uni'),    -- 71
    ('Pontiac', 'USA'),           -- 72
    ('Proton', 'Malaisie'),       -- 73
    ('Roewe', 'Chine'),           -- 74
    ('Rover', 'Royaume-Uni'),     -- 75
    ('Saturn', 'USA'),            -- 76
    ('Scion', 'Japon'),           -- 77
    ('Spyker', 'Pays-Bas'),       -- 78
    ('SsangYong', 'Corée du Sud'), -- 79
    ('Tata', 'Inde'),             -- 80
    ('Triumph', 'Royaume-Uni'),   -- 81
    ('Vauxhall', 'Royaume-Uni'),  -- 82
    ('VinFast', 'Vietnam'),       -- 83
    ('Wiesmann', 'Allemagne'),    -- 84
    ('Zagato', 'Italie'),         -- 85
    ('Zotye', 'Chine'),           -- 86
    ('Faraday Future', 'USA'),    -- 87
    ('BYD', 'Chine'),             -- 88
    ('Alpina', 'Allemagne'),      -- 89
    ('AMC', 'USA'),               -- 90
    ('Arrinera', 'Pologne'),      -- 91
    ('Artega', 'Allemagne'),      -- 92
    ('Aspark', 'Japon'),          -- 93
    ('Austin', 'Royaume-Uni'),    -- 94
    ('BAC', 'Royaume-Uni'),       -- 95
    ('Bellier', 'France'),        -- 96
    ('Bertone', 'Italie'),        -- 97
    ('Bizzarrini', 'Italie'),     -- 98
    ('Borgward', 'Allemagne'),    -- 99
    ('Bristol', 'Royaume-Uni'),   -- 100
    ('Byton', 'Chine'),           -- 101
    ('Cizeta', 'Italie'),         -- 102
    ('Cord', 'USA'),              -- 103
    ('Cupra', 'Espagne'),         -- 104
    ('Datsun', 'Japon'),          -- 105
    ('De Tomaso', 'Italie'),      -- 106
    ('Donkervoort', 'Pays-Bas'),  -- 107
    ('Eagle', 'Royaume-Uni'),     -- 108
    ('Edsel', 'USA'),             -- 109
    ('Elemental', 'Royaume-Uni'), -- 110
    ('Exagon', 'France'),         -- 111
    ('Facel Vega', 'France'),     -- 112
    ('Farbio', 'Royaume-Uni'),    -- 113
    ('Force Motors', 'Inde'),     -- 114
    ('Gemballa', 'Allemagne'),    -- 115
    ('Ginetta', 'Royaume-Uni'),   -- 116
    ('GTA Motor', 'Espagne'),     -- 117
    ('Hennessey', 'USA'),         -- 118
    ('Hindustan', 'Inde'),        -- 119
    ('Hommell', 'France'),        -- 120
    ('HTT', 'Canada'),            -- 121
    ('ICML', 'Inde'),             -- 122
    ('Iso', 'Italie'),            -- 123
    ('Isuzu', 'Japon'),           -- 124
    ('Jensen', 'Royaume-Uni'),    -- 125
    ('Karma', 'USA'),             -- 126
    ('Keating', 'Royaume-Uni'),   -- 127
    ('KTM', 'Autriche'),          -- 128
    ('Lanchester', 'Royaume-Uni'), -- 129
    ('Laraki', 'Maroc'),          -- 130
    ('Ligier', 'France'),         -- 131
    ('Lynk & Co', 'Chine'),       -- 132
    ('Marcos', 'Royaume-Uni'),    -- 133
    ('Mastretta', 'Mexique'),     -- 134
    ('Mitsuoka', 'Japon');        -- 135

-- Insertion des modèles avec les IDs corrigés
INSERT INTO modeles (marque_id, nom, annee, difficulte)
VALUES
    -- Toyota (ID: 1)
    (1, 'Corolla', 2020, 1),
    (1, 'Supra', 2019, 1),
    (1, 'Yaris', 2021, 1),
    (1, 'Land Cruiser', 2018, 2),
    (1, 'Hilux', 2021, 2),
    (1, 'C-HR', 2020, 2),
    (1, 'Avalon', 2019, 3),
    (1, 'Highlander', 2022, 2),

    -- Ford (ID: 2)
    (2, 'Mustang', 2021, 1),
    (2, 'Focus', 2020, 1),
    (2, 'F-150', 2019, 2),
    (2, 'Explorer', 2022, 2),
    (2, 'Bronco', 2021, 2),
    (2, 'Ranger', 2020, 2),
    (2, 'Edge', 2019, 3),
    (2, 'Escape', 2022, 2),

    -- BMW (ID: 3)
    (3, 'M3', 2022, 1),
    (3, 'X5', 2021, 1),
    (3, 'Serie 7', 2020, 1),
    (3, 'Z4', 2018, 2),
    (3, 'M4', 2021, 1),
    (3, 'X3', 2020, 1),
    (3, 'X7', 2019, 2),
    (3, 'i8', 2022, 2),

    -- Peugeot (ID: 4)
    (4, '208', 2023, 1),
    (4, '308', 2022, 1),
    (4, '508', 2021, 1),
    (4, '2008', 2020, 1),
    (4, '5008', 2021, 2),
    (4, 'RCZ', 2020, 2),
    (4, '607', 2019, 3),
    (4, 'Partner', 2022, 2),

    -- Ferrari (ID: 5)
    (5, '488 GTB', 2018, 2),
    (5, 'F8 Tributo', 2021, 2),
    (5, 'Roma', 2020, 2),
    (5, 'SF90 Stradale', 2022, 3),
    (5, 'LaFerrari', 2021, 1),
    (5, 'Enzo', 2020, 1),
    (5, 'Portofino', 2019, 3),
    (5, 'California', 2022, 2),

    -- Mercedes (ID: 6)
    (6, 'Classe A', 2021, 1),
    (6, 'Classe C', 2020, 1),
    (6, 'Classe E', 2019, 1),
    (6, 'GLE', 2022, 2),
    (6, 'GLS', 2021, 2),
    (6, 'SL', 2020, 2),
    (6, 'AMG GT', 2019, 2),
    (6, 'SLS AMG', 2022, 2),

    -- Renault (ID: 7)
    (7, 'Clio', 2023, 1),
    (7, 'Megane', 2021, 1),
    (7, 'Captur', 2020, 1),
    (7, 'Talisman', 2019, 2),
    (7, 'Kadjar', 2021, 2),
    (7, 'Scenic', 2020, 1),
    (7, 'Espace', 2019, 1),
    (7, 'Koleos', 2022, 2),

    -- Honda (ID: 8)
    (8, 'Civic', 2022, 1),
    (8, 'Accord', 2021, 2),
    (8, 'CR-V', 2020, 1),
    (8, 'NSX', 2019, 2),
    (8, 'Jazz', 2021, 1),
    (8, 'HR-V', 2020, 2),
    (8, 'Legend', 2019, 3),
    (8, 'Odyssey', 2022, 3),

    -- Audi (ID: 9)
    (9, 'A3', 2022, 1),
    (9, 'A4', 2021, 1),
    (9, 'Q5', 2020, 1),
    (9, 'R8', 2019, 1),
    (9, 'TT', 2021, 1),
    (9, 'A5', 2020, 1),
    (9, 'RS3', 2019, 2),
    (9, 'RS7', 2022, 2),

    -- Chevrolet (ID: 10)
    (10, 'Camaro', 2021, 1),
    (10, 'Corvette', 2020, 1),
    (10, 'Silverado', 2019, 2),
    (10, 'Malibu', 2018, 2),
    (10, 'Trailblazer', 2021, 3),
    (10, 'Impala', 2020, 2),
    (10, 'Blazer', 2019, 2),
    (10, 'Equinox', 2022, 3),

    -- Volkswagen (ID: 11)
    (11, 'Golf', 2022, 1),
    (11, 'Polo', 2021, 1),
    (11, 'Passat', 2020, 1),
    (11, 'Tiguan', 2019, 1),
    (11, 'Arteon', 2021, 2),
    (11, 'ID.4', 2020, 2),
    (11, 'T-Roc', 2019, 2),
    (11, 'Touareg', 2022, 2),

    -- Nissan (ID: 12)
    (12, 'GT-R', 2022, 1),
    (12, '370Z', 2021, 2),
    (12, 'Qashqai', 2020, 1),
    (12, 'Juke', 2019, 1),
    (12, 'Murano', 2021, 2),
    (12, 'Pathfinder', 2020, 2),
    (12, 'X-Trail', 2019, 2),
    (12, 'Leaf', 2022, 1),

    -- Porsche (ID: 13)
    (13, '911', 2022, 1),
    (13, 'Cayenne', 2021, 1),
    (13, 'Panamera', 2020, 1),
    (13, 'Taycan', 2019, 2),
    (13, 'Macan', 2021, 2),
    (13, 'Boxster', 2020, 2),
    (13, '718 Cayman', 2019, 2),
    (13, 'Carrera GT', 2022, 2),

    -- Lamborghini (ID: 14)
    (14, 'Huracan', 2022, 1),
    (14, 'Aventador', 2021, 1),
    (14, 'Urus', 2020, 2),
    (14, 'Gallardo', 2019, 1),
    (14, 'Diablo', 2021, 1),
    (14, 'Sesto Elemento', 2020, 3),
    (14, 'Veneno', 2019, 3),
    (14, 'Revuelto', 2022, 3),

    -- Mitsubishi (ID: 15)
    (15, 'Lancer Evolution', 2022, 1),
    (15, 'Outlander', 2021, 2),
    (15, 'Pajero', 2020, 1),
    (15, 'ASX', 2019, 2),
    (15, 'Eclipse Cross', 2021, 2),
    (15, 'Colt', 2020, 2),
    (15, 'Mirage', 2019, 3),
    (15, 'L200', 2022, 2),

    -- Subaru (ID: 16)
    (16, 'Impreza', 2022, 1),
    (16, 'WRX STI', 2021, 1),
    (16, 'Forester', 2020, 2),
    (16, 'BRZ', 2019, 2),
    (16, 'Levorg', 2021, 3),
    (16, 'Ascent', 2020, 3),
    (16, 'Legacy', 2019, 2),
    (16, 'SVX', 2022, 3),

    -- Mazda (ID: 17)
    (17, 'MX-5', 2022, 1),
    (17, 'RX-8', 2021, 1),
    (17, 'CX-5', 2020, 1),
    (17, 'Mazda 3', 2019, 1),
    (17, 'CX-9', 2021, 2),
    (17, '6', 2020, 2),
    (17, '2', 2019, 2),
    (17, 'Cosmo', 2022, 3),

    -- Jaguar (ID: 18)
    (18, 'F-Type', 2022, 2),
    (18, 'XE', 2021, 2),
    (18, 'XF', 2020, 2),
    (18, 'I-Pace', 2019, 2),
    (18, 'XJ', 2021, 2),
    (18, 'E-Pace', 2020, 2),
    (18, 'F-Pace', 2019, 2),
    (18, 'Mark X', 2022, 3),

    -- Tesla (ID: 19)
    (19, 'Model S', 2022, 1),
    (19, 'Model 3', 2021, 1),
    (19, 'Model X', 2020, 1),
    (19, 'Model Y', 2019, 1),
    (19, 'Roadster', 2021, 2),
    (19, 'Cybertruck', 2020, 1),
    (19, 'Semi', 2019, 2),
    (19, 'Model U', 2022, 3),

    -- Bugatti (ID: 20)
    (20, 'Chiron', 2022, 1),
    (20, 'Veyron', 2021, 1),
    (20, 'Divo', 2020, 2),
    (20, 'Centodieci', 2019, 3),
    (20, 'EB110', 2021, 2),
    (20, 'Type 57', 2020, 3),
    (20, 'Galibier', 2019, 3),
    (20, 'Bolide', 2022, 2),

    -- Alfa Romeo (ID: 21)
    (21, 'Giulia', 2022, 1),
    (21, 'Stelvio', 2021, 2),
    (21, 'Tonale', 2020, 2),
    (21, '8C', 2021, 3),
    (21, 'Brera', 2020, 2),
    (21, 'Giulietta', 2019, 1),
    (21, '33 Stradale', 2022, 3),

    -- Aston Martin (ID: 22)
    (22, 'DB11', 2022, 1),
    (22, 'Vantage', 2021, 1),
    (22, 'Rapide', 2021, 2),
    (22, 'DBX', 2020, 2),
    (22, 'Vanquish', 2019, 2),
    (22, 'Valhalla', 2022, 3),

    -- Bentley (ID: 23)
    (23, 'Continental GT', 2022, 1),
    (23, 'Bentayga', 2021, 2),
    (23, 'Mulsanne', 2021, 2),
    (23, 'Brooklands', 2020, 3),
    (23, 'Arnage', 2019, 3),
    (23, 'Flying Spur', 2022, 2),

    -- Citroën (ID: 24)
    (24, 'C3', 2022, 1),
    (24, 'C5 Aircross', 2021, 2),
    (24, 'DS3', 2021, 2),
    (24, 'DS7', 2020, 2),
    (24, 'C4 Picasso', 2019, 1),
    (24, 'C6', 2022, 3),

    -- Dacia (ID: 25)
    (25, 'Duster', 2022, 1),
    (25, 'Sandero', 2021, 1),
    (25, 'Logan', 2021, 1),
    (25, 'Spring', 2020, 2),
    (25, 'Dokker', 2019, 2),
    (25, 'Lodgy', 2022, 2),

    -- McLaren (ID: 40)
    (40, '720S', 2022, 2),
    (40, 'Speedtail', 2021, 3),
    (40, 'Senna', 2020, 2),
    (40, 'Elva', 2019, 3),
    (40, 'Artura', 2022, 3),

    -- Pagani (ID: 43)
    (43, 'Huayra', 2022, 2),
    (43, 'Zonda', 2021, 2),
    (43, 'Imola', 2020, 3),
    (43, 'R Revolución', 2019, 3),

    -- Koenigsegg (ID: 65)
    (65, 'Jesko', 2022, 3),
    (65, 'Regera', 2021, 2),
    -- Koenigsegg
    (65, 'Gemera', 2020, 3),
    (65, 'Agera RS', 2019, 2),
    -- Polestar
    (44, 'Polestar 2', 2022, 2),
    (44, '1', 2021, 2),
    (44, '3', 2022, 2),
    (44, '4', 2023, 2),
    -- Rivian
    (46, 'R1T', 2022, 2),
    (46, 'R1S', 2021, 2),
    (46, 'EDV 700', 2020, 3),
    -- Rolls-Royce
    (47, 'Phantom', 2022, 1),
    (47, 'Ghost', 2021, 1),
    (47, 'Cullinan', 2020, 2),
    (47, 'Wraith', 2019, 2),
    -- Lotus
    (38, 'Evora', 2022, 2),
    (38, 'Esprit', 2021, 2),
    (38, 'Elite', 2020, 3),
    (38, 'Europa', 2019, 3),
    (38, 'Eletre', 2022, 3),
    -- Mini
    (41, 'Cooper', 2022, 1),
    (41, 'Countryman', 2021, 1),
    (41, 'Paceman', 2020, 2),
    (41, 'Cabrio', 2019, 2),
    (41, 'Rocketman', 2022, 3),
    -- Caterham
    (56, 'Seven 170', 2022, 3),
    (56, 'Superlight R500', 2020, 3),
    (56, 'CSR', 2019, 3),
    (56, '310R', 2018, 3),
    -- Donkervoort
    (107, 'D8 GTO', 2019, 3),
    (107, 'D8 270 RS', 2016, 3),
    (107, 'D10', 2023, 3),
    (107, 'D8 235', 2014, 3),
    -- DeLorean
    (60, 'DMC-12', 1981, 1),
    (60, 'Alpha5', 2023, 3),
    (60, 'BTTF Edition', 2022, 3),
    (60, 'Omega', 2024, 3),
    -- Lucid
    (67, 'Air', 2022, 2),
    (67, 'Gravity', 2023, 3),
    (67, 'Sapphire', 2024, 3),
    (67, 'Pure', 2025, 3),
    -- Fisker
    (61, 'Ocean', 2023, 2),
    (61, 'Karma', 2019, 2),
    (61, 'Pear', 2022, 3),
    (61, 'Ronin', 2025, 3),
    -- GTA Motor
    (117, 'Spano', 2013, 3),
    (117, 'Spano R', 2016, 3),
    (117, 'Spano X', 2019, 3),
    (117, 'Spano GT', 2023, 3);