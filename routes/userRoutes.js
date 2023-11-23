const express = require("express");
const userControler = require("../controllers/userController");
const authController = require("../controllers/authController");
<<<<<<< HEAD
const timeController = require("../controllers/timeController");
=======
>>>>>>> origin/main

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/forgetPassword", authController.forgetPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// protecting all routes ussing protect midleware
router.use(authController.protect);
<<<<<<< HEAD
router.post("/classicPlay", timeController.setAndRetrieveAgreedUponTime);

// router.get("/speedPlay", timeController.startEggTimer);
// router.get("/soloPlay", timeController.startEggTimer);
=======
>>>>>>> origin/main

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
