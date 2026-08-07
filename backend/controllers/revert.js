const fs = require('fs').promises;
const path = require('path');

async function revertRepo(commitID){
   const repoPath = path.resolve(process.cwd(), ".jhaGit");
   const commitsPath = path.join(repoPath, "commits");

   try {
      const commitDir = path.join(commitsPath, commitID);
      try {
        await fs.access(commitDir);
      } catch {
        console.error(`Error: Commit '${commitID}' does not exist locally.`);
        return;
      }

      const files = await fs.readdir(commitDir); 
      const parentDir = path.resolve(repoPath, "..");
      
      for(const file of files){
          if (file === "commit.json") continue;
          await fs.copyFile(path.join(commitDir, file), path.join(parentDir, file));
      }
      console.log(`Commit ${commitID} reverted successfully!`);

   } catch(err){
      console.error("Unable to revert:", err);
   }
}

module.exports = { revertRepo };