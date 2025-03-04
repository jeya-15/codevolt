// models/ChargingStation.js
const mongoose = require("mongoose");

const PumpSchema = new mongoose.Schema({
  pumpId: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["available", "reserved", "charging", "maintenance"],
    default: "available",
  },
  reservedUntil: { type: Date, default: null }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
});



const ChargingStationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  totalPumps: { type: Number, required: true },
  availablePumps: { type: Number, required: true },
  waitingListCount: { type: Number, default: 0 },
  pricePerKV: { type: Number, required: true },
  pumps: [PumpSchema],
});


ChargingStationSchema.index({ location: "2dsphere" });

ChargingStationSchema.pre("save", function (next) {
  this.availablePumps = this.pumps.filter(
    (pump) => pump.status === "available"
  ).length;
  next();
});

const ChargingStation = mongoose.model(
  "ChargingStation",
  ChargingStationSchema
);
module.exports = ChargingStation;
