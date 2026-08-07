const fs = require('fs').promises;
const path = require('path');
const { resolveHead } = require('./headUtils');

async function getStatus() {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const stagingPath = path.join(repoPath, "staging");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.access(repoPath);
    } catch {
        console.error("Error: Not a jhaGit repository. Run 'init' first.");
        return { error: "Not a jhaGit repository" };
    }

    const headState = await resolveHead(repoPath);

    const stagedFiles = [];
    try {
        const stagedList = await fs.readdir(stagingPath);
        stagedFiles.push(...stagedList);
    } catch {
        // staging folder may not exist yet
    }

    // Get active commit files based on resolved HEAD
    let activeCommitFiles = [];
    if (headState.commitId) {
        try {
            const cFiles = await fs.readdir(path.join(commitsPath, headState.commitId));
            activeCommitFiles = cFiles.filter(f => f !== "commit.json");
        } catch {
            // no commit files found
        }
    }

    // Read working tree files (top level)
    const workingTreeFiles = [];
    const rootItems = await fs.readdir(process.cwd(), { withFileTypes: true });
    for (const item of rootItems) {
        if (item.isFile() && !item.name.startsWith('.')) {
            workingTreeFiles.push(item.name);
        }
    }

    const untracked = workingTreeFiles.filter(f => !stagedFiles.includes(f) && !activeCommitFiles.includes(f));
    const modified = workingTreeFiles.filter(f => !stagedFiles.includes(f) && activeCommitFiles.includes(f));

    const statusResult = {
        branch: headState.isDetached ? `HEAD detached at ${headState.commitId}` : headState.branch,
        isDetached: headState.isDetached,
        staged: stagedFiles,
        modified: modified,
        untracked: untracked
    };

    console.log("--- jhaGit Status ---");
    if (headState.isDetached) {
        console.log(`HEAD detached at ${headState.commitId}`);
    } else {
        console.log(`On branch ${headState.branch || 'main'}`);
    }
    console.log("Staged files:", stagedFiles.length > 0 ? stagedFiles.join(", ") : "(none)");
    console.log("Modified files:", modified.length > 0 ? modified.join(", ") : "(none)");
    console.log("Untracked files:", untracked.length > 0 ? untracked.join(", ") : "(none)");

    return statusResult;
}

module.exports = { getStatus };
