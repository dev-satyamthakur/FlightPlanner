import "./App.css";
import SunPositionFlightMap from "./components/SunPositionFlightMap";
import AirportSearchInput from "./components/AirportSearchInput";
import React, { useState } from "react";

export default function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureTime, setDepartureTime] = useState("");
  const [flightHours, setFlightHours] = useState("");
  const [flightMinutes, setFlightMinutes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate inputs
    if (
      !source ||
      !destination ||
      !departureTime ||
      (!flightHours && !flightMinutes)
    ) {
      alert("Please fill in all fields");
      return;
    }
  };

  // Calculate total minutes for the SunPositionFlightMap
  const totalFlightDuration =
    parseInt(flightHours || "0") * 60 + parseInt(flightMinutes || "0");

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "20px" }}>Plan Your Flight</h2>
        <form onSubmit={handleSubmit}>
          <AirportSearchInput
            label="Source Airport"
            onSelect={(airport) => setSource(airport)}
            excludeIcao={destination?.icao}
          />
          <AirportSearchInput
            label="Destination Airport"
            onSelect={(airport) => setDestination(airport)}
            excludeIcao={source?.icao}
          />
          <div style={{ marginTop: "20px" }}>
            <label>
              Departure Time:
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </label>
          </div>
          <div style={{ marginTop: "20px" }}>
            <label>Flight Duration:</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              <div>
                <input
                  type="number"
                  value={flightHours}
                  onChange={(e) => setFlightHours(e.target.value)}
                  min="0"
                  style={{ width: "80px" }}
                />
                <span style={{ marginLeft: "5px" }}>hours</span>
              </div>
              <div>
                <input
                  type="number"
                  value={flightMinutes}
                  onChange={(e) => setFlightMinutes(e.target.value)}
                  min="0"
                  max="59"
                  style={{ width: "80px" }}
                />
                <span style={{ marginLeft: "5px" }}>minutes</span>
              </div>
            </div>
          </div>
        </form>

        {source && destination && departureTime && totalFlightDuration > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3>Selected Flight Details:</h3>
            <div style={{ marginBottom: "10px" }}>
              <b>Source:</b> {source.name} ({source.icao})
              <br />
              Coordinates: [{source.lat}, {source.lon}]
            </div>
            <div>
              <b>Destination:</b> {destination.name} ({destination.icao})
              <br />
              Coordinates: [{destination.lat}, {destination.lon}]
            </div>
            <div>
              <b>Departure:</b> {new Date(departureTime).toLocaleString()}
              <br />
              <b>Duration:</b> {flightHours ? `${flightHours} hours ` : ""}
              {flightMinutes ? `${flightMinutes} minutes` : ""}
            </div>
          </div>
        )}
      </div>

      {source && destination && departureTime && totalFlightDuration > 0 && (
        <div style={{ marginTop: "20px" }}>
          <SunPositionFlightMap
            source={[source.lat, source.lon]}
            destination={[destination.lat, destination.lon]}
            departureTime={new Date(departureTime)}
            flightDuration={totalFlightDuration}
          />
        </div>
      )}
    </div>
  );
}
