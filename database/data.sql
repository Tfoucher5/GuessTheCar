-- Version moderne avec marques actuelles et 5+ modèles par marque
-- Difficultés: 1=Facile (populaire), 2=Moyen (premium/sport), 3=Difficile (exotique/rare)

-- Supprime les anciennes données
DELETE FROM models;
DELETE FROM brands;

-- Réinitialise les ID auto-incrémentés
ALTER TABLE models AUTO_INCREMENT = 1;
ALTER TABLE brands AUTO_INCREMENT = 1;

-- Insertion des marques modernes (76 marques actuelles)
INSERT INTO brands (name, country) VALUES
('Toyota', 'Japon'),('Ford', 'États-Unis'),('BMW', 'Allemagne'),('Peugeot', 'France'),('Ferrari', 'Italie'),('Mercedes', 'Allemagne'),('Renault', 'France'),('Honda', 'Japon'),('Audi', 'Allemagne'),('Chevrolet', 'États-Unis'),('Volkswagen', 'Allemagne'),('Nissan', 'Japon'),('Porsche', 'Allemagne'),('Lamborghini', 'Italie'),('Mitsubishi', 'Japon'),('Subaru', 'Japon'),('Mazda', 'Japon'),('Jaguar', 'Royaume-Uni'),('Tesla', 'États-Unis'),('Bugatti', 'France'),('Alfa Romeo', 'Italie'),('Aston Martin', 'Royaume-Uni'),('Bentley', 'Royaume-Uni'),('Citroën', 'France'),('Dacia', 'Roumanie'),('Dodge', 'États-Unis'),('Fiat', 'Italie'),('Genesis', 'Corée du Sud'),('Hyundai', 'Corée du Sud'),('Infiniti', 'Japon'),('Jeep', 'États-Unis'),('Kia', 'Corée du Sud'),('Land Rover', 'Royaume-Uni'),('Lexus', 'Japon'),('Lotus', 'Royaume-Uni'),('Maserati', 'Italie'),('McLaren', 'Royaume-Uni'),('Mini', 'Royaume-Uni'),('Opel', 'Allemagne'),('Pagani', 'Italie'),('Polestar', 'Suède'),('Rivian', 'États-Unis'),('Rolls-Royce', 'Royaume-Uni'),('SEAT', 'Espagne'),('Skoda', 'République tchèque'),('Acura', 'Japon'),('Chery', 'Chine'),('Geely', 'Chine'),('BYD', 'Chine'),('Lynk & Co', 'Chine'),('Volvo', 'Suède'),('Koenigsegg', 'Suède'),('Lincoln', 'États-Unis'),('Cadillac', 'États-Unis'),('GMC', 'États-Unis'),('Ram', 'États-Unis'),('Lucid', 'États-Unis'),('DS', 'France'),('Alpine', 'France'),('MG', 'Royaume-Uni'),('Cupra', 'Espagne'),('smart', 'Allemagne'),('Maybach', 'Allemagne'),('Lancia', 'Italie'),('Fisker', 'États-Unis'),('VinFast', 'Vietnam'),('Suzuki', 'Japon'),('Isuzu', 'Japon'),('Buick', 'États-Unis'),('Hummer', 'États-Unis'),('Vauxhall', 'Royaume-Uni'),('Tata', 'Inde'),('Xpeng', 'Chine'),('NIO', 'Chine'),('Li Auto', 'Chine'),('Rimac', 'Croatie');

-- Insertion des modèles Toyota (ID: 1)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (1, 'Corolla', 1), (1, 'Camry', 1), (1, 'RAV4', 1), (1, 'Highlander', 1), (1, 'Prius', 1), (1, 'Supra', 2), (1, 'Land Cruiser', 2), (1, 'Yaris', 1), (1, 'Avalon', 2), (1, 'Sienna', 1);

-- Insertion des modèles Ford (ID: 2)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (2, 'Focus', 1), (2, 'Fiesta', 1), (2, 'Mustang', 1), (2, 'F-150', 1), (2, 'Explorer', 1), (2, 'Escape', 1), (2, 'Bronco', 2), (2, 'Edge', 2), (2, 'Ranger', 2), (2, 'Expedition', 2);

