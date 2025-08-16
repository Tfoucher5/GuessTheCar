-- Version moderne avec marques actuelles et 5+ modèles par marque
-- Difficultés: 1=Facile (populaire), 2=Moyen (premium/sport), 3=Difficile (exotique/rare)
-- Ajout des dates de première apparition (year) pour les 790 modèles

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
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (1, 'Corolla', 1966, 1), (1, 'Camry', 1982, 1), (1, 'RAV4', 1994, 1), (1, 'Highlander', 2000, 1), (1, 'Prius', 1997, 1), (1, 'Supra', 1978, 2), (1, 'Land Cruiser', 1951, 2), (1, 'Yaris', 1999, 1), (1, 'Avalon', 1994, 2), (1, 'Sienna', 1997, 1);

-- Insertion des modèles Ford (ID: 2)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (2, 'Focus', 1998, 1), (2, 'Fiesta', 1976, 1), (2, 'Mustang', 1964, 1), (2, 'F-150', 1975, 1), (2, 'Explorer', 1990, 1), (2, 'Escape', 2000, 1), (2, 'Bronco', 1966, 2), (2, 'Edge', 2006, 2), (2, 'Ranger', 1983, 2), (2, 'Expedition', 1997, 2);

-- Insertion des modèles BMW (ID: 3)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (3, 'Serie 3', 1975, 2), (3, 'Serie 5', 1972, 2), (3, 'X3', 2003, 2), (3, 'X5', 1999, 2), (3, 'Serie 1', 2004, 2), (3, 'X1', 2009, 2), (3, 'M3', 1986, 2), (3, 'M5', 1984, 3), (3, 'i4', 2021, 2), (3, 'iX', 2021, 2);

-- Insertion des modèles Peugeot (ID: 4)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (4, '208', 2012, 1), (4, '308', 2007, 1), (4, '3008', 2008, 1), (4, '5008', 2009, 1), (4, '2008', 2013, 1), (4, '508', 2010, 2), (4, 'Rifter', 2018, 1), (4, 'Partner', 1996, 1), (4, 'e-208', 2019, 2), (4, 'e-2008', 2019, 2);

-- Insertion des modèles Ferrari (ID: 5)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (5, 'F8 Tributo', 2019, 3), (5, 'Roma', 2020, 3), (5, 'Portofino', 2017, 3), (5, 'SF90 Stradale', 2019, 3), (5, '296 GTB', 2021, 3), (5, 'LaFerrari', 2013, 3), (5, 'Purosangue', 2022, 3), (5, '812 Superfast', 2017, 3), (5, 'Monza SP1', 2018, 3), (5, 'Daytona SP3', 2021, 3);

-- Insertion des modèles Mercedes (ID: 6)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (6, 'Classe A', 1997, 2), (6, 'Classe C', 1993, 2), (6, 'Classe E', 1953, 2), (6, 'GLA', 2013, 2), (6, 'GLC', 2015, 2), (6, 'GLE', 1997, 2), (6, 'AMG GT', 2014, 3), (6, 'SL', 1954, 3), (6, 'EQS', 2021, 2), (6, 'Classe S', 1972, 2);

-- Insertion des modèles Renault (ID: 7)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (7, 'Clio', 1990, 1), (7, 'Megane', 1995, 1), (7, 'Captur', 2013, 1), (7, 'Kadjar', 2015, 1), (7, 'Scenic', 1996, 1), (7, 'Talisman', 2015, 2), (7, 'Koleos', 2008, 2), (7, 'Arkana', 2019, 1), (7, 'Zoe', 2012, 1), (7, 'Twingo', 1992, 1);

-- Insertion des modèles Honda (ID: 8)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (8, 'Civic', 1972, 1), (8, 'Accord', 1976, 1), (8, 'CR-V', 1995, 1), (8, 'HR-V', 1998, 1), (8, 'Pilot', 2002, 1), (8, 'Odyssey', 1994, 1), (8, 'Passport', 1993, 2), (8, 'Ridgeline', 2005, 2), (8, 'NSX', 1990, 3), (8, 'Insight', 1999, 2);

-- Insertion des modèles Audi (ID: 9)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (9, 'A3', 1996, 2), (9, 'A4', 1994, 2), (9, 'A6', 1994, 2), (9, 'Q3', 2011, 2), (9, 'Q5', 2008, 2), (9, 'Q7', 2005, 2), (9, 'TT', 1998, 2), (9, 'R8', 2006, 3), (9, 'e-tron', 2018, 2), (9, 'RS6', 2002, 3);

