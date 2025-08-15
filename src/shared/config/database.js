module.exports = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'theo',
    password: "",
    database: process.env.DB_NAME || 'voitures',
    port: process.env.DB_PORT || 3306,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};
