const ApiResponse = require('../utils/response');

/**
 * Global Express Error Handling Middleware
 */
function errorHandler(err, req, res, next) {
    // Log full error stack in development, otherwise just details
    if (process.env.NODE_ENV === 'development') {
        console.error('💥 Error stack:', err.stack);
    } else {
        console.error(`💥 Error [${err.errorCode || 'INTERNAL_ERROR'}]: ${err.message}`);
    }

    const statusCode = err.statusCode || 500;
    const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
    const message = err.message || 'An unexpected error occurred on the server.';
    const details = err.details || null;

    res.status(statusCode).json(
        ApiResponse.error(message, errorCode, details)
    );
}

module.exports = errorHandler;