-- Insertion des modèles Chevrolet (ID: 10)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (10, 'Cruze', 2008, 1), (10, 'Malibu', 1964, 1), (10, 'Equinox', 2004, 1), (10, 'Traverse', 2008, 1), (10, 'Silverado', 1999, 1), (10, 'Camaro', 1966, 2), (10, 'Corvette', 1953, 3), (10, 'Tahoe', 1995, 2), (10, 'Suburban', 1935, 2), (10, 'Blazer', 1969, 1);

-- Insertion des modèles Volkswagen (ID: 11)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (11, 'Golf', 1974, 1), (11, 'Polo', 1975, 1), (11, 'Passat', 1973, 1), (11, 'Tiguan', 2007, 1), (11, 'Touareg', 2002, 2), (11, 'Arteon', 2017, 2), (11, 'T-Cross', 2018, 1), (11, 'T-Roc', 2017, 1), (11, 'ID.3', 2019, 2), (11, 'ID.4', 2020, 2);

-- Insertion des modèles Nissan (ID: 12)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (12, 'Sentra', 1982, 1), (12, 'Altima', 1992, 1), (12, 'Rogue', 2007, 1), (12, 'Murano', 2002, 1), (12, 'Pathfinder', 1985, 1), (12, 'Frontier', 1997, 1), (12, 'Titan', 2003, 2), (12, 'GT-R', 2007, 3), (12, '370Z', 2008, 2), (12, 'Leaf', 2010, 2);

-- Insertion des modèles Porsche (ID: 13)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (13, '911', 1963, 3), (13, 'Cayenne', 2002, 2), (13, 'Macan', 2014, 2), (13, 'Panamera', 2009, 3), (13, 'Taycan', 2019, 3), (13, 'Boxster', 1996, 3), (13, 'Cayman', 2005, 3), (13, '718', 2016, 3), (13, 'Carrera', 1963, 3), (13, 'Turbo S', 1975, 3);

-- Insertion des modèles Lamborghini (ID: 14)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (14, 'Huracán', 2014, 3), (14, 'Aventador', 2011, 3), (14, 'Urus', 2018, 3), (14, 'Revuelto', 2023, 3), (14, 'Sterrato', 2022, 3), (14, 'STO', 2020, 3), (14, 'Tecnica', 2022, 3), (14, 'Performante', 2017, 3), (14, 'SVJ', 2018, 3), (14, 'Gallardo', 2003, 3);

-- Insertion des modèles Mitsubishi (ID: 15)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (15, 'Outlander', 2001, 1), (15, 'Eclipse Cross', 2017, 1), (15, 'Mirage', 1978, 1), (15, 'Pajero Sport', 1996, 2), (15, 'L200', 1978, 2), (15, 'ASX', 2010, 1), (15, 'Lancer', 1973, 2), (15, 'Triton', 2005, 2), (15, 'Shogun', 1982, 2), (15, 'Colt', 1962, 1);

-- Insertion des modèles Subaru (ID: 16)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (16, 'Impreza', 1992, 2), (16, 'Outback', 1994, 2), (16, 'Forester', 1997, 2), (16, 'XV', 2011, 2), (16, 'Legacy', 1989, 2), (16, 'WRX', 2001, 3), (16, 'BRZ', 2012, 2), (16, 'Ascent', 2018, 2), (16, 'Levorg', 2014, 2), (16, 'STI', 2004, 3);

-- Insertion des modèles Mazda (ID: 17)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (17, 'Mazda3', 2003, 1), (17, 'Mazda6', 2002, 1), (17, 'CX-5', 2012, 1), (17, 'CX-3', 2015, 1), (17, 'CX-30', 2019, 1), (17, 'CX-9', 2006, 2), (17, 'MX-5', 1989, 2), (17, 'RX-8', 2003, 3), (17, 'MX-30', 2020, 2), (17, 'CX-60', 2022, 2);

-- Insertion des modèles Jaguar (ID: 18)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (18, 'XE', 2014, 2), (18, 'XF', 2007, 2), (18, 'XJ', 1968, 3), (18, 'F-Pace', 2015, 2), (18, 'E-Pace', 2017, 2), (18, 'I-Pace', 2018, 3), (18, 'F-Type', 2013, 3), (18, 'XK', 1996, 3), (18, 'S-Type', 1999, 2), (18, 'X-Type', 2001, 2);

