const mongoose = require("mongoose");
const timelineEventSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
      enum: [
        "request_created",     
        "location_detected",    
        "hospitals_found",    
        "hospital_selected",    
        "ambulance_dispatched",
        "ambulance_arrived",    
        "patient_picked_up",    
        "arrived_at_hospital",  
        "resolved",             
        "cancelled",            
      ],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      trim: true,
     
    },
  },
  { _id: false }
);


const emergencyRequestSchema = new mongoose.Schema(
  {
   
    emergencyType: {
      type: String,
      required: [true, "Emergency type is required"],
      trim: true,
      lowercase: true,
     
    },

   
    severity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

  
    caller: {
      name: {
        type: String,
        trim: true,
        default: "Anonymous",
      },
      phone: {
        type: String,
        trim: true,
        
      },
      relationship: {
        type: String,
        trim: true,
        
        default: "unknown",
      },
    },

    
    situationDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      
    },

    
    userLocation: {
      lat: {
        type: Number,
        required: [true, "Emergency latitude is required"],
      },
      lng: {
        type: Number,
        required: [true, "Emergency longitude is required"],
      },
      address: {
        type: String,
        trim: true,
        
      },
      accuracy: {
        type: Number,
       
      },
      detectionMethod: {
        type: String,
        enum: ["gps", "ip_based", "manual"],
        default: "gps",
      },
    },

  
    algorithmsResult: {
      hospitalsConsidered: {
        type: Number,
        default: 0,
        
      },
      hospitalsFiltered: {
        type: Number,
        default: 0,
       
      },
      dijkstraRunTime: {
        type: Number,
       
      },
      topHospitals: [
        {
          hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
          },
          name: String,
          score: Number,      
          distance: Number,    
          eta: Number,        
          rank: Number,       
        },
      ],
    },

    
    hospitalAssigned: {
      hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        default: null,
      },
      name: String,
      distance: Number, 
      eta: Number,       
      assignedAt: Date,
    },

    
    ambulanceAssigned: {
      ambulanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ambulance",
        default: null,
      },
      vehicleNumber: String,
      driverName: String,
      driverPhone: String,
      distanceAtDispatch: Number, 
      etaAtDispatch: Number,      
      dispatchedAt: Date,
    },

 
    status: {
      type: String,
      enum: [
        "pending",     
        "active",     
        "resolved",    
        "cancelled",   
        "no_resource", 
      ],
      default: "pending",
    },

    
    timeline: {
      type: [timelineEventSchema],
      default: [],
    },

    
    metrics: {
      timeToHospitalFound: Number, 
      timeToDispatch: Number,       
      ambulanceResponseTime: Number, 
      totalResolutionTime: Number,   
    },

 
    deviceInfo: {
      userAgent: String,
      platform: String, 
      language: String,
    },
  },
  {
    timestamps: true,
   
  }
);

emergencyRequestSchema.index({ status: 1 });

emergencyRequestSchema.index({ emergencyType: 1 });

emergencyRequestSchema.index({ createdAt: -1 });

emergencyRequestSchema.index({ "hospitalAssigned.hospitalId": 1 });

emergencyRequestSchema.methods.addTimelineEvent = async function (
  event,
  note = ""
) {
  this.timeline.push({
    event,
    timestamp: new Date(),
    note,
  });
  await this.save();
};


emergencyRequestSchema.methods.resolve = async function () {
  const createdAt = this.createdAt;
  const now = new Date();

  this.status = "resolved";
  this.metrics.totalResolutionTime = Math.round(
    (now - createdAt) / 60000 
  );

  this.timeline.push({
    event: "resolved",
    timestamp: now,
    note: "Emergency successfully handled",
  });

  await this.save();
};
emergencyRequestSchema.statics.getActive = function () {
  return this.find({ status: "active" })
    .populate("hospitalAssigned.hospitalId", "name location contact")
    .populate("ambulanceAssigned.ambulanceId", "vehicleNumber currentLocation")
    .sort({ createdAt: -1 });
};


emergencyRequestSchema.statics.getSummary = async function (days = 7) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [total, resolved, byType] = await Promise.all([
    this.countDocuments({ createdAt: { $gte: since } }),
    this.countDocuments({ status: "resolved", createdAt: { $gte: since } }),
    this.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: "$emergencyType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return { total, resolved, pending: total - resolved, byType };
};

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);



