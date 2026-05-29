const rateLimit = require('express-rate-limit');
const ApiResponse = require('../utils/response');

/**
 * Standard API rate limiter to protect resources and prevent abuse
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res, next) => {
        res.status(429).json(
            ApiResponse.error(
                'Too many requests from this IP. Please try again after 15 minutes.',
                'RATE_LIMIT_EXCEEDED'
            )
        );
    }
});

/**
 * Strict rate limiter for write/analyze endpoints to prevent exhausting Github API quotas
 */
const analyzeLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 analysis calls per minute
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        res.status(429).json(
            ApiResponse.error(
                'Too many analysis requests. Please wait a minute before analyzing again.',
                'ANALYZE_RATE_LIMIT_EXCEEDED'
            )
        );
    }
});

module.exports = {
    apiLimiter,
    analyzeLimiter
};
