const express = require('express');
const repoRouter = express.Router();
const repoController = require("../controllers/repoController");
const starController = require("../controllers/starController");
const { getUserActivity } = require("../controllers/activityController");
const authMiddleware = require("../middleware/authMiddleware");

repoRouter.post("/repo/create", authMiddleware, repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepository);
repoRouter.get("/repo/:id", repoController.fetchRepositoryByID);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:UserId", repoController.fetchRepositoriesCurrentUser);
repoRouter.put("/repo/update/:id", authMiddleware, repoController.updateRepositoryByID);
repoRouter.post("/repo/file/add/:id", authMiddleware, repoController.addFileToRepository);
repoRouter.delete("/repo/delete/:id", authMiddleware, repoController.deleteRepositoryByID);
repoRouter.patch("/repo/toggle/:id", authMiddleware, repoController.toggleVisibilityByID);

// Starred Repositories Routes
repoRouter.post("/repo/star/:id", authMiddleware, starController.starRepository);
repoRouter.post("/repo/unstar/:id", authMiddleware, starController.unstarRepository);
repoRouter.get("/repo/starred/user/:userId", starController.getStarredRepositories);

// Activity Heatmap Route
repoRouter.get("/user/activity/:userId", getUserActivity);

module.exports = repoRouter;