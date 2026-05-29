const express = require('express');
const githubController = require('../controllers/githubController');
const { validateUsername, validateQueryParams } = require('../middlewares/validator');
const { apiLimiter, analyzeLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Apply general API rate limiting to all routes
router.use(apiLimiter);

/**
 * @openapi
 * /api/github/analyze/{username}:
 *   post:
 *     summary: Analyze GitHub user profile
 *     description: Fetch real-time profile & repository metrics from the GitHub API, compute a custom developer score, and cache/save results in the MySQL database.
 *     tags: [GitHub Analyzer]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub login username (e.g. torvalds)
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *         description: If set to true, bypasses MySQL cache and requests fresh data from GitHub API.
 *     responses:
 *       200:
 *         description: Profile successfully retrieved from database cache.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       201:
 *         description: User analyzed successfully and stored/updated in DB.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid username format or bad request parameters.
 *       403:
 *         description: GitHub API rate limits exceeded.
 *       404:
 *         description: User does not exist on GitHub.
 *       429:
 *         description: Rate limits exceeded.
 */
router.post(
    '/analyze/:username',
    analyzeLimiter, // Strict limiter to avoid API abuse & quota exhaustion
    validateUsername,
    githubController.analyzeProfile
);

/**
 * @openapi
 * /api/github/profiles:
 *   get:
 *     summary: Retrieve list of all analyzed profiles
 *     description: Returns a paginated list of all analyzed developers stored in MySQL. Supports fuzzy search by username, name, or top languages.
 *     tags: [GitHub Analyzer]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum records per page.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Fuzzy search term matching username, name, or top languages.
 *     responses:
 *       200:
 *         description: List of profiles retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Profiles retrieved successfully" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeveloperProfile'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total_records: { type: integer, example: 5 }
 *                     total_pages: { type: integer, example: 1 }
 *                     current_page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 */
router.get(
    '/profiles',
    validateQueryParams,
    githubController.getProfiles
);

/**
 * @openapi
 * /api/github/top-developers:
 *   get:
 *     summary: Retrieve developer leaderboard
 *     description: Fetch top developer profiles sorted by their Developer Score in descending order.
 *     tags: [GitHub Analyzer]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top developers to fetch.
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Top developers retrieved successfully" }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeveloperProfile'
 */
router.get(
    '/top-developers',
    githubController.getTopDevelopersList
);

/**
 * @openapi
 * /api/github/profile/{username}:
 *   get:
 *     summary: Retrieve single analyzed profile
 *     description: Returns the cached GitHub analysis profile for the given username if it exists in MySQL. Does not call GitHub API.
 *     tags: [GitHub Analyzer]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub login username.
 *     responses:
 *       200:
 *         description: Profile successfully retrieved from database cache.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Profile not found in database. Analyze first.
 */
router.get(
    '/profile/:username',
    validateUsername,
    githubController.getProfile
);

/**
 * @openapi
 * /api/github/profile/{username}:
 *   delete:
 *     summary: Delete analyzed profile
 *     description: Deletes the analyzed GitHub record matching the username from the database cache.
 *     tags: [GitHub Analyzer]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub login username.
 *     responses:
 *       200:
 *         description: Profile deleted successfully.
 *       404:
 *         description: Profile not found in database.
 */
router.delete(
    '/profile/:username',
    validateUsername,
    githubController.deleteProfile
);

module.exports = router;
