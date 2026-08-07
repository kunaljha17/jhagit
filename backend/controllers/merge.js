const fs = require('fs').promises;
const path = require('path');
const { add } = require('./add');
const { commit } = require('./commit');
const { resolveHead } = require('./headUtils');

// Reads the parent id(s) of a single commit. Understands both the new
// `parents` array (merge commits have two) and the legacy single `parent`
// field, so it works on repos with older commits too.
async function getCommitParentIds(repoPath, commitId) {
    try {
        const jsonPath = path.join(repoPath, "commits", commitId, "commit.json");
        const content = await fs.readFile(jsonPath, "utf8");
        const data = JSON.parse(content);
        if (Array.isArray(data.parents)) return data.parents.filter(Boolean);
        if (data.parent) return [data.parent];
        return [];
    } catch {
        return [];
    }
}

// BFS over the (possibly-merged, multi-parent) commit graph starting at
// commitId. Returns Map<commitId, distance> of every ancestor reachable
// from commitId, including commitId itself at distance 0.
async function getCommitAncestors(repoPath, commitId) {
    const distances = new Map();
    if (!commitId) return distances;
    const queue = [[commitId, 0]];
    while (queue.length) {
        const [id, dist] = queue.shift();
        if (distances.has(id) && distances.get(id) <= dist) continue;
        distances.set(id, dist);
        const parents = await getCommitParentIds(repoPath, id);
        for (const p of parents) {
            queue.push([p, dist + 1]);
        }
    }
    return distances;
}

// Kept for backward compatibility with any other code importing
// getCommitParents expecting a flat ancestor list.
async function getCommitParents(repoPath, commitId) {
    return Array.from((await getCommitAncestors(repoPath, commitId)).keys());
}

