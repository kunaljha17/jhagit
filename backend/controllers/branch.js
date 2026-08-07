const fs = require('fs').promises;
const path = require('path');
const { resolveHead } = require('./headUtils');

async function createBranch(branchName) {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const refsPath = path.join(repoPath, "refs", "heads");

    try {
        await fs.access(repoPath);
    } catch {
        console.error("Error: Not a jhaGit repository.");
        return;
    }

    const headState = await resolveHead(repoPath);

    if (!branchName) {
        // List branches
        try {
            await fs.mkdir(refsPath, { recursive: true });
            const branches = (await fs.readdir(refsPath)).filter(b => !b.startsWith('.'));

            console.log("--- Branches ---");
            if (headState.isDetached) {
                console.log(`* (HEAD detached at ${headState.commitId.slice(0, 7)})`);
            }
            if (branches.length === 0) {
                if (!headState.isDetached) {
                    console.log("* main (default)");
                }
            } else {
                branches.forEach(b => {
                    if (!headState.isDetached && b === headState.branch) {
                        console.log(`* ${b} (current)`);
                    } else {
                        console.log(`  ${b}`);
                    }
                });
            }
            return branches;
        } catch (err) {
            console.error("Error listing branches:", err);
            return [];
        }
    }

    try {
        await fs.mkdir(refsPath, { recursive: true });
        const branchFilePath = path.join(refsPath, branchName);

        // Point new branch to current active commit ID (whether from active branch or detached HEAD)
        const currentCommitId = headState.commitId;

        await fs.writeFile(branchFilePath, currentCommitId);
        console.log(`Branch '${branchName}' created successfully.`);
    } catch (err) {
        console.error("Error creating branch:", err);
    }
}

module.exports = { createBranch };
