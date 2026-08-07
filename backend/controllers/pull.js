const fs = require('fs').promises;
const path = require('path');
const s3 = require('../config/r2_bucket');
const { ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".jhaGit");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const listParams = {
            Bucket: process.env.R2_BUCKET,
            Prefix: "commits/",
        };

        const data = await s3.send(new ListObjectsV2Command(listParams));

        if (!data.Contents || data.Contents.length === 0) {
            console.log("No commits found on remote.");
            return;
        }

        for (const obj of data.Contents) {
            const key = obj.Key; // e.g. "commits/<commitDirr>/<file>"
            if (key.endsWith("/")) continue; // Skip directory placeholder objects

            const relativePath = key.replace(/^commits\//, "");
            if (!relativePath) continue;

            const localFilePath = path.join(commitsPath, relativePath);

            // Ensure the commit's directory exists locally
            await fs.mkdir(path.dirname(localFilePath), { recursive: true });

            const getParams = {
                Bucket: process.env.R2_BUCKET,
                Key: key,
            };

            const response = await s3.send(new GetObjectCommand(getParams));
            const byteArray = await response.Body.transformToByteArray();
            await fs.writeFile(localFilePath, Buffer.from(byteArray));
        }
        console.log("All commits pulled from R2.");
    } catch (err) {
        console.error("Error pulling from R2:", err);
    }
}

module.exports = { pullRepo };