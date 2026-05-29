const { BadRequestError } = require('../utils/errors');

/**
 * Validation regex for GitHub usernames:
 * - Alphanumeric or single hyphens
 * - Cannot start or end with a hyphen
 * - Max length 39 characters
 */
const GITHUB_USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/**
 * Validates the username param in request
 */
function validateUsername(req, res, next) {
    const { username } = req.params;

    if (!username) {
        return next(new BadRequestError('GitHub username parameter is required.'));
    }

    if (!GITHUB_USERNAME_REGEX.test(username)) {
        return next(new BadRequestError(
            `Invalid GitHub username format: "${username}". GitHub usernames can only contain alphanumeric characters or hyphens, and cannot start/end with a hyphen.`
        ));
    }

    next();
}

/**
 * Validates query parameters for pagination, sorting and searching
 */
function validateQueryParams(req, res, next) {
    const { page, limit } = req.query;

    const errors = {};

    if (page !== undefined) {
        const pageNum = Number(page);
        if (isNaN(pageNum) || !Number.isInteger(pageNum) || pageNum <= 0) {
            errors.page = 'Page must be a positive integer.';
        }
    }

    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (isNaN(limitNum) || !Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
            errors.limit = 'Limit must be a positive integer between 1 and 100.';
        }
    }

    if (Object.keys(errors).length > 0) {
        return next(new BadRequestError('Query parameter validation failed', errors));
    }

    next();
}

module.exports = {
    validateUsername,
    validateQueryParams
};
