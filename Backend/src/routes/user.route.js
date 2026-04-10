const express = require("express");
const userController = require("../controllers/user.controller");
const identifyUser = require("../middlewares/user.middleware");

const userRouter = express.Router();

userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/get-me", identifyUser, userController.getMe);
userRouter.post("/refresh-token", userController.refreshToken);
userRouter.post("/logout", identifyUser, userController.logout);
userRouter.post("/verify-email", userController.verifyEmail);
userRouter.put("/updateProfile",identifyUser,userController.updateProfile)
userRouter.post("/forgot-password", userController.forgotPassword);
userRouter.post("/verify-forgot-otp", userController.verifyForgotOtp);
userRouter.post("/resend-otp", userController.resendOtp);
userRouter.post("/reset-password", userController.resetPassword);
userRouter.post("/contact", userController.contactUs);

module.exports = userRouter;
