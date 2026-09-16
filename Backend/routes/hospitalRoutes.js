const express = require("express");
const router = express.Router();
const hospitalController = require("../controllers/hospitalController");

router.get("/", hospitalController.getAllHospitals);
router.get("/proximity", hospitalController.getNearbyHospitals);
router.post("/register", hospitalController.registerHospital);
router.post("/admin/login", hospitalController.adminLogin);
router.post("/capacity-sync", hospitalController.updateCapacity);
router.post("/capacity", hospitalController.updateCapacity);
router.post("/triage-ai", hospitalController.triageAiSearch);
router.post("/dispatch-alert", hospitalController.dispatchAlert);
router.post("/dispatch", hospitalController.dispatchAlert);

module.exports = router;