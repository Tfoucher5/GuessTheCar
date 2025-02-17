-- Supprime les anciennes données
DELETE FROM modeles;

DELETE FROM marques;

-- Réinitialise les ID auto-incrémentés
ALTER TABLE modeles AUTO_INCREMENT = 1;

ALTER TABLE marques AUTO_INCREMENT = 1;

-- Insertion des marques sans doublons
INSERT INTO
    marques (nom, pays)
VALUES
    ('Toyota', 'Japon'), -- 1
    ('Ford', 'USA'), -- 2
    ('BMW', 'Allemagne'), -- 3
    ('Peugeot', 'France'), -- 4
    ('Ferrari', 'Italie'), -- 5
    ('Mercedes', 'Allemagne'), -- 6
    ('Renault', 'France'), -- 7
    ('Honda', 'Japon'), -- 8
    ('Audi', 'Allemagne'), -- 9
    ('Chevrolet', 'USA'), -- 10
    ('Volkswagen', 'Allemagne'), -- 11
    ('Nissan', 'Japon'), -- 12
    ('Porsche', 'Allemagne'), -- 13
    ('Lamborghini', 'Italie'), -- 14
    ('Mitsubishi', 'Japon'), -- 15
    ('Subaru', 'Japon'), -- 16
    ('Mazda', 'Japon'), -- 17
    ('Jaguar', 'Royaume-Uni'), -- 18
    ('Tesla', 'USA'), -- 19
    ('Bugatti', 'France'), -- 20
    ('Alfa Romeo', 'Italie'), -- 21
    ('Aston Martin', 'Royaume-Uni'), -- 22
    ('Bentley', 'Royaume-Uni'), -- 23
    ('Citroën', 'France'), -- 24
    ('Dacia', 'Roumanie'), -- 25
    ('Dodge', 'USA'), -- 26
    ('Fiat', 'Italie'), -- 27
    ('Genesis', 'Corée du Sud'), -- 28
    ('GMC', 'USA'), -- 29
    ('Hyundai', 'Corée du Sud'), -- 30
    ('Infiniti', 'Japon'), -- 31
    ('Jeep', 'USA'), -- 32
    ('Kia', 'Corée du Sud'), -- 33
    ('Lancia', 'Italie'), -- 34
    ('Land Rover', 'Royaume-Uni'), -- 35
    ('Lexus', 'Japon'), -- 36
    ('Lincoln', 'USA'), -- 37
    ('Lotus', 'Royaume-Uni'), -- 38
    ('Maserati', 'Italie'), -- 39
    ('McLaren', 'Royaume-Uni'), -- 40
    ('Mini', 'Royaume-Uni'), -- 41
    ('Opel', 'Allemagne'), -- 42
    ('Pagani', 'Italie'), -- 43
    ('Polestar', 'Suède'), -- 44
    ('Ram', 'USA'), -- 45
    ('Rivian', 'USA'), -- 46
    ('Rolls-Royce', 'Royaume-Uni'), -- 47
    ('Saab', 'Suède'), -- 48
    ('SEAT', 'Espagne'), -- 49
    ('Skoda', 'République tchèque'), -- 50
    ('Acura', 'Japon'), -- 51
    ('Abarth', 'Italie'), -- 52
    ('BAIC', 'Chine'), -- 53
    ('Baojun', 'Chine'), -- 54
    ('Brabus', 'Allemagne'), -- 55
    ('Caterham', 'Royaume-Uni'), -- 56
    ('Chery', 'Chine'), -- 57
    ('Daewoo', 'Corée du Sud'), -- 58
    ('Daihatsu', 'Japon'), -- 59
    ('DeLorean', 'USA'), -- 60
    ('Fisker', 'USA'), -- 61
    ('Geely', 'Chine'), -- 62
    ('Great Wall', 'Chine'), -- 63
    ('Haval', 'Chine'), -- 64
    ('Koenigsegg', 'Suède'), -- 65
    ('Lada', 'Russie'), -- 66
    ('Lucid', 'USA'), -- 67
    ('Mahindra', 'Inde'), -- 68
    ('Maybach', 'Allemagne'), -- 69
    ('MG', 'Royaume-Uni'), -- 70
    ('Morgan', 'Royaume-Uni'), -- 71
    ('Pontiac', 'USA'), -- 72
    ('Proton', 'Malaisie'), -- 73
    ('Roewe', 'Chine'), -- 74
    ('Rover', 'Royaume-Uni'), -- 75
    ('Saturn', 'USA'), -- 76
    ('Scion', 'Japon'), -- 77
    ('Spyker', 'Pays-Bas'), -- 78
    ('SsangYong', 'Corée du Sud'), -- 79
    ('Tata', 'Inde'), -- 80
    ('Triumph', 'Royaume-Uni'), -- 81
    ('Vauxhall', 'Royaume-Uni'), -- 82
    ('VinFast', 'Vietnam'), -- 83
    ('Wiesmann', 'Allemagne'), -- 84
    ('Zagato', 'Italie'), -- 85
    ('Zotye', 'Chine'), -- 86
    ('Faraday Future', 'USA'), -- 87
    ('BYD', 'Chine'), -- 88
    ('Alpina', 'Allemagne'), -- 89
    ('AMC', 'USA'), -- 90
    ('Arrinera', 'Pologne'), -- 91
    ('Artega', 'Allemagne'), -- 92
    ('Aspark', 'Japon'), -- 93
    ('Austin', 'Royaume-Uni'), -- 94
    ('BAC', 'Royaume-Uni'), -- 95
    ('Bellier', 'France'), -- 96
    ('Bertone', 'Italie'), -- 97
    ('Bizzarrini', 'Italie'), -- 98
    ('Borgward', 'Allemagne'), -- 99
    ('Bristol', 'Royaume-Uni'), -- 100
    ('Byton', 'Chine'), -- 101
    ('Cizeta', 'Italie'), -- 102
    ('Cord', 'USA'), -- 103
    ('Cupra', 'Espagne'), -- 104
    ('Datsun', 'Japon'), -- 105
    ('De Tomaso', 'Italie'), -- 106
    ('Donkervoort', 'Pays-Bas'), -- 107
    ('Eagle', 'Royaume-Uni'), -- 108
    ('Edsel', 'USA'), -- 109
    ('Elemental', 'Royaume-Uni'), -- 110
    ('Exagon', 'France'), -- 111
    ('Facel Vega', 'France'), -- 112
    ('Farbio', 'Royaume-Uni'), -- 113
    ('Force Motors', 'Inde'), -- 114
    ('Gemballa', 'Allemagne'), -- 115
    ('Ginetta', 'Royaume-Uni'), -- 116
    ('GTA Motor', 'Espagne'), -- 117
    ('Hennessey', 'USA'), -- 118
    ('Hindustan', 'Inde'), -- 119
    ('Hommell', 'France'), -- 120
    ('HTT', 'Canada'), -- 121
    ('ICML', 'Inde'), -- 122
    ('Iso', 'Italie'), -- 123
    ('Isuzu', 'Japon'), -- 124
    ('Jensen', 'Royaume-Uni'), -- 125
    ('Karma', 'USA'), -- 126
    ('Keating', 'Royaume-Uni'), -- 127
    ('KTM', 'Autriche'), -- 128
    ('Lanchester', 'Royaume-Uni'), -- 129
    ('Laraki', 'Maroc'), -- 130
    ('Ligier', 'France'), -- 131
    ('Lynk & Co', 'Chine'), -- 132
    ('Marcos', 'Royaume-Uni'), -- 133
    ('Mastretta', 'Mexique'), -- 134
    ('Mitsuoka', 'Japon');

