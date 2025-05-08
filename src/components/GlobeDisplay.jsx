import React from "react";
import GlobeApp from "./Globe";

export default function GlobeDisplay({ source, destination }) {
  return (
    <div className="w-6/12 h-full relative">
      <div className="absolute inset-0">
        <GlobeApp
          pointA={
            source && {
              lat: source.lat,
              lon: source.lon,
              name:
                source.name ||
                `${source.lat.toFixed(2)}, ${source.lon.toFixed(2)}`,
            }
          }
          pointB={
            destination && {
              lat: destination.lat,
              lon: destination.lon,
              name:
                destination.name ||
                `${destination.lat.toFixed(2)}, ${destination.lon.toFixed(2)}`,
            }
          }
        />
      </div>
    </div>
  );
}