-- Insertion des modèles Tesla (ID: 19)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (19, 'Model 3', 2017, 2), (19, 'Model Y', 2019, 2), (19, 'Model S', 2012, 2), (19, 'Model X', 2015, 2), (19, 'Cybertruck', 2023, 3), (19, 'Semi', 2022, 3), (19, 'Roadster', 2008, 3), (19, 'Model S Plaid', 2021, 3), (19, 'Model X Plaid', 2021, 3), (19, 'Model 3 Performance', 2018, 2);

-- Insertion des modèles Bugatti (ID: 20)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (20, 'Chiron', 2016, 3), (20, 'Veyron', 2005, 3), (20, 'Divo', 2018, 3), (20, 'Centodieci', 2019, 3), (20, 'La Voiture Noire', 2019, 3), (20, 'Bolide', 2020, 3), (20, 'Mistral', 2022, 3), (20, 'EB110', 1991, 3), (20, 'Type 57', 1934, 3), (20, 'Atlantic', 1936, 3);

-- Insertion des modèles Alfa Romeo (ID: 21)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (21, 'Giulia', 2015, 2), (21, 'Stelvio', 2016, 2), (21, 'Giulietta', 2010, 2), (21, 'Tonale', 2022, 2), (21, '4C', 2013, 3), (21, 'GTV', 1995, 3), (21, 'Spider', 1995, 3), (21, 'Brera', 2005, 3), (21, '159', 2005, 2), (21, 'MiTo', 2008, 2);

-- Insertion des modèles Aston Martin (ID: 22)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (22, 'DB11', 2016, 3), (22, 'Vantage', 2005, 3), (22, 'DBS', 2007, 3), (22, 'DBX', 2019, 3), (22, 'Valkyrie', 2021, 3), (22, 'Rapide', 2009, 3), (22, 'Vanquish', 2001, 3), (22, 'Victor', 2020, 3), (22, 'Vulcan', 2015, 3), (22, 'One-77', 2009, 3);

-- Insertion des modèles Bentley (ID: 23)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (23, 'Continental', 2003, 3), (23, 'Bentayga', 2015, 3), (23, 'Flying Spur', 2005, 3), (23, 'Mulsanne', 2009, 3), (23, 'Bacalar', 2020, 3), (23, 'Batur', 2022, 3), (23, 'Arnage', 1998, 3), (23, 'Azure', 1995, 3), (23, 'Brooklands', 2007, 3), (23, 'Speed', 2007, 3);

-- Insertion des modèles Citroën (ID: 24)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (24, 'C3', 2002, 1), (24, 'C4', 2004, 1), (24, 'C5', 2000, 1), (24, 'C1', 2005, 1), (24, 'Berlingo', 1996, 1), (24, 'Picasso', 1999, 1), (24, 'DS3', 2009, 2), (24, 'DS4', 2011, 2), (24, 'DS5', 2011, 2), (24, 'Ami', 2020, 1);

-- Insertion des modèles Dacia (ID: 25)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (25, 'Sandero', 2007, 1), (25, 'Duster', 2010, 1), (25, 'Logan', 2004, 1), (25, 'Spring', 2021, 1), (25, 'Dokker', 2012, 1), (25, 'Lodgy', 2012, 1), (25, 'Jogger', 2021, 1), (25, 'Stepway', 2009, 1), (25, 'Pick-up', 2007, 1), (25, 'Solenza', 2003, 1);

-- Insertion des modèles Dodge (ID: 26)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (26, 'Challenger', 1970, 2), (26, 'Charger', 1966, 2), (26, 'Durango', 1998, 2), (26, 'Journey', 2008, 1), (26, 'Ram 1500', 2019, 2), (26, 'Viper', 1991, 3), (26, 'Hellcat', 2015, 3), (26, 'Demon', 2017, 3), (26, 'Avenger', 2007, 1), (26, 'Caliber', 2006, 1);

-- Insertion des modèles Fiat (ID: 27)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (27, '500', 2007, 1), (27, 'Panda', 1980, 1), (27, 'Tipo', 1988, 1), (27, 'Punto', 1993, 1), (27, 'Ducato', 1981, 1), (27, '500X', 2014, 1), (27, '500L', 2012, 1), (27, 'Doblo', 2000, 1), (27, 'Fiorino', 1977, 1), (27, 'Qubo', 2008, 1);

-- Insertion des modèles Genesis (ID: 28)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (28, 'G70', 2017, 2), (28, 'G80', 2016, 2), (28, 'G90', 2016, 2), (28, 'GV70', 2020, 2), (28, 'GV80', 2020, 2), (28, 'Coupe', 2008, 2), (28, 'Sedan', 2008, 2), (28, 'X', 2022, 3), (28, 'Electrified G80', 2021, 2), (28, 'GV60', 2021, 2);

