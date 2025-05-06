import "./App.css";
import SunPositionFlightMap from "./components/SunPositionFlightMap";
import AirportSearchInput from "./components/AirportSearchInput";
import React, { useState, useEffect } from "react";
import {
  calculateSunViewingWindows,
  getLocationName,
} from "./utils/sunTimingCalculator";
import GlobeApp from "./components/Globe";

export default function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureTime, setDepartureTime] = useState("");
  const [flightHours, setFlightHours] = useState("");
  const [flightMinutes, setFlightMinutes] = useState("");
  const [viewingWindows, setViewingWindows] = useState(null);
  const [locationNames, setLocationNames] = useState({
    sunrise: { start: null, end: null },
    sunset: { start: null, end: null },
  });

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

  useEffect(() => {
    if (source && destination && departureTime && totalFlightDuration > 0) {
      const windows = calculateSunViewingWindows(
        [source.lat, source.lon],
        [destination.lat, destination.lon],
        new Date(departureTime),
        totalFlightDuration
      );
      setViewingWindows(windows);

      const fetchLocationNames = async () => {
        const names = {
          sunrise: { start: null, end: null },
          sunset: { start: null, end: null },
        };

        if (windows.sunrise.start) {
          names.sunrise.start = await getLocationName(
            windows.sunrise.start.position.lat,
            windows.sunrise.start.position.lon
          );
          names.sunrise.end = await getLocationName(
            windows.sunrise.end.position.lat,
            windows.sunrise.end.position.lon
          );
        }

        if (windows.sunset.start) {
          names.sunset.start = await getLocationName(
            windows.sunset.start.position.lat,
            windows.sunset.start.position.lon
          );
          names.sunset.end = await getLocationName(
            windows.sunset.end.position.lat,
            windows.sunset.end.position.lon
          );
        }

        setLocationNames(names);
      };

      fetchLocationNames();
    }
  }, [source, destination, departureTime, totalFlightDuration]);

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

      {/* Middle Panel - Globe (6/12 = 50%) */}
      <div className="w-6/12 h-full relative">
        {source && destination && departureTime && totalFlightDuration > 0 ? (
          <div className="absolute inset-0">
            <GlobeApp
              pointA={{ 
                lat: source.lat, 
                lon: source.lon,
                name: source.name || `${source.lat.toFixed(2)}, ${source.lon.toFixed(2)}`
              }}
              pointB={{ 
                lat: destination.lat, 
                lon: destination.lon,
                name: destination.name || `${destination.lat.toFixed(2)}, ${destination.lon.toFixed(2)}`
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 text-lg">
              Enter flight details to view the globe
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Tips and Recommendations (3/12 = 25%) */}
      <div className="w-3/12 h-full bg-gray-50 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Flight Tips</h2>
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">
              Viewing Opportunities
            </h3>
            {source &&
            destination &&
            departureTime &&
            totalFlightDuration > 0 ? (
              <div className="space-y-4">
                {viewingWindows ? (
                  <>
                    {viewingWindows.sunrise.start && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <h4 className="text-lg font-medium text-orange-700 mb-2">
                          Sunrise Viewing Window
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Starts:</span>{" "}
                            {viewingWindows.sunrise.start.time}
                            {locationNames.sunrise.start && (
                              <span className="block text-orange-600 text-xs">
                                Near {locationNames.sunrise.start}
                              </span>
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Ends:</span>{" "}
                            {viewingWindows.sunrise.end.time}
                            {locationNames.sunrise.end && (
                              <span className="block text-orange-600 text-xs">
                                Near {locationNames.sunrise.end}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {viewingWindows.sunset.start && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="text-lg font-medium text-blue-700 mb-2">
                          Sunset Viewing Window
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Starts:</span>{" "}
                            {viewingWindows.sunset.start.time}
                            {locationNames.sunset.start && (
                              <span className="block text-blue-600 text-xs">
                                Near {locationNames.sunset.start}
                              </span>
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Ends:</span>{" "}
                            {viewingWindows.sunset.end.time}
                            {locationNames.sunset.end && (
                              <span className="block text-blue-600 text-xs">
                                Near {locationNames.sunset.end}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {!viewingWindows.sunrise.start &&
                      !viewingWindows.sunset.start && (
                        <p className="text-gray-500 italic">
                          No sunrise or sunset viewing opportunities during this
                          flight.
                        </p>
                      )}
                  </>
                ) : (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500">
                  <p>* Times are shown in your local timezone</p>
                  <p>
                    * Viewing windows are calculated for civil twilight periods
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Enter flight details to get viewing opportunities
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
