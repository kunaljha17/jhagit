const fs = require('fs').promises;
const path = require('path');

async function resolveHead(repoPath) {
    const headPath = path.join(repoPath, "HEAD");
    const refsPath = path.join(repoPath, "refs", "heads");

    let rawHead = "main";
    try {
        rawHead = (await fs.readFile(headPath, "utf8")).trim() || "main";
    } catch {
        // default main
    }

    if (rawHead.startsWith("detached:")) {
        const commitId = rawHead.slice("detached:".length).trim();
        return {
            isDetached: true,
            branch: null,
            commitId: commitId,
            raw: rawHead
        };
    } else {
        const branchRefFile = path.join(refsPath, rawHead);
        let commitId = "";
        try {
            commitId = (await fs.readFile(branchRefFile, "utf8")).trim();
        } catch {
            // branch reference may not exist or have no commits yet
        }
        return {
            isDetached: false,
            branch: rawHead,
            commitId: commitId,
            raw: rawHead
        };
    }
}

module.exports = { resolveHead };
