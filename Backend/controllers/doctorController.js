const Doctor = require("../models/Doctor");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "hospital_finder_secret_key_2026";

const defaultDoctors = [
  {
    fullName: "Dr. Prabhat Kumar",
    specialty: "Cardiologist",
    subSpecialty: "Interventional Cardiology",
    qualification: "MD, DM (Cardiology)",
    experienceYears: 18,
    designation: "Head of Cardiology",
    hospitalName: "AIIMS Patna",
    email: "dr.prabhat@aiimspatna.org",
    phone: "+91-612-2451070",
    password: "password123",
    fee: 1000,
    opdTimings: "10:00 AM - 02:00 PM & 05:00 PM - 08:00 PM",
    rating: 4.9,
    onDuty: true
  },
  {
    fullName: "Dr. Ananya Roy",
    specialty: "Dentistry",
    subSpecialty: "Cosmetic & Orthodontics",
    qualification: "BDS, MDS",
    experienceYears: 11,
    designation: "Chief Dental Surgeon",
    hospitalName: "Apex Multispecialty Dental Care",
    email: "ananya.dentist@hospital.org",
    phone: "+91-612-2348811",
    password: "password123",
    fee: 500,
    opdTimings: "09:00 AM - 01:00 PM & 04:00 PM - 07:30 PM",
    rating: 4.8,
    onDuty: true
  },
  {
    fullName: "Dr. Meenakshi Sundaram",
    specialty: "Gynaecologist",
    subSpecialty: "Obstetrics & High-Risk Pregnancy",
    qualification: "MBBS, MS (Obstetrics & Gynaecology)",
    experienceYears: 16,
    designation: "Senior Consultant Gynecologist",
    hospitalName: "Kurji Holy Family Hospital",
    email: "meenakshi.gyn@holyfamily.org",
    phone: "+91-612-2262540",
    password: "password123",
    fee: 800,
    opdTimings: "10:00 AM - 03:00 PM",
    rating: 4.9,
    onDuty: true
  },
  {
    fullName: "Dr. Vikram Sethi",
    specialty: "Dermatology",
    subSpecialty: "Clinical Dermatology & Laser Specialist",
    qualification: "MD (Dermatology, Venereology & Leprosy)",
    experienceYears: 13,
    designation: "Lead Dermatologist",
    hospitalName: "Skin & Laser Medical Center",
    email: "vikram.skin@dermatology.org",
    phone: "+91-612-2551122",
    password: "password123",
    fee: 700,
    opdTimings: "11:00 AM - 04:00 PM & 06:00 PM - 08:30 PM",
    rating: 4.7,
    onDuty: true
  },
  {
    fullName: "Dr. Suresh Prasad",
    specialty: "Orthopedic",
    subSpecialty: "Joint Replacement & Orthopaedics",
    qualification: "MS (Orthopedics)",
    experienceYears: 20,
    designation: "Chief Orthopedic Surgeon",
    hospitalName: "Patna Medical College and Hospital",
    email: "suresh.prasad@pmch.gov.in",
    phone: "+91-612-2300477",
    password: "password123",
    fee: 600,
    opdTimings: "09:00 AM - 02:00 PM",
    rating: 4.6,
    onDuty: true
  },
  {
    fullName: "Dr. Rajiv Ranjan",
    specialty: "Trauma Surgeon",
    subSpecialty: "Emergency Care & Critical Surgery",
    qualification: "MS (General Surgery), MCh",
    experienceYears: 12,
    designation: "Emergency Trauma Lead",
    hospitalName: "Nalanda Medical College and Hospital",
    email: "rajiv.ranjan@nmch.gov.in",
    phone: "+91-612-2354871",
    password: "password123",
    fee: 700,
    opdTimings: "24 Hours Shift",
    rating: 4.7,
    onDuty: true
  },
  {
    fullName: "Dr. Sushma Singh",
    specialty: "Neurologist",
    subSpecialty: "Neuro Critical Care",
    qualification: "MD, DM (Neurology)",
    experienceYears: 14,
    designation: "Senior Neurologist",
    hospitalName: "IGIMS Patna",
    email: "sushma.singh@igims.org",
    phone: "+91-612-2297152",
    password: "password123",
    fee: 850,
    opdTimings: "10:00 AM - 04:00 PM",
    rating: 4.8,
    onDuty: true
  },
  {
    fullName: "Dr. Rajesh Khanna",
    specialty: "General Medicine",
    subSpecialty: "Internal Medicine & Diabetes Care",
    qualification: "MD (Internal Medicine)",
    experienceYears: 19,
    designation: "Senior Physician",
    hospitalName: "Ruban Memorial Hospital",
    email: "rajesh.khanna@ruban.org",
    phone: "+91-612-2320220",
    password: "password123",
    fee: 600,
    opdTimings: "09:30 AM - 02:30 PM",
    rating: 4.8,
    onDuty: true
  },
  {
    fullName: "Dr. Sunita Verma",
    specialty: "Paediatrics",
    subSpecialty: "Pediatric Care & Neonatology",
    qualification: "MD (Pediatrics), DCH",
    experienceYears: 15,
    designation: "Head of Pediatrics",
    hospitalName: "AIIMS Patna Child Care",
    email: "sunita.pediatrics@aiims.org",
    phone: "+91-612-2451999",
    password: "password123",
    fee: 750,
    opdTimings: "10:00 AM - 03:00 PM",
    rating: 4.9,
    onDuty: true
  },
  {
    fullName: "Dr. Alok Nath",
    specialty: "Ophthalmology",
    subSpecialty: "Cataract & Refractive Surgery",
    qualification: "MS (Ophthalmology), FICO",
    experienceYears: 17,
    designation: "Chief Eye Surgeon",
    hospitalName: "Nayana Eye Care Hospital",
    email: "alok.eye@nayana.org",
    phone: "+91-612-2678899",
    password: "password123",
    fee: 500,
    opdTimings: "10:00 AM - 02:00 PM & 05:00 PM - 07:30 PM",
    rating: 4.8,
    onDuty: true
  },
  {
    fullName: "Dr. K. S. Murthy",
    specialty: "ENT",
    subSpecialty: "Otolaryngology & Head-Neck Surgery",
    qualification: "MS (ENT), DLO",
    experienceYears: 14,
    designation: "Senior ENT Specialist",
    hospitalName: "Patna Super Specialty Hospital",
    email: "murthy.ent@pssh.org",
    phone: "+91-612-2541241",
    password: "password123",
    fee: 650,
    opdTimings: "11:00 AM - 04:00 PM",
    rating: 4.7,
    onDuty: true
  },
  {
    fullName: "Dr. Naman Tiwari",
    specialty: "Psychiatry",
    subSpecialty: "Behavioral Health & Neuro-Psychiatry",
    qualification: "MD (Psychiatry), DPM",
    experienceYears: 10,
    designation: "Consultant Psychiatrist",
    hospitalName: "Mind Care & Wellness Clinic",
    email: "naman.psych@mindcare.org",
    phone: "+91-612-2789900",
    password: "password123",
    fee: 800,
    opdTimings: "12:00 PM - 06:00 PM",
    rating: 4.8,
    onDuty: true
  },
  {
    fullName: "Dr. Shweta Mishra",
    specialty: "Diabetology",
    subSpecialty: "Endocrinology & Diabetes Management",
    qualification: "MD, Fellowship in Diabetology",
    experienceYears: 12,
    designation: "Chief Diabetologist",
    hospitalName: "Diabetes & Endocrine Specialty Clinic",
    email: "shweta.diabetes@endocrine.org",
    phone: "+91-612-2890011",
    password: "password123",
    fee: 700,
    opdTimings: "09:00 AM - 02:00 PM",
    rating: 4.9,
    onDuty: true
  }
];

