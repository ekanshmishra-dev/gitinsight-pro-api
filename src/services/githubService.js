const axios = require('axios');
const { NotFoundError, AppError } = require('../utils/errors');
const dotenv = require('dotenv');

dotenv.config();

// Base Github Client Config
const githubClient = axios.create({
    baseURL: 'https://api.github.com',
    headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && { Authorization: `token ${process.env.GITHUB_TOKEN}` })
    },
    timeout: 8000 // 8 second timeout
});

/**
 * Handle Axios Errors and transform them to custom AppErrors
 * @param {Error} error 
 * @param {string} username 
 */
function handleGithubError(error, username) {
    if (error.response) {
        if (error.response.status === 404) {
            throw new NotFoundError(`GitHub user "${username}" does not exist.`);
        }
        if (error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
            throw new AppError(
                'GitHub API rate limit exceeded. Please add a valid GITHUB_TOKEN to your .env file to support higher limits.',
                403,
                'GITHUB_RATE_LIMIT'
            );
        }
        throw new AppError(
            `GitHub API error: ${error.response.data?.message || error.message}`,
            error.response.status,
            'GITHUB_API_ERROR'
        );
    }
    throw new AppError(`GitHub service connection timeout or network issue: ${error.message}`, 503, 'SERVICE_UNAVAILABLE');
}

/**
 * Fetch GitHub user profile details
 * @param {string} username 
 */
async function getProfileData(username) {
    try {
        const response = await githubClient.get(`/users/${username}`);
        return response.data;
    } catch (error) {
        handleGithubError(error, username);
    }
}

/**
 * Fetch GitHub repos for a user (up to 100 repositories)
 * @param {string} username 
 */
async function getUserRepositories(username) {
    try {
        // Fetch up to 100 public repos (default page size is 30, max is 100)
        const response = await githubClient.get(`/users/${username}/repos?per_page=100&type=owner`);
        return response.data;
    } catch (error) {
        handleGithubError(error, username);
    }
}

/**
 * Analyze repositories to aggregate total stars and determine top languages
 * @param {Array} repos 
 */
function analyzeRepositories(repos) {
    let totalStars = 0;
    const languageCounts = {};

    repos.forEach(repo => {
        // Sum stargazers
        totalStars += repo.stargazers_count || 0;

        // Count programming languages
        const lang = repo.language;
        if (lang) {
            languageCounts[lang] = (languageCounts[lang] || 0) + 1;
        }
    });

    // Sort languages by count descending and take top 3
    const topLanguages = Object.entries(languageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(entry => entry[0])
        .join(', ') || 'None';

    return {
        totalStars,
        topLanguages
    };
}

/**
 * Calculate developer score based on GitHub metrics
 * Formula: score = (public_repos * 2) + (followers * 3) + (total_stars * 5)
 * @param {number} publicRepos 
 * @param {number} followers 
 * @param {number} totalStars 
 */
function calculateDeveloperScore(publicRepos, followers, totalStars) {
    return (publicRepos * 2) + (followers * 3) + (totalStars * 5);
}

/**
 * Perform full analysis of a GitHub user
 * @param {string} username 
 */
async function analyzeGithubUser(username) {
    console.log(`🔍 Querying GitHub API for user: ${username}`);
    
    // Fetch profile and repository data concurrently for performance
    const [profile, repos] = await Promise.all([
        getProfileData(username),
        getUserRepositories(username)
    ]);

    const { totalStars, topLanguages } = analyzeRepositories(repos);
    
    // Calculate custom score
    const developerScore = calculateDeveloperScore(
        profile.public_repos || 0,
        profile.followers || 0,
        totalStars
    );

    return {
        username: profile.login,
        name: profile.name || profile.login,
        bio: profile.bio || '',
        followers: profile.followers || 0,
        following: profile.following || 0,
        public_repos: profile.public_repos || 0,
        total_stars: totalStars,
        top_languages: topLanguages,
        developer_score: developerScore,
        avatar_url: profile.avatar_url || '',
        profile_url: profile.html_url || ''
    };
}

module.exports = {
    analyzeGithubUser,
    calculateDeveloperScore
};
