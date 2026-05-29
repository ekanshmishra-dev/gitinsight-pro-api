-- GitInsight Pro API Database Schema
-- Run this in your MySQL client to set up the database and table manually if desired.
-- Note: The application will automatically execute this setup on launch!

-- Create Database
CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

-- Create GitHub Profiles Table
CREATE TABLE IF NOT EXISTS github_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150),
    bio TEXT,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    public_repos INT DEFAULT 0,
    total_stars INT DEFAULT 0,
    top_languages VARCHAR(255), -- Stored as comma-separated values (e.g. "JavaScript, TypeScript")
    developer_score INT DEFAULT 0,
    avatar_url VARCHAR(255),
    profile_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
