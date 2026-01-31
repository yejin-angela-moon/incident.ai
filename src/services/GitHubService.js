const axios = require("axios");

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Fetch the past commits for a specific file in a GitHub repository
 * @param {string} owner - GitHub repository owner
 * @param {string} repo - GitHub repository name
 * @param {string} filePath - Path to the file in the repository
 * @param {number} count - Number of commits to fetch (default: 5)
 * @returns {Promise<Array>} Array of commit objects with metadata
 */
async function getFileCommitHistory(owner, repo, filePath, count = 5) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`;

  try {
    const response = await axios.get(url, {
      params: {
        path: filePath,
        per_page: count,
      },
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    return response.data.map((commit) => ({
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 7),
      message: commit.commit.message,
      author: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
      url: commit.html_url,
      filesChanged: commit.files ? commit.files.length : null,
    }));
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(
        `Repository or file not found: ${owner}/${repo}/${filePath}`
      );
    }
    if (error.response?.status === 422) {
      throw new Error(`Invalid commit SHA or path: ${filePath}`);
    }
    throw new Error(`Failed to fetch commits: ${error.message}`);
  }
}

/**
 * Fetch a specific commit with detailed changes
 * @param {string} owner - GitHub repository owner
 * @param {string} repo - GitHub repository name
 * @param {string} sha - Commit SHA
 * @returns {Promise<Object>} Commit object with detailed changes
 */
async function getCommitDetails(owner, repo, sha) {
  const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    const commit = response.data;
    return {
      sha: commit.sha,
      shortSha: commit.sha.substring(0, 7),
      message: commit.commit.message,
      author: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
      url: commit.html_url,
      filesChanged: commit.files.map((file) => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch || null,
      })),
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Commit not found: ${sha}`);
    }
    throw new Error(`Failed to fetch commit details: ${error.message}`);
  }
}

module.exports = {
  getFileCommitHistory,
  getCommitDetails,
};
