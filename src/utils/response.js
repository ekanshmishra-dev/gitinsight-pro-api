/**
 * Unified API Response Utility
 */
class ApiResponse {
    /**
     * Send a successful response
     * @param {string} message 
     * @param {any} data 
     * @param {object} meta Optional pagination/metadata
     */
    static success(message, data = null, meta = null) {
        const response = {
            success: true,
            message,
        };

        if (data !== null) {
            response.data = data;
        }

        if (meta !== null) {
            response.meta = meta;
        }

        return response;
    }

    /**
     * Send an error response
     * @param {string} message 
     * @param {string} errorCode Optional internal error code
     * @param {any} details Optional details (validation errors)
     */
    static error(message, errorCode = 'INTERNAL_ERROR', details = null) {
        const response = {
            success: false,
            error: {
                message,
                code: errorCode
            }
        };

        if (details !== null) {
            response.error.details = details;
        }

        return response;
    }
}

module.exports = ApiResponse;
