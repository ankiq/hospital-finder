const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

router.get("/all", appointmentController.getAllAppointments);
router.get("/", appointmentController.getAllAppointments);
router.post("/book", appointmentController.bookAppointment);
router.put("/:id/:action", appointmentController.updateAppointmentStatus);

module.exports = router;
