
const mongoose = require("mongoose");

const emergencyTypeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Emergency type key is required"],
      unique: true,
      trim: true,
      lowercase: true,
      enum: [
        "cardiac",       
        "accident",      
        "burns",         
        "stroke",        
        "maternity",    
        "pediatric",     
        "respiratory",   
        "poisoning",    
        "fracture",     
        "psychiatric",  
      ],
    },

    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    icon: {
      type: String,
      default: "🚨",
      
    },

    color: {
      type: String,
      default: "#FF4444",
      
    },

       severity: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },

    requiredSpecialties: {
      type: [String],
      default: [],
    },
    preferredFacilities: {
      type: [String],
      default: [],  
    },

    firstAidSteps: {
      type: [String],
      default: [],
     
    },

    
    warningTime: {
      type: Number,
      default: 30,
      
    },

    
    keywords: {
      type: [String],
      default: [],
      
    },

    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

emergencyTypeSchema.index({ type: 1 }, { unique: true });
emergencyTypeSchema.index({ severity: 1 });
emergencyTypeSchema.index({ isActive: 1 });


emergencyTypeSchema.statics.seedDefaults = async function () {
  const count = await this.countDocuments();
  if (count > 0) {
    console.log("EmergencyType collection already seeded.");
    return;
  }

  const defaults = [
    {
      type: "cardiac",
      label: "Heart Attack",
      description: "Blockage of blood flow to the heart muscle",
      icon: "❤️",
      color: "#FF0000",
      severity: 1,
      requiredSpecialties: ["cardiology"],
      preferredFacilities: ["icu", "ventilator"],
      warningTime: 10,
      keywords: [
        "chest pain", "heart attack", "cardiac arrest",
        "not breathing", "unconscious", "heart pain",
        "left arm pain", "shortness of breath"
      ],
      firstAidSteps: [
        "Call 108 immediately — do this first",
        "Make the patient sit or lie down in a comfortable position",
        "Loosen tight clothing around chest, neck, and waist",
        "If patient is conscious, give 300-325mg aspirin (not for children)",
        "If patient becomes unconscious, check for breathing",
        "If not breathing, start CPR: 30 chest compressions then 2 rescue breaths",
        "Do NOT give food, water, or any other medication",
        "Stay with the patient and keep them calm",
        "Open windows for fresh air — do not crowd around patient"
      ],
    },
    {
      type: "accident",
      label: "Road Accident",
      description: "Trauma from vehicle collision or fall",
      icon: "🚗",
      color: "#FF6600",
      severity: 1,
      requiredSpecialties: ["trauma"],
      preferredFacilities: ["operationTheater", "bloodBank", "icu"],
      warningTime: 15,
      keywords: [
        "accident", "road accident", "crash", "collision",
        "fell down", "bleeding", "broken bone", "fracture",
        "head injury", "spine injury"
      ],
      firstAidSteps: [
        "Call 108 and police (100) immediately",
        "Do NOT move the patient unless there is immediate danger (fire/traffic)",
        "Moving a spine-injured patient can cause paralysis",
        "Control heavy bleeding by pressing clean cloth firmly on wound",
        "Do not remove any object stuck in the wound — press around it",
        "Keep the patient warm with a blanket if available",
        "Talk to the patient constantly to keep them conscious",
        "Do NOT give anything to eat or drink",
        "If patient is in car and conscious — leave them there until help arrives"
      ],
    },
    {
      type: "burns",
      label: "Burns",
      description: "Thermal, chemical, or electrical burns",
      icon: "🔥",
      color: "#FF4500",
      severity: 2,
      requiredSpecialties: ["burns"],
      preferredFacilities: ["burnUnit", "icu"],
      warningTime: 20,
      keywords: [
        "burns", "fire", "burnt", "skin burn", "chemical burn",
        "electric shock", "scalded", "hot water burn"
      ],
      firstAidSteps: [
        "Remove from source of burn immediately — turn off electricity first for electric burns",
        "Run cool (not cold/ice) water over the burn for 10-20 minutes",
        "Do NOT use ice, butter, toothpaste, or any home remedy on burns",
        "Remove jewelry, watches, belts near the burn area gently",
        "Do NOT remove burnt clothing stuck to skin",
        "Cover loosely with a clean dry bandage or cloth",
        "For chemical burns — rinse with large amounts of water for 20 minutes",
        "Do not break any blisters that form",
        "Call 108 for burns larger than your palm or burns on face/hands/genitals"
      ],
    },
    {
      type: "stroke",
      label: "Brain Stroke",
      description: "Sudden interruption of blood supply to brain",
      icon: "🧠",
      color: "#8B0000",
      severity: 1,
      requiredSpecialties: ["neurology"],
      preferredFacilities: ["ctScan", "mri", "icu"],
      warningTime: 10,
      keywords: [
        "stroke", "brain stroke", "paralysis", "face drooping",
        "sudden weakness", "slurred speech", "severe headache",
        "vision loss", "confusion", "arm weakness"
      ],
      firstAidSteps: [
        "Use FAST test: Face drooping? Arm weakness? Speech slurred? Time to call 108",
        "Call 108 immediately — stroke treatment must begin within 4.5 hours",
        "Do NOT give aspirin (different from heart attack — do not self-medicate)",
        "Lay patient on side if unconscious to prevent choking",
        "Do not give food or water — they may not be able to swallow",
        "Note the exact time symptoms started — tell the doctor immediately",
        "Keep patient calm and still — do not let them walk around",
        "Loosen tight clothing around neck"
      ],
    },
    {
      type: "maternity",
      label: "Maternity Emergency",
      description: "Labor, pregnancy complication, or delivery emergency",
      icon: "🤰",
      color: "#FF69B4",
      severity: 2,
      requiredSpecialties: ["maternity"],
      preferredFacilities: ["nicu", "operationTheater"],
      warningTime: 20,
      keywords: [
        "labor", "delivery", "pregnant", "water broke",
        "contractions", "bleeding during pregnancy",
        "baby coming", "premature birth"
      ],
      firstAidSteps: [
        "Call 108 immediately",
        "Help the mother lie down on her left side — reduces pressure on blood vessels",
        "Do NOT let her push if delivery is not imminent",
        "Time contractions — note frequency and duration",
        "If birth is happening: help mother breathe — pant, pant, blow",
        "Keep the area clean and warm",
        "If baby is born before ambulance arrives — keep baby warm on mother's chest",
        "Do NOT cut the umbilical cord — wait for medical help",
        "If heavy bleeding — press clean cloth on area"
      ],
    },
    {
      type: "pediatric",
      label: "Child Emergency",
      description: "Severe illness or injury in children under 12",
      icon: "👶",
      color: "#FF8C00",
      severity: 2,
      requiredSpecialties: ["pediatrics"],
      preferredFacilities: ["nicu", "pediatric"],
      warningTime: 15,
      keywords: [
        "child emergency", "baby sick", "child unconscious",
        "choking child", "seizure child", "infant not breathing",
        "high fever child", "convulsion baby"
      ],
      firstAidSteps: [
        "Call 108 immediately",
        "If child is choking: for infant — 5 back blows + 5 chest thrusts",
        "If child is choking: for older child — Heimlich maneuver",
        "If child is unconscious and not breathing — start child CPR",
        "Child CPR: 30 compressions (2 fingers for infants, 1 hand for children)",
        "Do not give aspirin to children — use paracetamol only if conscious",
        "For high fever — cool cloth on forehead, do not over-bundle",
        "For seizures — clear area, lay child on side, do not restrain",
        "Note when seizure started — tell doctor the duration"
      ],
    },
    {
      type: "respiratory",
      label: "Breathing Difficulty",
      description: "Asthma attack, choking, or severe breathing trouble",
      icon: "🫁",
      color: "#4169E1",
      severity: 2,
      requiredSpecialties: ["pulmonology"],
      preferredFacilities: ["ventilator", "icu"],
      warningTime: 10,
      keywords: [
        "breathing difficulty", "can't breathe", "choking",
        "asthma attack", "wheezing", "breathless",
        "inhaler", "suffocating", "throat swelling"
      ],
      firstAidSteps: [
        "Call 108 immediately if severe",
        "Help patient sit upright — leaning forward slightly helps breathing",
        "Do NOT lay them flat — this makes breathing harder",
        "If patient has an inhaler — help them use it (2 puffs)",
        "Loosen tight clothing around neck and chest",
        "Open windows for fresh air",
        "Stay calm and reassure patient — panic worsens breathing",
        "If patient becomes unconscious — start CPR immediately",
        "Do not leave the patient alone"
      ],
    },
    {
      type: "poisoning",
      label: "Poisoning / Overdose",
      description: "Chemical poisoning, drug overdose, or toxic substance",
      icon: "☠️",
      color: "#228B22",
      severity: 2,
      requiredSpecialties: ["gastroenterology"],
      preferredFacilities: ["icu", "dialysis"],
      warningTime: 15,
      keywords: [
        "poisoning", "overdose", "swallowed chemical",
        "drug overdose", "insecticide", "rat poison",
        "alcohol poisoning", "food poisoning severe"
      ],
      firstAidSteps: [
        "Call 108 AND Poison Control immediately",
        "Do NOT induce vomiting unless specifically told to by Poison Control",
        "If chemical is on skin — rinse with water for 20 minutes",
        "If chemical is in eyes — rinse with clean water for 15-20 minutes",
        "Note what was swallowed, when, and how much — tell the doctor",
        "Bring the container/packet of the substance to hospital",
        "If patient is unconscious — place on side (recovery position)",
        "Do not give milk, water, or any antidote without expert advice"
      ],
    },
    {
      type: "fracture",
      label: "Fracture / Bone Break",
      description: "Broken or suspected broken bones from injury",
      icon: "🦴",
      color: "#DAA520",
      severity: 3,
      requiredSpecialties: ["orthopedics"],
      preferredFacilities: ["xray", "operationTheater"],
      warningTime: 60,
      keywords: [
        "fracture", "broken bone", "bone break", "dislocated",
        "can't move arm", "can't move leg", "swollen joint",
        "bone sticking out"
      ],
      firstAidSteps: [
        "Do NOT try to straighten the broken bone",
        "Immobilize the injured area using a makeshift splint (ruler, board, rolled magazine)",
        "Pad the splint with cloth for comfort — tie above and below fracture, not on it",
        "Apply ice pack wrapped in cloth to reduce swelling (not directly on skin)",
        "If bone is visible through skin — cover with clean cloth, do not push bone back",
        "Elevate the injured limb above heart level if possible",
        "Watch for signs of shock: pale skin, rapid breathing, dizziness",
        "Do not give food or water — surgery may be needed"
      ],
    },
    {
      type: "psychiatric",
      label: "Mental Health Crisis",
      description: "Severe psychiatric episode, suicidal situation, or psychosis",
      icon: "🧘",
      color: "#6A0DAD",
      severity: 3,
      requiredSpecialties: ["psychiatry"],
      preferredFacilities: ["icu"],
      warningTime: 30,
      keywords: [
        "mental health crisis", "suicide attempt", "self harm",
        "psychosis", "violent behavior", "schizophrenia episode",
        "panic attack severe", "overdose intentional"
      ],
      firstAidSteps: [
        "Call 108 or NIMHANS helpline: 080-46110007",
        "Stay calm — do not argue, shout, or restrain unless safety is at risk",
        "Remove dangerous objects from the area quietly",
        "Speak in a slow, calm, reassuring voice",
        "Do not leave the person alone if they are at risk of harm",
        "Listen without judgment — let them speak",
        "If they have taken something harmful — treat as poisoning and call 108",
        "Do not promise to keep self-harm secrets — getting help is more important"
      ],
    },
  ];

  await this.insertMany(defaults);
  console.log(`EmergencyType collection seeded with ${defaults.length} types.`);
};

module.exports = mongoose.model("EmergencyType", emergencyTypeSchema);