-- Insertion des modèles Hyundai (ID: 29)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (29, 'i10', 2007, 1), (29, 'i20', 2008, 1), (29, 'i30', 2007, 1), (29, 'Tucson', 2004, 1), (29, 'Santa Fe', 2000, 1), (29, 'Kona', 2017, 1), (29, 'Elantra', 1990, 1), (29, 'Sonata', 1985, 1), (29, 'Veloster', 2011, 2), (29, 'Palisade', 2018, 2);

-- Insertion des modèles Infiniti (ID: 30)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (30, 'Q50', 2013, 2), (30, 'Q60', 2016, 2), (30, 'QX50', 2018, 2), (30, 'QX60', 2012, 2), (30, 'QX80', 2010, 2), (30, 'G35', 2002, 2), (30, 'G37', 2007, 2), (30, 'FX35', 2003, 2), (30, 'EX35', 2007, 2), (30, 'M35', 2005, 2);

-- Insertion des modèles Jeep (ID: 31)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (31, 'Wrangler', 1986, 1), (31, 'Grand Cherokee', 1992, 1), (31, 'Cherokee', 1974, 1), (31, 'Compass', 2006, 1), (31, 'Renegade', 2014, 1), (31, 'Gladiator', 2019, 2), (31, 'Patriot', 2006, 1), (31, 'Commander', 2005, 2), (31, 'Liberty', 2001, 1), (31, 'Avenger', 2022, 1);

-- Insertion des modèles Kia (ID: 32)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (32, 'Picanto', 2004, 1), (32, 'Rio', 1999, 1), (32, 'Ceed', 2007, 1), (32, 'Sportage', 1993, 1), (32, 'Sorento', 2002, 1), (32, 'Stinger', 2017, 2), (32, 'Niro', 2016, 1), (32, 'Soul', 2008, 1), (32, 'EV6', 2021, 2), (32, 'Xceed', 2019, 1);

-- Insertion des modèles Land Rover (ID: 33)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (33, 'Range Rover', 1970, 2), (33, 'Discovery', 1989, 2), (33, 'Defender', 1983, 2), (33, 'Evoque', 2011, 2), (33, 'Velar', 2017, 2), (33, 'Sport', 2005, 2), (33, 'Freelander', 1997, 2), (33, 'LR2', 2006, 2), (33, 'LR3', 2004, 2), (33, 'LR4', 2009, 2);

-- Insertion des modèles Lexus (ID: 34)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (34, 'IS', 1998, 2), (34, 'ES', 1989, 2), (34, 'GS', 1991, 2), (34, 'LS', 1989, 2), (34, 'NX', 2014, 2), (34, 'RX', 1998, 2), (34, 'GX', 2002, 2), (34, 'LX', 1995, 2), (34, 'RC', 2014, 2), (34, 'LC', 2017, 3);

-- Insertion des modèles Lotus (ID: 35)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (35, 'Elise', 1996, 3), (35, 'Exige', 2000, 3), (35, 'Evora', 2009, 3), (35, 'Emira', 2021, 3), (35, 'Esprit', 1976, 3), (35, 'Europa', 1966, 3), (35, 'Elan', 1962, 3), (35, 'Eclat', 1975, 3), (35, 'Elite', 1957, 3), (35, 'Eterne', 2009, 3);

-- Insertion des modèles Maserati (ID: 36)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (36, 'Ghibli', 2013, 3), (36, 'Quattroporte', 2003, 3), (36, 'Levante', 2016, 3), (36, 'GranTurismo', 2007, 3), (36, 'GranCabrio', 2009, 3), (36, 'MC20', 2020, 3), (36, 'Grecale', 2022, 3), (36, 'Khamsin', 1973, 3), (36, 'Biturbo', 1981, 3), (36, '3200 GT', 1998, 3);

-- Insertion des modèles McLaren (ID: 37)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (37, '720S', 2017, 3), (37, '765LT', 2020, 3), (37, 'Artura', 2021, 3), (37, '600LT', 2018, 3), (37, '570S', 2015, 3), (37, 'Senna', 2018, 3), (37, 'Speedtail', 2018, 3), (37, 'Elva', 2019, 3), (37, 'P1', 2013, 3), (37, 'F1', 1992, 3);

-- Insertion des modèles Mini (ID: 38)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (38, 'Cooper', 2001, 2), (38, 'Countryman', 2010, 2), (38, 'Clubman', 2007, 2), (38, 'Paceman', 2012, 2), (38, 'Convertible', 2004, 2), (38, 'Roadster', 2011, 2), (38, 'Coupe', 2011, 2), (38, 'Electric', 2019, 2), (38, 'JCW', 2006, 2), (38, 'One', 2001, 2);

