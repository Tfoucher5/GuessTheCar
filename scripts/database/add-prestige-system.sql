-- Migration pour ajouter le système de prestige
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter les colonnes de prestige à user_scores
ALTER TABLE user_scores
ADD COLUMN IF NOT EXISTS prestige_level INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS prestige_points NUMERIC(12,2) DEFAULT 0;

-- 2. Créer la table prestige_levels
CREATE TABLE IF NOT EXISTS prestige_levels (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(50) NOT NULL,
  multiplier NUMERIC(4,2) NOT NULL,
  points_required BIGINT NOT NULL,
  total_points_cumulative BIGINT NOT NULL,
  color VARCHAR(20) NOT NULL,
  animation_class VARCHAR(50) DEFAULT 'prestige-normal',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Insérer les 11 niveaux de prestige (0-10)
INSERT INTO prestige_levels (id, name, emoji, multiplier, points_required, total_points_cumulative, color, animation_class) VALUES
(0,  'Normal',           '',    1.0,  1000000,  1000000,    '#FFFFFF', 'prestige-normal'),
(1,  'Bronze',           '🥉',  1.5,  1500000,  2500000,    '#CD7F32', 'prestige-bronze'),
(2,  'Bronze II',        '🥉',  2.0,  2000000,  4500000,    '#CD7F32', 'prestige-bronze-glow'),
(3,  'Argent',           '🥈',  2.5,  2500000,  7000000,    '#C0C0C0', 'prestige-silver'),
(4,  'Argent II',        '🥈',  3.0,  3000000,  10000000,   '#C0C0C0', 'prestige-silver-glow'),
(5,  'Or',               '🥇',  4.0,  4000000,  14000000,   '#FFD700', 'prestige-gold'),
(6,  'Or II',            '🥇',  5.0,  5000000,  19000000,   '#FFD700', 'prestige-gold-glow'),
(7,  'Diamant',          '💎',  6.5,  6500000,  25500000,   '#00CED1', 'prestige-diamond'),
(8,  'Diamant II',       '💎',  8.5,  8500000,  34000000,   '#00CED1', 'prestige-diamond-glow'),
(9,  'Maître',           '👑',  11.0, 11000000, 45000000,   '#9370DB', 'prestige-master'),
(10, 'LÉGENDE',          '👑',  15.0, 15000000, 60000000,   '#FF1493', 'prestige-legend')
ON CONFLICT (id) DO NOTHING;

-- 4. Créer des index pour la performance
CREATE INDEX IF NOT EXISTS idx_user_scores_prestige_level ON user_scores(prestige_level DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_prestige_points ON user_scores(prestige_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_scores_total_absolute ON user_scores(total_points DESC, prestige_level DESC);

-- 5. Ajouter un commentaire pour documentation
COMMENT ON COLUMN user_scores.prestige_level IS 'Niveau de prestige du joueur (0-10)';
COMMENT ON COLUMN user_scores.prestige_points IS 'Points gagnés dans le prestige actuel';
COMMENT ON TABLE prestige_levels IS 'Configuration des niveaux de prestige avec multiplicateurs';

-- 6. Créer une vue pour le classement absolu (incluant prestige)
CREATE OR REPLACE VIEW leaderboard_absolute AS
SELECT
  u.user_id,
  u.username,
  u.prestige_level,
  u.prestige_points,
  u.total_points,
  (COALESCE(p.total_points_cumulative, 0) - COALESCE(p.points_required, 0) + u.prestige_points) as absolute_points,
  u.games_played,
  u.games_won,
  u.best_streak,
  u.best_time,
  ROW_NUMBER() OVER (ORDER BY
    u.prestige_level DESC,
    u.prestige_points DESC
  ) as rank
FROM user_scores u
LEFT JOIN prestige_levels p ON p.id = u.prestige_level
WHERE u.guild_id IS NULL
ORDER BY rank;

-- 7. Créer une fonction pour obtenir les points absolus d'un joueur
CREATE OR REPLACE FUNCTION get_absolute_points(p_prestige_level INT, p_prestige_points NUMERIC)
RETURNS BIGINT AS $$
DECLARE
  cumulative_points BIGINT;
BEGIN
  -- Si prestige = 0, retourner prestige_points directement (qui sera = total_points)
  IF p_prestige_level = 0 THEN
    RETURN p_prestige_points;
  END IF;

  -- Sinon, calculer les points cumulatifs du prestige précédent + points actuels
  SELECT total_points_cumulative INTO cumulative_points
  FROM prestige_levels
  WHERE id = p_prestige_level - 1;

  RETURN COALESCE(cumulative_points, 0) + p_prestige_points;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_absolute_points IS 'Calcule les points absolus totaux incluant tous les prestiges';
