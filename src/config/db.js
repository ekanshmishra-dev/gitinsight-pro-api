const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
};

let pool = null;

/**
 * Initializes the database, creating the DB and tables if they don't exist
 */
async function initializeDatabase() {
    try {
        console.log('🔄 Checking database connection and status...');
        // 1. Connect without database name first to create it if missing
        const tempConnection = await mysql.createConnection(dbConfig);
        
        const dbName = process.env.DB_NAME || 'github_analyzer';
        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await tempConnection.end();
        console.log(`✅ Database "${dbName}" ensured/verified.`);

        // 2. Initialize the connection pool with the correct database
        pool = mysql.createPool({
            ...dbConfig,
            database: dbName,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // 3. Create the necessary table
        const tableSchema = `
            CREATE TABLE IF NOT EXISTS github_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(150),
                bio TEXT,
                followers INT DEFAULT 0,
                following INT DEFAULT 0,
                public_repos INT DEFAULT 0,
                total_stars INT DEFAULT 0,
                top_languages VARCHAR(255),
                developer_score INT DEFAULT 0,
                avatar_url VARCHAR(255),
                profile_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        
        await pool.query(tableSchema);
        console.log('✅ Table "github_profiles" ensured/verified.');
        console.log('🚀 MySQL connection pool created successfully.');
        return pool;
    } catch (error) {
        console.error('❌ Database Initialization Failed:', error.message);
        console.error('👉 Make sure your MySQL service is running and credentials in .env are correct.');
        // We do not crash the app immediately to allow health checks to fail gracefully or show errors.
        throw error;
    }
}

// Function to get database pool
function getPool() {
    if (!pool) {
        throw new Error('Database pool has not been initialized. Call initializeDatabase first.');
    }
    return pool;
}

module.exports = {
    initializeDatabase,
    getPool,
    // Helper to query easily
    query: async (sql, params) => {
        const activePool = getPool();
        const [results] = await activePool.execute(sql, params);
        return results;
    }
};
