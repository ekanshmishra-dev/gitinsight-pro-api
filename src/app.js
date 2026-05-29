const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

const githubRoutes = require('./routes/githubRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { NotFoundError } = require('./utils/errors');
const ApiResponse = require('./utils/response');
const db = require('./config/db');
const setupSwagger = require('./docs/swagger');

dotenv.config();

const app = express();

// 1. Global Security & Utility Middlewares
app.use(helmet()); // Secure HTTP headers
app.use(cors());   // Enable Cross-Origin requests
app.use(express.json()); // Body parser for JSON
app.use(express.urlencoded({ extended: true })); // Query/Body encoder

// Elegant logging using Morgan
const isDevelopment = process.env.NODE_ENV === 'development';
app.use(morgan(isDevelopment ? 'dev' : 'combined'));

// Initialize Swagger Documentation UI
setupSwagger(app);

// 2. Health Check Endpoint (Indicates system integrity)
app.get('/health', async (req, res) => {
    try {
        // Query database to ensure connection is healthy
        await db.query('SELECT 1');
        res.status(200).json(
            ApiResponse.success('GitInsight Pro API is healthy and operational 🚀', {
                status: 'UP',
                database: 'CONNECTED',
                timestamp: new Date().toISOString()
            })
        );
    } catch (dbError) {
        res.status(500).json(
            ApiResponse.error('API is degraded. Database connection failed.', 'DEGRADED_STATE', {
                status: 'DEGRADED',
                database: 'DISCONNECTED',
                error: dbError.message,
                timestamp: new Date().toISOString()
            })
        );
    }
});

// 3. API Routers
app.use('/api/github', githubRoutes);

// 4. Catch-all Route for Unmatched Endpoints (404)
app.use('*', (req, res, next) => {
    next(new NotFoundError(`Requested endpoint "${req.originalUrl}" does not exist.`));
});

// 5. Global Exception Handler Middleware
app.use(errorHandler);

module.exports = app;
