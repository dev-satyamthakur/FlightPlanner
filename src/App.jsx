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

  const totalFlightDuration =
    parseInt(flightHours || "0") * 60 + parseInt(flightMinutes || "0");

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Panel - Flight Details (3/12 = 25%) */}
      <div className="w-3/12 h-full bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Plan Your Flight</h2>
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

        {source && destination && departureTime && totalFlightDuration > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Flight Details</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Source</p>
                <p>
                  {source.name} ({source.icao})
                </p>
                <p className="text-sm text-gray-600">
                  Coordinates: [{source.lat}, {source.lon}]
                </p>
              </div>
              <div>
                <p className="font-medium">Destination</p>
                <p>
                  {destination.name} ({destination.icao})
                </p>
                <p className="text-sm text-gray-600">
                  Coordinates: [{destination.lat}, {destination.lon}]
                </p>
              </div>
              <div>
                <p className="font-medium">Departure</p>
                <p>{new Date(departureTime).toLocaleString()}</p>
                <p className="font-medium">Duration</p>
                <p>
                  {flightHours ? `${flightHours} hours ` : ""}
                  {flightMinutes ? `${flightMinutes} minutes` : ""}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Middle Panel - Map (6/12 = 50%) */}
      <div className="w-6/12 h-full">
        {source && destination && departureTime && totalFlightDuration > 0 ? (
          <SunPositionFlightMap
            source={[source.lat, source.lon]}
            destination={[destination.lat, destination.lon]}
            departureTime={new Date(departureTime)}
            flightDuration={totalFlightDuration}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 text-lg">
              Enter flight details to view the map
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Tips and Recommendations (3/12 = 25%) */}
      <div className="w-3/12 h-full bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Flight Tips</h2>
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Seat Recommendation</h3>
            {source &&
            destination &&
            departureTime &&
            totalFlightDuration > 0 ? (
              <div className="seat-recommendation-content" />
            ) : (
              <p className="text-gray-500">
                Enter flight details to get seat recommendations
              </p>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">General Tips</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Window seats offer the best views of sunrise/sunset</li>
              <li>Consider the season when choosing your seat</li>
              <li>Flight direction affects sun position</li>
              <li>Morning and evening flights often offer better views</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