-- Insertion des modèles BMW (ID: 3)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (3, 'Serie 3', 2), (3, 'Serie 5', 2), (3, 'X3', 2), (3, 'X5', 2), (3, 'Serie 1', 2), (3, 'X1', 2), (3, 'M3', 2), (3, 'M5', 3), (3, 'i4', 2), (3, 'iX', 2);

-- Insertion des modèles Peugeot (ID: 4)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (4, '208', 1), (4, '308', 1), (4, '3008', 1), (4, '5008', 1), (4, '2008', 1), (4, '508', 2), (4, 'Rifter', 1), (4, 'Partner', 1), (4, 'e-208', 2), (4, 'e-2008', 2);

-- Insertion des modèles Ferrari (ID: 5)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (5, 'F8 Tributo', 3), (5, 'Roma', 3), (5, 'Portofino', 3), (5, 'SF90 Stradale', 3), (5, '296 GTB', 3), (5, 'LaFerrari', 3), (5, 'Purosangue', 3), (5, '812 Superfast', 3), (5, 'Monza SP1', 3), (5, 'Daytona SP3', 3);

-- Insertion des modèles Mercedes (ID: 6)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (6, 'Classe A', 2), (6, 'Classe C', 2), (6, 'Classe E', 2), (6, 'GLA', 2), (6, 'GLC', 2), (6, 'GLE', 2), (6, 'AMG GT', 3), (6, 'SL', 3), (6, 'EQS', 2), (6, 'Classe S', 2);

-- Insertion des modèles Renault (ID: 7)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (7, 'Clio', 1), (7, 'Megane', 1), (7, 'Captur', 1), (7, 'Kadjar', 1), (7, 'Scenic', 1), (7, 'Talisman', 2), (7, 'Koleos', 2), (7, 'Arkana', 1), (7, 'Zoe', 1), (7, 'Twingo', 1);

-- Insertion des modèles Honda (ID: 8)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (8, 'Civic', 1), (8, 'Accord', 1), (8, 'CR-V', 1), (8, 'HR-V', 1), (8, 'Pilot', 1), (8, 'Odyssey', 1), (8, 'Passport', 2), (8, 'Ridgeline', 2), (8, 'NSX', 3), (8, 'Insight', 2);

-- Insertion des modèles Audi (ID: 9)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (9, 'A3', 2), (9, 'A4', 2), (9, 'A6', 2), (9, 'Q3', 2), (9, 'Q5', 2), (9, 'Q7', 2), (9, 'TT', 2), (9, 'R8', 3), (9, 'e-tron', 2), (9, 'RS6', 3);

-- Insertion des modèles Chevrolet (ID: 10)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (10, 'Cruze', 1), (10, 'Malibu', 1), (10, 'Equinox', 1), (10, 'Traverse', 1), (10, 'Silverado', 1), (10, 'Camaro', 2), (10, 'Corvette', 3), (10, 'Tahoe', 2), (10, 'Suburban', 2), (10, 'Blazer', 1);

-- Insertion des modèles Volkswagen (ID: 11)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (11, 'Golf', 1), (11, 'Polo', 1), (11, 'Passat', 1), (11, 'Tiguan', 1), (11, 'Touareg', 2), (11, 'Arteon', 2), (11, 'T-Cross', 1), (11, 'T-Roc', 1), (11, 'ID.3', 2), (11, 'ID.4', 2);

-- Insertion des modèles Nissan (ID: 12)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (12, 'Sentra', 1), (12, 'Altima', 1), (12, 'Rogue', 1), (12, 'Murano', 1), (12, 'Pathfinder', 1), (12, 'Frontier', 1), (12, 'Titan', 2), (12, 'GT-R', 3), (12, '370Z', 2), (12, 'Leaf', 2);

-- Insertion des modèles Porsche (ID: 13)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (13, '911', 3), (13, 'Cayenne', 2), (13, 'Macan', 2), (13, 'Panamera', 3), (13, 'Taycan', 3), (13, 'Boxster', 3), (13, 'Cayman', 3), (13, '718', 3), (13, 'Carrera', 3), (13, 'Turbo S', 3);

-- Insertion des modèles Lamborghini (ID: 14)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (14, 'Huracán', 3), (14, 'Aventador', 3), (14, 'Urus', 3), (14, 'Revuelto', 3), (14, 'Sterrato', 3), (14, 'STO', 3), (14, 'Tecnica', 3), (14, 'Performante', 3), (14, 'SVJ', 3), (14, 'Gallardo', 3);

