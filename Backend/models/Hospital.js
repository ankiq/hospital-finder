
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, "Doctor specialty is required"],
      trim: true,
      lowercase: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    onDuty: {
      type: Boolean,
      default: false,
    },
    shift: {
      type: String,
      enum: ["morning", "evening", "night", "24hr"],
      default: "morning",
    },
  },
  { _id: false } 
);

const bedCategorySchema = new mongoose.Schema(
  {
    total: {
      type: Number,
      required: true,
      min: [0, "Total beds cannot be negative"],
      default: 0,
    },
    available: {
      type: Number,
      required: true,
      min: [0, "Available beds cannot be negative"],
      default: 0,
    },
  },
  { _id: false }
);

const bloodBankSchema = new mongoose.Schema(
  {
    isAvailable: {
      type: Boolean,
      default: false,
    },
    types: {
      "A+": { type: Number, default: 0, min: 0 },
      "A-": { type: Number, default: 0, min: 0 },
      "B+": { type: Number, default: 0, min: 0 },
      "B-": { type: Number, default: 0, min: 0 },
      "O+": { type: Number, default: 0, min: 0 },
      "O-": { type: Number, default: 0, min: 0 },
      "AB+": { type: Number, default: 0, min: 0 },
      "AB-": { type: Number, default: 0, min: 0 },
    },
  },
  { _id: false }
);

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Hospital name is required"],
      trim: true,
    },
    shortName: {
      type: String,
      trim: true,
      uppercase: true,
    },
    location: {
      lat: {
        type: Number,
        required: [true, "Latitude is required"],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, "Longitude is required"],
        min: -180,
        max: 180,
      },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
      city: {
        type: String,
        trim: true,
        default: "Patna",
      },
      state: {
        type: String,
        trim: true,
        default: "Bihar",
      },
      pincode: {
        type: String,
        trim: true,
      },
    },
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], 
        default: [0, 0]
      }
    },
    specialties: {
      type: [String],
      default: [],
    },
    specialists: {
      type: [String],
      default: [],
    },
    capabilities: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    facilities: {
      icu: { type: Boolean, default: false },
      ventilator: { type: Boolean, default: false },
      operationTheater: { type: Boolean, default: false },
      xray: { type: Boolean, default: false },
      mri: { type: Boolean, default: false },
      ctScan: { type: Boolean, default: false },
      dialysis: { type: Boolean, default: false },
      nicu: { type: Boolean, default: false },         
      burnUnit: { type: Boolean, default: false },
      traumaCenter: { type: Boolean, default: false },
      pharmacy24hr: { type: Boolean, default: false },
    },
    beds: {
      total: {
        type: Number,
        default: 0,
        min: 0,
      },
      available: {
        type: Number,
        default: 0,
        min: 0,
      },
      icu:       { type: bedCategorySchema, default: () => ({}) },
      emergency:  { type: bedCategorySchema, default: () => ({}) },
      general:    { type: bedCategorySchema, default: () => ({}) },
      maternity:  { type: bedCategorySchema, default: () => ({}) },
      pediatric:  { type: bedCategorySchema, default: () => ({}) },
      burns:      { type: bedCategorySchema, default: () => ({}) },
    },
    bloodBank: { type: bloodBankSchema, default: () => ({}) },
    contact: {
      phone: { type: String, trim: true },
      emergency: { type: String, trim: true },
      ambulance: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
      website: { type: String, trim: true },
    },
    doctors: {
      type: [doctorSchema],
      default: [],
    },
    ambulanceSummary: {
      total: { type: Number, default: 0, min: 0 },
      available: { type: Number, default: 0, min: 0 },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    registrationNumber: {
      type: String,
      trim: true,
      sparse: true,
    },
    adminEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    adminPassword: {
      type: String,
    },
    type: {
      type: String,
      default: "private",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const bcrypt = require("bcrypt");

// Encrypt adminPassword using bcrypt before save
hospitalSchema.pre("save", async function () {
  if (!this.isModified("adminPassword") || !this.adminPassword) return;
  const salt = await bcrypt.genSalt(10);
  this.adminPassword = await bcrypt.hash(this.adminPassword, salt);
});

// Compare adminPassword method
hospitalSchema.methods.matchAdminPassword = async function (enteredPassword) {
  if (!this.adminPassword) return false;
  if (!this.adminPassword.startsWith("$2a$") && !this.adminPassword.startsWith("$2b$")) {
    return this.adminPassword === enteredPassword;
  }
  return await bcrypt.compare(enteredPassword, this.adminPassword);
};


hospitalSchema.index({ "geo": "2dsphere" });
hospitalSchema.index({ name: "text", shortName: "text" });
hospitalSchema.index({ specialties: 1 });
hospitalSchema.index({ specialists: 1 }); 
hospitalSchema.index({ isActive: 1 });

hospitalSchema.virtual("bedAvailabilityPercent").get(function () {
  if (this.beds.total === 0) return 0;
  return Math.round((this.beds.available / this.beds.total) * 100);
});

hospitalSchema.virtual("icuAvailabilityPercent").get(function () {
  if (!this.beds.icu || this.beds.icu.total === 0) return 0;
  return Math.round((this.beds.icu.available / this.beds.icu.total) * 100);
});

hospitalSchema.methods.canHandleEmergency = function (requiredSpecialties) {
  return requiredSpecialties.every((spec) =>
    this.specialties.includes(spec) ||
    (spec === "icu" && this.facilities.icu)
  );
};

hospitalSchema.methods.calculateScore = function (distanceKm) {
  const MAX_DISTANCE = 50; 
  const distanceScore    = Math.min(distanceKm / MAX_DISTANCE, 1);
  const bedScore         = 1 - (this.beds.available / Math.max(this.beds.total, 1));
  const ratingScore      = 1 - (this.rating / 5); 
  
  const score =
    distanceScore * 0.40 +   
    bedScore      * 0.35 +   
    ratingScore   * 0.25;    
  return parseFloat(score.toFixed(4));
};

hospitalSchema.statics.getAllActive = function () {
  return this.find({ isActive: true }).select(
    "name shortName location geo specialties specialists capabilities isVerified facilities beds rating ambulanceSummary contact"
  );
};

module.exports = mongoose.model("Hospital", hospitalSchema);