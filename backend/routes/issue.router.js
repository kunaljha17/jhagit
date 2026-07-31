const express = require('express');
const issueRouter = express.Router();
const issueController = require("../controllers/issueController");


issueRouter.post("/issue/create/:id",issueController.createIssue);
issueRouter.put("/issue/update/:id",issueController.updateIssueByID);
issueRouter.delete("/issue/delete/:id",issueController.deleteIssueByID);
issueRouter.get("/issue/all",issueController.getAllIssues);
issueRouter.get("/issue/:id",issueController.getIssueByID);

module.exports = issueRouter;