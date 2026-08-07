const fs = require('fs').promises;
const path = require("path");

async function initRepo(){
     const repoPath = path.resolve(process.cwd(),".jhaGit");//store hidden folder 
     const commitsPath = path.join(repoPath , "commits");//store way to next folder inside repoPath .jhaGit this folder created

     try{
        await fs.mkdir(repoPath , {recursive:true}); //create repoPath things
        await fs.mkdir(commitsPath , {recursive:true});//Create commitsPath things
        await fs.mkdir(path.join(repoPath, "refs", "heads"), { recursive: true });
        await fs.writeFile(path.join(repoPath, "HEAD"), "main");
        await fs.writeFile(path.join(repoPath, "refs", "heads", "main"), "");
        await fs.writeFile(
            path.join(repoPath,"config.json"),
            JSON.stringify({bucket: process.env.R2_BUCKET || process.env.S3_BUCKET})
        );
        console.log("repository initialised!")
     }catch(err){
         console.error("Error initialising repository",err);
        
     }
}

module.exports = {initRepo};