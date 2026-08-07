const fs = require('fs').promises;
const path = require('path');
const s3 = require('../config/r2_bucket');
const { PutObjectCommand } = require("@aws-sdk/client-s3");


async function pushRepo(){
    const repoPath = path.resolve(process.cwd(),".jhaGit");
    const commitsPath = path.join(repoPath,"commits");
    try{
        const commitDirrs = await fs.readdir(commitsPath);

        for(const commitDirr of commitDirrs){
            const commitPath = path.join(commitsPath , commitDirr);
            const files = await fs.readdir(commitPath);

            for(const file of files){
                const filePath = path.join(commitPath,file);
                const fileContent = await fs.readFile(filePath);
                const params = {
                        Bucket: process.env.R2_BUCKET,
                        Key: `commits/${commitDirr}/${file}`,
                        Body: fileContent,
                };
                await s3.send(new PutObjectCommand(params));
            }
        }
        console.log("All commits push to S3.")
    }catch(err){
        console.error("Error pushing to s3",err)
    }
}

module.exports = {pushRepo};