-- Insertion des modèles Tesla (ID: 19)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (19, 'Model 3', 2), (19, 'Model Y', 2), (19, 'Model S', 2), (19, 'Model X', 2), (19, 'Cybertruck', 3), (19, 'Semi', 3), (19, 'Roadster', 3), (19, 'Model S Plaid', 3), (19, 'Model X Plaid', 3), (19, 'Model 3 Performance', 2);

-- Insertion des modèles McLaren (ID: 37)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (37, '720S', 3), (37, '765LT', 3), (37, 'Artura', 3), (37, '600LT', 3), (37, '570S', 3), (37, 'Senna', 3), (37, 'Speedtail', 3), (37, 'Elva', 3), (37, 'P1', 3), (37, 'F1', 3);

-- Insertion des modèles Suzuki (ID: 67)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (67, 'Swift', 1), (67, 'Vitara', 1), (67, 'Baleno', 1), (67, 'Jimny', 2), (67, 'S-Cross', 1), (67, 'Ertiga', 1), (67, 'Alto', 1), (67, 'Celerio', 1), (67, 'Ignis', 1), (67, 'XL7', 1);

-- Insertion des modèles Koenigsegg (ID: 52)
INSERT INTO models (brand_id, name, difficulty_level) VALUES (52, 'Regera', 3), (52, 'Jesko', 3), (52, 'Gemera', 3), (52, 'Agera', 3), (52, 'CCX', 3), (52, 'One:1', 3), (52, 'CCXR', 3), (52, 'CC8S', 3), (52, 'CCR', 3), (52, 'Absolut', 3);