-- Insertion des modèles Opel (ID: 39)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (39, 'Corsa', 1982, 1), (39, 'Astra', 1991, 1), (39, 'Insignia', 2008, 1), (39, 'Mokka', 2012, 1), (39, 'Crossland', 2017, 1), (39, 'Grandland', 2017, 1), (39, 'Zafira', 1999, 1), (39, 'Meriva', 2003, 1), (39, 'Vectra', 1988, 1), (39, 'Omega', 1986, 2);

-- Insertion des modèles Pagani (ID: 40)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (40, 'Huayra', 2011, 3), (40, 'Zonda', 1999, 3), (40, 'Utopia', 2022, 3), (40, 'Imola', 2020, 3), (40, 'Roadster BC', 2017, 3), (40, 'Tricolore', 2010, 3), (40, 'Cinque', 2009, 3), (40, 'R', 2007, 3), (40, 'F', 2005, 3), (40, 'C12', 1999, 3);

-- Insertion des modèles Polestar (ID: 41)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (41, '1', 2017, 2), (41, '2', 2019, 2), (41, '3', 2023, 2), (41, '4', 2023, 2), (41, '5', 2024, 3), (41, '6', 2024, 3), (41, 'Precept', 2020, 3), (41, 'O2', 2022, 3), (41, 'BST', 2020, 3), (41, 'Engineered', 2019, 2);

-- Insertion des modèles Rivian (ID: 42)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (42, 'R1T', 2021, 3), (42, 'R1S', 2021, 3), (42, 'EDV', 2022, 3), (42, 'Amazon Van', 2022, 3), (42, 'R2T', 2024, 3), (42, 'R2S', 2024, 3), (42, 'Air', 2023, 3), (42, 'Max Pack', 2022, 3), (42, 'Large Pack', 2021, 3), (42, 'Standard Pack', 2021, 3);

-- Insertion des modèles Rolls-Royce (ID: 43)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (43, 'Phantom', 2003, 3), (43, 'Ghost', 2009, 3), (43, 'Wraith', 2013, 3), (43, 'Dawn', 2015, 3), (43, 'Cullinan', 2018, 3), (43, 'Spectre', 2023, 3), (43, 'Silver Spur', 1980, 3), (43, 'Corniche', 1971, 3), (43, 'Silver Shadow', 1965, 3), (43, 'Silver Cloud', 1955, 3);

-- Insertion des modèles SEAT (ID: 44)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (44, 'Ibiza', 1984, 1), (44, 'Leon', 1999, 1), (44, 'Arona', 2017, 1), (44, 'Ateca', 2016, 1), (44, 'Tarraco', 2018, 1), (44, 'Alhambra', 1996, 1), (44, 'Altea', 2004, 1), (44, 'Toledo', 1991, 1), (44, 'Cordoba', 1993, 1), (44, 'Mii', 2011, 1);

-- Insertion des modèles Skoda (ID: 45)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (45, 'Octavia', 1996, 1), (45, 'Fabia', 1999, 1), (45, 'Superb', 2001, 1), (45, 'Karoq', 2017, 1), (45, 'Kodiaq', 2016, 1), (45, 'Kamiq', 2019, 1), (45, 'Scala', 2018, 1), (45, 'Citigo', 2011, 1), (45, 'Rapid', 2012, 1), (45, 'Roomster', 2006, 1);

-- Insertion des modèles Acura (ID: 46)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (46, 'TLX', 2014, 2), (46, 'MDX', 2000, 2), (46, 'RDX', 2006, 2), (46, 'ILX', 2012, 2), (46, 'NSX', 2016, 3), (46, 'TSX', 2003, 2), (46, 'TL', 1995, 2), (46, 'RL', 1996, 2), (46, 'RSX', 2001, 2), (46, 'Integra', 2022, 2);

-- Insertion des modèles Chery (ID: 47)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (47, 'Tiggo', 2005, 1), (47, 'QQ', 2003, 1), (47, 'Arrizo', 2013, 1), (47, 'Exeed', 2018, 2), (47, 'eQ', 2018, 2), (47, 'Omoda', 2022, 2), (47, 'Jetour', 2018, 2), (47, 'Fulwin', 2008, 1), (47, 'A3', 2008, 1), (47, 'E5', 2012, 1);

