import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import L from "leaflet";
import planeLeftIconUrl from "./assets/plane_left.png";
import planeRightIconUrl from "./assets/plane_right.png";
import { useEffect, useRef, useState } from "react";
import "./FlighMap.css";

const createPlaneIcon = (direction) => {
  console.log("Creating plane icon:", {
    direction,
    iconUrl:
      direction === "east-to-west" ? planeLeftIconUrl : planeRightIconUrl,
  });
  return new L.Icon({
    iconUrl:
      direction === "east-to-west" ? planeLeftIconUrl : planeRightIconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: `plane-icon ${direction}`,
  });
};

const FlightMap = ({ source, destination }) => {
  try {
    // Create points from source and destination coordinates
    const start = turf.point([source[1], source[0]]); // [lon, lat]
    const end = turf.point([destination[1], destination[0]]); // [lon, lat]

    // Add validation
    if (!start || !end || !source || !destination) {
      console.error("Invalid coordinates:", { source, destination });
      return <div>Error: Invalid coordinates</div>;
    }

    // Determine overall flight direction
    const isWestToEast =
      end.geometry.coordinates[0] > start.geometry.coordinates[0];
    const flightDirection = isWestToEast ? "west-to-east" : "east-to-west";

    // Create a great circle line with many points for smooth animation
    const npoints = 300;
    const greatCircle = turf.greatCircle(start, end, { npoints });

    // Path as [lat, lng] pairs
    const path = greatCircle.geometry.coordinates.map(([lng, lat]) => [
      lat,
      lng,
    ]);

    console.log("Path created:", {
      pathLength: path.length,
      firstPoint: path[0],
      lastPoint: path[path.length - 1],
    });

    // Animation state
    const [planeIndex, setPlaneIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef();

    useEffect(() => {
      console.log("Animation started", { pathLength: path.length, isPaused }); // Debug log
      let timeoutId;
      let intervalId;

      const animatePlane = () => {
        console.log("Animating plane at index:", planeIndex); // Debug log
        setPlaneIndex((prev) => {
          if (prev === 0) {
            setIsPaused(true);
            timeoutId = setTimeout(() => {
              setIsPaused(false);
              setPlaneIndex(1);
            }, 1000);
            return prev;
          }
          if (prev === path.length - 1) {
            setIsPaused(true);
            timeoutId = setTimeout(() => {
              setIsPaused(false);
              setPlaneIndex(0);
            }, 1000);
            return prev;
          }
          return prev + 1;
        });
      };

      if (!isPaused && path.length > 0) {
        // Add path.length check
        intervalId = setInterval(animatePlane, 100); // Changed to 100ms
        intervalRef.current = intervalId;
      }

      return () => {
        if (intervalId) clearInterval(intervalId);
        if (timeoutId) clearTimeout(timeoutId);
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [path.length, isPaused, planeIndex]); // Add planeIndex to dependencies

    // Calculate center point for the map
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
  } catch (error) {
    console.error("Error in FlightMap:", error);
    return <div>Error loading map</div>;
  }
};

export default FlightMap;
