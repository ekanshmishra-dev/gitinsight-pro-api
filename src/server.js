const app = require('./app');
const { initializeDatabase } = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Handle Uncaught Exceptions (Synchronous errors)
process.on('uncaughtException', (err) => {
    console.error('💥 UNCAUGHT EXCEPTION! Shutting down server...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

async function startServer() {
    try {
        // Initialize Database and Tables
        await initializeDatabase();

        // Start listening
        const server = app.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`🚀 GitInsight Pro API server successfully booted.`);
            console.log(`📡 Port: ${PORT}`);
            console.log(`🌐 Mode: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📝 Swagger Docs available at http://localhost:${PORT}/api-docs`);
            console.log(`=========================================`);
        });

        // Handle Unhandled Rejections (Asynchronous errors)
        process.on('unhandledRejection', (err) => {
            console.error('💥 UNHANDLED REJECTION! Shutting down server gracefully...');
            console.error(err.name, err.message, err.stack);
            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        console.error('💥 Server boot failed due to startup error:', error.message);
        process.exit(1);
    }
}

startServer();
