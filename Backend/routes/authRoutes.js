const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/profile", authController.getProfile);
router.post("/patient-login", authController.patientLogin);
router.post("/register", authController.registerUser);
router.post("/check-duplicate", authController.checkDuplicate);
router.post("/reset-password", authController.resetPassword);
router.put("/profile", authController.updateProfile);

module.exports = router;
