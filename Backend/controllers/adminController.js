const Hospital = require("../models/Hospital");

exports.getPendingHospitals = async (req, res) => {
  try {
    const pendingHospitals = await Hospital.find({
      $or: [{ isVerified: false }, { isActive: false }]
    });

    const formattedPending = pendingHospitals.map(h => ({
      _id: h._id,
      id: h._id,
      establishmentName: h.name,
      name: h.name,
      establishmentType: h.type || "Hospital",
      licenseNumber: h.licenseNumber || `REG-UP-${Math.floor(100000 + Math.random() * 900000)}`,
      officialEmail: h.contact?.email || "admin@hospital.org",
      phone: h.contact?.phone || "+91-612-2451070",
      address: h.location?.address || "Patna",
      city: h.location?.city || "Patna",
      state: h.location?.state || "Bihar",
      pincode: h.location?.pincode || "800001",
      bedsAvailable: h.beds?.available || 0,
      totalBeds: h.beds?.total || 100,
      icuBeds: h.beds?.icu?.total || 10,
      status: "pending"
    }));

    res.json({
      success: true,
      count: formattedPending.length,
      pendingHospitals: formattedPending,
      hospitals: formattedPending
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.approveHospital = async (req, res) => {
  try {
    const { hospitalId, action } = req.body;
    const hospital = await Hospital.findById(hospitalId);

    if (hospital) {
      if (action === "approve") {
        hospital.isVerified = true;
        hospital.isActive = true;
        await hospital.save();
      } else if (action === "reject") {
        hospital.isActive = false;
        await hospital.save();
      }
    }

    res.json({
      success: true,
      message: `Hospital request ${action === "approve" ? "approved" : "rejected"} successfully!`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
