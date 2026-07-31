const express = require('express');
const userRouter = express.Router();
const userController = require("../controllers/userController");

userRouter.get("/allUsers",userController.getAllUser);
userRouter.post("/signup",userController.signup);
userRouter.post("/login",userController.login);
userRouter.get("/userProfile/:id",userController.getUserProfile);
userRouter.put("/updateProfile/:id",userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id",userController.deleteUserProfile);

module.exports = userRouter;