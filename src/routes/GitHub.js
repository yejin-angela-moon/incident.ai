const { getFileCommitHistory, getCommitDetails } = require("../services/GitHubService");
const { HttpError } = require("../util/HttpError");

const gitHubRouter = require("express").Router();

/**
 * GET /api/github/file-history/:owner/:repo/:filePath
 * Fetch commit history for a specific file
 *
 * Query params:
 * - count: Number of commits to fetch (default: 5)
 */
gitHubRouter.get("/file-history/:owner/:repo/:filePath", async (req, res, next) => {
  try {
    const { owner, repo, filePath } = req.params;
    const { count } = req.query;

    if (!owner || !repo || !filePath) {
      return next(new HttpError(400, "Missing required parameters: owner, repo, filePath"));
    }

    const commitCount = count ? parseInt(count) : 5;
    if (isNaN(commitCount) || commitCount < 1 || commitCount > 100) {
      return next(new HttpError(400, "count must be a number between 1 and 100"));
    }

    const history = await getFileCommitHistory(owner, repo, filePath, commitCount);
    res.json({
      success: true,
      owner,
      repo,
      filePath,
      count: history.length,
      commits: history,
    });
  } catch (error) {
    next(new HttpError(400, error.message));
  }
});

/**
 * GET /api/github/commit/:owner/:repo/:sha
 * Fetch detailed commit information including changes
 */
gitHubRouter.get("/commit/:owner/:repo/:sha", async (req, res, next) => {
  try {
    const { owner, repo, sha } = req.params;

    if (!owner || !repo || !sha) {
      return next(new HttpError(400, "Missing required parameters: owner, repo, sha"));
    }

    const commitDetails = await getCommitDetails(owner, repo, sha);
    res.json({
      success: true,
      commit: commitDetails,
    });
  } catch (error) {
    next(new HttpError(400, error.message));
  }
});

module.exports = gitHubRouter;
