const express = require('express');
const issueRouter = express.Router();
const issueController = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");

issueRouter.post("/issue/create/:id", authMiddleware, issueController.createIssue);
issueRouter.put("/issue/update/:id", authMiddleware, issueController.updateIssueByID);
issueRouter.delete("/issue/delete/:id", authMiddleware, issueController.deleteIssueByID);
issueRouter.get("/issue/all", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueByID);

module.exports = issueRouter;