async function findCommonAncestor(repoPath, commitId1, commitId2) {
    if (!commitId1 || !commitId2) return null;
    const [dist1, dist2] = await Promise.all([
        getCommitAncestors(repoPath, commitId1),
        getCommitAncestors(repoPath, commitId2),
    ]);

    let best = null;
    let bestScore = Infinity;
    for (const [id, d1] of dist1) {
        if (dist2.has(id)) {
            const score = d1 + dist2.get(id);
            if (score < bestScore) {
                bestScore = score;
                best = id;
            }
        }
    }
    return best;
}
function diffLines(ancestorLines, fileLines) {
    const M = ancestorLines.length;
    const N = fileLines.length;
    const dp = Array.from({ length: M + 1 }, () => new Int32Array(N + 1));
    for (let i = M - 1; i >= 0; i--) {
        for (let j = N - 1; j >= 0; j--) {
            if (ancestorLines[i] === fileLines[j]) {
                dp[i][j] = dp[i + 1][j + 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const insertionsBefore = Array.from({ length: M + 1 }, () => []);
    const ancestorStatus = Array.from({ length: M }, () => ({ kept: false }));

    let i = 0, j = 0;
    while (i < M || j < N) {
        if (i < M && j < N && ancestorLines[i] === fileLines[j]) {
            ancestorStatus[i] = { kept: true };
            i++;
            j++;
        } else if (j < N && (i === M || dp[i][j + 1] >= dp[i + 1][j])) {
            insertionsBefore[i].push(fileLines[j]);
            j++;
        } else if (i < M && (j === N || dp[i][j + 1] < dp[i + 1][j])) {
            ancestorStatus[i] = { kept: false };
            i++;
        }
    }

    return { insertionsBefore, ancestorStatus };
}

function mergeFiles(ancestorContent, currentContent, targetContent, currentBranch, targetBranch) {
    if (currentContent === targetContent) {
        return { content: currentContent, conflict: false, deleteFile: currentContent === null };
    }
    if (ancestorContent !== null) {
        if (currentContent === ancestorContent) {
            return { content: targetContent, conflict: false, deleteFile: targetContent === null };
        }
        if (targetContent === ancestorContent) {
            return { content: currentContent, conflict: false, deleteFile: currentContent === null };
        }
    } else {
        if (currentContent === null) {
            return { content: targetContent, conflict: false, deleteFile: targetContent === null };
        }
        if (targetContent === null) {
            return { content: currentContent, conflict: false, deleteFile: currentContent === null };
        }
    }

    const ancestorLines = ancestorContent !== null ? ancestorContent.split(/\r?\n/) : [];
    const currentLines = currentContent !== null ? currentContent.split(/\r?\n/) : [];
    const targetLines = targetContent !== null ? targetContent.split(/\r?\n/) : [];

    const diffM = diffLines(ancestorLines, currentLines);
    const diffB = diffLines(ancestorLines, targetLines);

    const mergedLines = [];
    let hasConflict = false;

    const M = ancestorLines.length;
    for (let i = 0; i <= M; i++) {
        const insM = diffM.insertionsBefore[i];
        const insB = diffB.insertionsBefore[i];

        if (insM.length > 0 || insB.length > 0) {
            if (insM.join('\n') === insB.join('\n')) {
                mergedLines.push(...insM);
            } else if (insM.length > 0 && insB.length === 0) {
                mergedLines.push(...insM);
            } else if (insB.length > 0 && insM.length === 0) {
                mergedLines.push(...insB);
            } else {
                hasConflict = true;
                mergedLines.push(`<<<<<<< ${currentBranch}`);
                mergedLines.push(...insM);
                mergedLines.push(`=======`);
                mergedLines.push(...insB);
                mergedLines.push(`>>>>>>> ${targetBranch}`);
            }
        }

        if (i < M) {
            const keptM = diffM.ancestorStatus[i].kept;
            const keptB = diffB.ancestorStatus[i].kept;

            if (keptM && keptB) {
                mergedLines.push(ancestorLines[i]);
            }
        }
    }

    return {
        content: mergedLines.join('\n'),
        conflict: hasConflict,
        deleteFile: false
    };
}

async function mergeBranch(targetBranch) {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const headPath = path.join(repoPath, "HEAD");
    const refsPath = path.join(repoPath, "refs", "heads");

    try {
        await fs.access(repoPath);
    } catch {
        console.error("Error: Not a jhaGit repository.");
        return;
    }

    if (!targetBranch) {
        console.error("Please specify a branch name to merge.");
        return;
    }

    const headState = await resolveHead(repoPath);

    if (headState.isDetached) {
        console.error("Error: Cannot merge while in detached HEAD state.");
        return;
    }

    const currentBranch = headState.branch || "main";

    if (currentBranch === targetBranch) {
        console.error(`Error: Cannot merge branch '${targetBranch}' into itself.`);
        return;
    }

    const currentBranchFilePath = path.join(refsPath, currentBranch);
    const targetBranchFilePath = path.join(refsPath, targetBranch);

    try {
        await fs.access(targetBranchFilePath);
    } catch {
        console.error(`Error: Branch '${targetBranch}' does not exist.`);
        return;
    }

    try {
        let currentCommitId = "";
        try {
            currentCommitId = (await fs.readFile(currentBranchFilePath, "utf8")).trim();
        } catch {
            currentCommitId = "";
        }

        const targetCommitId = (await fs.readFile(targetBranchFilePath, "utf8")).trim();
        if (!targetCommitId) {
            console.log(`Branch '${targetBranch}' has no commits to merge.`);
            return;
        }

        const ancestorCommitId = await findCommonAncestor(repoPath, currentCommitId, targetCommitId);

        const parentDir = path.resolve(repoPath, "..");

        const fileNames = new Set();

        const getFilesInCommit = async (commitId) => {
            if (!commitId) return [];
            try {
                const commitDir = path.join(repoPath, "commits", commitId);
                const files = await fs.readdir(commitDir);
                return files.filter(f => f !== "commit.json");
            } catch {
                return [];
            }
        };

        const ancestorFiles = await getFilesInCommit(ancestorCommitId);
        const currentFiles = await getFilesInCommit(currentCommitId);
        const targetFiles = await getFilesInCommit(targetCommitId);

        ancestorFiles.forEach(f => fileNames.add(f));
        currentFiles.forEach(f => fileNames.add(f));
        targetFiles.forEach(f => fileNames.add(f));

        const readFileContent = async (commitId, file) => {
            if (!commitId) return null;
            try {
                const filePath = path.join(repoPath, "commits", commitId, file);
                return await fs.readFile(filePath, "utf8");
            } catch {
                return null;
            }
        };

        const readWorkingFileContent = async (file) => {
            try {
                const filePath = path.join(parentDir, file);
                return await fs.readFile(filePath, "utf8");
            } catch {
                return null;
            }
        };

        let anyConflict = false;

        for (const file of fileNames) {
            const ancestorContent = await readFileContent(ancestorCommitId, file);
            let currentContent = await readWorkingFileContent(file);
            if (currentContent === null) {
                currentContent = await readFileContent(currentCommitId, file);
            }
            const targetContent = await readFileContent(targetCommitId, file);

            const result = mergeFiles(
                ancestorContent,
                currentContent,
                targetContent,
                currentBranch,
                targetBranch
            );

            const targetFilePath = path.join(parentDir, file);

            if (result.deleteFile) {
                try {
                    await fs.unlink(targetFilePath);
                } catch {
                    // file might not exist
                }
            } else if (result.content !== null) {
                await fs.writeFile(targetFilePath, result.content, "utf8");
                await add(file);
                if (result.conflict) {
                    anyConflict = true;
                }
            }
        }

        if (anyConflict) {
            await fs.writeFile(path.join(repoPath, 'MERGE_HEAD'), targetCommitId, 'utf8');
            console.log(`Automatic merge failed; fix conflicts and commit the result.`);
        } else {
            await commit(`Merge branch '${targetBranch}' into ${currentBranch}`, [targetCommitId]);
            // Clean up any stale MERGE_HEAD from a previous aborted merge
            try { await fs.unlink(path.join(repoPath, 'MERGE_HEAD')); } catch {}
            console.log(`Merged branch '${targetBranch}' into '${currentBranch}' successfully.`);
        }
    } catch (err) {
        console.error("Error during merge:", err);
    }
}

module.exports = { mergeBranch, findCommonAncestor, mergeFiles };

