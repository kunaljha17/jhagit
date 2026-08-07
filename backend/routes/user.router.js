const express = require('express');
const userRouter = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

userRouter.get("/allUsers", userController.getAllUser);
userRouter.post("/signup", userController.signup);
userRouter.post('/verify-otp', userController.verifyOtp);
userRouter.post('/resend-otp', userController.resendOtp);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.put("/updateProfile/:id", authMiddleware, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", authMiddleware, userController.deleteUserProfile);
userRouter.patch("/user/avatar", authMiddleware,userController.updateAvatar);
module.exports = userRouter;