-- 135
-- Insertion des modèles avec les IDs corrigés
INSERT INTO
    modeles (marque_id, nom, annee, difficulte)
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
    -- Dodge (ID: 26)
    (26, 'Challenger', 2022, 1),
    (26, 'Charger', 2021, 1),
    (26, 'Durango', 2020, 2),
    -- Fiat (ID: 27)
    (27, '500', 2022, 1),
    (27, 'Panda', 2021, 1),
    (27, 'Tipo', 2020, 2),
    -- Genesis (ID: 28)
    (28, 'G70', 2022, 2),
    (28, 'G80', 2021, 2),
    (28, 'GV80', 2020, 2),
    -- GMC (ID: 29)
    (29, 'Sierra', 2022, 2),
    (29, 'Yukon', 2021, 2),
    (29, 'Terrain', 2020, 2),
    -- Hyundai (ID: 30)
    (30, 'Tucson', 2022, 1),
    (30, 'Santa Fe', 2021, 1),
    (30, 'i30', 2020, 1),
    -- Infiniti (ID: 31)
    (31, 'Q50', 2022, 2),
    (31, 'QX60', 2021, 2),
    (31, 'Q60', 2020, 2),
    -- Jeep (ID: 32)
    (32, 'Wrangler', 2022, 1),
    (32, 'Grand Cherokee', 2021, 1),
    (32, 'Compass', 2020, 2),
    -- Kia (ID: 33)
    (33, 'Sportage', 2022, 1),
    (33, 'Sorento', 2021, 1),
    (33, 'Stinger', 2020, 2),
    -- Lancia (ID: 34)
    (34, 'Ypsilon', 2022, 2),
    (34, 'Delta', 2020, 2),
    (34, 'Stratos', 1973, 1),
    -- Land Rover (ID: 35)
    (35, 'Range Rover', 2022, 1),
    (35, 'Defender', 2021, 1),
    (35, 'Discovery', 2020, 2),
    -- Lexus (ID: 36)
    (36, 'IS', 2022, 2),
    (36, 'RX', 2021, 2),
    (36, 'LS', 2020, 2),
    -- Lincoln (ID: 37)
    (37, 'Navigator', 2022, 2),
    (37, 'Aviator', 2021, 2),
    (37, 'Continental', 2020, 2),
    -- Lotus
    (38, 'Evora', 2022, 2),
    (38, 'Esprit', 2021, 2),
    (38, 'Elite', 2020, 3),
    (38, 'Europa', 2019, 3),
    (38, 'Eletre', 2022, 3),
    -- Maserati (ID: 39)
    (39, 'Ghibli', 2022, 2),
    (39, 'Levante', 2021, 2),
    (39, 'Quattroporte', 2020, 2),
    -- McLaren (ID: 40)
    (40, '720S', 2022, 2),
    (40, 'Speedtail', 2021, 3),
    (40, 'Senna', 2020, 2),
    (40, 'Elva', 2019, 3),
    (40, 'Artura', 2022, 3),
    -- Mini
    (41, 'Cooper', 2022, 1),
    (41, 'Countryman', 2021, 1),
    (41, 'Paceman', 2020, 2),
    (41, 'Cabrio', 2019, 2),
    (41, 'Rocketman', 2022, 3),
    -- Opel (ID: 42)
    (42, 'Corsa', 2022, 1),
    (42, 'Astra', 2021, 1),
    (42, 'Insignia', 2020, 2),
    -- Pagani (ID: 43)
    (43, 'Huayra', 2022, 2),
    (43, 'Zonda', 2021, 2),
    (43, 'Imola', 2020, 3),
    (43, 'R Revolución', 2019, 3),
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
    (49, 'Leon', 2022, 1),
    (49, 'Ibiza', 2021, 1),
    (49, 'Ateca', 2020, 2),
    (49, 'Tarraco', 2021, 2),
    (49, 'Arona', 2022, 2),
    (50, 'Octavia', 2022, 1),
    (50, 'Superb', 2021, 2),
    (50, 'Kodiaq', 2020, 2),
    (50, 'Fabia', 2021, 1),
    (50, 'Karoq', 2022, 2),
    (51, 'NSX', 2022, 2),
    (51, 'TLX', 2021, 2),
    (51, 'MDX', 2020, 2),
    (51, 'RDX', 2021, 2),
    (51, 'Integra', 2022, 1),
    (52, '500', 2022, 1),
    (52, '595', 2021, 2),
    (52, '695', 2020, 2),
    (52, '124 Spider', 2019, 2),
    (52, 'Punto', 2018, 2),
    (53, 'EU5', 2022, 2),
    (53, 'X7', 2021, 2),
    (53, 'BJ40', 2020, 2),
    (53, 'EC5', 2021, 2),
    (53, 'EU7', 2022, 2),
    (54, 'RC-5', 2022, 2),
    (54, 'E300', 2021, 2),
    (54, '530', 2020, 2),
    (54, 'RS-3', 2021, 2),
    (54, 'RS-5', 2022, 2),
    (55, 'G900', 2022, 3),
    (55, 'Rocket 900', 2021, 3),
    (55, 'S800', 2020, 3),
    (55, 'GLE 800', 2021, 3),
    (55, 'E V12', 2019, 3),
    (57, 'Tiggo 8', 2022, 2),
    (57, 'Arrizo 5', 2021, 2),
    (57, 'Tiggo 7', 2020, 2),
    (57, 'eQ1', 2021, 2),
    (57, 'Tiggo 4', 2022, 2),
    (58, 'Lanos', 2002, 1),
    (58, 'Matiz', 2004, 1),
    (58, 'Nubira', 2003, 2),
    (58, 'Leganza', 2002, 2),
    (58, 'Espero', 1999, 2),
    (59, 'Terios', 2022, 2),
    (59, 'Rocky', 2021, 2),
    (59, 'Taft', 2020, 2),
    (59, 'Xenia', 2021, 2),
    (59, 'Copen', 2019, 2),
    (62, 'Coolray', 2022, 2),
    (62, 'Okavango', 2021, 2),
    (62, 'Azkarra', 2020, 2),
    (62, 'Emgrand', 2021, 2),
    (62, 'Tugella', 2022, 2),
    (63, 'Haval H6', 2022, 2),
    (63, 'Poer', 2021, 2),
    (63, 'Cannon', 2020, 2),
    (63, 'Tank 300', 2021, 3),
    (63, 'Ora Cat', 2022, 2),
    (64, 'H6', 2022, 2),
    (64, 'Jolion', 2021, 2),
    (64, 'H9', 2020, 2),
    (64, 'F7', 2021, 2),
    (64, 'H2', 2022, 2),
    (66, 'Niva', 2022, 1),
    (66, 'Vesta', 2021, 2),
    (66, 'XRAY', 2020, 2),
    (66, 'Granta', 2021, 2),
    (66, 'Kalina', 2018, 2),
    (68, 'Thar', 2022, 2),
    (68, 'XUV700', 2021, 2),
    (68, 'Scorpio', 2020, 2),
    (68, 'XUV300', 2021, 2),
    (68, 'Bolero', 2022, 2),
    (69, 'S-Class', 2022, 2),
    (69, 'GLS', 2021, 2),
    (69, '57', 2012, 1),
    (69, '62', 2012, 1),
    (69, 'Landaulet', 2011, 3),
    (70, 'ZS', 2022, 2),
    (70, 'HS', 2021, 2),
    (70, '5', 2020, 2),
    (70, 'Marvel R', 2021, 2),
    (70, 'Cyberster', 2023, 3),
    (71, 'Plus Four', 2022, 3),
    (71, 'Plus Six', 2021, 3),
    (71, '3 Wheeler', 2020, 3),
    (71, 'Aero 8', 2018, 3),
    (71, 'Roadster', 2019, 3),
    (72, 'GTO', 2006, 1),
    (72, 'Firebird', 2002, 1),
    (72, 'Trans Am', 2002, 1),
    (72, 'Grand Prix', 2008, 2),
    (72, 'Solstice', 2009, 2),
    (73, 'Saga', 2022, 2),
    (73, 'X70', 2021, 2),
    (73, 'Persona', 2020, 2),
    (73, 'Iriz', 2021, 2),
    (73, 'X50', 2022, 2),
    (74, 'i5', 2022, 2),
    (74, 'RX5', 2021, 2),
    (74, 'i6', 2020, 2),
    (74, 'Marvel X', 2021, 2),
    (74, 'ERX5', 2022, 2),
    (75, '75', 1999, 2),
    (75, '25', 2000, 2),
    (75, '45', 2000, 2),
    (75, '600', 1999, 2),
    (75, 'Streetwise', 2003, 2),
    (76, 'Ion', 2007, 2),
    (76, 'Vue', 2009, 2),
    (76, 'Aura', 2009, 2),
    (76, 'Sky', 2009, 2),
    (76, 'Outlook', 2009, 2),
    (77, 'tC', 2016, 2),
    (77, 'xB', 2015, 2),
    (77, 'xD', 2014, 2),
    (77, 'FR-S', 2016, 2),
    (77, 'iQ', 2015, 2),
    (78, 'C8', 2010, 3),
    (78, 'C12', 2009, 3),
    (78, 'D8', 2006, 3),
    (78, 'C8 Laviolette', 2009, 3),
    (78, 'B6', 2013, 3),
    (79, 'Rexton', 2022, 2),
    (79, 'Tivoli', 2021, 2),
    (79, 'Korando', 2020, 2),
    (79, 'Musso', 2021, 2),
    (79, 'Rodius', 2019, 2),
    (80, 'Harrier', 2022, 2),
    (80, 'Safari', 2021, 2),
    (80, 'Nexon', 2020, 2),
    (80, 'Altroz', 2021, 2),
    (80, 'Punch', 2022, 2),
    (81, 'TR6', 1969, 2),
    (81, 'Spitfire', 1970, 2),
    (81, 'GT6', 1970, 2),
    (81, 'Herald', 1971, 2),
    (81, 'Stag', 1972, 2),
    (82, 'Corsa', 2022, 1),
    (82, 'Astra', 2021, 1),
    (82, 'Insignia', 2020, 2),
    (82, 'Crossland', 2021, 2),
    (82, 'Grandland', 2022, 2),
    (83, 'VF e34', 2022, 2),
    (83, 'VF e35', 2021, 2),
    (83, 'VF e36', 2022, 2),
    (83, 'President', 2021, 3),
    (83, 'Fadil', 2020, 2),
    (84, 'MF3', 2012, 3),
    (84, 'GT', 2010, 3),
    (84, 'Roadster', 2011, 3),
    (84, 'MF4', 2013, 3),
    (84, 'MF5', 2011, 3),
    (85, 'DB4 GT', 1960, 3),
    (85, 'Raptor', 2019, 3),
    (85, 'Mostro', 2015, 3),
    (85, 'V12', 2012, 3),
    (85, 'TZ3', 2011, 3),
    (86, 'T600', 2020, 2),
    (86, 'SR9', 2019, 2),
    (86, 'Z100', 2018, 2),
    (86, 'T700', 2020, 2),
    (86, 'E200', 2019, 2),
    (87, 'FF91', 2022, 3),
    (87, 'FF81', 2023, 3),
    (87, 'FF71', 2024, 3),
    (87, 'Prototype', 2021, 3),
    (87, 'Vision', 2025, 3),
    (88, 'Han', 2022, 2),
    (88, 'Tang', 2021, 2),
    (88, 'Song', 2020, 2),
    (88, 'Yuan', 2021, 2),
    (88, 'Dolphin', 2022, 2),
    (89, 'B3', 2022, 3),
    (89, 'B5', 2021, 3),
    (89, 'B7', 2020, 3),
    (89, 'XB7', 2021, 3),
    (89, 'D3', 2022, 3),
    (91, 'Hussarya', 2022, 3),
    (91, 'GT', 2021, 3),
    (91, '33', 2020, 3),
    (91, 'Race', 2023, 3),
    (91, 'Street', 2024, 3),
    (92, 'GT', 2011, 3),
    (92, 'Sport', 2012, 3),
    (92, 'R', 2013, 3),
    (92, 'Evolution', 2014, 3),
    (92, 'Race', 2015, 3),
    (93, 'Owl', 2022, 3),
    (93, 'Electric', 2023, 3),
    (93, 'Vision', 2024, 3),
    (93, 'Future', 2025, 3),
    (93, 'Speed', 2026, 3),
    (94, 'Seven', 1970, 2),
    (94, 'Mini', 1969, 1),
    (94, 'Allegro', 1973, 2),
    (94, 'Maxi', 1971, 2),
    (94, 'Princess', 1975, 2),
    (95, 'Mono', 2022, 3),
    (95, 'Mono R', 2021, 3),
    (95, 'Mono Classic', 2020, 3),
    (95, 'Track', 2023, 3),
    (95, 'Street', 2024, 3),
    (96, 'Docker', 2022, 2),
    (96, 'Opale', 2021, 2),
    (96, 'Divane', 2020, 2),
    (96, 'B8', 2023, 2),
    (96, 'JS50', 2024, 2),
    (97, 'Nuccio', 2012, 3),
    (97, 'Mantide', 2009, 3),
    (97, 'Suizhou', 2011, 3),
    (97, 'GT', 2010, 3),
    (97, 'Concept', 2013, 3),
    (98, 'P538', 1966, 3),
    (98, '5300 GT', 1968, 3),
    (98, 'P578', 1967, 3),
    (98, 'Giotto', 1968, 3),
    (98, 'AMR', 2020, 3),
    (99, 'BX7', 2018, 2),
    (99, 'BX5', 2017, 2),
    (99, 'Isabella', 2020, 3),
    (99, 'BXi7', 2019, 2),
    (99, 'Classic', 2021, 3),
    (100, 'Fighter', 2004, 3),
    (100, '411', 2003, 3),
    (100, 'Blenheim', 2002, 3),
    (100, 'Speedster', 2005, 3),
    (100, 'Type 603', 2001, 3),
    (101, 'M-Byte', 2022, 3),
    (101, 'K-Byte', 2023, 3),
    (101, 'Concept', 2021, 3),
    (101, 'SUV', 2024, 3),
    (101, 'Sedan', 2025, 3),
    (102, 'V16T', 1991, 3),
    (102, 'Moroder', 1992, 3),
    (102, 'TTJ', 1993, 3),
    (102, 'Fenice', 2003, 3),
    (102, 'Vision', 2022, 3),
    (103, '810', 1936, 3),
    (103, '812', 1937, 3),
    -- Koenigsegg (ID: 65)
    (65, 'Jesko', 2022, 3),
    (65, 'Regera', 2021, 2),
    -- Koenigsegg
    (65, 'Gemera', 2020, 3),
    (65, 'Agera RS', 2019, 2),
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
    -- AMC
    (90, 'Javelin', 1967, 2),
    (90, 'Gremlin', 1970, 3),
    (90, 'Pacer', 1975, 3),
    (90, 'Eagle', 1979, 2),
    (90, 'Matador', 1971, 2),
    (90, 'Hornet', 1970, 2),
    (90, 'Rebel', 1967, 2),
    (90, 'Marlin', 1965, 3),
    (90, 'Rambler American', 1958, 3),
    -- GTA Motor
    (117, 'Spano', 2013, 3),
    (117, 'Spano R', 2016, 3),
    (117, 'Spano X', 2019, 3),
    (117, 'Spano GT', 2023, 3),
    -- Hennessey (ID: 118)
    (118, 'Venom GT', 2022, 3),
    (118, 'Venom F5', 2021, 3),
    (118, 'VelociRaptor', 2020, 2),
    (118, 'Exorcist', 2019, 2),
    (118, 'Venom GT Spyder', 2018, 3),
    -- HTT (ID: 121)
    (121, 'Pléthore LC-750', 2022, 3),
    (121, 'Concept EV', 2021, 3),
    (121, 'Sport GT', 2020, 3),
    (121, 'Roadster', 2019, 3),
    (121, 'Prototype X', 2018, 3),
    -- ICML (ID: 122)
    (122, 'Rhino', 2022, 2),
    (122, 'Extreme', 2021, 2),
    (122, 'Cargo', 2020, 2),
    (122, 'Commander', 2019, 2),
    (122, 'Explorer', 2018, 2),
    -- Iso (ID: 123)
    (123, 'Grifo', 2022, 3),
    (123, 'Rivolta', 2021, 3),
    (123, 'Fidia', 2020, 3),
    (123, 'Lele', 2019, 3),
    (123, 'GT', 2018, 3),
    -- Isuzu (ID: 124)
    (124, 'D-Max', 2022, 2),
    (124, 'MU-X', 2021, 2),
    (124, 'NPR', 2020, 2),
    (124, 'FVR', 2019, 2),
    (124, 'NQR', 2018, 2),
    -- Jensen (ID: 125)
    (125, 'Interceptor', 2022, 3),
    (125, 'FF', 2021, 3),
    (125, 'GT', 2020, 3),
    (125, 'CV8', 2019, 3),
    (125, 'S-Type', 2018, 3),
    -- Karma (ID: 126)
    (126, 'GS-6', 2022, 2),
    (126, 'Revero', 2021, 2),
    (126, 'GT', 2020, 2),
    (126, 'GSe-6', 2019, 2),
    (126, 'Pininfarina', 2018, 3),
    -- Keating (ID: 127)
    (127, 'Bolt', 2022, 3),
    (127, 'SKR', 2021, 3),
    (127, 'Berus', 2020, 3),
    (127, 'TKR', 2019, 3),
    (127, 'Supercar', 2018, 3),
    -- KTM (ID: 128)
    (128, 'X-Bow', 2022, 3),
    (128, 'X-Bow GT', 2021, 3),
    (128, 'X-Bow R', 2020, 3),
    (128, 'X-Bow GTX', 2019, 3),
    (128, 'X-Bow GT2', 2018, 3),
    -- Lanchester (ID: 129)
    (129, 'Eighteen', 2022, 3),
    (129, 'Roadrider', 2021, 3),
    (129, 'Sprite', 2020, 3),
    (129, 'Ten', 2019, 3),
    (129, 'Forty', 2018, 3),
    -- Laraki (ID: 130)
    (130, 'Epitome', 2022, 3),
    (130, 'Borac', 2021, 3),
    (130, 'Fulgura', 2020, 3),
    (130, 'Sahara', 2019, 3),
    (130, 'Preliator', 2018, 3),
    -- Ligier (ID: 131)
    (131, 'JS2 R', 2022, 3),
    (131, 'JS P4', 2021, 3),
    (131, 'JS50', 2020, 2),
    (131, 'JS60', 2019, 2),
    (131, 'X-Too', 2018, 2),
    -- Lynk & Co (ID: 132)
    (132, '01', 2022, 2),
    (132, '02', 2021, 2),
    (132, '03', 2020, 2),
    (132, '05', 2019, 2),
    (132, '09', 2018, 2),
    -- Marcos (ID: 133)
    (133, 'TSO GT2', 2022, 3),
    (133, 'Mantis', 2021, 3),
    (133, 'LM600', 2020, 3),
    (133, 'Mantaray', 2019, 3),
    (133, 'GT', 2018, 3),
    -- Mastretta (ID: 134)
    (134, 'MXT', 2022, 3),
    (134, 'MXT-R', 2021, 3),
    (134, 'MXT GT', 2020, 3),
    (134, 'MXT Sport', 2019, 3),
    (134, 'MXT Race', 2018, 3),
    -- Mitsuoka (ID: 135)
    (135, 'Himiko', 2022, 3),
    (135, 'Rock Star', 2021, 3),
    (135, 'Le-Seyde', 2020, 3),
    (135, 'Viewt', 2019, 2),
    (135, 'Galue', 2018, 2),
    -- Cupra (ID: 104)
    (104, 'Formentor', 2022, 2),
    (104, 'Born', 2021, 2),
    (104, 'Leon', 2020, 1),
    (104, 'Ateca', 2019, 2),
    (104, 'Tavascan', 2023, 3),
    -- Force Motors (ID: 114)
    (114, 'Gurkha', 2022, 2),
    (114, 'Traveller', 2021, 2),
    (114, 'Trump', 2020, 2),
    (114, 'Trax', 2019, 2),
    (114, 'One', 2018, 2),
    -- Gemballa (ID: 115)
    (115, 'Avalanche', 2022, 3),
    (115, 'Mirage GT', 2021, 3),
    (115, 'GTR', 2020, 3),
    (115, 'Tornado', 2019, 3),
    (115, 'MIG-U1', 2018, 3),
    -- Ginetta (ID: 116)
    (116, 'G60', 2022, 3),
    (116, 'G55', 2021, 3),
    (116, 'G40', 2020, 3),
    (116, 'Akula', 2019, 3),
    (116, 'G58', 2018, 3),
    -- Hindustan (ID: 119)
    (119, 'Ambassador', 2022, 2),
    (119, 'Contessa', 2021, 2),
    (119, 'Trekker', 2020, 2),
    (119, 'Pushpak', 2019, 2),
    (119, 'Porter', 2018, 2),
    -- Hommell (ID: 120)
    (120, 'Barquette', 2022, 3),
    (120, 'Berlinette RS', 2021, 3),
    (120, 'Sport RS2', 2020, 3),
    (120, 'Coupe', 2019, 3),
    (120, 'GT', 2018, 3),
    -- Cord (ID: 103)
    (103, '810', 1936, 3),
    (103, '812', 1937, 3),
    (103, 'L-29', 1929, 3),
    (103, 'E-1', 1932, 3),
    (103, 'Westchester', 1937, 3),
    -- Eagle (ID: 108)
    (108, 'Speedster', 2022, 3),
    (108, 'Low Drag GT', 2021, 3),
    (108, 'E-Type', 2020, 3),
    (108, 'Lightweight GT', 2019, 3),
    (108, 'Spyder GT', 2018, 3),
    -- Edsel (ID: 109)
    (109, 'Ranger', 1960, 3),
    (109, 'Corsair', 1959, 3),
    (109, 'Pacer', 1958, 3),
    (109, 'Citation', 1958, 3),
    (109, 'Villager', 1958, 3),
    -- Elemental (ID: 110)
    (110, 'RP1', 2022, 3),
    (110, 'RP1 GT', 2021, 3),
    (110, 'RP1 Race', 2020, 3),
    (110, 'RP1 Sport', 2019, 3),
    (110, 'RP1 Track', 2018, 3),
    -- Exagon (ID: 111)
    (111, 'Furtive-eGT', 2022, 3),
    (111, 'Sport', 2021, 3),
    (111, 'GT', 2020, 3),
    (111, 'Race', 2019, 3),
    (111, 'Electric', 2018, 3),
    -- Facel Vega (ID: 112)
    (112, 'HK500', 1959, 3),
    (112, 'Excellence', 1958, 3),
    (112, 'Facel II', 1962, 3),
    (112, 'Facellia', 1960, 3),
    (112, 'FV4', 1957, 3),
    -- Farbio (ID: 113)
    (113, 'GTS', 2022, 3),
    (113, 'GTS Sport', 2021, 3),
    (113, 'GTS Race', 2020, 3),
    (113, 'GTS GT', 2019, 3),
    (113, 'GTS SuperSport', 2018, 3),
    (48, '900', 1993, 1),
    (48, '9-3', 2002, 1),
    (48, '9-5', 2003, 2),
    (48, 'Sonett', 1970, 3),
    (48, '99 Turbo', 1978, 2),
    (45, '1500', 2022, 1),
    (45, '2500', 2021, 2),
    (45, '3500', 2020, 2),
    (45, 'ProMaster', 2021, 2),
    (45, 'TRX', 2022, 2),
    (106, 'Pantera', 1971, 2),
    (106, 'Mangusta', 1967, 2),
    (106, 'Vallelunga', 1964, 3),
    (106, 'Deauville', 1971, 3),
    (106, 'Longchamp', 1972, 3),
    (105, '240Z', 1970, 1),
    (105, '510', 1968, 2),
    (105, 'Fairlady', 1969, 2),
    (105, 'Go', 2014, 1),
    (105, 'redi-GO', 2016, 1);