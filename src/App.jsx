import "./App.css";
import SunPositionFlightMap from "./components/SunPositionFlightMap";
import AirportSearchInput from "./components/AirportSearchInput";
import React, { useState } from "react";

export default function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureTime, setDepartureTime] = useState("");
  const [flightDuration, setFlightDuration] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate inputs
    if (!source || !destination || !departureTime || !flightDuration) {
      alert("Please fill in all fields");
      return;
    }
  };

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
            <label>
              Flight Duration (minutes):
              <input
                type="number"
                value={flightDuration}
                onChange={(e) => setFlightDuration(e.target.value)}
                min="1"
                style={{ marginLeft: "10px" }}
              />
            </label>
          </div>
        </form>

        {source && destination && departureTime && flightDuration && (
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
              <b>Duration:</b> {flightDuration} minutes
            </div>
          </div>
        )}
      </div>

      {source && destination && departureTime && flightDuration && (
        <div style={{ marginTop: "20px" }}>
          <SunPositionFlightMap
            source={[source.lat, source.lon]}
            destination={[destination.lat, destination.lon]}
            departureTime={new Date(departureTime)}
            flightDuration={parseInt(flightDuration)}
          />
        </div>
      )}
    </div>
  );
}
