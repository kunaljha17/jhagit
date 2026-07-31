const fs = require('fs').promises;
const path = require('path');
const s3 = require('../config/r2_bucket.');
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");

// async function streamToBuffer(stream) { // Node handles stream draining internally//
//     const chunks = [];
//     for await (const chunk of stream) {
//         chunks.push(chunk);
//     }
//     return Buffer.concat(chunks);
// }

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const listParams = {
            Bucket: process.env.R2_BUCKET,
            Prefix: "commits/",
        };
                                        //get data obj there content is in array where store key is file name start with prefix
        const data = await s3.send(new ListObjectsV2Command(listParams));

        if (!data.Contents || data.Contents.length === 0) {
            console.log("No commits found on remote.");
            return;
        }

        for (const obj of data.Contents) {
            const key = obj.Key; // e.g. "commits/<commitDirr>/<file>"
            const relativePath = key.replace("commits/", "");
            const localFilePath = path.join(commitsPath, relativePath);

            // ensure the commit's directory exists locally
            await fs.mkdir(path.dirname(localFilePath), { recursive: true });

            const getParams = {
                Bucket: process.env.R2_BUCKET,
                Key: key,
            };

            const response = await s3.send(new GetObjectCommand(getParams));
                                                    //we get file content in chunk so here we add it into chunks array by using method
            // const fileBuffer = await streamToBuffer(response.Body);   //*****/ Node handles stream draining internally/*****/

            await fs.writeFile(localFilePath, response.Body);
        }
        console.log("All commits pulled from R2.");
    } catch (err) {
        console.error("Error pulling from R2", err);
    }
}

module.exports = { pullRepo };