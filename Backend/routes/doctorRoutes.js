const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");

router.get("/", doctorController.getDoctors);
router.post("/register", doctorController.registerDoctor);
router.post("/login", doctorController.loginDoctor);
router.put("/profile", doctorController.updateProfile);
router.post("/reset-password", doctorController.resetPassword);

module.exports = router;
