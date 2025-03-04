const mongoose = require("mongoose");
const ChargingStation = require("./model/stations"); // Adjust the path if needed

mongoose.connect("mongodb+srv://sathya:codevolt25@codevoltcluster.2wof2.mongodb.net/?retryWrites=true&w=majority&appName=codevoltcluster")
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log(err));


const sampleStations = [
    {
      stationId: "CS201",
      name: "Chennai EV Hub",
      location: { type: "Point", coordinates: [80.2707, 13.0827] },
      totalPumps: 6,
      availablePumps: 3,
      waitingListCount: 1,
      pricePerKV: 5.5,
      pumps: [
        { pumpId: "P201", status: "available" },
        { pumpId: "P202", status: "charging", userId: "65d2c02e4f15f8a7b7b6e501" },
        { pumpId: "P203", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e502", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P204", status: "available" },
        { pumpId: "P205", status: "charging", userId: "65d2c02e4f15f8a7b7b6e503" },
        { pumpId: "P206", status: "maintenance" }
      ]
    },
    {
      stationId: "CS202",
      name: "Guindy EV Station",
      location: { type: "Point", coordinates: [80.2209, 13.0106] },
      totalPumps: 5,
      availablePumps: 2,
      waitingListCount: 0,
      pricePerKV: 6.0,
      pumps: [
        { pumpId: "P207", status: "available" },
        { pumpId: "P208", status: "charging", userId: "65d2c02e4f15f8a7b7b6e504" },
        { pumpId: "P209", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e505", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P210", status: "available" },
        { pumpId: "P211", status: "available" }
      ]
    },
    {
      stationId: "CS203",
      name: "Velachery EV Plaza",
      location: { type: "Point", coordinates: [80.217, 12.9791] },
      totalPumps: 4,
      availablePumps: 1,
      waitingListCount: 2,
      pricePerKV: 5.8,
      pumps: [
        { pumpId: "P212", status: "charging", userId: "65d2c02e4f15f8a7b7b6e506" },
        { pumpId: "P213", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e507", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P214", status: "available" },
        { pumpId: "P215", status: "maintenance" }
      ]
    },
    {
      stationId: "CS204",
      name: "T. Nagar Charging Station",
      location: { type: "Point", coordinates: [80.2346, 13.0426] },
      totalPumps: 6,
      availablePumps: 3,
      waitingListCount: 1,
      pricePerKV: 6.2,
      pumps: [
        { pumpId: "P216", status: "available" },
        { pumpId: "P217", status: "charging", userId: "65d2c02e4f15f8a7b7b6e508" },
        { pumpId: "P218", status: "available" },
        { pumpId: "P219", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e509", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P220", status: "available" },
        { pumpId: "P221", status: "maintenance" }
      ]
    },
    {
      stationId: "CS205",
      name: "OMR EV Stop",
      location: { type: "Point", coordinates: [80.2433, 12.9072] },
      totalPumps: 5,
      availablePumps: 2,
      waitingListCount: 0,
      pricePerKV: 5.7,
      pumps: [
        { pumpId: "P222", status: "available" },
        { pumpId: "P223", status: "charging", userId: "65d2c02e4f15f8a7b7b6e510" },
        { pumpId: "P224", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e511", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P225", status: "available" },
        { pumpId: "P226", status: "available" }
      ]
    },
    {
      stationId: "CS206",
      name: "Anna Nagar Power Charge",
      location: { type: "Point", coordinates: [80.2134, 13.0844] },
      totalPumps: 6,
      availablePumps: 4,
      waitingListCount: 1,
      pricePerKV: 6.3,
      pumps: [
        { pumpId: "P227", status: "available" },
        { pumpId: "P228", status: "charging", userId: "65d2c02e4f15f8a7b7b6e512" },
        { pumpId: "P229", status: "available" },
        { pumpId: "P230", status: "available" },
        { pumpId: "P231", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e513", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P232", status: "maintenance" }
      ]
    },
    {
      stationId: "CS207",
      name: "Perungudi EV Stop",
      location: { type: "Point", coordinates: [80.2512, 12.9673] },
      totalPumps: 4,
      availablePumps: 2,
      waitingListCount: 1,
      pricePerKV: 5.9,
      pumps: [
        { pumpId: "P233", status: "available" },
        { pumpId: "P234", status: "charging", userId: "65d2c02e4f15f8a7b7b6e514" },
        { pumpId: "P235", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e515", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P236", status: "available" }
      ]
    },
    {
      stationId: "CS208",
      name: "Adyar FastCharge",
      location: { type: "Point", coordinates: [80.2604, 13.0052] },
      totalPumps: 3,
      availablePumps: 1,
      waitingListCount: 2,
      pricePerKV: 6.4,
      pumps: [
        { pumpId: "P237", status: "charging", userId: "65d2c02e4f15f8a7b7b6e516" },
        { pumpId: "P238", status: "reserved", userId: "65d2c02e4f15f8a7b7b6e517", reservedUntil: new Date(Date.now() + 5 * 60 * 1000) },
        { pumpId: "P239", status: "available" }
      ]
    },
    {
      stationId: "CS209",
      name: "Thoraipakkam EV Plaza",
      location: { type: "Point", coordinates: [80.2556, 12.9253] },
      totalPumps: 5,
      availablePumps: 3,
      waitingListCount: 0,
      pricePerKV: 5.6,
      pumps: [
        { pumpId: "P240", status: "available" },
        { pumpId: "P241", status: "charging", userId: "65d2c02e4f15f8a7b7b6e518" },
        { pumpId: "P242", status: "available" },
        { pumpId: "P243", status: "available" },
        { pumpId: "P244", status: "maintenance" }
      ]
    }
  ];
  
  console.log(JSON.stringify(sampleStations, null, 2));
  

// Insert data into MongoDB
const seedDB = async () => {
  await ChargingStation.deleteMany({}); // Clear existing data
  await ChargingStation.insertMany(sampleStations);
  console.log("Sample charging stations added!");
  mongoose.connection.close();
};

seedDB();
