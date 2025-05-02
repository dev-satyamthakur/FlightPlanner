import "./App.css";
import MapComponent from "./MapComponent";
import FlightMap from "./FlighMap";
import AirportSearch from "./components/AirportSearch";
import React, { useState } from "react";
import AirportSearchInput from "./components/AirportSearchInput";

export default function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "20px" }}>Select Airports</h2>
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

        {source && destination && (
          <div style={{ marginTop: "20px" }}>
            <h3>Selected Airports:</h3>
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
          </div>
        )}
      </div>

      {source && destination && (
        <div style={{ marginTop: "20px" }}>
          <FlightMap
            source={[source.lat, source.lon]}
            destination={[destination.lat, destination.lon]}
          />
        </div>
      )}
    </div>
  );
}
