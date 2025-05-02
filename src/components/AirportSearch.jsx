import React, { useState } from "react";
import AirportSearchInput from "./AirportSearchInput";

export default function App() {
  const [source, setSource] = useState(null); // { lat, lon, icao, ... }
  const [destination, setDestination] = useState(null);

  return (
    <div>
      <h2>Select Airports</h2>
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
      <div>
        <h3>Selected:</h3>
        <div>
          <b>Source:</b>{" "}
          {source ? `[${source.lat}, ${source.lon}] (${source.name})` : "None"}
        </div>
        <div>
          <b>Destination:</b>{" "}
          {destination
            ? `[${destination.lat}, ${destination.lon}] (${destination.name})`
            : "None"}
        </div>
      </div>
    </div>
  );
}
