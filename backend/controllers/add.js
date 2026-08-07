const fs = require('fs').promises;
const path = require('path');

async function add(filePath){
   const repoPath = path.resolve(process.cwd(), ".jhaGit");
   const stagingPath = path.join(repoPath, "staging");

   try {
     try {
       await fs.access(repoPath);
     } catch {
       console.error("Error: Not a jhaGit repository. Run 'init' first.");
       return;
     }

     const resolvedFilePath = path.resolve(process.cwd(), filePath);
     try {
       await fs.access(resolvedFilePath);
     } catch {
       console.error(`Error: File '${filePath}' does not exist.`);
       return;
     }

     await fs.mkdir(stagingPath, { recursive: true });
     const fileName = path.basename(filePath);          
     await fs.copyFile(resolvedFilePath, path.join(stagingPath, fileName));
     console.log(`File ${fileName} added to staging area!`);
   } catch(err) {
     console.error("Error adding file:", err);
   }
}

module.exports = { add };