#!/usr/bin/env node
/* eslint-disable no-undef */
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const { Client } = require("pg");
require("dotenv").config();

async function createDatabase() {
  console.log('🗄️  Migration PostgreSQL démarrée...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  await client.connect();

  try {
    console.log('🔁 Nettoyage (drop view + tables si existent)...');

    await client.query(`DROP VIEW IF EXISTS leaderboard_view`);
    await client.query(`DROP TABLE IF EXISTS game_sessions`);
    await client.query(`DROP TABLE IF EXISTS user_cars_found`);
    await client.query(`DROP TABLE IF EXISTS user_scores`);
    await client.query(`DROP TABLE IF EXISTS models`);
    await client.query(`DROP TABLE IF EXISTS brands`);
    await client.query(`DROP TABLE IF EXISTS levels`);

    console.log('✅ Drops terminés');

    await client.query(`
      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    console.log('✅ Fonction set_updated_at créée');

    // Table des niveaux
    await client.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        "minPoints" DOUBLE PRECISION NOT NULL,
        "maxPoints" DOUBLE PRECISION NOT NULL,
        description TEXT NOT NULL,
        emoji VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        animation_class TEXT DEFAULT 'level-static'
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS levels_minpoints_index ON levels("minPoints")`);
    await client.query(`
      CREATE TRIGGER trg_levels_updated_at
      BEFORE UPDATE ON levels
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('✅ Table levels créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        country VARCHAR(50) NOT NULL DEFAULT 'Inconnu',
        logo_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_brands_country ON brands(country)`);
    await client.query(`
      CREATE TRIGGER trg_brands_updated_at
      BEFORE UPDATE ON brands
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('✅ Table brands créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS models (
        id SERIAL PRIMARY KEY,
        brand_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        year SMALLINT DEFAULT 2024,
        difficulty_level SMALLINT NOT NULL DEFAULT 1,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_models_brand_id ON models(brand_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_models_difficulty ON models(difficulty_level)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_models_year ON models(year)`);
    await client.query(`
      CREATE TRIGGER trg_models_updated_at
      BEFORE UPDATE ON models
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('✅ Table models créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_scores (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255),
        username VARCHAR(32) NOT NULL,
        total_points NUMERIC(10,2) DEFAULT 0,
        games_played INT DEFAULT 0,
        games_won INT DEFAULT 0,
        correct_brand_guesses INT DEFAULT 0,
        correct_model_guesses INT DEFAULT 0,
        total_brand_guesses INT DEFAULT 0,
        total_model_guesses INT DEFAULT 0,
        best_streak INT DEFAULT 0,
        current_streak INT DEFAULT 0,
        best_time INT DEFAULT NULL,
        average_response_time NUMERIC(8,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, guild_id)
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_scores_user_id ON user_scores(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_scores_guild_id ON user_scores(guild_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_scores_guild_user ON user_scores(guild_id, user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_scores_total_points ON user_scores(total_points DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_scores_games_won ON user_scores(games_won DESC)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_scores_updated_at ON user_scores(updated_at)`);
    await client.query(`
      CREATE TRIGGER trg_user_scores_updated_at
      BEFORE UPDATE ON user_scores
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('✅ Table user_scores créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_cars_found (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255),
        car_id INT NOT NULL,
        brand_id INT NOT NULL,
        found_at TIMESTAMP DEFAULT NOW(),
        attempts_used INT DEFAULT 0,
        time_taken INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (user_id, guild_id, car_id)
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_cars_found_user_id ON user_cars_found(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_cars_found_guild_id ON user_cars_found(guild_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_cars_found_guild_user ON user_cars_found(guild_id, user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_cars_found_car_id ON user_cars_found(car_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_cars_found_brand_id ON user_cars_found(brand_id)`);
    await client.query(`
      CREATE TRIGGER trg_user_cars_found_updated_at
      BEFORE UPDATE ON user_cars_found
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('✅ Table user_cars_found créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        guild_id VARCHAR(255),
        car_id INT NOT NULL,
        started_at TIMESTAMP DEFAULT NOW(),
        ended_at TIMESTAMP,
        duration_seconds INT,
        attempts_make INT DEFAULT 0,
        attempts_model INT DEFAULT 0,
        make_found BOOLEAN DEFAULT FALSE,
        model_found BOOLEAN DEFAULT FALSE,
        completed BOOLEAN DEFAULT FALSE,
        abandoned BOOLEAN DEFAULT FALSE,
        timeout BOOLEAN DEFAULT FALSE,
        car_changes_used INT DEFAULT 0,
        hints_used JSONB DEFAULT NULL,
        points_earned NUMERIC(6,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_sessions_guild_id ON game_sessions(guild_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_sessions_guild_user ON game_sessions(guild_id, user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_sessions_car_id ON game_sessions(car_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed)`);
    await client.query(`
      CREATE TRIGGER trg_game_sessions_updated_at
      BEFORE UPDATE ON game_sessions
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
    console.log('✅ Table game_sessions créée');

    await client.query(`
      CREATE OR REPLACE VIEW leaderboard_view AS
      SELECT
        us.*,
        RANK() OVER (
          ORDER BY
            us.total_points DESC,
            us.games_won DESC,
            us.best_time ASC
        ) as ranking,
        CASE
          WHEN us.total_points >= 100 THEN 'Expert'
          WHEN us.total_points >= 50 THEN 'Avancé'
          WHEN us.total_points >= 20 THEN 'Intermédiaire'
          WHEN us.total_points >= 10 THEN 'Apprenti'
          ELSE 'Débutant'
        END as skill_level,
        CASE
          WHEN us.games_played > 0 THEN ROUND((us.games_won::numeric / us.games_played::numeric) * 100, 1)
          ELSE 0
        END as success_rate,
        CASE
          WHEN us.games_played > 0 THEN ROUND(us.total_brand_guesses::numeric / us.games_played::numeric, 1)
          ELSE 0
        END as average_attempts,
        COALESCE(
          (
            SELECT AVG(duration_seconds)
            FROM game_sessions gs
            WHERE gs.user_id = us.user_id
              AND gs.completed = TRUE
              AND gs.duration_seconds IS NOT NULL
          ),
          0
        ) as average_time_seconds
      FROM user_scores us
      WHERE us.total_points > 0;
    `);
    console.log('✅ Vue leaderboard_view créée');

    // Insertion des niveaux
    await client.query(`
      INSERT INTO levels (title, "minPoints", "maxPoints", description, emoji, animation_class) VALUES
      ('🤡 Pire que Lance Stroll', 0, 99, 'Même le pilote le plus critiqué de F1 fait mieux que ça !', '🤡', 'level-static'),
      ('🚗 Conducteur du Dimanche', 100, 249, 'Vous conduisez votre Clio au supermarché, c''est déjà ça !', '🚗', 'level-static'),
      ('🔰 Apprenti Mécanicien', 250, 499, 'Vous savez faire la vidange... enfin, vous essayez.', '🔰', 'level-static'),
      ('🚙 Fan de SUV', 500, 899, 'Un Qashqai, c''est sportif non ? Non ?', '🚙', 'level-static'),
      ('🏁 Spectateur de F1', 900, 1499, 'Vous regardez les courses du canapé avec des chips.', '🏁', 'level-static'),
      ('🏎️ Pilote de Karting', 1500, 2499, 'Enfin du vrai pilotage ! Même si c''est sur un parking.', '🏎️', 'level-static'),
      ('🚘 Propriétaire de GTI', 2500, 3999, 'Golf GTI ou 208 GTI, vous avez du goût !', '🚘', 'level-static'),
      ('🏃 Coureur Amateur', 4000, 6499, 'Trackdays le weekend, embouteillages la semaine.', '🏃', 'level-static'),
      ('🔧 Mécanicien Confirmé', 6500, 9999, 'Vous savez distinguer un flat-6 d''un V6 !', '🔧', 'level-static'),
      ('🚀 Passionné de Supercars', 10000, 15999, 'Ferrari, Lamborghini... vous connaissez par cœur !', '🚀', 'level-static'),
      ('🏆 Julien Febreau', 16000, 24999, 'Vous avez la culture auto du journaliste de Sport Auto !', '🏆', 'level-pulse'),
      ('⭐ Soheil Ayari', 25000, 39999, 'Votre expertise rappelle celle du pilote instructeur !', '⭐', 'level-pulse'),
      ('🎯 Sébastien Loeb', 40000, 64999, 'Nonuple champion du monde, respect !', '🎯', 'level-pulse'),
      ('👑 Alain Prost', 65000, 99999, 'Le Professeur serait fier de vos connaissances !', '👑', 'level-glow'),
      ('🌟 Ayrton Senna', 100000, 159999, 'La légende brésilienne approuverait votre passion !', '🌟', 'level-glow'),
      ('🔥 Encyclopédie Vivante', 160000, 249999, 'Vous êtes une bible automobile sur pattes !', '🔥', 'level-glow'),
      ('⚡ Sage de l''Automobile', 250000, 399999, 'Votre savoir dépasse l''entendement humain !', '⚡', 'level-rainbow'),
      ('🌪️ Maître Absolu', 400000, 649999, 'Il n''y a plus grand chose que vous ignoriez !', '🌪️', 'level-rainbow'),
      ('🗲 Génie de l''Automobile', 650000, 999999, 'Vous frôlez la perfection, c''est impressionnant !', '🗲', 'level-rainbow'),
      ('🧠 Sylvain Lyve', 1000000, 9999999999, 'Vous avez atteint le niveau du maître absolu de YouTube automobile !', '🧠', 'level-legendary')
    `);
    console.log('✅ Niveaux insérés (20 niveaux)');

    console.log('\n🎉 Migration PostgreSQL terminée avec succès!');
    console.log('\n📊 Tables créées :');
    console.log('- levels');
    console.log('- brands');
    console.log('- models');
    console.log('- user_scores');
    console.log('- user_cars_found');
    console.log('- game_sessions');
    console.log('- leaderboard_view');

    console.log('\n🚀 Prochaine étape: npm run seed (si tu as des seeders)');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  createDatabase().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = createDatabase;
