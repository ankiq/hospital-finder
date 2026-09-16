const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    medicalCouncilRegNumber: {
      type: String,
      trim: true,
      default: function() { return `MCI-${Math.floor(100000 + Math.random() * 900000)}`; },
    },
    specialty: {
      type: String,
      required: [true, "Specialty is required"],
      trim: true,
    },
    subSpecialty: {
      type: String,
      trim: true,
      default: "",
    },
    qualification: {
      type: String,
      trim: true,
      default: "MD",
    },
    experienceYears: {
      type: Number,
      default: 5,
    },
    designation: {
      type: String,
      trim: true,
      default: "Senior Consultant",
    },
    hospitalName: {
      type: String,
      trim: true,
      default: "City Emergency Hospital",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    fee: {
      type: Number,
      default: 800,
    },
    opdTimings: {
      type: String,
      default: "10:00 AM - 02:00 PM & 05:00 PM - 08:00 PM",
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    onDuty: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "doctor",
    },
  },
  { timestamps: true }
);

const bcrypt = require("bcrypt");

// Encrypt password using bcrypt before save
doctorSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
doctorSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  if (!this.password.startsWith("$2a$") && !this.password.startsWith("$2b$")) {
    return this.password === enteredPassword;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Doctor", doctorSchema);
