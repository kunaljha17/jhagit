const fs = require('fs').promises;
const path = require('path');
const { pullRepo } = require('./pull');
const { getLog } = require('./log');
const { revertRepo } = require('./revert');
const { initRepo } = require('./init');

async function cloneRepo() {
    console.log("Initializing clone from remote R2 repository...");
    await initRepo();
    await pullRepo();

    const commits = await getLog();
    if (commits && commits.length > 0) {
        const latestCommit = commits[0];
        console.log(`Checking out latest commit (${latestCommit.commitID})...`);
        await revertRepo(latestCommit.commitID);
        console.log("Clone completed successfully!");
    } else {
        console.log("Clone completed. No commits were found in remote storage.");
    }
}

module.exports = { cloneRepo };
