import React from "react";

export default function FlightDetailsDisplay({
  source,
  destination,
  departureTime,
  flightHours,
  flightMinutes,
}) {
  const totalFlightDuration =
    parseInt(flightHours || "0") * 60 + parseInt(flightMinutes || "0");

  return (
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
  );
}
