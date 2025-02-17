-- Supprime les anciennes données
DELETE FROM modeles;
DELETE FROM marques;

-- Réinitialise les ID auto-incrémentés
ALTER TABLE modeles AUTO_INCREMENT = 1;
ALTER TABLE marques AUTO_INCREMENT = 1;

-- Les inserts des marques restent identiques
INSERT INTO marques (nom, pays)
VALUES
    ('Toyota', 'Japon'),
    ('Ford', 'USA'),
    ('BMW', 'Allemagne'),
    ('Peugeot', 'France'),
    ('Ferrari', 'Italie'),
    ('Mercedes', 'Allemagne'),
    ('Renault', 'France'),
    ('Honda', 'Japon'),
    ('Audi', 'Allemagne'),
    ('Chevrolet', 'USA'),
    ('Volkswagen', 'Allemagne'),
    ('Nissan', 'Japon'),
    ('Porsche', 'Allemagne'),
    ('Lamborghini', 'Italie'),
    ('Mitsubishi', 'Japon'),
    ('Subaru', 'Japon'),
    ('Mazda', 'Japon'),
    ('Jaguar', 'Royaume-Uni'),
    ('Tesla', 'USA'),
    ('Bugatti', 'France'),
    ('Alfa Romeo', 'Italie'),
    ('Aston Martin', 'Royaume-Uni'),
    ('Bentley', 'Royaume-Uni'),
    ('Citroën', 'France'),
    ('Dacia', 'Roumanie'),
    ('Dodge', 'USA'),
    ('Fiat', 'Italie'),
    ('Genesis', 'Corée du Sud'),
    ('GMC', 'USA'),
    ('Hyundai', 'Corée du Sud'),
    ('Infiniti', 'Japon'),
    ('Jeep', 'USA'),
    ('Kia', 'Corée du Sud'),
    ('Lancia', 'Italie'),
    ('Land Rover', 'Royaume-Uni'),
    ('Lexus', 'Japon'),
    ('Lincoln', 'USA'),
    ('Lotus', 'Royaume-Uni'),
    ('Maserati', 'Italie'),
    ('McLaren', 'Royaume-Uni'),
    ('Mini', 'Royaume-Uni'),
    ('Opel', 'Allemagne'),
    ('Pagani', 'Italie'),
    ('Polestar', 'Suède'),
    ('Ram', 'USA'),
    ('Rivian', 'USA'),
    ('Rolls-Royce', 'Royaume-Uni'),
    ('Saab', 'Suède'),
    ('Seat', 'Espagne'),
    ('Skoda', 'République tchèque'),
    ('Acura', 'Japon'),
    ('Abarth', 'Italie'),
    ('BAIC', 'Chine'),
    ('Baojun', 'Chine'),
    ('Brabus', 'Allemagne'),
    ('Caterham', 'Royaume-Uni'),
    ('Chery', 'Chine'),
    ('Daewoo', 'Corée du Sud'),
    ('Daihatsu', 'Japon'),
    ('DeLorean', 'États-Unis'),
    ('Fisker', 'États-Unis'),
    ('Geely', 'Chine'),
    ('Great Wall', 'Chine'),
    ('Haval', 'Chine'),
    ('Koenigsegg', 'Suède'),
    ('Lada', 'Russie'),
    ('Lexus', 'Japon'),
    ('Lucid', 'États-Unis'),
    ('Mahindra', 'Inde'),
    ('Maserati', 'Italie'),
    ('Maybach', 'Allemagne'),
    ('MG', 'Royaume-Uni'),
    ('Morgan', 'Royaume-Uni'),
    ('Opel', 'Allemagne'),
    ('Pagani', 'Italie'),
    ('Polestar', 'Suède'),
    ('Pontiac', 'États-Unis'),
    ('Proton', 'Malaisie'),
    ('Ram', 'États-Unis'),
    ('Rivian', 'États-Unis'),
    ('Roewe', 'Chine'),
    ('Rolls-Royce', 'Royaume-Uni'),
    ('Rover', 'Royaume-Uni'),
    ('Saab', 'Suède'),
    ('Saturn', 'États-Unis'),
    ('Scion', 'Japon'),
    ('SEAT', 'Espagne'),
    ('Skoda', 'République tchèque'),
    ('Spyker', 'Pays-Bas'),
    ('SsangYong', 'Corée du Sud'),
    ('Tata', 'Inde'),
    ('Triumph', 'Royaume-Uni'),
    ('Vauxhall', 'Royaume-Uni'),
    ('VinFast', 'Vietnam'),
    ('Wiesmann', 'Allemagne'),
    ('Zagato', 'Italie'),
    ('Zotye', 'Chine'),
    ('Faraday Future', 'États-Unis'),
    ('BYD', 'Chine'),
    ('GMC', 'États-Unis'),
    ('Alpina', 'Allemagne'),
    ('AMC', 'États-Unis'),
    ('Arrinera', 'Pologne'),
    ('Artega', 'Allemagne'),
    ('Aspark', 'Japon'),
    ('Austin', 'Royaume-Uni'),
    ('BAC', 'Royaume-Uni'),
    ('Bellier', 'France'),
    ('Bertone', 'Italie'),
    ('Bizzarrini', 'Italie'),
    ('Borgward', 'Allemagne'),
    ('Bristol', 'Royaume-Uni'),
    ('Byton', 'Chine'),
    ('Cizeta', 'Italie'),
    ('Cord', 'États-Unis'),
    ('Cupra', 'Espagne'),
    ('Dacia', 'Roumanie'),
    ('Datsun', 'Japon'),
    ('De Tomaso', 'Italie'),
    ('Donkervoort', 'Pays-Bas'),
    ('Eagle', 'Royaume-Uni'),
    ('Edsel', 'États-Unis'),
    ('Elemental', 'Royaume-Uni'),
    ('Exagon', 'France'),
    ('Facel Vega', 'France'),
    ('Farbio', 'Royaume-Uni'),
    ('Force Motors', 'Inde'),
    ('Gemballa', 'Allemagne'),
    ('Ginetta', 'Royaume-Uni'),
    ('GTA Motor', 'Espagne'),
    ('Hennessey', 'États-Unis'),
    ('Hindustan', 'Inde'),
    ('Hommell', 'France'),
    ('HTT', 'Canada'),
    ('ICML', 'Inde'),
    ('Iso', 'Italie'),
    ('Isuzu', 'Japon'),
    ('Jensen', 'Royaume-Uni'),
    ('Karma', 'États-Unis'),
    ('Keating', 'Royaume-Uni'),
    ('KTM', 'Autriche'),
    ('Lanchester', 'Royaume-Uni'),
    ('Lancia', 'Italie'),
    ('Laraki', 'Maroc'),
    ('Ligier', 'France'),
    ('Lynk & Co', 'Chine'),
    ('Marcos', 'Royaume-Uni'),
    ('Mastretta', 'Mexique'),
    ('Mitsuoka', 'Japon'),
    ('Morgan', 'Royaume-Uni');

