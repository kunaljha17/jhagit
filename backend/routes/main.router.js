const express = require('express');
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const gitRouter = require("./git.router");
const mainRouter = express.Router();


mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(gitRouter);

mainRouter.get("/",(req,res)=>{
  res.send("Welcome to jhaGit REST API Server!");
});

module.exports = mainRouter;