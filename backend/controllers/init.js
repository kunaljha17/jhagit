const fs = require('fs').promises;
const path = require("path");

async function initRepo(){
     const repoPath = path.resolve(process.cwd(),".jhaGit");//store hidden folder 
     const commitsPath = path.join(repoPath , "commits");//store way to next folder inside repoPath .jhaGit this folder created

     try{
        await fs.mkdir(repoPath , {recursive:true}); //create repoPath things
        await fs.mkdir(commitsPath , {recursive:true});//Create commitsPath things
        await fs.writeFile(
            path.join(repoPath,"config.json"),
            JSON.stringify({bucket: process.env.S3_BUCKET})
        );
        console.log("repository initialised!")
     }catch(err){
         console.error("Error initialising repository",err);
        
     }
}

module.exports = {initRepo};