/**
 * Base custom error class for Application Errors
 */
class AppError extends Error {
    constructor(message, statusCode, errorCode = 'APP_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true; // Indicates this is a known, handled error
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details = null) {
        super(message, 400, 'BAD_REQUEST');
        this.details = details;
    }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN');
    }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found') {
        super(message, 404, 'NOT_FOUND');
    }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends AppError {
    constructor(message = 'Conflict occurred') {
        super(message, 409, 'CONFLICT');
    }
}

/**
 * 429 Too Many Requests Error
 */
class RateLimitError extends AppError {
    constructor(message = 'Too many requests, please try again later.') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    RateLimitError
};
