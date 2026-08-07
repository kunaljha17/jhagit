const fs = require('fs').promises;
const path = require('path');
const { resolveHead } = require('./headUtils');

async function getLog() {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        await fs.access(commitsPath);
    } catch {
        console.log("No commits found (repo not initialized or no commits made yet).");
        return [];
    }

    const headState = await resolveHead(repoPath);

    if (!headState.commitId) {
        console.log("--- jhaGit Commit Log ---");
        console.log("No commits recorded on current HEAD.");
        return [];
    }

    try {
        const logEntries = [];
        const visited = new Set();
        const queue = [headState.commitId];

        while (queue.length > 0) {
            const commitID = queue.shift();
            if (visited.has(commitID)) continue;
            visited.add(commitID);

            const commitDir = path.join(commitsPath, commitID);
            let metadata = { message: "No commit message", date: new Date().toISOString() };
            try {
                const jsonContent = await fs.readFile(path.join(commitDir, "commit.json"), "utf8");
                metadata = JSON.parse(jsonContent);
            } catch {
                // missing or malformed commit.json
            }

            let files = [];
            try {
                files = (await fs.readdir(commitDir)).filter(f => f !== "commit.json");
            } catch {}

            logEntries.push({
                commitID,
                message: metadata.message,
                date: metadata.date,
                files,
                parents: metadata.parents || (metadata.parent ? [metadata.parent] : [])
            });

            const parentList = metadata.parents || (metadata.parent ? [metadata.parent] : []);
            for (const p of parentList) {
                if (p && !visited.has(p)) {
                    queue.push(p);
                }
            }
        }

        console.log("--- jhaGit Commit Log ---");
        if (headState.isDetached) {
            console.log(`HEAD detached at ${headState.commitId}`);
        } else {
            console.log(`Branch: ${headState.branch || 'main'}`);
        }
        if (logEntries.length === 0) {
            console.log("No commits recorded.");
        } else {
            logEntries.forEach(entry => {
                console.log(`Commit: ${entry.commitID}`);
                console.log(`Date:   ${entry.date}`);
                console.log(`Msg:    ${entry.message}`);
                console.log(`Files:  ${entry.files.join(", ")}`);
                console.log("-----------------------------------------");
            });
        }

        return logEntries;
    } catch (err) {
        console.error("Error reading commit log:", err);
        return [];
    }
}

module.exports = { getLog };
