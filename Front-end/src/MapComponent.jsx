import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Button, Spinner, Card, Modal } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";

const socket = io("http://localhost:3001"); 

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [40, 40],
});

const stationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
});

// adaiyar [13.0012 ,80.2565]°

const ChargingStationMap = () => {
  const [stations, setStations] = useState([]);
  const [userLocation, setUserLocation] = useState([13.0012 ,80.2565]);
  const [loading, setLoading] = useState(true);
  const [bookedPump, setBookedPump] = useState(null);
  const [timer, setTimer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPump, setSelectedPump] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        fetchStations(latitude, longitude);
      },
      () => {
        // toast.error("Location access blocked. Using default location.");
        fetchStations(13.018, 80.2411);
      }
    );
  }, []);

  const fetchStations = (lat, lng) => {
    socket.emit("getStations", { lat, lng });
  };

  useEffect(() => {
    socket.on("stationsData", (data) => {
      setStations(data);
      setLoading(false);
    });

    socket.on("updatePumpStatus", ({ stationId, pumpId, status }) => {
      setStations((prevStations) =>
        prevStations.map((station) =>
          station._id === stationId
            ? {
                ...station,
                pumps: station.pumps.map((pump) =>
                  pump.pumpId === pumpId ? { ...pump, status } : pump
                ),
              }
            : station
        )
      );
    });

    return () => {
      socket.off("stationsData");
      socket.off("updatePumpStatus");
    };
  }, [stations]);

  // Open modal before booking
  const confirmBooking = (stationId, pumpId) => {
    setSelectedPump({ stationId, pumpId });
    setShowModal(true);
  };

  // Book pump after confirmation
  const bookPump = () => {
    if (!selectedPump) return;

    const { stationId, pumpId } = selectedPump;
    socket.emit("bookPump", { stationId, pumpId });

    toast.success("Pump booked! Reach within 5 minutes.");
    setBookedPump({ stationId, pumpId });
    setShowModal(false);

    if (timer) clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        setBookedPump(null);
        socket.emit("releasePump", { stationId, pumpId });
        toast.error("Time expired! Booking released.");
      }, 5 * 60 * 1000)
    );
  };

  return (
    <div className="d-flex vh-100">
      <Toaster position="top-center" />

      {/* Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Booking</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to book this pump?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={bookPump}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Map Section */}
      <div className="flex-grow-1 position-relative">
        <h3 className="text-center text-white py-2 bg-primary">
          EV Charging Map
        </h3>
        <div className="map-container">
          <MapContainer center={userLocation} zoom={14} className="custom-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* User Location Marker */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <strong>Your Location</strong>
              </Popup>
            </Marker>

            {/* Charging Stations Markers */}
            {stations.map((station) => (
              <Marker
                key={station._id}
                position={[...station.location.coordinates].reverse()}
                icon={stationIcon}
              >
                <Popup>
                  <h6 className="mb-1">{station.name}</h6>
                  <p className="small">
                    🟢 Available: {station.availablePumps}/{station.totalPumps}
                    <br />
                    💰 Price: ${station.pricePerKV}/kWh
                  </p>
                  <hr />
                  {station.pumps.map((pump) => (
                    <div key={pump.pumpId} className="mb-2">
                      <span>
                        Pump {pump.pumpId} - <b>{pump.status}</b>
                      </span>
                      {pump.status === "available" && (
                        <Button
                          variant="success"
                          size="sm"
                          className="ms-2"
                          onClick={() => confirmBooking(station._id, pump.pumpId)}
                        >
                          Book
                        </Button>
                      )}
                    </div>
                  ))}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">
        <h3 className="text-center text-primary">Charging Stations</h3>

        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        ) : (
          stations.map((station) => (
            <Card key={station._id} className="mb-3 shadow-lg">
              <Card.Body>
                <Card.Title className="text-success">{station.name}</Card.Title>
                <Card.Text className="text-muted small">
                  📍 Location: {station.location.coordinates.join(", ")}
                  <br />
                  🔋 Available Pumps: {station.availablePumps}/
                  {station.totalPumps}
                  <br />
                  💰 Price: ${station.pricePerKV} per kWh
                </Card.Text>
                <h6>Pumps:</h6>
                <ul className="list-group list-group-flush">
                  {station.pumps.map((pump) => (
                    <li
                      key={pump.pumpId}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>
                        Pump {pump.pumpId} - <b>{pump.status}</b>
                      </span>
                      {pump.status === "available" && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => confirmBooking(station._id, pump.pumpId)}
                        >
                          Book
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      {/* Custom CSS */}
      <style>
        {`
        .custom-map {
          height: 80vh;
          border-radius: 15px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
        }

        .sidebar {
          width: 350px;
          padding: 20px;
          background: #f8f9fa;
          border-left: 3px solid #007bff;
          overflow-y: auto;
        }
        `}
      </style>
    </div>
  );
};

export default ChargingStationMap;
