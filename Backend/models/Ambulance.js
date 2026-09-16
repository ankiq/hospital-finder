
const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    
    vehicleNumber: {
      type: String,
      required: [true, "Vehicle number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      
    },
    type: {
      type: String,
      enum: [
        "BLS",   
        "ALS",   
        "NICU",  
        "air",  
      ],
      default: "BLS",
    },

  
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: [true, "Hospital reference is required"],
    },

  
    driver: {
      name: {
        type: String,
        required: [true, "Driver name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Driver phone is required"],
        trim: true,
        
      },
      licenseNumber: {
        type: String,
        trim: true,
        uppercase: true,
      },
    },

    

   
    equipment: {
      type: [String],
      default: ["stretcher", "first_aid_kit", "oxygen"],
    
    },

  
    currentLocation: {
      lat: {
        type: Number,
        required: [true, "Current latitude is required"],
        min: -90,
        max: 90,
      },
      lng: {
        type: Number,
        required: [true, "Current longitude is required"],
        min: -180,
        max: 180,
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
        
      },
    },

    
    status: {
      type: String,
      enum: [
        "available",    
        "dispatched",   
        "at_scene",     
        "transporting", 
        "returning",    
        "maintenance",  
        "offline",      
      ],
      default: "available",
    },

  
    currentRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmergencyRequest",
      default: null,
    },

    
    dispatchedTo: {
      userLocation: {
        lat: Number,
        lng: Number,
        address: String,
      },
      dispatchedAt: Date,
      estimatedArrival: Date, 
    },

    
    operationalHours: {
      start: { type: String, default: "00:00" }, 
      end: { type: String, default: "23:59" },
      is24hr: { type: Boolean, default: true },
    },

   
    isActive: {
      type: Boolean,
      default: true,
    },

    
    stats: {
      totalDispatches: { type: Number, default: 0 },
      totalKmCovered: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);


ambulanceSchema.index({ status: 1 });
ambulanceSchema.index({ hospitalId: 1 });

ambulanceSchema.index({ currentLocation: "2dsphere" });



ambulanceSchema.methods.distanceTo = function (targetLat, targetLng) {
  const R = 6371; 
  const dLat = ((targetLat - this.currentLocation.lat) * Math.PI) / 180;
  const dLng = ((targetLng - this.currentLocation.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((this.currentLocation.lat * Math.PI) / 180) *
      Math.cos((targetLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2)); 
};


ambulanceSchema.methods.dispatch = async function (
  requestId,
  userLat,
  userLng,
  userAddress,
  etaMinutes
) {
  this.status = "dispatched";
  this.currentRequest = requestId;
  this.dispatchedTo = {
    userLocation: { lat: userLat, lng: userLng, address: userAddress },
    dispatchedAt: new Date(),
    estimatedArrival: new Date(Date.now() + etaMinutes * 60 * 1000),
  };
  this.stats.totalDispatches += 1;
  await this.save();
};


ambulanceSchema.methods.returnToBase = async function () {
  this.status = "available";
  this.currentRequest = null;
  this.dispatchedTo = undefined;
  await this.save();
};


ambulanceSchema.statics.findNearest = async function (
  userLat,
  userLng,
  emergencyType = null
) {
  
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const query = { 
    status: "available", 
    isActive: true,
    "currentLocation.lastUpdated": { $gte: tenMinutesAgo } // Only fresh pings!
  };

  if (emergencyType === "pediatric") {
    query.type = { $in: ["ALS", "NICU"] };
  } else if (emergencyType === "cardiac" || emergencyType === "stroke") {
    query.type = { $in: ["ALS"] };
  }

  const ambulances = await this.find(query);

  if (ambulances.length === 0) return null;
  
  let nearest = ambulances[0];
  let minDistance = ambulances[0].distanceTo(userLat, userLng);

  for (let i = 1; i < ambulances.length; i++) {
    const dist = ambulances[i].distanceTo(userLat, userLng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = ambulances[i];
    }
  }

  return { ambulance: nearest, distance: minDistance };
};

module.exports = mongoose.model("Ambulance", ambulanceSchema);
