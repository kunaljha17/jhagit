const fs = require('fs').promises;
const path = require('path');

async function add(filePath){
   const repoPath = path.resolve(process.cwd(),".jhaGit");
   const stagingPath = path.join(repoPath, "staging");

   try{
    await fs.mkdir(stagingPath , {recursive:true});
    const fileName = path.basename(filePath);          
                    //kon sa file se copy krna hai          //kaha bana hai    //file name
    await fs.copyFile(filePath, path.join(stagingPath,fileName)); // creating file copy in staging area
    console.log(`File ${fileName} added to staging area!`)
   }catch(err){
    console.error("Error adding file : " , err);
   }
}

module.exports = {add};