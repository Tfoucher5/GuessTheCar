// src/shared/utils/SimpleTracker.js
class SimpleTracker {
    constructor() {
        this.stats = {
            commands: {
                total: 0,
                today: 0,
                byName: new Map(),
                todayStart: new Date().toDateString()
            },
            games: {
                active: new Set(),
                total: 0,
                completed: 0,
                abandoned: 0,
                today: {
                    started: 0,
                    completed: 0,
                    abandoned: 0,
                    date: new Date().toDateString()
                }
            },
            users: {
                today: new Set(),
                date: new Date().toDateString()
            }
        };

        setInterval(() => this.checkDailyReset(), 60000);
        console.log('📊 SimpleTracker initialized');
    }

    checkDailyReset() {
        const today = new Date().toDateString();

        if (this.stats.commands.todayStart !== today) {
            console.log('🔄 Daily stats reset');

            this.stats.commands.today = 0;
            this.stats.commands.todayStart = today;

            this.stats.games.today = {
                started: 0,
                completed: 0,
                abandoned: 0,
                date: today
            };

            this.stats.users.today.clear();
            this.stats.users.date = today;
        }
    }

    logCommand(commandName, userId) {
        this.checkDailyReset();

        this.stats.commands.total++;
        this.stats.commands.today++;

        if (!this.stats.commands.byName.has(commandName)) {
            this.stats.commands.byName.set(commandName, {
                count: 0,
                firstUsed: new Date().toISOString(),
                lastUsed: new Date().toISOString()
            });
        }

        const commandStats = this.stats.commands.byName.get(commandName);
        commandStats.count++;
        commandStats.lastUsed = new Date().toISOString();

        if (userId) {
            this.stats.users.today.add(userId);
        }

        console.log(`📝 Command /${commandName} logged - Total: ${this.stats.commands.total}`);
    }

    startGame(channelId, userId) {
        this.checkDailyReset();

        if (!this.stats.games.active.has(channelId)) {
            this.stats.games.active.add(channelId);
            this.stats.games.total++;
            this.stats.games.today.started++;

            if (userId) {
                this.stats.users.today.add(userId);
            }

            console.log(`🎮 Game started (${channelId}) - Active: ${this.stats.games.active.size}`);
        }
    }

    completeGame(channelId) {
        console.log('🔍 Trying to complete game:', channelId, 'Active before:', Array.from(this.stats.games.active));

        if (this.stats.games.active.has(channelId)) {
            this.stats.games.active.delete(channelId); // ✅ Doit supprimer
            this.stats.games.completed++;
            this.stats.games.today.completed++;

            console.log('✅ Game completed - Active after:', Array.from(this.stats.games.active));
        } else {
            console.warn('⚠️ Channel not found in active games:', channelId);
        }
    }

    abandonGame(channelId) {
        console.log('🔍 Trying to abandon game:', channelId, 'Active before:', Array.from(this.stats.games.active));

        if (this.stats.games.active.has(channelId)) {
            this.stats.games.active.delete(channelId); // ✅ Doit supprimer
            this.stats.games.abandoned++;
            this.stats.games.today.abandoned++;

            console.log('❌ Game abandoned - Active after:', Array.from(this.stats.games.active));
        } else {
            console.warn('⚠️ Channel not found in active games:', channelId);
        }
    }

    getStats() {
        this.checkDailyReset();

        const topCommands = Array.from(this.stats.commands.byName.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            commands: {
                total: this.stats.commands.total,
                today: this.stats.commands.today,
                popular: topCommands
            },
            games: {
                active: this.stats.games.active.size,
                total: this.stats.games.total,
                completed: this.stats.games.completed,
                abandoned: this.stats.games.abandoned,
                today: this.stats.games.today.started,
                todayCompleted: this.stats.games.today.completed,
                todayAbandoned: this.stats.games.today.abandoned
            },
            users: {
                uniqueToday: this.stats.users.today.size
            },
            lastUpdate: new Date().toISOString()
        };
    }

    reset() {
        this.stats.commands.total = 0;
        this.stats.commands.today = 0;
        this.stats.commands.byName.clear();

        this.stats.games.active.clear();
        this.stats.games.total = 0;
        this.stats.games.completed = 0;
        this.stats.games.abandoned = 0;
        this.stats.games.today = {
            started: 0,
            completed: 0,
            abandoned: 0,
            date: new Date().toDateString()
        };

        this.stats.users.today.clear();

        console.log('🔄 All stats reset');
    }
}

const tracker = new SimpleTracker();
module.exports = tracker;
