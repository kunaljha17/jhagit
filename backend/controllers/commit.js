const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { resolveHead } = require("./headUtils");

async function commit(message, extraParents = []) {
  const repoPath = path.resolve(process.cwd(), ".jhaGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");
  const headPath = path.join(repoPath, "HEAD");
  const refsPath = path.join(repoPath, "refs", "heads");

  try {
    try {
      await fs.access(stagedPath);
    } catch {
      console.log("Nothing to commit (staging area is empty or repo not initialized).");
      return;
    }

    const files = await fs.readdir(stagedPath);
    if (files.length === 0) {
      console.log("Nothing to commit (no files in staging area).");
      return;
    }

    // Determine active head state (branch or detached commit ID)
    const headState = await resolveHead(repoPath);
    const parentCommitId = headState.commitId;

    // Check for in-progress merge (conflict resolution)
    const mergeHeadPath = path.join(repoPath, 'MERGE_HEAD');
    try {
        const mergeHead = (await fs.readFile(mergeHeadPath, 'utf8')).trim();
        if (mergeHead && !extraParents.includes(mergeHead)) {
            extraParents.push(mergeHead);
        }
    } catch {
        // No MERGE_HEAD — normal commit
    }

    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true });

    // 1. Inherit files from parent commit snapshot if available
    if (parentCommitId) {
      const parentCommitDir = path.join(commitPath, parentCommitId);
      try {
        const parentFiles = await fs.readdir(parentCommitDir);
        for (const pFile of parentFiles) {
          if (pFile === "commit.json") continue;
          await fs.copyFile(
            path.join(parentCommitDir, pFile),
            path.join(commitDir, pFile)
          );
        }
      } catch {
        // parent commit dir not accessible
      }
    }

    // 2. Overwrite / add staged files
    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    // 3. Write metadata
    const parents = [parentCommitId, ...extraParents].filter(Boolean);

    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify({
        message,
        date: new Date().toISOString(),
        // kept for backward compatibility with any code still reading `.parent`
        parent: parentCommitId || null,
        // full parent list -- a merge commit has two entries here
        parents,
      }),
    );

    // 4. Update branch reference or detached HEAD
    if (headState.isDetached) {
      await fs.writeFile(headPath, `detached:${commitID}`);
    } else {
      await fs.mkdir(refsPath, { recursive: true });
      const branchRefFile = path.join(refsPath, headState.branch || "main");
      await fs.writeFile(branchRefFile, commitID);
    }

    // 5. Clear staging directory after commit
    for (const file of files) {
      await fs.unlink(path.join(stagedPath, file));
    }

    // 6. Clean up MERGE_HEAD if present
    try { await fs.unlink(mergeHeadPath); } catch {}

    console.log(`Commit ${commitID} created with message: ${message}`);
  } catch (err) {
    console.error("Error committing files:", err);
  }
}

module.exports = { commit };
