const express = require('express');
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");

repoRouter.post("/repo/create",repoController.createRepository);
repoRouter.get("/repo/all",repoController.getAllRepository);
repoRouter.get("/repo/:id",repoController.fetchRepositoryByID);
repoRouter.get("/repo/name/:name",repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:UserId",repoController.fetchRepositoriesCurrentUser);
repoRouter.put("/repo/update/:id",repoController.updateRepositoryByID);
repoRouter.delete("/repo/delete/:id",repoController.deleteRepositoryByID);
repoRouter.patch("/repo/toggle/:id",repoController.toggleVisibilityByID);

module.exports = repoRouter;