-- Insertion des modèles Geely (ID: 48)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (48, 'Emgrand', 2009, 1), (48, 'Coolray', 2018, 1), (48, 'Atlas', 2016, 1), (48, 'Geometry', 2019, 2), (48, 'Xingyue', 2019, 2), (48, 'Boyue', 2016, 1), (48, 'Binyue', 2018, 1), (48, 'Jiaji', 2018, 1), (48, 'Preface', 2020, 2), (48, 'Icon', 2020, 2);

-- Insertion des modèles BYD (ID: 49)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (49, 'Tang', 2015, 2), (49, 'Song', 2016, 2), (49, 'Qin', 2013, 2), (49, 'Han', 2020, 2), (49, 'Yuan', 2016, 1), (49, 'Dolphin', 2021, 2), (49, 'Seal', 2022, 2), (49, 'Atto 3', 2022, 2), (49, 'e6', 2009, 2), (49, 'F3', 2005, 1);

-- Insertion des modèles Lynk & Co (ID: 50)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (50, '01', 2017, 2), (50, '02', 2018, 2), (50, '03', 2018, 2), (50, '05', 2020, 2), (50, '06', 2020, 2), (50, '09', 2022, 2), (50, 'Z10', 2023, 3), (50, 'The Next Day', 2022, 3), (50, 'Co Pad', 2021, 2), (50, 'Co Pilot', 2021, 2);

-- Insertion des modèles Volvo (ID: 51)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (51, 'XC40', 2017, 2), (51, 'XC60', 2008, 2), (51, 'XC90', 2002, 2), (51, 'V60', 2010, 2), (51, 'V90', 2016, 2), (51, 'S60', 2000, 2), (51, 'S90', 2016, 2), (51, 'C40', 2021, 2), (51, 'EX30', 2023, 2), (51, 'EX90', 2023, 2);

-- Insertion des modèles Koenigsegg (ID: 52)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (52, 'Regera', 2016, 3), (52, 'Jesko', 2019, 3), (52, 'Gemera', 2020, 3), (52, 'Agera', 2011, 3), (52, 'CCX', 2006, 3), (52, 'One:1', 2014, 3), (52, 'CCXR', 2007, 3), (52, 'CC8S', 2003, 3), (52, 'CCR', 2004, 3), (52, 'Absolut', 2019, 3);

-- Insertion des modèles Lincoln (ID: 53)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (53, 'Navigator', 1997, 2), (53, 'Aviator', 2003, 2), (53, 'Corsair', 2019, 2), (53, 'Nautilus', 2015, 2), (53, 'Continental', 2016, 2), (53, 'MKZ', 2006, 2), (53, 'MKX', 2006, 2), (53, 'MKC', 2014, 2), (53, 'Town Car', 1981, 2), (53, 'LS', 1999, 2);

-- Insertion des modèles Cadillac (ID: 54)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (54, 'Escalade', 1999, 2), (54, 'XT5', 2016, 2), (54, 'XT4', 2018, 2), (54, 'CT4', 2019, 2), (54, 'CT5', 2019, 2), (54, 'Lyriq', 2022, 3), (54, 'Celestiq', 2023, 3), (54, 'CTS', 2002, 2), (54, 'ATS', 2012, 2), (54, 'SRX', 2003, 2);

-- Insertion des modèles GMC (ID: 55)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (55, 'Sierra', 1999, 2), (55, 'Yukon', 1991, 2), (55, 'Terrain', 2009, 2), (55, 'Acadia', 2006, 2), (55, 'Canyon', 2003, 2), (55, 'Savana', 1995, 2), (55, 'Hummer EV', 2021, 3), (55, 'Denali', 1999, 2), (55, 'AT4', 2018, 2), (55, 'Envoy', 1997, 2);

-- Insertion des modèles Ram (ID: 56)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (56, '1500', 2009, 2), (56, '2500', 2009, 2), (56, '3500', 2009, 2), (56, 'ProMaster', 2013, 2), (56, 'ProMaster City', 2014, 2), (56, 'Rebel', 2015, 2), (56, 'TRX', 2020, 3), (56, 'Laramie', 2009, 2), (56, 'Big Horn', 2009, 2), (56, 'Limited', 2009, 2);

-- Insertion des modèles Lucid (ID: 57)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (57, 'Air', 2021, 3), (57, 'Dream', 2021, 3), (57, 'Touring', 2022, 3), (57, 'Pure', 2022, 3), (57, 'Gravity', 2024, 3), (57, 'Sapphire', 2022, 3), (57, 'Grand Touring', 2021, 3), (57, 'Stealth', 2023, 3), (57, 'Glass Roof', 2021, 3), (57, 'Santa Monica', 2022, 3);

