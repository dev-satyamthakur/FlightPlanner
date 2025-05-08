import React, { useState } from "react";
import AirportSearchInput from "./AirportSearchInput";

export default function FlightDetailsForm({ onSubmit }) {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureTime, setDepartureTime] = useState("");
  const [flightHours, setFlightHours] = useState("");
  const [flightMinutes, setFlightMinutes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !source ||
      !destination ||
      !departureTime ||
      (!flightHours && !flightMinutes)
    ) {
      alert("Please fill in all fields");
      return;
    }
    onSubmit({
      source,
      destination,
      departureTime,
      flightHours,
      flightMinutes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Departure Time
        </label>
        <input
          type="datetime-local"
          value={departureTime}
          onChange={(e) => setDepartureTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Flight Duration
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              value={flightHours}
              onChange={(e) => setFlightHours(e.target.value)}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Hours"
            />
          </div>
          <div className="flex-1">
            <input
              type="number"
              value={flightMinutes}
              onChange={(e) => setFlightMinutes(e.target.value)}
              min="0"
              max="59"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Minutes"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
