-- Supprime les anciennes données
DELETE FROM modeles;

DELETE FROM marques;

-- Réinitialise les ID auto-incrémentés
ALTER TABLE modeles AUTO_INCREMENT = 1;

ALTER TABLE marques AUTO_INCREMENT = 1;

-- Insère les marques
INSERT INTO
    marques (nom, pays)
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

-- Insère les modèles (300 modèles variés)
INSERT INTO
    modeles (marque_id, nom, annee)
VALUES
    (1, 'Corolla', 2020),
    (1, 'Supra', 2019),
    (1, 'Yaris', 2021),
    (1, 'Land Cruiser', 2018),
    (2, 'Mustang', 2021),
    (2, 'Focus', 2020),
    (2, 'F-150', 2019),
    (2, 'Explorer', 2022),
    (3, 'M3', 2022),
    (3, 'X5', 2021),
    (3, 'Serie 7', 2020),
    (3, 'Z4', 2018),
    (4, '208', 2023),
    (4, '308', 2022),
    (4, '508', 2021),
    (4, '2008', 2020),
    (5, '488 GTB', 2018),
    (5, 'F8 Tributo', 2021),
    (5, 'Roma', 2020),
    (5, 'SF90 Stradale', 2022),
    (6, 'Classe A', 2021),
    (6, 'Classe C', 2020),
    (6, 'Classe E', 2019),
    (6, 'GLE', 2022),
    (7, 'Clio', 2023),
    (7, 'Megane', 2021),
    (7, 'Captur', 2020),
    (7, 'Talisman', 2019),
    (8, 'Civic', 2022),
    (8, 'Accord', 2021),
    (8, 'CR-V', 2020),
    (8, 'NSX', 2019),
    (9, 'A3', 2022),
    (9, 'A4', 2021),
    (9, 'Q5', 2020),
    (9, 'R8', 2019),
    (10, 'Camaro', 2021),
    (10, 'Corvette', 2020),
    (10, 'Silverado', 2019),
    (10, 'Malibu', 2018),
    (11, 'Golf', 2022),
    (11, 'Polo', 2021),
    (11, 'Passat', 2020),
    (11, 'Tiguan', 2019),
    (12, 'GT-R', 2022),
    (12, '370Z', 2021),
    (12, 'Qashqai', 2020),
    (12, 'Juke', 2019),
    (13, '911', 2022),
    (13, 'Cayenne', 2021),
    (13, 'Panamera', 2020),
    (13, 'Taycan', 2019),
    (14, 'Huracan', 2022),
    (14, 'Aventador', 2021),
    (14, 'Urus', 2020),
    (14, 'Gallardo', 2019),
    (15, 'Lancer Evolution', 2022),
    (15, 'Outlander', 2021),
    (15, 'Pajero', 2020),
    (15, 'ASX', 2019),
    (16, 'Impreza', 2022),
    (16, 'WRX STI', 2021),
    (16, 'Forester', 2020),
    (16, 'BRZ', 2019),
    (17, 'MX-5', 2022),
    (17, 'RX-8', 2021),
    (17, 'CX-5', 2020),
    (17, 'Mazda 3', 2019),
    (18, 'F-Type', 2022),
    (18, 'XE', 2021),
    (18, 'XF', 2020),
    (18, 'I-Pace', 2019),
    (19, 'Model S', 2022),
    (19, 'Model 3', 2021),
    (19, 'Model X', 2020),
    (19, 'Model Y', 2019),
    (20, 'Chiron', 2022),
    (20, 'Veyron', 2021),
    (20, 'Divo', 2020),
    (20, 'Centodieci', 2019),
    (21, 'Giulia', 2022),
    (21, 'Stelvio', 2021),
    (21, 'Tonale', 2020),
    (22, 'DB11', 2022),
    (22, 'Vantage', 2021),
    (23, 'Continental GT', 2022),
    (23, 'Bentayga', 2021),
    (24, 'C3', 2022),
    (24, 'C5 Aircross', 2021),
    (25, 'Duster', 2022),
    (25, 'Sandero', 2021),
    (26, 'Challenger', 2022),
    (26, 'Durango', 2021),
    (27, '500', 2022),
    (27, 'Panda', 2021),
    (28, 'G80', 2022),
    (29, 'Yukon', 2022),
    (30, 'Tucson', 2022),
    (31, 'QX50', 2022),
    (32, 'Wrangler', 2022),
    (33, 'Sorento', 2022),
    (34, 'Ypsilon', 2022),
    (35, 'Defender', 2022),
    (36, 'RX', 2022),
    (37, 'Navigator', 2022),
    (38, 'Evora', 2022),
    (39, 'Ghibli', 2022),
    (40, '720S', 2022),
    (41, 'Cooper', 2022),
    (42, 'Astra', 2022),
    (43, 'Huayra', 2022),
    (44, 'Polestar 2', 2022),
    (45, '1500', 2022),
    (46, 'R1T', 2022),
    (47, 'Phantom', 2022),
    (48, '9-5', 2022),
    (49, 'Leon', 2022),
    (50, 'Octavia', 2022),
    (1, 'Hilux', 2021),
    (1, 'C-HR', 2020),
    (1, 'Avalon', 2019),
    (1, 'Highlander', 2022),
    (2, 'Bronco', 2021),
    (2, 'Ranger', 2020),
    (2, 'Edge', 2019),
    (2, 'Escape', 2022),
    (3, 'M4', 2021),
    (3, 'X3', 2020),
    (3, 'X7', 2019),
    (3, 'i8', 2022),
    (4, '5008', 2021),
    (4, 'RCZ', 2020),
    (4, '607', 2019),
    (4, 'Partner', 2022),
    (5, 'LaFerrari', 2021),
    (5, 'Enzo', 2020),
    (5, 'Portofino', 2019),
    (5, 'California', 2022),
    (6, 'GLS', 2021),
    (6, 'SL', 2020),
    (6, 'AMG GT', 2019),
    (6, 'SLS AMG', 2022),
    (7, 'Kadjar', 2021),
    (7, 'Scenic', 2020),
    (7, 'Espace', 2019),
    (7, 'Koleos', 2022),
    (8, 'Jazz', 2021),
    (8, 'HR-V', 2020),
    (8, 'Legend', 2019),
    (8, 'Odyssey', 2022),
    (9, 'TT', 2021),
    (9, 'A5', 2020),
    (9, 'RS3', 2019),
    (9, 'RS7', 2022),
    (10, 'Trailblazer', 2021),
    (10, 'Impala', 2020),
    (10, 'Blazer', 2019),
    (10, 'Equinox', 2022),
    (11, 'Arteon', 2021),
    (11, 'ID.4', 2020),
    (11, 'T-Roc', 2019),
    (11, 'Touareg', 2022),
    (12, 'Murano', 2021),
    (12, 'Pathfinder', 2020),
    (12, 'X-Trail', 2019),
    (12, 'Leaf', 2022),
    (13, 'Macan', 2021),
    (13, 'Boxster', 2020),
    (13, '718 Cayman', 2019),
    (13, 'Carrera GT', 2022),
    (14, 'Diablo', 2021),
    (14, 'Sesto Elemento', 2020),
    (14, 'Veneno', 2019),
    (14, 'Revuelto', 2022),
    (15, 'Eclipse Cross', 2021),
    (15, 'Colt', 2020),
    (15, 'Mirage', 2019),
    (15, 'L200', 2022),
    (16, 'Levorg', 2021),
    (16, 'Ascent', 2020),
    (16, 'Legacy', 2019),
    (16, 'SVX', 2022),
    (17, 'CX-9', 2021),
    (17, '6', 2020),
    (17, '2', 2019),
    (17, 'Cosmo', 2022),
    (18, 'XJ', 2021),
    (18, 'E-Pace', 2020),
    (18, 'F-Pace', 2019),
    (18, 'Mark X', 2022),
    (19, 'Roadster', 2021),
    (19, 'Cybertruck', 2020),
    (19, 'Semi', 2019),
    (19, 'Model U', 2022),
    (20, 'EB110', 2021),
    (20, 'Type 57', 2020),
    (20, 'Galibier', 2019),
    (20, 'Bolide', 2022),
    (21, '8C', 2021),
    (21, 'Brera', 2020),
    (21, 'Giulietta', 2019),
    (21, '33 Stradale', 2022),
    (22, 'Rapide', 2021),
    (22, 'DBX', 2020),
    (22, 'Vanquish', 2019),
    (22, 'Valhalla', 2022),
    (23, 'Mulsanne', 2021),
    (23, 'Brooklands', 2020),
    (23, 'Arnage', 2019),
    (23, 'Flying Spur', 2022),
    (24, 'DS3', 2021),
    (24, 'DS7', 2020),
    (24, 'C4 Picasso', 2019),
    (24, 'C6', 2022),
    (25, 'Logan', 2021),
    (25, 'Spring', 2020),
    (25, 'Dokker', 2019),
    (25, 'Lodgy', 2022),
    (26, 'Charger', 2021),
    (26, 'Dart', 2020),
    (26, 'Magnum', 2019),
    (26, 'Viper', 2022),
    (27, 'Tipo', 2021),
    (27, 'Uno', 2020),
    (27, 'Strada', 2019),
    (27, 'Doblo', 2022),
    (28, 'GV80', 2021),
    (28, 'G90', 2020),
    (28, 'G70', 2019),
    (28, 'Essentia', 2022),
    (29, 'Sierra', 2021),
    (29, 'Canyon', 2020),
    (29, 'Acadia', 2019),
    (29, 'Envoy', 2022),
    (30, 'Santa Fe', 2021),
    (30, 'Ioniq 5', 2020),
    (30, 'Veloster', 2019),
    (30, 'Kona', 2022),
    (31, 'QX80', 2021),
    (31, 'QX60', 2020),
    (31, 'Q70', 2019),
    (31, 'Q50', 2022),
    (32, 'Grand Cherokee', 2021),
    (32, 'Renegade', 2020),
    (32, 'Commander', 2019),
    (32, 'Cherokee', 2022),
    (33, 'Sportage', 2021),
    (33, 'Telluride', 2020),
    (33, 'Stinger', 2019),
    (33, 'Soul', 2022),
    (34, 'Delta', 2021),
    (34, 'Thema', 2020),
    (34, 'Stratos', 2019),
    (34, 'Montecarlo', 2022),
    (35, 'Range Rover', 2021),
    (35, 'Discovery', 2020),
    (35, 'Evoque', 2019),
    (35, 'Freelander', 2022),
    (36, 'IS', 2021),
    (36, 'LS', 2020),
    (36, 'UX', 2019),
    (36, 'GX', 2022),
    (37, 'Aviator', 2021),
    (37, 'Corsair', 2020),
    (37, 'MKX', 2019),
    (37, 'Town Car', 2022),
    (38, 'Esprit', 2021),
    (38, 'Elite', 2020),
    (38, 'Europa', 2019),
    (38, 'Eletre', 2022),
    (39, 'Quattroporte', 2021),
    (39, 'MC20', 2020),
    (39, 'Biturbo', 2019),
    (39, 'Karif', 2022),
    (40, 'Speedtail', 2021),
    (40, 'Senna', 2020),
    (40, 'Elva', 2019),
    (40, 'Artura', 2022),
    (41, 'Countryman', 2021),
    (41, 'Paceman', 2020),
    (41, 'Cabrio', 2019),
    (41, 'Rocketman', 2022),
    (51, 'NSX', 2022),
    (51, 'TLX', 2021),
    (51, 'RDX', 2020),
    (51, 'MDX', 2019),
    (52, '500', 2022),
    (52, '124 Spider', 2020),
    (52, 'Punto Evo', 2018),
    (52, 'Grande Punto', 2017),
    (53, 'BJ40', 2023),
    (53, 'BJ80', 2021),
    (53, 'Senova X55', 2019),
    (53, 'EU7', 2022),
    (54, 'RS-5', 2023),
    (54, '530', 2021),
    (54, '630', 2020),
    (54, 'E100', 2019),
    (55, 'Rocket 900', 2022),
    (55, 'G800', 2021),
    (55, 'G V12 900', 2023),
    (55, '700 Widestar', 2018),
    (56, 'Seven 170', 2022),
    (56, 'Superlight R500', 2020),
    (56, 'CSR', 2019),
    (56, '310R', 2018),
    (57, 'Tiggo 8', 2023),
    (57, 'Arrizo 5', 2021),
    (57, 'QQ Ice Cream', 2022),
    (57, 'Fulwin 2', 2018),
    (58, 'Lanos', 2019),
    (58, 'Matiz', 2021),
    (58, 'Nubira', 2017),
    (58, 'Leganza', 2016),
    (59, 'Terios', 2022),
    (59, 'Copen', 2021),
    (59, 'Rocky', 2020),
    (59, 'Move', 2019),
    (60, 'DMC-12', 1981),
    (60, 'Alpha5', 2023),
    (60, 'BTTF Edition', 2022),
    (60, 'Omega', 2024),
    (61, 'Ocean', 2023),
    (61, 'Karma', 2019),
    (61, 'Pear', 2022),
    (61, 'Ronin', 2025),
    (62, 'Xingyue L', 2022),
    (62, 'Binrui', 2021),
    (62, 'Boyue', 2020),
    (62, 'Preface', 2019),
    (63, 'Tank 500', 2023),
    (63, 'Haval H6', 2022),
    (63, 'Ora Good Cat', 2021),
    (63, 'Poer', 2020),
    (64, 'Jesko', 2022),
    (64, 'Regera', 2021),
    (64, 'Gemera', 2020),
    (64, 'Agera RS', 2019),
    (65, 'Niva', 2022),
    (65, 'Vesta', 2021),
    (65, 'Granta', 2020),
    (65, 'XRAY', 2019),
    (66, 'UX 300e', 2023),
    (66, 'RX 500h', 2022),
    (66, 'NX 350h', 2021),
    (66, 'LS 500', 2020),
    (67, 'Air', 2022),
    (67, 'Gravity', 2023),
    (67, 'Sapphire', 2024),
    (67, 'Pure', 2025),
    (68, 'Thar', 2022),
    (68, 'XUV700', 2021),
    (68, 'Scorpio-N', 2020),
    (68, 'Bolero', 2019),
    (69, 'Ghibli', 2023),
    (69, 'Levante', 2022),
    (69, 'MC20', 2021),
    (69, 'Quattroporte', 2020),
    (70, 'S 680', 2022),
    (70, 'G 650 Landaulet', 2021),
    (70, 'Maybach 62', 2020),
    (70, 'Vision 6', 2019),
    (71, 'ZS EV', 2023),
    (71, 'MG5', 2022),
    (71, 'HS PHEV', 2021),
    (71, 'EZS', 2020),
    (72, 'Plus 4', 2022),
    (72, 'Aero 8', 2021),
    (72, '3-Wheeler', 2020),
    (72, 'Super 3', 2019),
    (73, 'Astra', 2023),
    (73, 'Grandland', 2022),
    (73, 'Corsa', 2021),
    (73, 'Mokka', 2020),
    (74, 'Huayra', 2023),
    (74, 'Zonda', 2022),
    (74, 'Imola', 2021),
    (74, 'R Revolución', 2020),
    (75, '2', 2023),
    (75, '3', 2022),
    (75, '4', 2021),
    (75, 'Precept', 2020),
    (76, 'Trans Am', 2002),
    (76, 'Firebird', 2001),
    (76, 'G8', 2009),
    (76, 'Solstice', 2010),
    (77, 'X50', 2023),
    (77, 'X70', 2022),
    (77, 'Persona', 2021),
    (77, 'Saga', 2020),
    (101, 'B3', 2023),
    (101, 'B4', 2022),
    (101, 'XD3', 2021),
    (101, 'D5', 2020),
    (102, 'AMX', 1969),
    (102, 'Javelin', 1974),
    (102, 'Gremlin', 1970),
    (102, 'Hornet', 1973),
    (103, 'Hussarya', 2017),
    (103, 'Hussarya GT', 2020),
    (103, 'Hussarya 33', 2021),
    (103, 'GT Evo', 2023),
    (104, 'GT', 2009),
    (104, 'Scalo', 2015),
    (104, 'Scalo Superelletra', 2017),
    (104, 'Karo', 2018),
    (105, 'Owl', 2020),
    (105, 'Owl Hypercar', 2023),
    (105, 'Owl Racing Edition', 2024),
    (105, 'Owl Concept', 2025),
    (106, 'Mini', 1970),
    (106, 'Seven', 1961),
    (106, 'Countryman', 1964),
    (106, 'Cambridge', 1955),
    (107, 'Mono', 2011),
    (107, 'Mono R', 2020),
    (107, 'Mono 2', 2023),
    (107, 'Mono Evo', 2025),
    (108, 'B8', 2015),
    (108, 'Opale', 2017),
    (108, 'Divine DS', 2019),
    (108, 'Urban', 2021),
    (109, 'Nuccio', 2012),
    (109, 'Mantide', 2010),
    (109, 'Pickster', 1998),
    (109, 'Birusa', 2003),
    (110, '5300 GT', 1965),
    (110, 'P538', 1966),
    (110, 'Bizzarrini GT', 2024),
    (110, 'Giotto', 2025),
    (111, 'Isabella', 1954),
    (111, 'Hansa', 1939),
    (111, 'P100', 1960),
    (111, 'BX7', 2016),
    (112, 'Bladon', 2022),
    (112, 'Fighter', 2004),
    (112, 'Speedster', 1965),
    (112, 'Blenheim', 2000),
    (113, 'M-Byte', 2023),
    (113, 'K-Byte', 2022),
    (113, 'T-Byte', 2021),
    (113, 'S-Byte', 2025),
    (114, 'V16T', 1991),
    (114, 'Moroder', 1993),
    (114, 'V10', 1988),
    (114, 'Supercar', 1995),
    (115, 'L-29', 1929),
    (115, 'Cord 810', 1936),
    (115, 'Cord 812', 1937),
    (115, 'Sportsman', 1938),
    (116, 'Formentor', 2022),
    (116, 'Born', 2023),
    (116, 'Tavascan', 2024),
    (116, 'Leon Cupra', 2021),
    (117, 'Duster', 2023),
    (117, 'Spring', 2022),
    (117, 'Jogger', 2021),
    (117, 'Sandero', 2020),
    (118, '280ZX', 1978),
    (118, 'Fairlady', 1973),
    (118, '240Z', 1969),
    (118, 'Skyline GT-R', 1971),
    (119, 'Pantera', 1971),
    (119, 'Guarà', 1993),
    (119, 'Mangusta', 1967),
    (119, 'P72', 2021),
    (120, 'D8 GTO', 2019),
    (120, 'D8 270 RS', 2016),
    (120, 'D10', 2023),
    (120, 'D8 235', 2014),
    (121, 'Speedster', 2021),
    (121, 'E-Type', 2023),
    (121, 'Low Drag', 2019),
    (121, 'Eagle Spyder', 2020),
    (122, 'Corsair', 1958),
    (122, 'Ranger', 1960),
    (122, 'Pacer', 1959),
    (122, 'Citation', 1958),
    (123, 'RP1', 2017),
    (123, 'RP2', 2020),
    (123, 'RPX', 2022),
    (123, 'RPX Evo', 2024),
    (124, 'Furtive-eGT', 2012),
    (124, 'Furtive RS', 2015),
    (124, 'GT X', 2017),
    (124, 'Furtive Vision', 2023),
    (125, 'Excellence', 1958),
    (125, 'Facel II', 1962),
    (125, 'Facel 6', 1964),
    (125, 'HK500', 1959),
    (126, 'F400', 2006),
    (126, 'F350', 2008),
    (126, 'GTS', 2010),
    (126, 'Exige', 2012),
    (127, 'Gurkha', 2015),
    (127, 'One', 2017),
    (127, 'Force GT', 2018),
    (127, 'Traveller', 2020),
    (128, 'Avalanche', 2017),
    (128, 'Mistrale', 2018),
    (128, 'Gemballa GT', 2020),
    (128, 'Tornado', 2023),
    (129, 'Akula', 2019),
    (129, 'F200', 2018),
    (129, 'Sprint', 2017),
    (129, 'G60', 2020),
    (130, 'Spano', 2013),
    (130, 'Spano R', 2016),
    (130, 'Spano X', 2019),
    (130, 'Spano GT', 2023);