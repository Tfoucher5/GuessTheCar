// eslint-disable-next-line no-undef
module.exports = {
    apps: [
        {
            name: 'guesscar-api',
            script: 'server.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 3000
            },
            log_file: './logs/api.log',
            out_file: './logs/api-out.log',
            error_file: './logs/api-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: '10s',
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'database'],
            merge_logs: true,
            time: true
        },
        {
            name: 'guesscar-bot',
            script: 'src/app.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production'
            },
            env_development: {
                NODE_ENV: 'development'
            },
            log_file: './logs/bot.log',
            out_file: './logs/bot-out.log',
            error_file: './logs/bot-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: '10s',
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'database'],
            merge_logs: true,
            time: true
        },
        {
            name: 'guesscar-admin',
            script: 'npx',
            args: 'http-server public -p 8080 -c-1',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production'
            },
            env_development: {
                NODE_ENV: 'development'
            },
            log_file: './logs/admin.log',
            out_file: './logs/admin-out.log',
            error_file: './logs/admin-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            restart_delay: 4000,
            max_restarts: 5,
            min_uptime: '10s',
            watch: false,
            merge_logs: true,
            time: true
        }
    ],

    deploy: {
        production: {
            user: 'deploy',
            host: 'your-server.com',
            ref: 'origin/main',
            repo: 'https://github.com/username/guess-the-car-bot.git',
            path: '/var/www/guess-the-car-bot',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && npm run migrate && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        },
        development: {
            user: 'dev',
            host: 'dev-server.com',
            ref: 'origin/develop',
            repo: 'https://github.com/username/guess-the-car-bot.git',
            path: '/var/www/guess-the-car-bot-dev',
            'post-deploy': 'npm install && npm run migrate && pm2 reload ecosystem.config.js --env development'
        }
    }
};