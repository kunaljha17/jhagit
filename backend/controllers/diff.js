const fs = require('fs').promises;
const path = require('path');

async function getDiff(fileName) {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const stagingPath = path.join(repoPath, "staging");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.access(repoPath);
    } catch {
        console.error("Error: Not a jhaGit repository.");
        return;
    }

    if (!fileName) {
        console.error("Please specify a file to diff, e.g., 'node index.js diff <file>'");
        return;
    }

    const workingFilePath = path.resolve(process.cwd(), fileName);
    let workingContent = "";
    try {
        workingContent = await fs.readFile(workingFilePath, "utf8");
    } catch {
        console.log(`File '${fileName}' does not exist in working directory.`);
        return;
    }

    // Check staging first, then latest commit
    let previousContent = null;
    let sourceName = "";

    const stagedFilePath = path.join(stagingPath, path.basename(fileName));
    try {
        previousContent = await fs.readFile(stagedFilePath, "utf8");
        sourceName = "Staged Area";
    } catch {
        // Not in staging, check latest commit
        try {
            const commitDirs = await fs.readdir(commitsPath);
            if (commitDirs.length > 0) {
                // sort by date
                const commitDetails = [];
                for (const dir of commitDirs) {
                    const jsonPath = path.join(commitsPath, dir, "commit.json");
                    try {
                        const data = await fs.readFile(jsonPath, "utf8");
                        commitDetails.push({ dir, date: new Date(JSON.parse(data).date) });
                    } catch {
                        commitDetails.push({ dir, date: new Date(0) });
                    }
                }
                commitDetails.sort((a, b) => b.date - a.date);
                const latestDir = commitDetails[0].dir;
                const commitFilePath = path.join(commitsPath, latestDir, path.basename(fileName));
                previousContent = await fs.readFile(commitFilePath, "utf8");
                sourceName = `Commit (${latestDir.substring(0, 8)})`;
            }
        } catch {
            // No previous content
        }
    }

    console.log(`--- Diff for ${fileName} (Working Tree vs ${sourceName || 'New File'}) ---`);
    if (previousContent === null) {
        console.log(`+ Entire file ${fileName} is new.`);
        return;
    }

    const prevLines = previousContent.split('\n');
    const currLines = workingContent.split('\n');

    let hasDiff = false;
    const maxLen = Math.max(prevLines.length, currLines.length);

    for (let i = 0; i < maxLen; i++) {
        const prev = prevLines[i];
        const curr = currLines[i];

        if (prev !== curr) {
            hasDiff = true;
            if (prev !== undefined) console.log(`- L${i+1}: ${prev}`);
            if (curr !== undefined) console.log(`+ L${i+1}: ${curr}`);
        }
    }

    if (!hasDiff) {
        console.log("No differences detected.");
    }
}

module.exports = { getDiff };
