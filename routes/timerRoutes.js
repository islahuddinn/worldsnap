const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const timeController = require("../controllers/timeController");
const router = express.Router();

router.use(authController.protect);
router.post("/setTime", timeController.setAndRetrieveAgreedUponTime);
router
  // .get("/classicPlay", timeController.classicPlay)
  .post("/classicPlay", timeController.classicPlay)
  // .get("/speedPlay", timeController.speedPlay)
  .post("/speedPlay", timeController.speedPlay);
//   .get("/soloPlay", timeController.soloPlay)
// .post("/soloPlay", timeController.soloPlay);

module.exports = router;
