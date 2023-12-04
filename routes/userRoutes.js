const express = require("express");
const userControler = require("../controllers/userController");
const authController = require("../controllers/authController");
const timeController = require("../controllers/timeController");
const pushNotificationController = require("../controllers/push-notificationController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/verify", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/sendOTP", authController.sendOTP);
router.post("/verifyOTP", authController.verifyOtp);
router.post("/refresh/:token", authController.refresh);
router.post("/forgetPassword", authController.forgotPassword);
router.patch("/resetPassword", authController.resetPassword);
router.post(
  "/verifyOTPResetPassword",
  authController.verifyOtpForResetPassword
);

// protecting all routes ussing protect midleware
router.use(authController.protect);
router.patch("/updateMyPassword", authController.updatePassword);
router.post("/logout", authController.logout);
router.post("/classicPlay", timeController.setAndRetrieveAgreedUponTime);
router.post(
  "/send-notification",
  pushNotificationController.sendPushNotification
);

// router.get("/speedPlay", timeController.startEggTimer);
// router.get("/soloPlay", timeController.startEggTimer);

router.patch("/updatePassword", authController.updatePassword);
router.get("/me", userControler.getMe, userControler.getUser);
router.patch("/updateMe", userControler.updateMe);
router.patch("/updateProfile", userControler.updateUserProfile);
router.delete("/deleteMe", userControler.deleteMe);

// router.use(authController.restrictTo("admin"));
router.route("/").post(userControler.createUser);

router
  .route("/:id")
  .get(userControler.getUser)
  .patch(userControler.updateUser)
  .delete(userControler.deleteUser);

module.exports = router;
