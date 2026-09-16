const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/pending-hospitals", adminController.getPendingHospitals);
router.post("/approve-hospital", adminController.approveHospital);

module.exports = router;
