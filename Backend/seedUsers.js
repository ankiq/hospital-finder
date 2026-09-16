const mongoose = require('mongoose');
const User = require('./models/User');
const Hospital = require('./models/Hospital');
const Doctor = require('./models/Doctor');

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hospitalFinder";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for auth seeding...");

    // 1. Seed Demo Patient
    const patientExists = await User.findOne({ email: "user@gmail.com" });
    if (!patientExists) {
      await User.create({
        fullName: "Rahul Sharma",
        email: "user@gmail.com",
        phone: "9876543210",
        password: "password123",
        role: "patient",
        age: 28,
        gender: "Male",
        bloodGroup: "O+"
      });
      console.log("✅ Seeded demo patient: user@gmail.com / password123");
    } else {
      patientExists.password = "password123";
      await patientExists.save();
      console.log("✅ Password updated for user@gmail.com / password123");
    }

    // 2. Seed Demo Provider
    let srn = await Hospital.findOne({ name: /Swaroop Rani/i });
    if (srn) {
      srn.registrationNumber = "HOSP-2026-REG";
      srn.adminEmail = "admin@hospital.org";
      srn.adminPassword = "password123";
      srn.type = "government";
      await srn.save();
      console.log("✅ Seeded demo provider: HOSP-2026-REG / password123 (Swaroop Rani Nehru Hospital)");
    } else {
      await Hospital.create({
        name: "Swaroop Rani Nehru Hospital (SRN)",
        shortName: "SRN",
        registrationNumber: "HOSP-2026-REG",
        adminEmail: "admin@hospital.org",
        adminPassword: "password123",
        type: "government",
        isActive: true,
        isVerified: true,
        location: { lat: 25.4485, lng: 81.8512, address: "MG Marg, George Town", city: "Prayagraj", state: "Uttar Pradesh" },
        geo: { type: "Point", coordinates: [81.8512, 25.4485] }
      });
      console.log("✅ Created demo provider hospital: HOSP-2026-REG / password123");
    }

    // 3. Seed Demo Doctor
    let doc = await Doctor.findOne({ email: "dr.prabhat@aiimspatna.org" });
    if (!doc) {
      await Doctor.create({
        fullName: "Dr. Prabhat Kumar",
        medicalCouncilRegNumber: "MCI-PAT-90812",
        specialty: "Cardiologist",
        subSpecialty: "Interventional Cardiology",
        qualification: "MBBS, MD (Cardiology)",
        experienceYears: 14,
        designation: "Senior Chief Consultant",
        hospitalName: "AIIMS Patna",
        email: "dr.prabhat@aiimspatna.org",
        phone: "+91-612-2451001",
        password: "password123",
        fee: 800,
        opdTimings: "10:00 AM - 04:00 PM"
      });
      console.log("✅ Seeded demo doctor: dr.prabhat@aiimspatna.org / password123");
    } else {
      doc.password = "password123";
      await doc.save();
      console.log("✅ Password updated for dr.prabhat@aiimspatna.org / password123");
    }

    console.log("Auth Seeding Complete!");
    process.exit(0);
  } catch (err) {
    console.error("Auth seeding error:", err);
    process.exit(1);
  }
}

seed();
