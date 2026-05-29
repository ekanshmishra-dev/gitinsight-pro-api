const githubService = require('../services/githubService');
const dbService = require('../services/dbService');
const ApiResponse = require('../utils/response');
const { NotFoundError } = require('../utils/errors');

/**
 * Controller for GitInsight Pro API - GitHub Analysis
 */

/**
 * Analyze a GitHub profile, calculate score, cache/save result in DB
 */
async function analyzeProfile(req, res, next) {
    try {
        const { username } = req.params;
        const forceUpdate = req.query.force === 'true';

        console.log(`🤖 Request to analyze user: ${username} (Force Update: ${forceUpdate})`);

        // Check DB Cache first if not forcing update
        if (!forceUpdate) {
            const cachedProfile = await dbService.findProfileByUsername(username);
            if (cachedProfile) {
                console.log(`🚀 [Cache Hit] Returning stored profile for: ${username}`);
                return res.status(200).json(
                    ApiResponse.success(
                        'Profile retrieved successfully (cached)',
                        { ...cachedProfile, cached: true }
                    )
                );
            }
            console.log(`📡 [Cache Miss] Commencing fresh analysis for: ${username}`);
        }

        // Cache miss or force update = do fresh analysis
        const analyzedData = await githubService.analyzeGithubUser(username);
        
        // Save/Update in DB
        const savedProfile = await dbService.saveOrUpdateProfile(analyzedData);

        res.status(201).json(
            ApiResponse.success(
                forceUpdate ? 'Profile re-analyzed and updated successfully' : 'Profile analyzed and saved successfully',
                { ...savedProfile, cached: false }
            )
        );
    } catch (error) {
        next(error);
    }
}

/**
 * Get all analyzed developer profiles (supports search, pagination)
 */
async function getProfiles(req, res, next) {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        console.log(`📋 Listing profiles - Page: ${page}, Limit: ${limit}, Search: "${search}"`);

        const result = await dbService.getAllProfiles({
            page: parseInt(page),
            limit: parseInt(limit),
            search
        });

        res.status(200).json(
            ApiResponse.success(
                'Profiles retrieved successfully',
                result.profiles,
                result.pagination
            )
        );
    } catch (error) {
        next(error);
    }
}

/**
 * Get a single analyzed profile from DB cache
 */
async function getProfile(req, res, next) {
    try {
        const { username } = req.params;

        console.log(`🔍 Fetching profile for: ${username}`);

        const profile = await dbService.findProfileByUsername(username);
        if (!profile) {
            throw new NotFoundError(`Profile for GitHub user "${username}" has not been analyzed yet. Use POST /api/github/analyze/${username} first.`);
        }

        res.status(200).json(
            ApiResponse.success('Profile retrieved successfully', profile)
        );
    } catch (error) {
        next(error);
    }
}

/**
 * Delete a profile analysis record from DB
 */
async function deleteProfile(req, res, next) {
    try {
        const { username } = req.params;

        console.log(`🗑️ Deleting profile record for: ${username}`);

        const deleted = await dbService.deleteProfileByUsername(username);
        if (!deleted) {
            throw new NotFoundError(`Profile for GitHub user "${username}" not found in database.`);
        }

        res.status(200).json(
            ApiResponse.success(`Profile record for "${username}" was deleted successfully.`)
        );
    } catch (error) {
        next(error);
    }
}

/**
 * Get leaderboard of analyzed developers sorted by developer score descending
 */
async function getTopDevelopersList(req, res, next) {
    try {
        const limit = parseInt(req.query.limit) || 10;

        console.log(`🏆 Fetching top ${limit} developers`);

        const topDevelopers = await dbService.getTopDevelopers(limit);

        res.status(200).json(
            ApiResponse.success('Top developers retrieved successfully', topDevelopers)
        );
    } catch (error) {
        next(error);
    }
}

module.exports = {
    analyzeProfile,
    getProfiles,
    getProfile,
    deleteProfile,
    getTopDevelopersList
};
