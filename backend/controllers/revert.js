const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

                    //promisify is node internal check does this availabe or not . if not then throw error
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

async function revertRepo(commitID){
     const repoPath = path.resolve(process.cwd(),".jhaGit");
     const commitsPath = path.join(repoPath,"commits");

     try{
        const commitDir = path.join(commitsPath,commitID);
        const files = await readdir(commitDir); 
        const parentDir = path.resolve(repoPath,".."); //move up path
        
        
       
        for(const file of files){       //(source, destination)
                            //give path of where copy from , where to paste path file
            await copyFile(path.join(commitDir,file),path.join(parentDir,file));
        }
        console.log(`Commit ${commitID} reverted successfully !`);

     }catch(err){
        console.error("Unable to revert ",err);
     }
}

module.exports = {revertRepo};