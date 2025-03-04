const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const ChargingStation = require("./model/stations");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });


mongoose
  .connect(
    "mongodb+srv://sathya:codevolt25@codevoltcluster.2wof2.mongodb.net/?retryWrites=true&w=majority&appName=codevoltcluster"
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Fetch nearby charging stations aroun 5 km

  socket.on("getStations", async ({ lat, lng }) => {
    console.log(`Fetching stations near: ${lat}, ${lng}`);
    try {
      const stations = await ChargingStation.find({
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: 5000, 
          },
        },
      });

      socket.emit("stationsData", stations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      socket.emit("error", { message: "Failed to fetch stations" });
    }
  });

  //Booking pump 

  socket.on("bookPump", async ({ stationId, pumpId, userId }) => {
    console.log(`Booking pump ${pumpId} at station ${stationId}`);

    try {
      const station = await ChargingStation.findById(stationId);
      if (!station) return socket.emit("error", { message: "Station not found" });

      const pump = station.pumps.find((p) => p.pumpId === pumpId);
      if (!pump) return socket.emit("error", { message: "Pump not found" });

      if (pump.status !== "available") {
        return socket.emit("error", { message: "Pump already booked" });
      }

      pump.status = "reserved";
      pump.userId = userId;
      pump.reservedUntil = new Date(Date.now() + 5 * 60000);
      station.markModified("pumps");
      await station.save();

      io.emit("updatePumpStatus", { stationId, pumpId, status: "reserved" });
      console.log(`Pump ${pumpId} reserved`);
  
    //   booking relaese
      
      setTimeout(async () => {
        const updatedStation = await ChargingStation.findById(stationId);
        if (!updatedStation) return;

        const updatedPump = updatedStation.pumps.find((p) => p.pumpId === pumpId);
        if (updatedPump && updatedPump.status === "reserved") {
          updatedPump.status = "available";
          updatedPump.userId = null;
          updatedPump.reservedUntil = null;
          updatedStation.markModified("pumps");
          await updatedStation.save();

          io.emit("updatePumpStatus", { stationId, pumpId, status: "available" });
          console.log(`Pump ${pumpId} auto-released`);
        }
      }, 5 * 60000);

      socket.emit("success", { message: "Pump reserved successfully!" });
    } catch (error) {
      console.error("Error booking pump:", error);
      socket.emit("error", { message: "Booking failed" });
    }
  });

  // Start Charging
  socket.on("startCharging", async ({ stationId, pumpId, userId }) => {
    try {
      const station = await ChargingStation.findById(stationId);
      if (!station) return socket.emit("error", { message: "Station not found" });

      const pump = station.pumps.find((p) => p.pumpId === pumpId);
      if (!pump) return socket.emit("error", { message: "Pump not found" });

      if (pump.status !== "reserved" || pump.userId !== userId) {
        return socket.emit("error", { message: "Unauthorized access!" });
      }

      pump.status = "charging";
      pump.reservedUntil = null;
      station.markModified("pumps");
      await station.save();

      io.emit("updatePumpStatus", { stationId, pumpId, status: "charging" });

      socket.emit("success", { message: "Charging started successfully!" });
    } catch (error) {
      console.error("Error starting charging:", error);
      socket.emit("error", { message: "Failed to start charging" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
