const fs = require('fs').promises;
const path = require('path');
const { revertRepo } = require('./revert');

async function checkout(target) {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const refsPath = path.join(repoPath, "refs", "heads");
    const headPath = path.join(repoPath, "HEAD");

    try {
        await fs.access(repoPath);
    } catch {
        console.error("Error: Not a jhaGit repository.");
        return;
    }

    if (!target) {
        console.error("Please specify a branch name or commit ID to checkout.");
        return;
    }

    // Check if target is a branch
    const branchFilePath = path.join(refsPath, target);

    try {
        await fs.access(branchFilePath);
        // It's a branch! Update HEAD and get pointing commit
        await fs.writeFile(headPath, target);
        console.log(`Switched to branch '${target}'`);
        const commitId = await fs.readFile(branchFilePath, "utf8");
        if (commitId.trim()) {
            await revertRepo(commitId.trim());
        }
        return;
    } catch {
        // Not a branch file, assume target is a direct commit ID
    }

    // Direct commit ID checkout
    const commitDir = path.join(repoPath, "commits", target);
    try {
        await fs.access(commitDir);
        await fs.writeFile(headPath, `detached:${target}`);
        await revertRepo(target);
        console.log(`Note: switching to '${target}'. You are in 'detached HEAD' state.`);
        console.log(`HEAD is now at ${target}`);
    } catch {
        console.error(`Error: pathspec '${target}' did not match any file(s) or branch known to jhaGit.`);
    }
}

module.exports = { checkout };
