const db = require('../config/db');

/**
 * Find a single developer profile by username
 * @param {string} username 
 */
async function findProfileByUsername(username) {
    const queryStr = 'SELECT * FROM github_profiles WHERE username = ? LIMIT 1';
    const results = await db.query(queryStr, [username]);
    return results[0] || null;
}

/**
 * Save a new profile or update it if it already exists (caching update)
 * Uses MySQL's INSERT ... ON DUPLICATE KEY UPDATE for solid atomicity
 * @param {object} p - Profile data object
 */
async function saveOrUpdateProfile(p) {
    const queryStr = `
        INSERT INTO github_profiles 
        (username, name, bio, followers, following, public_repos, total_stars, top_languages, developer_score, avatar_url, profile_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        bio = VALUES(bio),
        followers = VALUES(followers),
        following = VALUES(following),
        public_repos = VALUES(public_repos),
        total_stars = VALUES(total_stars),
        top_languages = VALUES(top_languages),
        developer_score = VALUES(developer_score),
        avatar_url = VALUES(avatar_url),
        profile_url = VALUES(profile_url);
    `;

    const params = [
        p.username,
        p.name,
        p.bio,
        p.followers,
        p.following,
        p.public_repos,
        p.total_stars,
        p.top_languages,
        p.developer_score,
        p.avatar_url,
        p.profile_url
    ];

    await db.query(queryStr, params);
    
    // Fetch the updated profile to return
    return await findProfileByUsername(p.username);
}

/**
 * Retrieve all profiles with pagination and optional search
 * @param {object} options 
 * @param {number} options.page 
 * @param {number} options.limit 
 * @param {string} options.search 
 */
async function getAllProfiles(options = {}) {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const search = options.search || '';
    
    const offset = (page - 1) * limit;

    let baseQuery = 'FROM github_profiles';
    const queryParams = [];

    // Search filter setup
    if (search) {
        baseQuery += ' WHERE username LIKE ? OR name LIKE ? OR top_languages LIKE ?';
        const searchWildcard = `%${search}%`;
        queryParams.push(searchWildcard, searchWildcard, searchWildcard);
    }

    // 1. Get the total count for pagination metadata
    const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
    const [countResult] = await db.query(countQuery, queryParams);
    const totalRecords = countResult.total;

    // 2. Fetch the paginated data
    const dataQuery = `SELECT * ${baseQuery} ORDER BY id DESC LIMIT ? OFFSET ?`;
    
    // Param typing must match INTEGER for LIMIT and OFFSET in MySQL execute
    const results = await db.query(dataQuery, [...queryParams, limit, offset]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
        profiles: results,
        pagination: {
            total_records: totalRecords,
            total_pages: totalPages,
            current_page: page,
            limit: limit
        }
    };
}

/**
 * Delete a profile by username
 * @param {string} username 
 */
async function deleteProfileByUsername(username) {
    const queryStr = 'DELETE FROM github_profiles WHERE username = ?';
    const result = await db.query(queryStr, [username]);
    return result.affectedRows > 0;
}

/**
 * Get top developers sorted by score in descending order
 * @param {number} limit 
 */
async function getTopDevelopers(limit = 10) {
    const queryStr = 'SELECT * FROM github_profiles ORDER BY developer_score DESC LIMIT ?';
    return await db.query(queryStr, [limit]);
}

module.exports = {
    findProfileByUsername,
    saveOrUpdateProfile,
    getAllProfiles,
    deleteProfileByUsername,
    getTopDevelopers
};
