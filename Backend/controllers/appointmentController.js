const Appointment = require("../models/Appointment");

const sampleAppointments = [
  {
    patientName: "Rahul Sharma",
    patientEmail: "rahul.sharma@example.com",
    patientPhone: "+919876543210",
    doctorName: "Dr. Prabhat Kumar",
    hospitalName: "AIIMS Patna",
    specialty: "Cardiology",
    date: "Thu, Jul 30, 2026",
    time: "10:30 AM",
    fee: 1000,
    status: "confirmed",
  },
  {
    patientName: "Ananya Gupta",
    patientEmail: "ananya@example.com",
    patientPhone: "+919812345678",
    doctorName: "Dr. Sushma Singh",
    hospitalName: "IGIMS Patna",
    specialty: "Neurology",
    date: "Fri, Jul 31, 2026",
    time: "02:00 PM",
    fee: 850,
    status: "upcoming",
  }
];

exports.getAllAppointments = async (req, res) => {
  try {
    let count = await Appointment.countDocuments();
    if (count === 0) {
      await Appointment.insertMany(sampleAppointments);
    }

    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json({ success: true, count: appointments.length, appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bookAppointment = async (req, res) => {
  try {
    const bookingData = req.body;
    if (!bookingData.doctorName || !bookingData.patientName) {
      return res.status(400).json({ success: false, error: "Missing required booking details." });
    }

    const appointment = await Appointment.create({
      patientName: bookingData.patientName,
      patientEmail: bookingData.patientEmail || "",
      patientPhone: bookingData.patientPhone || "",
      doctorName: bookingData.doctorName,
      hospitalName: bookingData.hospitalName || "City Hospital",
      specialty: bookingData.specialty || "General Medicine",
      date: bookingData.date || "Today",
      time: bookingData.time || "10:00 AM",
      fee: bookingData.fee || 800,
      status: "confirmed"
    });

    res.json({
      success: true,
      message: "Appointment booked successfully!",
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id, action } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.json({ success: true, message: `Action '${action}' recorded successfully.` });
    }

    if (action === "accept" || action === "confirm") {
      appointment.status = "confirmed";
      appointment.acceptedAt = new Date();
    } else if (action === "complete") {
      appointment.status = "completed";
    } else if (action === "cancel") {
      appointment.status = "cancelled";
    }

    await appointment.save();

    res.json({
      success: true,
      message: `Appointment ${appointment.status} successfully.`,
      appointment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
