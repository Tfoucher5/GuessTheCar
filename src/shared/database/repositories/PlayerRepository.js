// src/shared/database/repositories/PlayerRepository.js
const BaseRepository = require('./BaseRepository');
const { supabase } = require('../connection');
const Player = require('../../../core/player/Player');

class PlayerRepository extends BaseRepository {
    constructor() {
        super('user_scores');
    }

    /**
     * Crée un nouveau joueur avec les valeurs par défaut
     */
    async create(userId, username, guildId = null) {
        console.log('PlayerRepository.create - Creating new player:', {
            userId, username, guildId
        });

        try {
            const { data, error } = await supabase
                .from('user_scores')
                .insert({
                    user_id: userId,
                    username: username,
                    guild_id: guildId,
                    total_points: 0,
                    prestige_points: 0,
                    prestige_level: 0,
                    games_played: 0,
                    games_won: 0,
                    correct_brand_guesses: 0,
                    correct_model_guesses: 0,
                    total_brand_guesses: 0,
                    total_model_guesses: 0,
                    best_streak: 0,
                    current_streak: 0,
                    best_time: null,
                    average_response_time: null
                })
                .select()
                .single();

            if (error) {
                console.error('create error:', error);
                throw error;
            }

            return Player.fromDatabase(data);
        } catch (error) {
            console.error('create catch error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                userId,
                username,
                guildId
            });
            throw error;
        }
    }

    /**
     * Trouve un joueur par userId ET guildId
     */
    async findByUserIdAndGuild(userId, guildId = null) {
        try {
            let query = supabase
                .from('user_scores')
                .select('*')
                .eq('user_id', userId);

            if (guildId) {
                query = query.eq('guild_id', guildId);
            } else {
                query = query.is('guild_id', null);
            }

            const { data, error } = await query.maybeSingle();

            if (error) {
                console.error('findByUserIdAndGuild error:', error);
                throw error;
            }

            return data ? Player.fromDatabase(data) : null;
        } catch (error) {
            console.error('findByUserIdAndGuild catch error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                userId,
                guildId
            });
            throw error;
        }
    }

    /**
     * Trouve un joueur par userId (sans contrainte de serveur) - FALLBACK
     */
    async findByUserId(userId) {
        const { data, error } = await supabase
            .from('user_scores')
            .select('*')
            .eq('user_id', userId)
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data ? Player.fromDatabase(data) : null;
    }

    /**
     * Trouve ou crée un joueur pour un serveur spécifique
     */
    async findOrCreate(userId, username, guildId = null) {
        console.log('PlayerRepository.findOrCreate - Searching for player:', {
            userId, username, guildId
        });

        const player = await this.findByUserIdAndGuild(userId, guildId);

        if (player) {
            console.log('PlayerRepository.findOrCreate - Player found:', player);
            // Mettre à jour le username si nécessaire
            if (player.username !== username) {
                console.log('PlayerRepository.findOrCreate - Updating username');
                await this.updatePlayerStats(userId, { username }, guildId);
                player.username = username;
            }
            return player;
        }

        console.log('PlayerRepository.findOrCreate - Player not found, creating new one');
        return await this.create(userId, username, guildId);
    }

    /**
     * Met à jour le nom d'utilisateur
     */
    async updateUsername(userId, username) {
        const { error } = await supabase
            .from('user_scores')
            .update({ username })
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Met à jour les stats d'un joueur pour un serveur spécifique
     */
    async updatePlayerStats(userId, data, guildId = null) {
        const cleanData = this.cleanData(data, [
            'username', 'total_points', 'prestige_points', 'prestige_level',
            'games_played', 'games_won', 'correct_brand_guesses', 'correct_model_guesses',
            'total_brand_guesses', 'total_model_guesses', 'best_streak',
            'current_streak', 'best_time', 'average_response_time'
        ]);

        if (Object.keys(cleanData).length === 0) {
            throw new Error('No valid data provided for update');
        }

        let query = supabase
            .from('user_scores')
            .update(cleanData)
            .eq('user_id', userId);

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { error } = await query;
        if (error) throw error;

        return await this.findByUserIdAndGuild(userId, guildId);
    }

    /**
     * Nettoie les données (éviter les undefined)
     */
    cleanData(data, allowedFields) {
        const cleaned = {};
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                cleaned[field] = data[field];
            }
        });
        return cleaned;
    }

    /**
     * Sauvegarde une session de jeu
     */
    async saveGameSession(gameSession) {
        const { error } = await supabase
            .from('game_sessions')
            .insert({
                user_id: gameSession.userId,
                guild_id: gameSession.guildId,
                car_id: gameSession.carId,
                started_at: gameSession.startedAt,
                ended_at: gameSession.endedAt,
                duration_seconds: gameSession.durationSeconds,
                attempts_make: gameSession.attemptsMake || 0,
                attempts_model: gameSession.attemptsModel || 0,
                make_found: gameSession.makeFound || false,
                model_found: gameSession.modelFound || false,
                completed: gameSession.completed || false,
                abandoned: gameSession.abandoned || false,
                timeout: gameSession.timeout || false,
                car_changes_used: gameSession.carChangesUsed || 0,
                hints_used: JSON.stringify(gameSession.hintsUsed || {}),
                points_earned: gameSession.pointsEarned || 0,
            });

        if (error) throw error;
    }

    /**
     * Met à jour le score après une partie
     */
    async updatePlayerAfterGame(userId, gameResult, guildId = null) {
        const player = await this.findByUserIdAndGuild(userId, guildId);
        if (!player) return null;

        const newStats = {
            total_points: player.totalPoints + (gameResult.basePoints || 0),
            games_played: player.gamesPlayed + 1,
            games_won: player.gamesWon + (gameResult.completed ? 1 : 0),
            correct_brand_guesses: player.correctBrandGuesses + (gameResult.makeFound ? 1 : 0),
            correct_model_guesses: player.correctModelGuesses + (gameResult.modelFound ? 1 : 0),
            total_brand_guesses: player.totalBrandGuesses + (gameResult.attemptsMake || 0),
            total_model_guesses: player.totalModelGuesses + (gameResult.attemptsModel || 0)
        };

        if (gameResult.completed) {
            newStats.current_streak = player.currentStreak + 1;
            if (newStats.current_streak > player.bestStreak) {
                newStats.best_streak = newStats.current_streak;
            }
        } else {
            newStats.current_streak = 0;
        }

        return await this.updatePlayerStats(userId, newStats, guildId);
    }

    /**
     * Classement par serveur
     */
    async getLeaderboard(limit = 10, guildId = null) {
        let query = supabase
            .from('user_scores')
            .select('*')
            .gt('games_played', 0)
            .order('total_points', { ascending: false })
            .order('games_won', { ascending: false })
            .limit(limit);

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((row, index) => ({
            ...Player.fromDatabase(row),
            ranking: index + 1
        }));
    }

    /**
     * Stats avec ranking par serveur
     */
    async getPlayerWithRanking(userId, guildId = null) {
        try {
            const player = await this.findByUserIdAndGuild(userId, guildId);
            if (!player) return null;

            // Récupérer tous les joueurs pour calculer le ranking
            let query = supabase
                .from('user_scores')
                .select('user_id, total_points, games_won')
                .gt('games_played', 0)
                .order('total_points', { ascending: false })
                .order('games_won', { ascending: false });

            if (guildId) {
                query = query.eq('guild_id', guildId);
            } else {
                query = query.is('guild_id', null);
            }

            const { data, error } = await query;

            if (error) {
                console.error('getPlayerWithRanking error:', error);
                throw error;
            }

            const ranking = data.findIndex(p => p.user_id === userId) + 1;

            return {
                ...player,
                ranking
            };
        } catch (error) {
            console.error('getPlayerWithRanking catch error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                userId,
                guildId
            });
            throw error;
        }
    }

    /**
     * Enregistre qu'un joueur a trouvé une voiture
     */
    async recordCarFound(data) {
        const { error } = await supabase
            .from('user_cars_found')
            .upsert({
                user_id: data.userId,
                guild_id: data.guildId || null,
                car_id: data.carId,
                brand_id: data.brandId,
                attempts_used: data.attemptsUsed,
                time_taken: data.timeTaken
            }, {
                onConflict: 'user_id,guild_id,car_id',
                ignoreDuplicates: true
            });

        if (error) throw error;
    }

    /**
     * Obtient les statistiques de collection d'un joueur
     */
    async getPlayerCollection(userId, guildId = null) {
        // Compter les voitures trouvées
        // Si guildId = null, on récupère TOUTES les voitures de l'utilisateur (inter-serveur)
        // Si guildId est défini, on filtre par serveur
        let carsQuery = supabase
            .from('user_cars_found')
            .select('car_id, brand_id')
            .eq('user_id', userId);

        if (guildId) {
            carsQuery = carsQuery.eq('guild_id', guildId);
        }
        // Sinon, pas de filtre guild_id = on prend tout (inter-serveur)

        const { data: carsData } = await carsQuery;

        // Compter les voitures uniques (distinctes) et marques uniques
        const uniqueCars = [...new Set(carsData?.map(c => c.car_id) || [])];
        const uniqueBrands = [...new Set(carsData?.map(c => c.brand_id) || [])];

        // Compter le total de voitures et marques
        const { count: totalCars } = await supabase.from('models').select('*', { count: 'exact', head: true });
        const { count: totalBrands } = await supabase.from('brands').select('*', { count: 'exact', head: true });

        return {
            carsFound: uniqueCars.length,
            brandsFound: uniqueBrands.length,
            totalCars: totalCars || 0,
            totalBrands: totalBrands || 0
        };
    }

    /**
     * Obtient le classement des collectionneurs (inter-serveur si guildId = null)
     */
    async getCollectionLeaderboard(limit, guildId = null) {
        // Cette requête nécessite une fonction RPC côté Supabase ou un traitement côté client
        // Pour simplifier, on fait un traitement côté client
        let query = supabase
            .from('user_cars_found')
            .select('user_id, car_id, brand_id');

        if (guildId) {
            query = query.eq('guild_id', guildId);
        }
        // Sinon, pas de filtre guild_id = classement inter-serveur

        const { data: carsFound } = await query;

        // Grouper par utilisateur
        const userStats = {};
        carsFound?.forEach(record => {
            if (!userStats[record.user_id]) {
                userStats[record.user_id] = {
                    cars: new Set(),
                    brands: new Set()
                };
            }
            userStats[record.user_id].cars.add(record.car_id);
            userStats[record.user_id].brands.add(record.brand_id);
        });

        // Récupérer les usernames
        const userIds = Object.keys(userStats);
        const { data: users } = await supabase
            .from('user_scores')
            .select('user_id, username')
            .in('user_id', userIds);

        // Formatter les résultats
        const results = userIds.map(userId => {
            const user = users?.find(u => u.user_id === userId);
            return {
                user_id: userId,
                username: user?.username || 'Unknown',
                carsFound: userStats[userId].cars.size,
                brandsFound: userStats[userId].brands.size
            };
        });

        // Trier et limiter
        return results
            .sort((a, b) => b.carsFound - a.carsFound || b.brandsFound - a.brandsFound)
            .slice(0, limit);
    }

    /**
     * Classement mensuel - joueurs avec le plus de points ce mois-ci
     */
    async getMonthlyLeaderboard(limit = 10, guildId = null) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Récupérer les sessions du mois
        let query = supabase
            .from('game_sessions')
            .select('user_id, points_earned, completed')
            .gte('started_at', startOfMonth.toISOString());

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data: sessions } = await query;

        // Grouper par utilisateur
        const userStats = {};
        sessions?.forEach(session => {
            if (!userStats[session.user_id]) {
                userStats[session.user_id] = {
                    monthlyPoints: 0,
                    monthlyWins: 0,
                    monthlyGames: 0
                };
            }
            userStats[session.user_id].monthlyPoints += (session.points_earned || 0);
            userStats[session.user_id].monthlyWins += session.completed ? 1 : 0;
            userStats[session.user_id].monthlyGames += 1;
        });

        // Récupérer les infos complètes des joueurs
        const userIds = Object.keys(userStats);
        if (userIds.length === 0) return [];

        let usersQuery = supabase
            .from('user_scores')
            .select('*')
            .in('user_id', userIds);

        if (guildId) {
            usersQuery = usersQuery.eq('guild_id', guildId);
        } else {
            usersQuery = usersQuery.is('guild_id', null);
        }

        const { data: users } = await usersQuery;

        // Combiner les données
        const results = users?.map(user => ({
            ...Player.fromDatabase(user),
            monthlyPoints: userStats[user.user_id].monthlyPoints,
            monthlyWins: userStats[user.user_id].monthlyWins,
            monthlyGames: userStats[user.user_id].monthlyGames
        })) || [];

        // Trier et ajouter le ranking
        return results
            .sort((a, b) => b.monthlyPoints - a.monthlyPoints || b.monthlyWins - a.monthlyWins)
            .slice(0, limit)
            .map((player, index) => ({
                ...player,
                ranking: index + 1
            }));
    }

    /**
     * Classement par vitesse
     */
    async getSpeedLeaderboard(limit = 10, guildId = null) {
        let query = supabase
            .from('game_sessions')
            .select('user_id, duration_seconds')
            .eq('completed', true)
            .not('duration_seconds', 'is', null)
            .gt('duration_seconds', 0);

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data: sessions } = await query;

        // Calculer les moyennes par utilisateur
        const userStats = {};
        sessions?.forEach(session => {
            if (!userStats[session.user_id]) {
                userStats[session.user_id] = {
                    totalTime: 0,
                    count: 0
                };
            }
            userStats[session.user_id].totalTime += session.duration_seconds;
            userStats[session.user_id].count += 1;
        });

        // Filtrer les joueurs avec au moins 3 parties
        const qualifiedUsers = Object.entries(userStats)
            .filter(([_, stats]) => stats.count >= 3)
            .map(([userId, stats]) => ({
                userId,
                averageTime: stats.totalTime / stats.count,
                completedGames: stats.count
            }));

        if (qualifiedUsers.length === 0) return [];

        // Récupérer les infos des joueurs
        const userIds = qualifiedUsers.map(u => u.userId);
        let usersQuery = supabase
            .from('user_scores')
            .select('*')
            .in('user_id', userIds);

        if (guildId) {
            usersQuery = usersQuery.eq('guild_id', guildId);
        } else {
            usersQuery = usersQuery.is('guild_id', null);
        }

        const { data: users } = await usersQuery;

        // Combiner et trier
        const results = users?.map(user => {
            const stats = qualifiedUsers.find(u => u.userId === user.user_id);
            return {
                ...Player.fromDatabase(user),
                averageTime: stats.averageTime,
                completedGames: stats.completedGames
            };
        }) || [];

        return results
            .sort((a, b) => a.averageTime - b.averageTime)
            .slice(0, limit)
            .map((player, index) => ({
                ...player,
                ranking: index + 1
            }));
    }

    /**
     * Classement par précision
     */
    async getPrecisionLeaderboard(limit = 10, guildId = null) {
        let query = supabase
            .from('user_scores')
            .select('*')
            .gte('games_played', 5);

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        const results = data.map(user => ({
            ...Player.fromDatabase(user),
            successRate: (user.games_won / user.games_played) * 100
        }));

        return results
            .sort((a, b) => b.successRate - a.successRate || b.gamesPlayed - a.gamesPlayed)
            .slice(0, limit)
            .map((player, index) => ({
                ...player,
                ranking: index + 1
            }));
    }

    /**
     * Classement par séries
     */
    async getStreaksLeaderboard(limit = 10, guildId = null) {
        let query = supabase
            .from('user_scores')
            .select('*')
            .gt('best_streak', 0)
            .order('best_streak', { ascending: false })
            .order('current_streak', { ascending: false })
            .order('games_won', { ascending: false })
            .limit(limit);

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((row, index) => ({
            ...Player.fromDatabase(row),
            ranking: index + 1
        }));
    }

    /**
     * Récupère tous les joueurs pour le système de ranking
     */
    async getAllPlayersForRanking(guildId = null) {
        let query = supabase
            .from('user_scores')
            .select('*')
            .gt('total_points', 0)
            .order('total_points', { ascending: false })
            .order('games_won', { ascending: false });

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map(row => Player.fromDatabase(row));
    }

    /**
     * Met à jour le ranking d'un joueur (utilisé par RealTimeRankingManager)
     */
    async updatePlayerRanking(userId, ranking, guildId = null) {
        // Note: Cette méthode peut être utilisée pour des optimisations futures
        // Pour l'instant, le ranking est calculé à la volée
        // On pourrait ajouter une colonne 'ranking' dans user_scores si nécessaire
        logger.debug(`Ranking updated for user ${userId}: ${ranking}`);
    }

    /**
     * Classement par activité
     */
    async getActivityLeaderboard(limit = 10, guildId = null) {
        let query = supabase
            .from('user_scores')
            .select('*')
            .gt('games_played', 0)
            .order('games_played', { ascending: false })
            .order('games_won', { ascending: false })
            .limit(limit);

        if (guildId) {
            query = query.eq('guild_id', guildId);
        } else {
            query = query.is('guild_id', null);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((row, index) => ({
            ...Player.fromDatabase(row),
            ranking: index + 1
        }));
    }
}

module.exports = PlayerRepository;
