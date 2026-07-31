const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commit(message) {
  const repoPath = path.resolve(process.cwd(), ".jhaGit");
  const stagedPath = path.join(repoPath, "staging");
  const commitPath = path.join(repoPath, "commits");

  try {
    const commitID = uuidv4();
    const commitDir = path.join(commitPath, commitID);
    await fs.mkdir(commitDir, { recursive: true }); //folder created with id name
    const files = await fs.readdir(stagedPath); //read all files 
    for (const file of files) {
      // for loop for select each file one by one
      await fs.copyFile(
        path.join(stagedPath, file), // kaha ka kon sa file ko copy krna hai
        path.join(commitDir, file), // kaha copy krna hai
      );
    } //kaha bana hai  // name kya hai
    await fs.writeFile( //json file to keep track data
      path.join(commitDir, "commit.json"),          
      JSON.stringify({ message, date: new Date().toISOString() }),
    );
    console.log(`Commit ${commitID} created with message: ${message}`);
  } catch (err) {
    console.error("Error committig filees :", err);
  }
}

module.exports = { commit };