exports.getDoctors = async (req, res) => {
  try {
    const { search, specialty } = req.query;
    
    // Ensure all 12 default specialties exist
    let count = await Doctor.countDocuments();
    if (count < defaultDoctors.length) {
      for (const doc of defaultDoctors) {
        await Doctor.updateOne(
          { fullName: doc.fullName },
          { $setOnInsert: doc },
          { upsert: true }
        );
      }
    }

    let filter = {};
    if (specialty && specialty !== "ALL") {
      const cleanSpec = specialty.replace(/[^a-zA-Z]/g, "").slice(0, 4);
      filter.$or = [
        { specialty: { $regex: new RegExp(cleanSpec, "i") } },
        { subSpecialty: { $regex: new RegExp(cleanSpec, "i") } }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { fullName: searchRegex },
        { specialty: searchRegex },
        { subSpecialty: searchRegex },
        { hospitalName: searchRegex }
      ];
    }

    let doctors = await Doctor.find(filter).sort({ rating: -1 });

    // Fallback to all doctors if filter turns empty
    if (doctors.length === 0 && specialty && specialty !== "ALL") {
      doctors = await Doctor.find().sort({ rating: -1 });
    }

    const formattedDoctors = doctors.map(doc => ({
      _id: doc._id,
      id: doc._id,
      name: doc.fullName,
      fullName: doc.fullName,
      specialty: doc.specialty,
      subSpecialty: doc.subSpecialty,
      qualification: doc.qualification,
      experienceYears: doc.experienceYears,
      designation: doc.designation,
      hospital: doc.hospitalName,
      hospitalName: doc.hospitalName,
      email: doc.email,
      phone: doc.phone,
      fee: doc.fee,
      opdTimings: doc.opdTimings,
      rating: doc.rating,
      onDuty: doc.onDuty,
      role: "doctor"
    }));

    res.json({ success: true, count: formattedDoctors.length, doctors: formattedDoctors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.registerDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    if (!doctorData.fullName || !doctorData.email || !doctorData.password) {
      return res.status(400).json({ success: false, error: "Required fields missing." });
    }

    const existing = await Doctor.findOne({ email: doctorData.email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: "Doctor with this email already exists." });
    }

    const doctor = await Doctor.create({
      ...doctorData,
      email: doctorData.email.toLowerCase()
    });

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: `Doctor ${doctor.fullName} registered successfully!`,
      token,
      doctor: {
        id: doctor._id,
        name: doctor.fullName,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        hospitalName: doctor.hospitalName,
        email: doctor.email,
        role: "doctor"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginEmail = (email || "").trim().toLowerCase();

    if (!loginEmail || !password) {
      return res.status(400).json({ success: false, error: "Please enter both Email and Password." });
    }

    let doctor = await Doctor.findOne({ email: loginEmail });

    if (!doctor) {
      return res.status(401).json({
        success: false,
        error: `Doctor account '${loginEmail}' not found. Please register your doctor profile first.`
      });
    }

    // Secure Bcrypt Password Comparison
    const isMatch = await doctor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Incorrect Password. Please check your credentials and try again."
      });
    }

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Doctor login successful!",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.fullName,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        subSpecialty: doctor.subSpecialty,
        qualification: doctor.qualification,
        experienceYears: doctor.experienceYears,
        hospital: doctor.hospitalName,
        hospitalName: doctor.hospitalName,
        email: doctor.email,
        phone: doctor.phone,
        fee: doctor.fee,
        opdTimings: doctor.opdTimings,
        role: "doctor"
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profileData = req.body;
    let doctor = await Doctor.findOne({ email: profileData.email?.toLowerCase() });
    if (!doctor && profileData.id) {
      doctor = await Doctor.findById(profileData.id);
    }

    if (doctor) {
      Object.assign(doctor, profileData);
      await doctor.save();
    }

    res.json({
      success: true,
      message: "Doctor profile updated successfully!",
      doctor
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    let doctor = await Doctor.findOne({ email: email?.toLowerCase() });
    if (doctor && newPassword) {
      doctor.password = newPassword;
      await doctor.save();
    }

    res.json({
      success: true,
      message: "Doctor password reset successfully!"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
