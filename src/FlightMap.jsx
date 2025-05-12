import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import L from "leaflet";
import planeLeftIconUrl from "./assets/plane_left.png";
import planeRightIconUrl from "./assets/plane_right.png";
import { useEffect, useRef, useState } from "react";
import "./FlightMap.css";

const createPlaneIcon = (direction) => {
  return new L.Icon({
    iconUrl:
      direction === "east-to-west" ? planeLeftIconUrl : planeRightIconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: `plane-icon ${direction}`,
  });
};

const FlightMap = ({ source, destination }) => {
  if (!source || !destination) {
    console.error("Invalid coordinates:", { source, destination });
    return <div>Error: Invalid coordinates</div>;
  }

  try {
    const start = turf.point([source[1], source[0]]); // [lon, lat]
    const end = turf.point([destination[1], destination[0]]); // [lon, lat]

    const isWestToEast =
      end.geometry.coordinates[0] > start.geometry.coordinates[0];
    const flightDirection = isWestToEast ? "west-to-east" : "east-to-west";

    const npoints = 300;
    const greatCircle = turf.greatCircle(start, end, { npoints });
    const path = greatCircle.geometry.coordinates.map(([lng, lat]) => [
      lat,
      lng,
    ]);

    const [planeIndex, setPlaneIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef();

    useEffect(() => {
      let timeoutId;

      const animatePlane = () => {
        setPlaneIndex((prev) => {
          if (prev === 0 || prev === path.length - 1) {
            setIsPaused(true);
            timeoutId = setTimeout(() => {
              setIsPaused(false);
              return prev === 0 ? 1 : 0;
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      };

      if (!isPaused && path.length > 0) {
        intervalRef.current = setInterval(animatePlane, 100);
      }

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [path.length, isPaused]);

    const center = [
      (source[0] + destination[0]) / 2,
      (source[1] + destination[1]) / 2,
    ];

    return (
      <div style={{ width: "100%", height: "100vh" }}>
        <MapContainer
          center={center}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="© Google"
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          <Polyline
            positions={path}
            pathOptions={{
              color: "blue",
              weight: 3,
              dashArray: "8 12",
            }}
          />
          <Marker
            position={path[planeIndex]}
            icon={createPlaneIcon(flightDirection)}
          />
        </MapContainer>
      </div>
    );
  } catch (error) {
    console.error("Error in FlightMap:", error);
    return <div>Error loading map</div>;
  }
};

export default FlightMap;
