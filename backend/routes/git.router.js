const express = require('express');
const gitRouter = express.Router();
const { initRepo } = require('../controllers/init');
const { add } = require('../controllers/add');
const { commit } = require('../controllers/commit');
const { pushRepo } = require('../controllers/push');
const { pullRepo } = require('../controllers/pull');
const { getStatus } = require('../controllers/status');
const { getLog } = require('../controllers/log');
const { revertRepo } = require('../controllers/revert');
const { createBranch } = require('../controllers/branch');
const { checkout } = require('../controllers/checkout');
const { mergeBranch } = require('../controllers/merge');
const fs = require('fs').promises;
const path = require('path');

gitRouter.post("/git/branch", async (req, res) => {
    const { branchName } = req.body;
    try {
        const branches = await createBranch(branchName);
        res.json({ message: branchName ? `Branch ${branchName} created.` : "Branches listed.", branches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/checkout", async (req, res) => {
    const { target } = req.body;
    try {
        await checkout(target);
        res.json({ message: `Checked out ${target}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/merge", async (req, res) => {
    const { targetBranch } = req.body;
    try {
        await mergeBranch(targetBranch);
        res.json({ message: `Merged branch ${targetBranch}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/init", async (req, res) => {
    try {
        await initRepo();
        res.json({ message: "Repository initialized!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.get("/git/status", async (req, res) => {
    try {
        const status = await getStatus();
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.get("/git/log", async (req, res) => {
    try {
        const log = await getLog();
        res.json(log);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/add", async (req, res) => {
    const { filePath } = req.body;
    try {
        await add(filePath);
        res.json({ message: `File ${filePath} added to staging area.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/commit", async (req, res) => {
    const { message } = req.body;
    try {
        await commit(message);
        res.json({ message: `Commit executed: ${message}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/push", async (req, res) => {
    try {
        await pushRepo();
        res.json({ message: "Commits pushed to remote R2 storage." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/pull", async (req, res) => {
    try {
        await pullRepo();
        res.json({ message: "Commits pulled from remote R2 storage." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

gitRouter.post("/git/revert", async (req, res) => {
    const { commitID } = req.body;
    try {
        await revertRepo(commitID);
        res.json({ message: `Reverted to commit ${commitID}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Endpoint to view file list & file contents for web repo browser
gitRouter.get("/git/files", async (req, res) => {
    try {
        const repoPath = path.resolve(process.cwd(), ".jhaGit");
        const commitsPath = path.join(repoPath, "commits");
        
        let commits = [];
        try {
            commits = await getLog();
        } catch {
            commits = [];
        }

        const files = [];
        if (commits.length > 0) {
            const latestCommitDir = path.join(commitsPath, commits[0].commitID);
            const dirFiles = await fs.readdir(latestCommitDir);
            for (const file of dirFiles) {
                if (file === "commit.json") continue;
                const content = await fs.readFile(path.join(latestCommitDir, file), "utf8");
                files.push({ name: file, content: content });
            }
        }

        res.json({ commits, files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = gitRouter;