-- Ajout de TOUS les modèles pour TOUTES les 76 marques
INSERT INTO models (brand_id, name, difficulty_level) VALUES (15, 'Outlander', 1), (15, 'Eclipse Cross', 1), (15, 'Mirage', 1), (15, 'Pajero Sport', 2), (15, 'L200', 2), (15, 'ASX', 1), (15, 'Lancer', 2), (15, 'Triton', 2), (15, 'Xpander', 1), (15, 'Delica', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (16, 'Impreza', 1), (16, 'Forester', 1), (16, 'Outback', 1), (16, 'Crosstrek', 1), (16, 'WRX', 2), (16, 'Ascent', 1), (16, 'BRZ', 2), (16, 'Legacy', 1), (16, 'STI', 3), (16, 'Solterra', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (17, 'Mazda3', 1), (17, 'CX-5', 1), (17, 'CX-30', 1), (17, 'CX-9', 1), (17, 'MX-5', 2), (17, 'CX-90', 1), (17, 'Mazda6', 1), (17, 'MX-30', 2), (17, 'CX-50', 1), (17, 'RX-8', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (18, 'XE', 2), (18, 'XF', 2), (18, 'XJ', 3), (18, 'F-PACE', 2), (18, 'E-PACE', 2), (18, 'I-PACE', 2), (18, 'F-TYPE', 3), (18, 'XK', 3), (18, 'XKR', 3), (18, 'Project 7', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (20, 'Chiron', 3), (20, 'Veyron', 3), (20, 'Divo', 3), (20, 'Centodieci', 3), (20, 'Bolide', 3), (20, 'Mistral', 3), (20, 'EB110', 3), (20, 'Type 57', 3), (20, 'La Voiture Noire', 3), (20, 'Super Sport', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (21, 'Giulia', 2), (21, 'Stelvio', 2), (21, 'Tonale', 2), (21, 'Giulietta', 2), (21, '4C', 3), (21, 'MiTo', 2), (21, 'Brera', 3), (21, '159', 2), (21, 'Spider', 3), (21, 'GTV', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (22, 'DB11', 3), (22, 'Vantage', 3), (22, 'DBS', 3), (22, 'DBX', 3), (22, 'Valkyrie', 3), (22, 'Vanquish', 3), (22, 'Rapide', 3), (22, 'One-77', 3), (22, 'Vulcan', 3), (22, 'Victor', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (23, 'Continental GT', 3), (23, 'Bentayga', 3), (23, 'Flying Spur', 3), (23, 'Mulsanne', 3), (23, 'Azure', 3), (23, 'Arnage', 3), (23, 'Brooklands', 3), (23, 'Continental R', 3), (23, 'Speed 8', 3), (23, 'Bacalar', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (24, 'C3', 1), (24, 'C4', 1), (24, 'C5 Aircross', 1), (24, 'Berlingo', 1), (24, 'C1', 1), (24, 'C3 Aircross', 1), (24, 'C4 Picasso', 1), (24, 'C5 X', 2), (24, 'ë-C4', 2), (24, 'Ami', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (25, 'Duster', 1), (25, 'Sandero', 1), (25, 'Logan', 1), (25, 'Spring', 1), (25, 'Jogger', 1), (25, 'Lodgy', 1), (25, 'Dokker', 1), (25, 'Stepway', 1), (25, 'MCV', 1), (25, 'Pick-up', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (26, 'Challenger', 2), (26, 'Charger', 2), (26, 'Durango', 2), (26, 'Journey', 1), (26, 'Grand Caravan', 1), (26, 'Viper', 3), (26, 'Demon', 3), (26, 'Hellcat', 3), (26, 'SRT', 3), (26, 'Rampage', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (27, '500', 1), (27, 'Panda', 1), (27, 'Tipo', 1), (27, '500X', 1), (27, 'Ducato', 1), (27, '500L', 1), (27, 'Doblo', 1), (27, 'Qubo', 1), (27, '500e', 2), (27, 'Punto', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (28, 'G90', 3), (28, 'G80', 3), (28, 'G70', 3), (28, 'GV80', 3), (28, 'GV70', 3), (28, 'GV60', 3), (28, 'Coupe', 3), (28, 'Essentia', 3), (28, 'X', 3), (28, 'Neolun', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (29, 'Elantra', 1), (29, 'Sonata', 1), (29, 'Tucson', 1), (29, 'Santa Fe', 1), (29, 'Accent', 1), (29, 'Venue', 1), (29, 'Palisade', 1), (29, 'Kona', 1), (29, 'Ioniq 5', 2), (29, 'Ioniq 6', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (30, 'Q50', 2), (30, 'Q60', 2), (30, 'QX50', 2), (30, 'QX60', 2), (30, 'QX80', 2), (30, 'QX55', 2), (30, 'Q70', 2), (30, 'QX30', 2), (30, 'G37', 2), (30, 'FX', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (31, 'Wrangler', 1), (31, 'Grand Cherokee', 1), (31, 'Cherokee', 1), (31, 'Compass', 1), (31, 'Renegade', 1), (31, 'Gladiator', 2), (31, 'Avenger', 1), (31, 'Meridian', 1), (31, 'Commander', 2), (31, 'Patriot', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (32, 'Forte', 1), (32, 'Optima', 1), (32, 'Sportage', 1), (32, 'Sorento', 1), (32, 'Soul', 1), (32, 'Stinger', 2), (32, 'Telluride', 1), (32, 'Niro', 1), (32, 'EV6', 2), (32, 'Carnival', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (33, 'Range Rover', 2), (33, 'Range Rover Sport', 2), (33, 'Range Rover Evoque', 2), (33, 'Range Rover Velar', 2), (33, 'Discovery', 2), (33, 'Discovery Sport', 2), (33, 'Defender', 2), (33, 'Freelander', 2), (33, 'LR4', 2), (33, 'LR3', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (34, 'ES', 2), (34, 'IS', 2), (34, 'GS', 2), (34, 'LS', 2), (34, 'NX', 2), (34, 'RX', 2), (34, 'GX', 2), (34, 'LX', 2), (34, 'LC', 3), (34, 'RC', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (35, 'Evora', 3), (35, 'Elise', 3), (35, 'Exige', 3), (35, 'Emira', 3), (35, 'Evija', 3), (35, 'Europa', 3), (35, 'Esprit', 3), (35, 'Elan', 3), (35, 'Carlton', 3), (35, 'Eclat', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (36, 'Ghibli', 2), (36, 'Quattroporte', 2), (36, 'Levante', 2), (36, 'MC20', 3), (36, 'GranTurismo', 3), (36, 'GranCabrio', 3), (36, 'Alfieri', 3), (36, 'Bora', 3), (36, 'Merak', 3), (36, 'Khamsin', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (38, 'Cooper', 1), (38, 'Countryman', 1), (38, 'Clubman', 1), (38, 'Convertible', 2), (38, 'Paceman', 2), (38, 'Roadster', 2), (38, 'Coupe', 2), (38, 'Electric', 2), (38, 'JCW', 2), (38, 'One', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (39, 'Corsa', 1), (39, 'Astra', 1), (39, 'Insignia', 1), (39, 'Crossland', 1), (39, 'Grandland', 1), (39, 'Mokka', 1), (39, 'Combo', 1), (39, 'Vivaro', 1), (39, 'Zafira', 1), (39, 'Vectra', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (40, 'Huayra', 3), (40, 'Zonda', 3), (40, 'Imola', 3), (40, 'Roadster BC', 3), (40, 'Cinque', 3), (40, 'Tricolore', 3), (40, 'R', 3), (40, 'Barchetta', 3), (40, 'Revolución', 3), (40, 'Codalunga', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (41, 'Polestar 1', 2), (41, 'Polestar 2', 2), (41, 'Polestar 3', 2), (41, 'Polestar 4', 2), (41, 'Polestar 5', 3), (41, 'Polestar 6', 3), (41, 'Precept', 3), (41, 'O2', 3), (41, 'BST', 3), (41, 'Engineered', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (42, 'R1T', 2), (42, 'R1S', 2), (42, 'EDV', 2), (42, 'R2T', 3), (42, 'R2S', 3), (42, 'Amazon Van', 2), (42, 'Commercial', 2), (42, 'Adventure', 2), (42, 'Explore', 2), (42, 'Camp Kitchen', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (43, 'Phantom', 3), (43, 'Ghost', 3), (43, 'Wraith', 3), (43, 'Dawn', 3), (43, 'Cullinan', 3), (43, 'Silver Shadow', 3), (43, 'Corniche', 3), (43, 'Park Ward', 3), (43, 'Drophead', 3), (43, 'Black Badge', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (44, 'Ibiza', 1), (44, 'Leon', 1), (44, 'Arona', 1), (44, 'Ateca', 1), (44, 'Tarraco', 1), (44, 'Toledo', 1), (44, 'Alhambra', 1), (44, 'Mii', 1), (44, 'Altea', 1), (44, 'Exeo', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (45, 'Fabia', 1), (45, 'Octavia', 1), (45, 'Superb', 1), (45, 'Kamiq', 1), (45, 'Karoq', 1), (45, 'Kodiaq', 1), (45, 'Citigo', 1), (45, 'Rapid', 1), (45, 'Yeti', 1), (45, 'Enyaq', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (46, 'ILX', 2), (46, 'TLX', 2), (46, 'RLX', 2), (46, 'RDX', 2), (46, 'MDX', 2), (46, 'NSX', 3), (46, 'Integra', 2), (46, 'TSX', 2), (46, 'ZDX', 2), (46, 'RL', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (47, 'Tiggo 8', 1), (47, 'Tiggo 7', 1), (47, 'Tiggo 4', 1), (47, 'Arrizo 5', 1), (47, 'Arrizo 6', 1), (47, 'QQ', 1), (47, 'eQ1', 2), (47, 'Exeed TXL', 2), (47, 'Exeed LX', 2), (47, 'Fulwin', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (48, 'Coolray', 1), (48, 'Azkarra', 1), (48, 'Okavango', 1), (48, 'Tugella', 2), (48, 'Atlas', 1), (48, 'Boyue', 1), (48, 'Binrui', 1), (48, 'Xingyue', 2), (48, 'Jiaji', 1), (48, 'Galaxy', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (49, 'Tang', 2), (49, 'Han', 2), (49, 'Song', 1), (49, 'Qin', 1), (49, 'Yuan', 1), (49, 'Dolphin', 1), (49, 'Seal', 2), (49, 'Atto 3', 2), (49, 'Blade Battery', 2), (49, 'DM-i', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (50, '01', 2), (50, '02', 2), (50, '03', 2), (50, '05', 2), (50, '06', 2), (50, '09', 2), (50, 'Z10', 3), (50, 'The Next Day', 3), (50, 'Cyan', 3), (50, 'Club', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (51, 'S60', 2), (51, 'S90', 2), (51, 'V60', 2), (51, 'V90', 2), (51, 'XC40', 2), (51, 'XC60', 2), (51, 'XC90', 2), (51, 'C40', 2), (51, 'EX90', 2), (51, 'Polestar', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (53, 'Navigator', 2), (53, 'Aviator', 2), (53, 'Corsair', 2), (53, 'Nautilus', 2), (53, 'Continental', 2), (53, 'MKZ', 2), (53, 'MKX', 2), (53, 'MKC', 2), (53, 'Town Car', 2), (53, 'Mark VIII', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (54, 'Escalade', 2), (54, 'XT5', 2), (54, 'XT6', 2), (54, 'CT5', 2), (54, 'CT4', 2), (54, 'CTS', 2), (54, 'ATS', 2), (54, 'SRX', 2), (54, 'XTS', 2), (54, 'DeVille', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (55, 'Sierra', 1), (55, 'Acadia', 1), (55, 'Terrain', 1), (55, 'Yukon', 2), (55, 'Canyon', 1), (55, 'Savana', 1), (55, 'Envoy', 1), (55, 'Jimmy', 1), (55, 'Safari', 1), (55, 'Suburban', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (56, '1500', 1), (56, '2500', 2), (56, '3500', 2), (56, 'ProMaster', 1), (56, 'ProMaster City', 1), (56, 'TRX', 3), (56, 'Rebel', 2), (56, 'Laramie', 2), (56, 'Limited', 2), (56, 'Tradesman', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (57, 'Air Dream', 3), (57, 'Air Grand Touring', 3), (57, 'Air Touring', 3), (57, 'Air Pure', 2), (57, 'Gravity', 3), (57, 'Project Sapphire', 3), (57, 'Studio', 3), (57, 'Stealth', 3), (57, 'Glass Canopy', 3), (57, 'DreamDrive', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (58, 'DS 3', 2), (58, 'DS 4', 2), (58, 'DS 7', 2), (58, 'DS 9', 2), (58, 'DS 3 Crossback', 2), (58, 'DS 4 Crossback', 2), (58, 'DS 5', 2), (58, 'DS E-Tense', 3), (58, 'DS Aero Sport', 3), (58, 'DS Performance', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (59, 'A110', 3), (59, 'A110S', 3), (59, 'A110 Pure', 3), (59, 'A110 Légende', 3), (59, 'A110 GT', 3), (59, 'A290', 3), (59, 'A390', 3), (59, 'A490', 3), (59, 'Alpenglow', 3), (59, 'Vision', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (60, 'ZS', 1), (60, 'HS', 1), (60, 'MG5', 1), (60, 'MG4', 1), (60, 'EZS', 2), (60, 'EHS', 2), (60, 'Marvel R', 2), (60, 'Cyberster', 3), (60, 'TF', 2), (60, 'F', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (61, 'Formentor', 2), (61, 'Ateca', 2), (61, 'Leon', 2), (61, 'Born', 2), (61, 'Tavascan', 2), (61, 'UrbanRebel', 3), (61, 'DarkRebel', 3), (61, 'Terramar', 2), (61, 'VZ', 3), (61, 'eHybrid', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (62, 'fortwo', 1), (62, 'forfour', 1), (62, 'fortwo EQ', 2), (62, 'forfour EQ', 2), (62, '#1', 2), (62, '#3', 2), (62, 'Concept #1', 2), (62, 'EQS', 2), (62, 'Brabus', 2), (62, 'Cabrio', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (63, 'S-Class', 3), (63, 'GLS', 3), (63, 'EQS', 3), (63, '57', 3), (63, '62', 3), (63, 'Exelero', 3), (63, 'Landaulet', 3), (63, 'Pullman', 3), (63, 'Zeppelin', 3), (63, 'Vision 6', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (64, 'Ypsilon', 2), (64, 'Delta', 2), (64, 'Stratos', 3), (64, 'Aurelia', 3), (64, 'Fulvia', 3), (64, 'Beta', 2), (64, 'Gamma', 2), (64, 'Thema', 2), (64, 'Kappa', 2), (64, 'Musa', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (65, 'Ocean', 2), (65, 'Karma', 3), (65, 'PEAR', 2), (65, 'Ronin', 3), (65, 'Alaska', 3), (65, 'EMotion', 3), (65, 'Orbit', 2), (65, 'Force E', 3), (65, 'Solar Roof', 2), (65, 'Ultra', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (66, 'VF 8', 2), (66, 'VF 9', 2), (66, 'VF e34', 2), (66, 'VF 5', 1), (66, 'VF 6', 1), (66, 'VF 7', 2), (66, 'Fadil', 1), (66, 'Lux A2.0', 2), (66, 'Lux SA2.0', 2), (66, 'President', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (68, 'D-Max', 1), (68, 'MU-X', 1), (68, 'NPR', 2), (68, 'FRR', 2), (68, 'FVR', 2), (68, 'Trooper', 2), (68, 'Rodeo', 2), (68, 'VehiCross', 3), (68, 'Ascender', 2), (68, 'i-Series', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (69, 'Enclave', 2), (69, 'Encore', 2), (69, 'Envision', 2), (69, 'LaCrosse', 2), (69, 'Regal', 2), (69, 'Verano', 2), (69, 'Cascada', 2), (69, 'Electra', 3), (69, 'Riviera', 3), (69, 'Park Avenue', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (70, 'EV Pickup', 3), (70, 'EV SUV', 3), (70, 'H1', 3), (70, 'H2', 3), (70, 'H3', 3), (70, 'Edition 1', 3), (70, 'EQT', 3), (70, 'Sierra', 3), (70, 'Alpha', 3), (70, 'Bravo', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (71, 'Corsa', 1), (71, 'Astra', 1), (71, 'Insignia', 1), (71, 'Crossland', 1), (71, 'Grandland', 1), (71, 'Mokka', 1), (71, 'Combo', 1), (71, 'Vivaro', 1), (71, 'Movano', 1), (71, 'Vectra', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (72, 'Nexon', 1), (72, 'Harrier', 1), (72, 'Safari', 1), (72, 'Altroz', 1), (72, 'Tigor', 1), (72, 'Tiago', 1), (72, 'Punch', 1), (72, 'Hexa', 2), (72, 'Nano', 1), (72, 'Indica', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (73, 'P7', 2), (73, 'P5', 2), (73, 'G3', 2), (73, 'G9', 2), (73, 'P7i', 2), (73, 'G6', 2), (73, 'X9', 2), (73, 'Flying Car', 3), (73, 'Robot Horse', 3), (73, 'City NGP', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (74, 'ES8', 2), (74, 'ES6', 2), (74, 'EC6', 2), (74, 'ET7', 2), (74, 'ET5', 2), (74, 'EL7', 2), (74, 'EL6', 2), (74, 'EP9', 3), (74, 'Eve', 3), (74, 'Battery Swap', 2);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (75, 'Li ONE', 2), (75, 'L9', 2), (75, 'L8', 2), (75, 'L7', 2), (75, 'L6', 2), (75, 'MEGA', 2), (75, 'Li L9 Max', 2), (75, 'Li L8 Pro', 2), (75, 'Li L7 Air', 2), (75, 'AD Max', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (76, 'Nevera', 3), (76, 'C_Two', 3), (76, 'Concept One', 3), (76, 'Galactic', 3), (76, 'All-Wheel Torque', 3), (76, 'R-AWTV', 3), (76, 'Hypercar', 3), (76, 'Electric GT', 3), (76, 'Time Attack', 3), (76, 'Track Pack', 3);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (25, 'Duster', 1), (25, 'Sandero', 1), (25, 'Logan', 1), (25, 'Spring', 1), (25, 'Jogger', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (29, 'Elantra', 1), (29, 'Sonata', 1), (29, 'Tucson', 1), (29, 'Santa Fe', 1), (29, 'Kona', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (32, 'Forte', 1), (32, 'Optima', 1), (32, 'Sportage', 1), (32, 'Sorento', 1), (32, 'Soul', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (44, 'Ibiza', 1), (44, 'Leon', 1), (44, 'Arona', 1), (44, 'Ateca', 1), (44, 'Tarraco', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (45, 'Fabia', 1), (45, 'Octavia', 1), (45, 'Superb', 1), (45, 'Kamiq', 1), (45, 'Karoq', 1);
INSERT INTO models (brand_id, name, difficulty_level) VALUES (51, 'S60', 2), (51, 'S90', 2), (51, 'V60', 2), (51, 'XC40', 2), (51, 'XC60', 2);