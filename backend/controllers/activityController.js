const Repository = require("../models/repoModel");
const Issue = require("../models/issueModel");
const fs = require('fs').promises;
const path = require('path');

const getUserActivity = async (req, res) => {
  const { userId } = req.params;
  try {
    const activityMap = {};

    // 1. Fetch user repositories (Repo creation + Repository file updates/commits)
    const userRepos = await Repository.find({ Owner: userId });
    const repoIds = [];

    for (const repo of userRepos) {
      if (repo._id) {
        repoIds.push(repo._id);

        // Repo creation date
        const repoDateStr = new Date(repo._id.getTimestamp()).toISOString().split("T")[0];
        activityMap[repoDateStr] = (activityMap[repoDateStr] || 0) + 3;

        // Repository file additions / commits
        if (repo.content && Array.isArray(repo.content)) {
          for (const item of repo.content) {
            if (item && item.updatedAt) {
              const fileDateStr = new Date(item.updatedAt).toISOString().split("T")[0];
              activityMap[fileDateStr] = (activityMap[fileDateStr] || 0) + 1;
            }
          }
        }
      }
    }

    // 2. Fetch issues created by user OR created in user's repositories
    const queryConditions = [];
    if (userId) {
      queryConditions.push({ author: userId });
    }
    if (repoIds.length > 0) {
      queryConditions.push({ repository: { $in: repoIds } });
    }

    if (queryConditions.length > 0) {
      const issues = await Issue.find({ $or: queryConditions });
      for (const issue of issues) {
        const issueDateStr = issue.createdAt
          ? new Date(issue.createdAt).toISOString().split("T")[0]
          : (issue._id ? new Date(issue._id.getTimestamp()).toISOString().split("T")[0] : null);
        
        if (issueDateStr) {
          activityMap[issueDateStr] = (activityMap[issueDateStr] || 0) + 2;
        }
      }
    }

    // 3. Fetch local CLI commits from .jhaGit/commits/
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const commitsPath = path.join(repoPath, "commits");
    try {
      const commitDirs = await fs.readdir(commitsPath);
      for (const dir of commitDirs) {
        const jsonPath = path.join(commitsPath, dir, "commit.json");
        try {
          const content = await fs.readFile(jsonPath, "utf8");
          const metadata = JSON.parse(content);
          if (metadata.date) {
            const commitDateStr = new Date(metadata.date).toISOString().split("T")[0];
            activityMap[commitDateStr] = (activityMap[commitDateStr] || 0) + 1;
          }
        } catch {
          // ignore error
        }
      }
    } catch {
      // commits dir might not exist
    }

    // Format output data over last 365 days
    const result = [];
    const today = new Date();
    for (let i = 365; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        count: activityMap[dateStr] || 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Error fetching user activity:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getUserActivity };
