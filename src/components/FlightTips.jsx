import React from "react";
import { getSeatRecommendation } from "../utils/sunTimingCalculator";

export default function FlightTips({
  source,
  destination,
  viewingWindows,
  locationNames,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Viewing Opportunities</h3>

        {viewingWindows && (
          <div className="mb-4">
            <p className="font-medium">Seat Recommendations</p>
            {(() => {
              const recommendation = getSeatRecommendation(
                source.lat,
                source.lon,
                destination.lat,
                destination.lon,
                !!viewingWindows.sunrise.start,
                !!viewingWindows.sunset.start
              );
              return (
                <div className="text-sm">
                  {viewingWindows.sunrise.start && (
                    <p className="text-orange-600">
                      For sunrise views, choose a {recommendation.sunrise} side
                      window seat
                    </p>
                  )}
                  {viewingWindows.sunset.start && (
                    <p className="text-blue-600">
                      For sunset views, choose a {recommendation.sunset} side
                      window seat
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {source && destination && viewingWindows ? (
          <div className="space-y-4">
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

            {!viewingWindows.sunrise.start && !viewingWindows.sunset.start && (
              <p className="text-gray-500 italic">
                No sunrise or sunset viewing opportunities during this flight.
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">
            Enter flight details to get viewing opportunities
          </p>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p>* Times are shown in your local timezone</p>
          <p>* Viewing windows are calculated for civil twilight periods</p>
        </div>
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
  );
}
