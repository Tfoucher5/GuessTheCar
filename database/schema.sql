-- Schema pour Guess The Car Bot v2.0
-- Création des tables pour le nouveau système
-- Table des joueurs (remplace le système scores.json)
CREATE TABLE
    IF NOT EXISTS players (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL UNIQUE,
        username VARCHAR(32) NOT NULL,
        cars_guessed INT DEFAULT 0,
        partial_guesses INT DEFAULT 0,
        total_points DECIMAL(8, 2) DEFAULT 0,
        total_difficulty_points DECIMAL(8, 2) DEFAULT 0,
        total_attempts INT DEFAULT 0,
        best_time INT DEFAULT NULL,
        last_game_time INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_total_difficulty_points (total_difficulty_points DESC),
        INDEX idx_updated_at (updated_at)
    );

-- Table des marques (existante - garder la structure actuelle)
CREATE TABLE
    IF NOT EXISTS marques (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(50) NOT NULL,
        pays VARCHAR(50) NOT NULL,
        INDEX idx_nom (nom),
        INDEX idx_pays (pays)
    );

-- Table des modèles (existante - garder la structure actuelle) 
CREATE TABLE
    IF NOT EXISTS modeles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marque_id INT NOT NULL,
        nom VARCHAR(100) NOT NULL,
        annee YEAR NOT NULL,
        difficulte TINYINT NOT NULL DEFAULT 1,
        FOREIGN KEY (marque_id) REFERENCES marques (id) ON DELETE CASCADE,
        INDEX idx_marque_id (marque_id),
        INDEX idx_difficulte (difficulte),
        INDEX idx_annee (annee)
    );

-- Table des parties (optionnelle - pour historique détaillé)
CREATE TABLE
    IF NOT EXISTS game_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(20) NOT NULL,
        car_id INT NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP NULL,
        attempts_make INT DEFAULT 0,
        attempts_model INT DEFAULT 0,
        make_found BOOLEAN DEFAULT FALSE,
        model_found BOOLEAN DEFAULT FALSE,
        abandoned BOOLEAN DEFAULT FALSE,
        timeout BOOLEAN DEFAULT FALSE,
        car_changes_used INT DEFAULT 0,
        points_earned DECIMAL(6, 2) DEFAULT 0,
        difficulty_points_earned DECIMAL(6, 2) DEFAULT 0,
        FOREIGN KEY (car_id) REFERENCES modeles (id),
        INDEX idx_user_id (user_id),
        INDEX idx_started_at (started_at),
        INDEX idx_car_id (car_id)
    );

-- Vue pour les statistiques rapides
CREATE
OR REPLACE VIEW player_stats_view AS
SELECT
    p.*,
    RANK() OVER (
        ORDER BY
            p.total_difficulty_points DESC,
            p.cars_guessed DESC,
            p.best_time ASC
    ) as ranking,
    CASE
        WHEN p.total_difficulty_points >= 50 THEN 'Maître'
        WHEN p.total_difficulty_points >= 25 THEN 'Expert'
        WHEN p.total_difficulty_points >= 15 THEN 'Avancé'
        WHEN p.total_difficulty_points >= 8 THEN 'Intermédiaire'
        WHEN p.total_difficulty_points >= 3 THEN 'Apprenti'
        ELSE 'Débutant'
    END as skill_level,
    (p.cars_guessed + p.partial_guesses) as total_games,
    CASE
        WHEN (p.cars_guessed + p.partial_guesses) > 0 THEN (
            p.cars_guessed / (p.cars_guessed + p.partial_guesses)
        ) * 100
        ELSE 0
    END as success_rate,
    CASE
        WHEN (p.cars_guessed + p.partial_guesses) > 0 THEN p.total_attempts / (p.cars_guessed + p.partial_guesses)
        ELSE 0
    END as average_attempts
FROM
    players p
WHERE
    p.total_difficulty_points > 0;

-- Index pour optimiser les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_players_leaderboard ON players (
    total_difficulty_points DESC,
    cars_guessed DESC,
    best_time ASC
);

CREATE INDEX IF NOT EXISTS idx_players_active ON players (updated_at DESC)
WHERE
    total_difficulty_points > 0;