-- Inserts des modèles avec leurs niveaux de difficulté
INSERT INTO modeles (marque_id, nom, annee, difficulte)
VALUES
    -- Toyota
    (1, 'Corolla', 2020, 1),
    (1, 'Supra', 2019, 3),
    (1, 'Yaris', 2021, 1),
    (1, 'Land Cruiser', 2018, 2),
    (1, 'Hilux', 2021, 2),
    (1, 'C-HR', 2020, 1),
    (1, 'Avalon', 2019, 2),
    (1, 'Highlander', 2022, 2),

    -- Ford
    (2, 'Mustang', 2021, 3),
    (2, 'Focus', 2020, 1),
    (2, 'F-150', 2019, 2),
    (2, 'Explorer', 2022, 2),
    (2, 'Bronco', 2021, 2),
    (2, 'Ranger', 2020, 2),
    (2, 'Edge', 2019, 2),
    (2, 'Escape', 2022, 1),

    -- BMW
    (3, 'M3', 2022, 3),
    (3, 'X5', 2021, 2),
    (3, 'Serie 7', 2020, 2),
    (3, 'Z4', 2018, 3),
    (3, 'M4', 2021, 3),
    (3, 'X3', 2020, 2),
    (3, 'X7', 2019, 2),
    (3, 'i8', 2022, 3),

    -- Peugeot
    (4, '208', 2023, 1),
    (4, '308', 2022, 1),
    (4, '508', 2021, 2),
    (4, '2008', 2020, 1),
    (4, '5008', 2021, 2),
    (4, 'RCZ', 2020, 2),
    (4, '607', 2019, 2),
    (4, 'Partner', 2022, 1),

    -- Ferrari
    (5, '488 GTB', 2018, 3),
    (5, 'F8 Tributo', 2021, 3),
    (5, 'Roma', 2020, 3),
    (5, 'SF90 Stradale', 2022, 3),
    (5, 'LaFerrari', 2021, 3),
    (5, 'Enzo', 2020, 3),
    (5, 'Portofino', 2019, 3),
    (5, 'California', 2022, 3),

    -- Mercedes
    (6, 'Classe A', 2021, 1),
    (6, 'Classe C', 2020, 2),
    (6, 'Classe E', 2019, 2),
    (6, 'GLE', 2022, 2),
    (6, 'GLS', 2021, 2),
    (6, 'SL', 2020, 3),
    (6, 'AMG GT', 2019, 3),
    (6, 'SLS AMG', 2022, 3),

    -- Renault
    (7, 'Clio', 2023, 1),
    (7, 'Megane', 2021, 1),
    (7, 'Captur', 2020, 1),
    (7, 'Talisman', 2019, 2),
    (7, 'Kadjar', 2021, 1),
    (7, 'Scenic', 2020, 1),
    (7, 'Espace', 2019, 2),
    (7, 'Koleos', 2022, 2),

    -- Honda
    (8, 'Civic', 2022, 1),
    (8, 'Accord', 2021, 2),
    (8, 'CR-V', 2020, 1),
    (8, 'NSX', 2019, 3),
    (8, 'Jazz', 2021, 1),
    (8, 'HR-V', 2020, 1),
    (8, 'Legend', 2019, 2),
    (8, 'Odyssey', 2022, 1),

    -- Audi
    (9, 'A3', 2022, 1),
    (9, 'A4', 2021, 2),
    (9, 'Q5', 2020, 2),
    (9, 'R8', 2019, 3),
    (9, 'TT', 2021, 2),
    (9, 'A5', 2020, 2),
    (9, 'RS3', 2019, 3),
    (9, 'RS7', 2022, 3),

    -- Chevrolet
    (10, 'Camaro', 2021, 3),
    (10, 'Corvette', 2020, 3),
    (10, 'Silverado', 2019, 2),
    (10, 'Malibu', 2018, 1),
    (10, 'Trailblazer', 2021, 2),
    (10, 'Impala', 2020, 2),
    (10, 'Blazer', 2019, 2),
    (10, 'Equinox', 2022, 1),

    -- Volkswagen
    (11, 'Golf', 2022, 1),
    (11, 'Polo', 2021, 1),
    (11, 'Passat', 2020, 2),
    (11, 'Tiguan', 2019, 2),
    (11, 'Arteon', 2021, 2),
    (11, 'ID.4', 2020, 2),
    (11, 'T-Roc', 2019, 1),
    (11, 'Touareg', 2022, 2),

    -- Nissan
    (12, 'GT-R', 2022, 3),
    (12, '370Z', 2021, 3),
    (12, 'Qashqai', 2020, 1),
    (12, 'Juke', 2019, 1),
    (12, 'Murano', 2021, 2),
    (12, 'Pathfinder', 2020, 2),
    (12, 'X-Trail', 2019, 2),
    (12, 'Leaf', 2022, 1),

    -- Porsche
    (13, '911', 2022, 3),
    (13, 'Cayenne', 2021, 2),
    (13, 'Panamera', 2020, 2),
    -- Suite des inserts Porsche
    (13, 'Taycan', 2019, 2),
    (13, 'Macan', 2021, 2),
    (13, 'Boxster', 2020, 3),
    (13, '718 Cayman', 2019, 3),
    (13, 'Carrera GT', 2022, 3),

    -- Lamborghini
    (14, 'Huracan', 2022, 3),
    (14, 'Aventador', 2021, 3),
    (14, 'Urus', 2020, 3),
    (14, 'Gallardo', 2019, 3),
    (14, 'Diablo', 2021, 3),
    (14, 'Sesto Elemento', 2020, 3),
    (14, 'Veneno', 2019, 3),
    (14, 'Revuelto', 2022, 3),

    -- Mitsubishi
    (15, 'Lancer Evolution', 2022, 3),
    (15, 'Outlander', 2021, 2),
    (15, 'Pajero', 2020, 2),
    (15, 'ASX', 2019, 1),
    (15, 'Eclipse Cross', 2021, 2),
    (15, 'Colt', 2020, 1),
    (15, 'Mirage', 2019, 1),
    (15, 'L200', 2022, 2),

    -- Subaru
    (16, 'Impreza', 2022, 2),
    (16, 'WRX STI', 2021, 3),
    (16, 'Forester', 2020, 2),
    (16, 'BRZ', 2019, 3),
    (16, 'Levorg', 2021, 2),
    (16, 'Ascent', 2020, 2),
    (16, 'Legacy', 2019, 2),
    (16, 'SVX', 2022, 2),

    -- Mazda
    (17, 'MX-5', 2022, 2),
    (17, 'RX-8', 2021, 3),
    (17, 'CX-5', 2020, 1),
    (17, 'Mazda 3', 2019, 1),
    (17, 'CX-9', 2021, 2),
    (17, '6', 2020, 2),
    (17, '2', 2019, 1),
    (17, 'Cosmo', 2022, 2),

    -- Jaguar
    (18, 'F-Type', 2022, 3),
    (18, 'XE', 2021, 2),
    (18, 'XF', 2020, 2),
    (18, 'I-Pace', 2019, 2),
    (18, 'XJ', 2021, 2),
    (18, 'E-Pace', 2020, 2),
    (18, 'F-Pace', 2019, 2),
    (18, 'Mark X', 2022, 2),

    -- Tesla
    (19, 'Model S', 2022, 2),
    (19, 'Model 3', 2021, 2),
    (19, 'Model X', 2020, 2),
    (19, 'Model Y', 2019, 2),
    (19, 'Roadster', 2021, 3),
    (19, 'Cybertruck', 2020, 2),
    (19, 'Semi', 2019, 3),
    (19, 'Model U', 2022, 2),

    -- Bugatti
    (20, 'Chiron', 2022, 3),
    (20, 'Veyron', 2021, 3),
    (20, 'Divo', 2020, 3),
    (20, 'Centodieci', 2019, 3),
    (20, 'EB110', 2021, 3),
    (20, 'Type 57', 2020, 3),
    (20, 'Galibier', 2019, 3),
    (20, 'Bolide', 2022, 3),

    -- Alfa Romeo
    (21, 'Giulia', 2022, 2),
    (21, 'Stelvio', 2021, 2),
    (21, 'Tonale', 2020, 2),
    (21, '8C', 2021, 3),
    (21, 'Brera', 2020, 2),
    (21, 'Giulietta', 2019, 2),
    (21, '33 Stradale', 2022, 3),

    -- Aston Martin
    (22, 'DB11', 2022, 3),
    (22, 'Vantage', 2021, 3),
    (22, 'Rapide', 2021, 3),
    (22, 'DBX', 2020, 2),
    (22, 'Vanquish', 2019, 3),
    (22, 'Valhalla', 2022, 3),

    -- Bentley
    (23, 'Continental GT', 2022, 3),
    (23, 'Bentayga', 2021, 2),
    (23, 'Mulsanne', 2021, 3),
    (23, 'Brooklands', 2020, 3),
    (23, 'Arnage', 2019, 3),
    (23, 'Flying Spur', 2022, 3),

    -- Citroën
    (24, 'C3', 2022, 1),
    (24, 'C5 Aircross', 2021, 2),
    (24, 'DS3', 2021, 2),
    (24, 'DS7', 2020, 2),
    (24, 'C4 Picasso', 2019, 1),
    (24, 'C6', 2022, 2),

    -- Dacia
    (25, 'Duster', 2022, 1),
    (25, 'Sandero', 2021, 1),
    (25, 'Logan', 2021, 1),
    (25, 'Spring', 2020, 1),
    (25, 'Dokker', 2019, 1),
    (25, 'Lodgy', 2022, 1),

    -- Dodge
    (26, 'Challenger', 2022, 3),
    (26, 'Durango', 2021, 2),
    (26, 'Charger', 2021, 3),
    (26, 'Dart', 2020, 1),
    (26, 'Magnum', 2019, 2),
    (26, 'Viper', 2022, 3),

    -- Fiat
    (27, '500', 2022, 1),
    (27, 'Panda', 2021, 1),
    (27, 'Tipo', 2021, 1),
    (27, 'Uno', 2020, 1),
    (27, 'Strada', 2019, 1),
    (27, 'Doblo', 2022, 1),

    -- Genesis
    (28, 'G80', 2022, 2),
    (28, 'GV80', 2021, 2),
    (28, 'G90', 2020, 2),
    (28, 'G70', 2019, 2),
    (28, 'Essentia', 2022, 3),

    -- GMC
    (29, 'Yukon', 2022, 2),
    (29, 'Sierra', 2021, 2),
    (29, 'Canyon', 2020, 2),
    (29, 'Acadia', 2019, 2),
    (29, 'Envoy', 2022, 2),

    -- Hyundai
    (30, 'Tucson', 2022, 1),
    (30, 'Santa Fe', 2021, 2),
    (30, 'Ioniq 5', 2020, 2),
    (30, 'Veloster', 2019, 2),
    (30, 'Kona', 2022, 1),

    -- Infiniti
    (31, 'QX50', 2022, 2),
    (31, 'QX80', 2021, 2),
    (31, 'QX60', 2020, 2),
    (31, 'Q70', 2019, 2),
    (31, 'Q50', 2022, 2),

    -- Jeep
    (32, 'Wrangler', 2022, 2),
    (32, 'Grand Cherokee', 2021, 2),
    (32, 'Renegade', 2020, 1),
    (32, 'Commander', 2019, 2),
    (32, 'Cherokee', 2022, 2),

    -- Kia
    (33, 'Sorento', 2022, 2),
    (33, 'Sportage', 2021, 1),
    (33, 'Telluride', 2020, 2),
    (33, 'Stinger', 2019, 3),
    (33, 'Soul', 2022, 1),

    -- Lancia
    (34, 'Ypsilon', 2022, 1),
    (34, 'Delta', 2021, 2),
    (34, 'Thema', 2020, 2),
    (34, 'Stratos', 2019, 3),
    (34, 'Montecarlo', 2022, 3),

    -- Land Rover
    (35, 'Defender', 2022, 2),
    (35, 'Range Rover', 2021, 2),
    (35, 'Discovery', 2020, 2),
    (35, 'Evoque', 2019, 2),
    (35, 'Freelander', 2022, 2),

    -- Suite des marques de luxe et de sport
    -- Lexus
    (36, 'RX', 2022, 2),
    (36, 'IS', 2021, 2),
    (36, 'LS', 2020, 2),
    (36, 'UX', 2019, 1),
    (36, 'GX', 2022, 2),

    -- McLaren
    (40, '720S', 2022, 3),
    (40, 'Speedtail', 2021, 3),
    (40, 'Senna', 2020, 3),
    (40, 'Elva', 2019, 3),
    (40, 'Artura', 2022, 3),

    -- Pagani
    (43, 'Huayra', 2022, 3),
    (43, 'Zonda', 2021, 3),
    (43, 'Imola', 2020, 3),
    (43, 'R Revolución', 2019, 3),

    -- Koenigsegg
    (64, 'Jesko', 2022, 3),
    (64, 'Regera', 2021, 3),
    (64, 'Gemera', 2020, 3),
    (64, 'Agera RS', 2019, 3),

    -- Marques plus accessibles
    -- Polestar
    (44, 'Polestar 2', 2022, 2),
    (44, '1', 2021, 3),
    (44, '3', 2022, 2),
    (44, '4', 2023, 2),

    -- Rivian
    (46, 'R1T', 2022, 2),
    (46, 'R1S', 2021, 2),
    (46, 'EDV 700', 2020, 2),

    -- Marques de luxe traditionnelles
    -- Rolls-Royce
    (47, 'Phantom', 2022, 3),
    (47, 'Ghost', 2021, 3),
    (47, 'Cullinan', 2020, 3),
    (47, 'Wraith', 2019, 3),

    -- Lotus
    (38, 'Evora', 2022, 3),
    (38, 'Esprit', 2021, 3),
    (38, 'Elite', 2020, 3),
    (38, 'Europa', 2019, 3),
    (38, 'Eletre', 2022, 3),

    -- Mini
    (41, 'Cooper', 2022, 2),
    (41, 'Countryman', 2021, 2),
    (41, 'Paceman', 2020, 2),
    (41, 'Cabrio', 2019, 2),
    (41, 'Rocketman', 2022, 2),

    -- Marques spécialisées performance
    -- Caterham
    (56, 'Seven 170', 2022, 3),
    (56, 'Superlight R500', 2020, 3),
    (56, 'CSR', 2019, 3),
    (56, '310R', 2018, 3),

    -- Donkervoort
    (120, 'D8 GTO', 2019, 3),
    (120, 'D8 270 RS', 2016, 3),
    (120, 'D10', 2023, 3),
    (120, 'D8 235', 2014, 3),

    -- Marques plus rares
    -- DeLorean
    (60, 'DMC-12', 1981, 3),
    (60, 'Alpha5', 2023, 3),
    (60, 'BTTF Edition', 2022, 3),
    (60, 'Omega', 2024, 3),

    -- Marques émergentes électriques
    -- Lucid
    (67, 'Air', 2022, 2),
    (67, 'Gravity', 2023, 2),
    (67, 'Sapphire', 2024, 3),
    (67, 'Pure', 2025, 2),

    -- Fisker
    (61, 'Ocean', 2023, 2),
    (61, 'Karma', 2019, 3),
    (61, 'Pear', 2022, 2),
    (61, 'Ronin', 2025, 3),

    -- Dernières entrées spéciales
    -- GTA Motor
    (130, 'Spano', 2013, 3),
    (130, 'Spano R', 2016, 3),
    (130, 'Spano X', 2019, 3),
    (130, 'Spano GT', 2023, 3),