require("dotenv").config();
const mongoose = require("mongoose");
const Hospital = require("../models/Hospital");
const Ambulance = require("../models/Ambulance");

const hospitals = [  
  {
    name: "All India Institute of Medical Sciences Patna",
    shortName: "AIIMS PATNA",
    location: { lat: 25.5480, lng: 85.0722, address: "Phulwari Sharif, Patna, Bihar 801507", city: "Patna", state: "Bihar", pincode: "801507" },
    specialties: ["cardiology", "neurology", "burns", "trauma", "maternity", "pediatrics", "orthopedics", "psychiatry", "oncology", "nephrology", "pulmonology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: true, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 960, available: 180, icu: { total: 100, available: 15 }, emergency: { total: 60, available: 10 }, general: { total: 600, available: 100 }, maternity: { total: 100, available: 30 }, pediatric: { total: 60, available: 15 }, burns: { total: 40, available: 10 } },
    bloodBank: { isAvailable: true, types: { "A+": 20, "A-": 5, "B+": 25, "B-": 3, "O+": 30, "O-": 8, "AB+": 10, "AB-": 2 } },
    contact: { phone: "+91-612-2451070", emergency: "+91-612-2451911", ambulance: "+91-612-2451108", email: "emergency@aiimspatna.org", website: "https://aiimspatna.edu.in" },
    doctors: [{ name: "Dr. Prabhat Kumar", specialty: "cardiology", qualification: "MD, DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 12, available: 4 }, rating: 4.6, reviewCount: 2840, type: "government", isActive: true
  },
  {
    name: "Patna Medical College and Hospital",
    shortName: "PMCH",
    location: { lat: 25.6093, lng: 85.1365, address: "Ashok Rajpath, Patna, Bihar 800004", city: "Patna", state: "Bihar", pincode: "800004" },
    specialties: ["cardiology", "neurology", "trauma", "maternity", "pediatrics", "orthopedics", "burns", "pulmonology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: false, nicu: true, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 1800, available: 320, icu: { total: 80, available: 8 }, emergency: { total: 100, available: 20 }, general: { total: 1200, available: 220 }, maternity: { total: 200, available: 50 }, pediatric: { total: 120, available: 15 }, burns: { total: 100, available: 7 } },
    bloodBank: { isAvailable: true, types: { "A+": 15, "A-": 3, "B+": 18, "B-": 2, "O+": 22, "O-": 5, "AB+": 7, "AB-": 1 } },
    contact: { phone: "+91-612-2300477", emergency: "+91-612-2300911", email: "info@pmch.gov.in" },
    doctors: [{ name: "Dr. Suresh Prasad", specialty: "cardiology", qualification: "MD, DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 18, available: 6 }, rating: 4.1, reviewCount: 3200, type: "government", isActive: true
  },
  {
    name: "Indira Gandhi Institute of Medical Sciences",
    shortName: "IGIMS",
    location: { lat: 25.6134, lng: 85.0823, address: "Sheikhpura, Patna, Bihar 800014", city: "Patna", state: "Bihar", pincode: "800014" },
    specialties: ["cardiology", "neurology", "nephrology", "gastroenterology", "oncology", "orthopedics", "trauma"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: false, burnUnit: false, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 700, available: 95, icu: { total: 60, available: 5 }, emergency: { total: 40, available: 8 }, general: { total: 500, available: 70 }, maternity: { total: 50, available: 7 }, pediatric: { total: 30, available: 5 }, burns: { total: 20, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 12, "A-": 2, "B+": 14, "B-": 1, "O+": 18, "O-": 4, "AB+": 5, "AB-": 1 } },
    contact: { phone: "+91-612-2297152", emergency: "+91-612-2297911", email: "info@igims.org" },
    doctors: [{ name: "Dr. Sushma Singh", specialty: "nephrology", qualification: "DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 8, available: 3 }, rating: 4.3, reviewCount: 1680, type: "government", isActive: true
  },
  {
    name: "Paras HMRI Hospital",
    shortName: "PARAS",
    location: { lat: 25.6290, lng: 85.1290, address: "Raja Bazar, Patna, Bihar 800014", city: "Patna", state: "Bihar", pincode: "800014" },
    specialties: ["cardiology", "neurology", "orthopedics", "gastroenterology", "maternity", "pediatrics", "trauma"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: true, burnUnit: false, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 350, available: 60, icu: { total: 30, available: 5 }, emergency: { total: 25, available: 8 }, general: { total: 220, available: 38 }, maternity: { total: 45, available: 6 }, pediatric: { total: 30, available: 3 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 8, "A-": 1, "B+": 10, "B-": 1, "O+": 12, "O-": 3, "AB+": 4, "AB-": 0 } },
    contact: { phone: "+91-612-3270100", emergency: "+91-612-3270911" },
    doctors: [{ name: "Dr. Narendra Prasad", specialty: "cardiology", qualification: "DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 7, available: 3 }, rating: 4.5, reviewCount: 1240, type: "private", isActive: true
  },
  {
    name: "Ruban Memorial Hospital",
    shortName: "RUBAN",
    location: { lat: 25.6177, lng: 85.1389, address: "Near Gandhi Maidan, Patna, Bihar 800001", city: "Patna", state: "Bihar", pincode: "800001" },
    specialties: ["cardiology", "orthopedics", "maternity", "pediatrics", "nephrology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: true, nicu: true, burnUnit: false, traumaCenter: false, pharmacy24hr: true },
    beds: { total: 200, available: 45, icu: { total: 20, available: 4 }, emergency: { total: 15, available: 5 }, general: { total: 120, available: 28 }, maternity: { total: 30, available: 6 }, pediatric: { total: 15, available: 2 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: false, types: {} },
    contact: { phone: "+91-612-2320220", emergency: "+91-612-2320911" },
    doctors: [{ name: "Dr. Vikram Sinha", specialty: "cardiology", qualification: "MD", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 5, available: 2 }, rating: 4.4, reviewCount: 920, type: "private", isActive: true
  },
  {
    name: "Nalanda Medical College and Hospital",
    shortName: "NMCH",
    location: { lat: 25.5985, lng: 85.1872, address: "Kankarbagh, Patna, Bihar 800007", city: "Patna", state: "Bihar", pincode: "800007" },
    specialties: ["trauma", "maternity", "pediatrics", "orthopedics", "pulmonology", "gastroenterology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: false, nicu: true, burnUnit: false, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 750, available: 110, icu: { total: 40, available: 6 }, emergency: { total: 50, available: 12 }, general: { total: 500, available: 70 }, maternity: { total: 100, available: 15 }, pediatric: { total: 40, available: 5 }, burns: { total: 20, available: 2 } },
    bloodBank: { isAvailable: true, types: { "A+": 10, "B+": 12, "O+": 14, "AB+": 4 } },
    contact: { phone: "+91-612-2354871", emergency: "+91-612-2354911" },
    doctors: [{ name: "Dr. Rajiv Ranjan", specialty: "trauma", qualification: "MS", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 8, available: 3 }, rating: 3.9, reviewCount: 1150, type: "government", isActive: true
  },
  {
    name: "Kurji Holy Family Hospital",
    shortName: "KURJI",
    location: { lat: 25.6372, lng: 85.1011, address: "Sadaquat Ashram, Patna, Bihar 800010", city: "Patna", state: "Bihar", pincode: "800010" },
    specialties: ["maternity", "pediatrics", "orthopedics", "psychiatric"],
    facilities: { icu: true, ventilator: false, operationTheater: true, xray: true, mri: false, ctScan: false, dialysis: false, nicu: true, burnUnit: false, traumaCenter: false, pharmacy24hr: true },
    beds: { total: 300, available: 55, icu: { total: 15, available: 2 }, emergency: { total: 20, available: 6 }, general: { total: 200, available: 35 }, maternity: { total: 50, available: 10 }, pediatric: { total: 15, available: 2 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: true, types: { "O+": 10, "B+": 8 } },
    contact: { phone: "+91-612-2262540", emergency: "+91-612-2262911" },
    doctors: [{ name: "Sister Dr. Mary", specialty: "maternity", qualification: "DGO, MS", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 4, available: 2 }, rating: 4.2, reviewCount: 740, type: "trust", isActive: true
  },
  {
    name: "Patna Super Specialty Hospital",
    shortName: "PSSH",
    location: { lat: 25.6022, lng: 85.1215, address: "Boring Road, Patna, Bihar 800001", city: "Patna", state: "Bihar", pincode: "800001" },
    specialties: ["cardiology", "neurology", "nephrology", "pulmonology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: false, burnUnit: false, traumaCenter: false, pharmacy24hr: true },
    beds: { total: 120, available: 24, icu: { total: 15, available: 3 }, emergency: { total: 10, available: 2 }, general: { total: 80, available: 16 }, maternity: { total: 15, available: 3 }, pediatric: { total: 0, available: 0 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: false, types: {} },
    contact: { phone: "+91-612-2541241", emergency: "+91-612-2541911" },
    doctors: [{ name: "Dr. KK Roy", specialty: "cardiology", qualification: "DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 3, available: 1 }, rating: 4.4, reviewCount: 310, type: "private", isActive: true
  },
  {
    name: "Medversity Trauma & Critical Care",
    shortName: "MEDVERSITY",
    location: { lat: 25.5891, lng: 85.1482, address: "Kankarbagh Main Rd, Patna, Bihar 800020", city: "Patna", state: "Bihar", pincode: "800020" },
    specialties: ["trauma", "orthopedics", "burns", "poisoning"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: false, nicu: false, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 80, available: 18, icu: { total: 12, available: 2 }, emergency: { total: 15, available: 5 }, general: { total: 43, available: 10 }, maternity: { total: 0, available: 0 }, pediatric: { total: 10, available: 1 }, burns: { total: 10, available: 0 } },
    bloodBank: { isAvailable: true, types: { "O-": 5, "AB-": 2 } },
    contact: { phone: "+91-612-2698541", emergency: "+91-612-2698911" },
    doctors: [{ name: "Dr. S. K. Sinha", specialty: "trauma", qualification: "MS, MCh", onDuty: true, shift: "night" }],
    ambulanceSummary: { total: 4, available: 2 }, rating: 4.0, reviewCount: 190, type: "private", isActive: true
  },
  {
    name: "Ford Hospital & Research Centre",
    shortName: "FORD",
    location: { lat: 25.5721, lng: 85.1741, address: "Khemnichak, New Bypass, Patna, Bihar 800027", city: "Patna", state: "Bihar", pincode: "800027" },
    specialties: ["cardiology", "trauma", "maternity", "pediatrics", "gastroenterology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: true, burnUnit: false, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 150, available: 31, icu: { total: 20, available: 4 }, emergency: { total: 10, available: 3 }, general: { total: 95, available: 18 }, maternity: { total: 15, available: 4 }, pediatric: { total: 10, available: 2 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 5, "B+": 6, "O+": 8 } },
    contact: { phone: "+91-612-2345100", emergency: "+91-612-2345911" },
    doctors: [{ name: "Dr. Santosh Kumar", specialty: "gastroenterology", qualification: "DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 5, available: 2 }, rating: 4.3, reviewCount: 610, type: "private", isActive: true
  },

  
  {
    name: "All India Institute of Medical Sciences Gorakhpur",
    shortName: "AIIMS GKP",
    location: { lat: 26.7850, lng: 83.4350, address: "Kunraghat, Gorakhpur, Uttar Pradesh 273008", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273008" },
    specialties: ["cardiology", "neurology", "burns", "trauma", "maternity", "pediatrics", "orthopedics", "psychiatry", "oncology", "nephrology", "pulmonology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: true, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 750, available: 145, icu: { total: 80, available: 12 }, emergency: { total: 50, available: 8 }, general: { total: 500, available: 95 }, maternity: { total: 60, available: 15 }, pediatric: { total: 40, available: 10 }, burns: { total: 20, available: 5 } },
    bloodBank: { isAvailable: true, types: { "A+": 15, "A-": 4, "B+": 20, "B-": 2, "O+": 25, "O-": 6, "AB+": 8, "AB-": 1 } },
    contact: { phone: "+91-551-2205501", emergency: "+91-551-2205911", ambulance: "+91-551-2205108", email: "emergency@aiimsgorakhpur.edu.in" },
    doctors: [{ name: "Dr. Alok Kumar", specialty: "cardiology", qualification: "MD, DM", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 10, available: 4 }, rating: 4.7, reviewCount: 1420, type: "government", isActive: true
  },
  {
    name: "Baba Raghav Das Medical College and Hospital",
    shortName: "BRDMC",
    location: { lat: 26.7972, lng: 83.3744, address: "Medical College Road, Gorakhpur, Uttar Pradesh 273013", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273013" },
    specialties: ["cardiology", "neurology", "trauma", "maternity", "pediatrics", "orthopedics", "burns", "pulmonology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: false, nicu: true, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 1100, available: 190, icu: { total: 60, available: 4 }, emergency: { total: 80, available: 12 }, general: { total: 750, available: 130 }, maternity: { total: 120, available: 25 }, pediatric: { total: 70, available: 14 }, burns: { total: 20, available: 5 } },
    bloodBank: { isAvailable: true, types: { "A+": 12, "A-": 2, "B+": 15, "B-": 1, "O+": 18, "O-": 4, "AB+": 6, "AB-": 1 } },
    contact: { phone: "+91-551-2332145", emergency: "+91-551-2332911", email: "info@brdmc.ac.in" },
    doctors: [{ name: "Dr. RK Mishra", specialty: "trauma", qualification: "MS Orthopedics", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 14, available: 5 }, rating: 4.2, reviewCount: 2150, type: "government", isActive: true
  },
  {
    name: "Rana Hospital Gorakhpur",
    shortName: "RANA",
    location: { lat: 26.7565, lng: 83.3768, address: "Golghar, Gorakhpur, Uttar Pradesh 273001", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273001" },
    specialties: ["cardiology", "orthopedics", "maternity", "pediatrics"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: false, nicu: true, burnUnit: false, traumaCenter: false, pharmacy24hr: true },
    beds: { total: 150, available: 32, icu: { total: 15, available: 2 }, emergency: { total: 10, available: 4 }, general: { total: 95, available: 20 }, maternity: { total: 20, available: 4 }, pediatric: { total: 10, available: 2 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: false, types: {} },
    contact: { phone: "+91-551-2202021", emergency: "+91-551-2202911", email: "care@ranahospital.com" },
    doctors: [{ name: "Dr. Sanjay Rana", specialty: "orthopedics", qualification: "MS Ortho", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 4, available: 2 }, rating: 4.3, reviewCount: 480, type: "private", isActive: true
  },
  {
    name: "Sahara Hospital Gorakhpur",
    shortName: "SAHARA GKP",
    location: { lat: 26.7412, lng: 83.3891, address: "Taramandal, Gorakhpur, Uttar Pradesh 273010", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273010" },
    specialties: ["cardiology", "neurology", "trauma", "gastroenterology", "nephrology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: true, nicu: false, burnUnit: false, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 250, available: 48, icu: { total: 24, available: 4 }, emergency: { total: 16, available: 3 }, general: { total: 160, available: 32 }, maternity: { total: 30, available: 6 }, pediatric: { total: 20, available: 3 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 8, "B+": 10, "O+": 12 } },
    contact: { phone: "+91-551-2230041", emergency: "+91-551-2230911" },
    doctors: [{ name: "Dr. P. K. Srivastava", specialty: "neurology", qualification: "DM Neurology", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 6, available: 3 }, rating: 4.5, reviewCount: 710, type: "private", isActive: true
  },
  {
    name: "District Hospital Gorakhpur",
    shortName: "DISTRICT H",
    location: { lat: 26.7592, lng: 83.3614, address: "Near Railway Station, Gorakhpur, Uttar Pradesh 273001", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273001" },
    specialties: ["trauma", "maternity", "pediatrics", "orthopedics", "poisoning"],
    facilities: { icu: true, ventilator: false, operationTheater: true, xray: true, mri: false, ctScan: false, dialysis: false, nicu: true, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 400, available: 82, icu: { total: 12, available: 2 }, emergency: { total: 30, available: 10 }, general: { total: 258, available: 50 }, maternity: { total: 60, available: 15 }, pediatric: { total: 20, available: 3 }, burns: { total: 20, available: 2 } },
    bloodBank: { isAvailable: true, types: { "A+": 10, "B+": 12, "O+": 15, "AB+": 3 } },
    contact: { phone: "+91-551-2334512", emergency: "+91-551-2334911" },
    doctors: [{ name: "Dr. S. C. Gupta", specialty: "trauma", qualification: "MS", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 8, available: 2 }, rating: 3.8, reviewCount: 940, type: "government", isActive: true
  },
  {
    name: "Star Hospital Gorakhpur",
    shortName: "STAR",
    location: { lat: 26.7721, lng: 83.3541, address: "Bank Road, Gorakhpur, Uttar Pradesh 273001", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273001" },
    specialties: ["cardiology", "maternity", "pediatrics", "respiratory"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: false, nicu: true, burnUnit: false, traumaCenter: false, pharmacy24hr: true },
    beds: { total: 100, available: 21, icu: { total: 10, available: 2 }, emergency: { total: 10, available: 4 }, general: { total: 60, available: 12 }, maternity: { total: 10, available: 2 }, pediatric: { total: 10, available: 1 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: false, types: {} },
    contact: { phone: "+91-551-2284100", emergency: "+91-551-2284911" },
    doctors: [{ name: "Dr. V. N. Agrawal", specialty: "respiratory", qualification: "MD", onDuty: true, shift: "evening" }],
    ambulanceSummary: { total: 3, available: 1 }, rating: 4.1, reviewCount: 230, type: "private", isActive: true
  },
  {
    name: "Savitri Hospital & Research Centre",
    shortName: "SAVITRI",
    location: { lat: 26.7491, lng: 83.4112, address: "Deoria Road, Gorakhpur, Uttar Pradesh 273008", city: "Gorakhpur", state: "Uttar Pradesh", pincode: "273008" },
    specialties: ["trauma", "orthopedics", "maternity", "neurology"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: true, ctScan: true, dialysis: false, nicu: false, burnUnit: false, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 120, available: 19, icu: { total: 12, available: 1 }, emergency: { total: 10, available: 3 }, general: { total: 78, available: 12 }, maternity: { total: 10, available: 2 }, pediatric: { total: 10, available: 1 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 4, "B+": 5, "O+": 6 } },
    contact: { phone: "+91-551-2274152", emergency: "+91-551-2274911" },
    doctors: [{ name: "Dr. Abhay Singh", specialty: "orthopedics", qualification: "MS Ortho", onDuty: true, shift: "morning" }],
    ambulanceSummary: { total: 4, available: 2 }, rating: 4.3, reviewCount: 380, type: "private", isActive: true
  },

  
  {
    name: "Sri Krishna Medical College Hospital",
    shortName: "SKMCH",
    location: { lat: 26.1197, lng: 85.3910, address: "Muzaffarpur, Bihar 842004", city: "Muzaffarpur", state: "Bihar", pincode: "842004" },
    specialties: ["cardiology", "trauma", "maternity", "pediatrics", "orthopedics", "burns"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: false, nicu: true, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 1200, available: 200, icu: { total: 50, available: 8 }, emergency: { total: 80, available: 15 }, general: { total: 800, available: 140 }, maternity: { total: 150, available: 25 }, pediatric: { total: 80, available: 12 }, burns: { total: 40, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 10, "A-": 2, "B+": 12, "B-": 1, "O+": 15, "O-": 3, "AB+": 4, "AB-": 1 } },
    contact: { phone: "+91-621-2245551", emergency: "+91-621-2245911" },
    ambulanceSummary: { total: 10, available: 4 }, rating: 3.9, reviewCount: 1820, type: "government", isActive: true
  },
  {
    name: "Anugrah Narayan Magadh Medical College",
    shortName: "ANMCH",
    location: { lat: 24.7452, lng: 84.9947, address: "Gaya, Bihar 823001", city: "Gaya", state: "Bihar", pincode: "823001" },
    specialties: ["trauma", "maternity", "pediatrics", "orthopedics", "pulmonology"],
    facilities: { icu: true, ventilator: false, operationTheater: true, xray: true, mri: false, ctScan: false, dialysis: false, nicu: false, burnUnit: false, traumaCenter: true, pharmacy24hr: false },
    beds: { total: 800, available: 150, icu: { total: 30, available: 5 }, emergency: { total: 50, available: 12 }, general: { total: 550, available: 110 }, maternity: { total: 100, available: 18 }, pediatric: { total: 50, available: 5 }, burns: { total: 20, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 8, "A-": 1, "B+": 9, "B-": 0, "O+": 11, "O-": 2, "AB+": 3, "AB-": 0 } },
    contact: { phone: "+91-631-2220433", emergency: "+91-631-2220911" },
    ambulanceSummary: { total: 6, available: 2 }, rating: 3.7, reviewCount: 980, type: "government", isActive: true
  },
  {
    name: "Darbhanga Medical College Hospital",
    shortName: "DMCH",
    location: { lat: 26.1585, lng: 85.8994, address: "Laheriasarai, Darbhanga, Bihar 846003", city: "Darbhanga", state: "Bihar", pincode: "846003" },
    specialties: ["trauma", "maternity", "pediatrics", "orthopedics"],
    facilities: { icu: true, ventilator: false, operationTheater: true, xray: true, mri: false, ctScan: false, dialysis: false, nicu: true, burnUnit: false, traumaCenter: true, pharmacy24hr: false },
    beds: { total: 1000, available: 180, icu: { total: 40, available: 6 }, emergency: { total: 60, available: 14 }, general: { total: 650, available: 120 }, maternity: { total: 150, available: 30 }, pediatric: { total: 80, available: 10 }, burns: { total: 20, available: 0 } },
    bloodBank: { isAvailable: true, types: { "A+": 9, "A-": 1, "B+": 11, "B-": 1, "O+": 14, "O-": 2, "AB+": 4, "AB-": 0 } },
    contact: { phone: "+91-6272-222555", emergency: "+91-6272-222911" },
    ambulanceSummary: { total: 7, available: 3 }, rating: 3.8, reviewCount: 870, type: "government", isActive: true
  },
  {
    name: "Muzaffarpur Eye & General Trauma Hospital",
    shortName: "MUZ TRAUMA",
    location: { lat: 26.1310, lng: 85.3750, address: "Mithanpura, Muzaffarpur, Bihar 842002", city: "Muzaffarpur", state: "Bihar", pincode: "842002" },
    specialties: ["trauma", "orthopedics", "burns", "respiratory"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: false, nicu: false, burnUnit: true, traumaCenter: true, pharmacy24hr: true },
    beds: { total: 120, available: 26, icu: { total: 10, available: 2 }, emergency: { total: 15, available: 4 }, general: { total: 85, available: 18 }, maternity: { total: 0, available: 0 }, pediatric: { total: 10, available: 2 }, burns: { total: 10, available: 0 } },
    bloodBank: { isAvailable: false, types: {} },
    contact: { phone: "+91-621-2264512", emergency: "+91-621-2264911" },
    ambulanceSummary: { total: 4, available: 2 }, rating: 4.1, reviewCount: 340, type: "private", isActive: true
  },
  {
    name: "Gaya Emergency MultiSpecialty Hospital",
    shortName: "GAYA MS",
    location: { lat: 24.7910, lng: 84.9995, address: "Medical College Road, Gaya, Bihar 823001", city: "Gaya", state: "Bihar", pincode: "823001" },
    specialties: ["cardiology", "trauma", "maternity", "pediatrics"],
    facilities: { icu: true, ventilator: true, operationTheater: true, xray: true, mri: false, ctScan: true, dialysis: true, nicu: true, burnUnit: false, traumaCenter: false, pharmacy24hr: true },
    beds: { total: 140, available: 34, icu: { total: 12, available: 3 }, emergency: { total: 12, available: 4 }, general: { total: 96, available: 22 }, maternity: { total: 10, available: 3 }, pediatric: { total: 10, available: 2 }, burns: { total: 0, available: 0 } },
    bloodBank: { isAvailable: true, types: { "B+": 6, "O+": 8 } },
    contact: { phone: "+91-631-2241512", emergency: "+91-631-2241911" },
    ambulanceSummary: { total: 5, available: 2 }, rating: 4.2, reviewCount: 460, type: "private", isActive: true
  }
];

const generateAmbulances = (hospitalDocs) => {
  const ambulances = [];
  const drivers = [
    { name: "Vijay Yadav", phone: "+91-9988776655" },
    { name: "Rajesh Paswan", phone: "+91-9988776656" },
    { name: "Amit Singh", phone: "+91-9988776657" },
    { name: "Sanjay Mahto", phone: "+91-9988776658" }
  ];

  hospitalDocs.forEach((hospital, hIdx) => {
    const count = Math.min(hospital.ambulanceSummary.available + 1, 3);
    for (let i = 0; i < count; i++) {
      const driverIdx = (hIdx * 2 + i) % drivers.length;
      const latOffset = (Math.random() - 0.5) * 0.015;
      const lngOffset = (Math.random() - 0.5) * 0.015;

      ambulances.push({
        vehicleNumber: `BR-UP-AM-${4000 + hIdx * 10 + i}`,
        type: i === 0 ? "ALS" : "BLS",
        hospitalId: hospital._id,
        driver: drivers[driverIdx],
        equipment: i === 0
          ? ["stretcher", "first_aid_kit", "oxygen", "defibrillator", "iv_kit"]
          : ["stretcher", "first_aid_kit", "oxygen"],
        currentLocation: {
          lat: hospital.location.lat + latOffset,
          lng: hospital.location.lng + lngOffset,
          lastUpdated: new Date(),
        },
        status: "available",
        isActive: true,
        operationalHours: { start: "00:00", end: "23:59", is24hr: true },
      });
    }
  });
  return ambulances;
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connecting to database cluster...");

    
    await Hospital.deleteMany({});
    await Ambulance.deleteMany({});
    console.log("Cleared existing collections.");

    
    const preparedHospitals = hospitals.map(hospital => {
      const normalizedSpecialists = hospital.specialties.map(s => {
        if (s === 'cardiology') return 'Cardiologist';
        if (s === 'neurology') return 'Neurologist';
        if (s === 'orthopedics') return 'Orthopedic';
        if (s === 'trauma') return 'Trauma Surgeon';
        return s.charAt(0).toUpperCase() + s.slice(1);
      });

      const generatedCapabilities = [];
      if (hospital.facilities.icu) generatedCapabilities.push("ICU");
      if (hospital.facilities.ventilator) generatedCapabilities.push("Ventilator");
      if (hospital.facilities.traumaCenter) generatedCapabilities.push("Trauma Ready");
      if (hospital.bloodBank?.isAvailable) generatedCapabilities.push("Blood Bank");

      return {
        ...hospital,
        specialists: normalizedSpecialists,
        capabilities: generatedCapabilities,
        isVerified: hospital.rating >= 4.2,
        geo: {
          type: "Point",
          coordinates: [hospital.location.lng, hospital.location.lat] 
        }
      };
    });

    const insertedHospitals = await Hospital.insertMany(preparedHospitals);
    console.log(`Loaded ${insertedHospitals.length} composite state-wide hospitals into database layout.`);

    
    await Hospital.collection.createIndex({ geo: "2dsphere" });
    console.log("Geospatial 2dsphere index built successfully!");

    const ambulanceData = generateAmbulances(insertedHospitals);
    await Ambulance.insertMany(ambulanceData);
    console.log(`Spawned and mapped ${ambulanceData.length} live tracking vehicles directly onto proximity index layers.`);

    console.log("\nProduction master seeding operation completed flawlessly!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding fatal failure:", error.message);
    process.exit(1);
  }
};

seed();



