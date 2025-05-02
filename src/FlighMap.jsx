import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import L from "leaflet";
import planeLeftIconUrl from "./assets/plane_left.png";
import planeRightIconUrl from "./assets/plane_right.png";
import { useEffect, useRef, useState } from "react";
import "./FlighMap.css";

const createPlaneIcon = (direction) => {
  return new L.Icon({
    iconUrl:
      direction === "east-to-west" ? planeLeftIconUrl : planeRightIconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: "plane-icon",
  });
};

const FlightMap = () => {
  // Define coordinates - [longitude, latitude]
  const newDelhi = [77.1025, 28.5562];
  const singapore = [103.9894, 1.3644];
  const start = turf.point(newDelhi);
  const end = turf.point(singapore);

  //   const california = [-118.4085, 33.9416]; // [longitude, latitude]
  //   const indonesia = [106.6559, -6.1256]; // [longitude, latitude]
  //   const start = turf.point(california);
  //   const end = turf.point(indonesia);

  // Determine overall flight direction
  const isWestToEast =
    end.geometry.coordinates[0] > start.geometry.coordinates[0];
  const flightDirection = isWestToEast ? "west-to-east" : "east-to-west";

  // Create a great circle line with many points for smooth animation
  const npoints = 300;
  const greatCircle = turf.greatCircle(start, end, { npoints });

  // Path as [lat, lng] pairs
  const path = greatCircle.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  // Animation state
  const [planeIndex, setPlaneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    let timeoutId;

    const animatePlane = () => {
      setPlaneIndex((prev) => {
        // If we're at the start
        if (prev === 0) {
          setIsPaused(true);
          timeoutId = setTimeout(() => {
            setIsPaused(false);
            setPlaneIndex(1);
          }, 1000);
          return prev;
        }
        // If we're at the end
        if (prev === path.length - 1) {
          setIsPaused(true);
          timeoutId = setTimeout(() => {
            setIsPaused(false);
            setPlaneIndex(0);
          }, 1000);
          return prev;
        }
        // Normal movement
        return prev + 1;
      });
    };

    if (!isPaused) {
      intervalRef.current = setInterval(animatePlane, 30);
    }

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutId);
    };
  }, [path.length, isPaused]);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <MapContainer
        center={[40, 20]}
        zoom={3}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Dotted great circle path */}
        <Polyline
          positions={path}
          pathOptions={{
            color: "blue",
            weight: 3,
            dashArray: "8 12", // Dotted/dashed line
          }}
        />
        {/* Animated plane marker */}
        <Marker
          position={path[planeIndex]}
          icon={createPlaneIcon(flightDirection)}
        />
      </MapContainer>
    </div>
  );
};

export default FlightMap;