-- Insertion des modèles DS (ID: 58)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (58, 'DS3', 2009, 2), (58, 'DS4', 2011, 2), (58, 'DS5', 2011, 2), (58, 'DS7', 2017, 2), (58, 'DS8', 2019, 2), (58, 'DS9', 2020, 2), (58, 'E-Tense', 2019, 2), (58, 'Crossback', 2018, 2), (58, 'Performance Line', 2020, 2), (58, 'Opera', 2021, 2);

-- Insertion des modèles Alpine (ID: 59)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (59, 'A110', 2017, 3), (59, 'A310', 1971, 3), (59, 'A610', 1991, 3), (59, 'GTA', 1984, 3), (59, 'V6', 1985, 3), (59, 'Turbo', 1976, 3), (59, 'Pure', 2018, 3), (59, 'Legende', 2018, 3), (59, 'S', 2019, 3), (59, 'R', 2022, 3);

-- Insertion des modèles MG (ID: 60)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (60, 'ZS', 2017, 1), (60, 'HS', 2018, 1), (60, '5', 2020, 1), (60, 'Marvel R', 2021, 2), (60, 'EHS', 2019, 2), (60, 'ZST', 2018, 1), (60, 'One', 2021, 2), (60, 'Cyberster', 2023, 3), (60, 'EZS', 2019, 2), (60, 'Pilot', 2022, 2);

-- Insertion des modèles Cupra (ID: 61)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (61, 'Leon', 2020, 2), (61, 'Formentor', 2020, 2), (61, 'Ateca', 2018, 2), (61, 'Born', 2021, 2), (61, 'Tavascan', 2024, 2), (61, 'Leon e-Hybrid', 2020, 2), (61, 'VZ', 2021, 2), (61, 'R', 2021, 3), (61, 'Performance', 2020, 2), (61, 'eBoost', 2021, 2);

-- Insertion des modèles smart (ID: 62)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (62, 'fortwo', 1998, 1), (62, 'forfour', 2004, 1), (62, 'EQfortwo', 2017, 2), (62, 'EQforfour', 2017, 2), (62, '#1', 2022, 2), (62, '#3', 2023, 2), (62, 'Roadster', 2003, 2), (62, 'Crossblade', 2002, 3), (62, 'Brabus', 2002, 2), (62, 'Cabrio', 2000, 2);

-- Insertion des modèles Maybach (ID: 63)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (63, 'S-Class', 2014, 3), (63, 'GLS', 2019, 3), (63, 'EQS', 2021, 3), (63, '57', 2002, 3), (63, '62', 2002, 3), (63, 'Exelero', 2004, 3), (63, 'Landaulet', 2007, 3), (63, 'Zeppelin', 2009, 3), (63, 'Guard', 2016, 3), (63, 'Pullman', 2015, 3);

-- Insertion des modèles Lancia (ID: 64)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (64, 'Ypsilon', 2003, 2), (64, 'Delta', 1979, 2), (64, 'Musa', 2004, 2), (64, 'Phedra', 2002, 2), (64, 'Thesis', 2001, 2), (64, 'Stratos', 1973, 3), (64, 'Integrale', 1987, 3), (64, 'Fulvia', 1963, 3), (64, 'Beta', 1972, 2), (64, 'Gamma', 1976, 2);

-- Insertion des modèles Fisker (ID: 65)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (65, 'Ocean', 2022, 3), (65, 'Karma', 2011, 3), (65, 'Pear', 2024, 3), (65, 'Alaska', 2024, 3), (65, 'Ronin', 2025, 3), (65, 'EMotion', 2017, 3), (65, 'Ultra', 2022, 3), (65, 'Extreme', 2022, 3), (65, 'Sport', 2022, 3), (65, 'One', 2023, 3);

-- Insertion des modèles VinFast (ID: 66)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (66, 'VF8', 2022, 2), (66, 'VF9', 2022, 2), (66, 'VF5', 2021, 2), (66, 'VF6', 2021, 2), (66, 'VF7', 2021, 2), (66, 'Lux A2.0', 2018, 2), (66, 'Lux SA2.0', 2018, 2), (66, 'Fadil', 2018, 1), (66, 'Klara', 2018, 1), (66, 'Theon', 2019, 2);

-- Insertion des modèles Suzuki (ID: 67)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (67, 'Swift', 2004, 1), (67, 'Vitara', 1988, 1), (67, 'Baleno', 2015, 1), (67, 'Jimny', 1998, 2), (67, 'S-Cross', 2013, 1), (67, 'Ertiga', 2012, 1), (67, 'Alto', 1979, 1), (67, 'Celerio', 2008, 1), (67, 'Ignis', 2000, 1), (67, 'XL7', 2019, 1);

