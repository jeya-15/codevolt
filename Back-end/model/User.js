const { v4: uuidv4 } = require("uuid");

const UserSchema = new mongoose.Schema({
  vehicleId: { type: String, default: uuidv4, unique: true }, 
  vehicleModel: { type: String, required: true },
  batteryCapacity: { type: Number, required: true },
  rangePerCharge: { type: Number, required: true },
  priorityUser: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model("User", UserSchema);