import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import L from "leaflet";
import planeLeftIconUrl from "../assets/plane_left.png";
import planeRightIconUrl from "../assets/plane_right.png";
import { useEffect, useRef, useState } from "react";
import SunCalc from "suncalc";
import "../FlightMap.css";

const createPlaneIcon = (direction) => {
  return new L.Icon({
    iconUrl:
      direction === "east-to-west" ? planeLeftIconUrl : planeRightIconUrl,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: "plane-icon",
  });
};

const SunPositionFlightMap = ({
  source,
  destination,
  departureTime,
  flightDuration, // in minutes
}) => {
  // Create points from source and destination coordinates
  const start = turf.point([source[1], source[0]]); // [lon, lat]
  const end = turf.point([destination[1], destination[0]]); // [lon, lat]

  // Determine overall flight direction
  const isWestToEast =
    end.geometry.coordinates[0] > start.geometry.coordinates[0];
  const flightDirection = isWestToEast ? "west-to-east" : "east-to-west";

  // Create a great circle line with many points for smooth animation
  const npoints = Math.floor(flightDuration / 2); // One point every 2 minutes
  const greatCircle = turf.greatCircle(start, end, { npoints });

  // Path as [lat, lng] pairs
  const path = greatCircle.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  // Calculate sun positions along the flight path
  const getSunPositionAtPoint = (point, time) => {
    return SunCalc.getPosition(time, point[0], point[1]);
  };

  // Calculate sun positions for each point along the path
  const sunPositions = path.map((point, index) => {
    const timeAtPoint = new Date(
      departureTime.getTime() + (index * (flightDuration * 60000)) / npoints
    );
    return getSunPositionAtPoint(point, timeAtPoint);
  });

  // Determine which side of the aircraft will have better views
  const determineBestSeat = () => {
    let sunOnLeft = 0;
    let sunOnRight = 0;

    sunPositions.forEach((pos, i) => {
      // Convert azimuth to degrees (0-360)
      let azimuth = ((pos.azimuth * 180) / Math.PI + 180) % 360;

      // Calculate relative angle to aircraft heading
      const heading = isWestToEast ? 90 : 270;
      const relativeAngle = (azimuth - heading + 360) % 360;

      // Count which side the sun appears more
      if (relativeAngle > 0 && relativeAngle < 180) {
        sunOnRight++;
      } else {
        sunOnLeft++;
      }
    });

    return {
      recommendedSide: sunOnLeft > sunOnRight ? "left" : "right",
      confidence: Math.abs(sunOnLeft - sunOnRight) / (sunOnLeft + sunOnRight),
    };
  };

  const seatRecommendation = determineBestSeat();

  // Animation state
  const [planeIndex, setPlaneIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    let timeoutId;

    const animatePlane = () => {
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

    if (!isPaused) {
      intervalRef.current = setInterval(animatePlane, 30);
    }

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutId);
    };
  }, [path.length, isPaused]);

  // Calculate center point for the map
  const center = [
    (source[0] + destination[0]) / 2,
    (source[1] + destination[1]) / 2,
  ];

  return (
    <div>
      <div className="seat-recommendation">
        <h3>Seat Recommendation</h3>
        <p>
          For the best views of sunrise/sunset, choose a seat on the{" "}
          <strong>{seatRecommendation.recommendedSide}</strong> side of the
          aircraft.
        </p>
        <p>Confidence: {Math.round(seatRecommendation.confidence * 100)}%</p>
      </div>
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
    </div>
  );
};

export default SunPositionFlightMap;