-- Insertion des modèles Isuzu (ID: 68)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (68, 'D-Max', 2002, 2), (68, 'MU-X', 2013, 2), (68, 'Trooper', 1981, 2), (68, 'Rodeo', 1988, 2), (68, 'Ascender', 2003, 2), (68, 'Axiom', 2001, 2), (68, 'VehiCross', 1997, 3), (68, 'Amigo', 1989, 2), (68, 'Hombre', 1996, 2), (68, 'Oasis', 1996, 2);

-- Insertion des modèles Buick (ID: 69)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (69, 'Encore', 2012, 2), (69, 'Envision', 2014, 2), (69, 'Enclave', 2007, 2), (69, 'Regal', 1973, 2), (69, 'LaCrosse', 2004, 2), (69, 'Verano', 2011, 2), (69, 'Cascada', 2013, 2), (69, 'Grand National', 1984, 3), (69, 'Riviera', 1963, 2), (69, 'Park Avenue', 1990, 2);

-- Insertion des modèles Hummer (ID: 70)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (70, 'EV', 2021, 3), (70, 'H1', 1992, 3), (70, 'H2', 2002, 3), (70, 'H3', 2005, 3), (70, 'EV SUV', 2023, 3), (70, 'EV Pickup', 2021, 3), (70, 'Alpha', 2006, 3), (70, 'SUT', 2004, 3), (70, 'Wagon', 1999, 3), (70, 'Open Top', 1997, 3);

-- Insertion des modèles Vauxhall (ID: 71)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (71, 'Corsa', 1993, 1), (71, 'Astra', 1980, 1), (71, 'Insignia', 2008, 1), (71, 'Mokka', 2012, 1), (71, 'Crossland', 2017, 1), (71, 'Grandland', 2017, 1), (71, 'Zafira', 1999, 1), (71, 'Meriva', 2003, 1), (71, 'Vectra', 1988, 1), (71, 'Omega', 1986, 2);

-- Insertion des modèles Tata (ID: 72)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (72, 'Nexon', 2017, 1), (72, 'Harrier', 2019, 1), (72, 'Safari', 2021, 1), (72, 'Altroz', 2019, 1), (72, 'Tiago', 2016, 1), (72, 'Tigor', 2017, 1), (72, 'Punch', 2021, 1), (72, 'Nano', 2008, 1), (72, 'Indica', 1998, 1), (72, 'Sumo', 1994, 1);

-- Insertion des modèles Xpeng (ID: 73)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (73, 'P7', 2020, 2), (73, 'P5', 2021, 2), (73, 'G3', 2018, 2), (73, 'G9', 2022, 2), (73, 'P7i', 2023, 2), (73, 'G6', 2023, 2), (73, 'X9', 2024, 3), (73, 'MONA', 2022, 3), (73, 'Robot Taxi', 2023, 3), (73, 'Flying Car', 2024, 3);

-- Insertion des modèles NIO (ID: 74)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (74, 'ES8', 2018, 2), (74, 'ES6', 2019, 2), (74, 'EC6', 2020, 2), (74, 'ET7', 2022, 2), (74, 'ET5', 2022, 2), (74, 'EL7', 2022, 2), (74, 'EC7', 2023, 2), (74, 'EP9', 2016, 3), (74, 'EVE', 2017, 3), (74, 'ET9', 2024, 3);

-- Insertion des modèles Li Auto (ID: 75)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (75, 'One', 2019, 2), (75, 'L9', 2022, 2), (75, 'L8', 2022, 2), (75, 'L7', 2023, 2), (75, 'L6', 2024, 2), (75, 'MEGA', 2024, 3), (75, 'Air', 2025, 3), (75, 'Pro', 2023, 2), (75, 'Max', 2022, 2), (75, 'Ultra', 2024, 3);

-- Insertion des modèles Rimac (ID: 76)
INSERT INTO models (brand_id, name, year, difficulty_level) VALUES (76, 'Nevera', 2021, 3), (76, 'Concept One', 2016, 3), (76, 'Concept Two', 2018, 3), (76, 'C_Two', 2019, 3), (76, 'All-Wheel Torque Vectoring', 2020, 3), (76, 'Time Attack', 2021, 3), (76, 'Signature', 2021, 3), (76, 'Timeless', 2022, 3), (76, 'Bespoke', 2022, 3), (76, 'Green Hell', 2023, 3);

