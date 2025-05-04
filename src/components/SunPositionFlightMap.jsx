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
    return {
      position: getSunPositionAtPoint(point, timeAtPoint),
      time: timeAtPoint,
      location: point,
    };
  });

  // Determine which side of the aircraft will have better views
  const determineBestSeat = () => {
    let sunriseViews = { left: 0, right: 0 };
    let sunsetViews = { left: 0, right: 0 };
    let totalViews = 0;

    sunPositions.forEach((data, i) => {
      const pos = data.position;
      const time = data.time;
      const location = data.location;

      // Convert altitude to degrees
      const altitudeDeg = (pos.altitude * 180) / Math.PI;

      // Only consider when sun is near horizon (-6° to 6° for civil twilight)
      if (Math.abs(altitudeDeg) <= 6) {
        // Get sun times for this location
        const times = SunCalc.getTimes(time, location[0], location[1]);

        // Convert azimuth to degrees (0-360)
        let azimuth = ((pos.azimuth * 180) / Math.PI + 180) % 360;

        // Calculate relative angle to aircraft heading
        const heading = isWestToEast ? 90 : 270;
        const relativeAngle = (azimuth - heading + 360) % 360;

        // Determine if it's sunrise or sunset period
        const isSunrise = time > times.sunrise && time < times.solarNoon;
        const isSunset = time > times.solarNoon && time < times.sunset;

        if (relativeAngle > 0 && relativeAngle < 180) {
          if (isSunrise) sunriseViews.right++;
          if (isSunset) sunsetViews.right++;
        } else {
          if (isSunrise) sunriseViews.left++;
          if (isSunset) sunsetViews.left++;
        }
        totalViews++;
      }
    });

    // Calculate overall recommendation
    const totalLeft = sunriseViews.left + sunsetViews.left;
    const totalRight = sunriseViews.right + sunsetViews.right;

    // Prevent division by zero
    const confidence =
      totalViews > 0 ? Math.abs(totalLeft - totalRight) / totalViews : 0;

    return {
      recommendedSide: totalLeft > totalRight ? "left" : "right",
      confidence: confidence,
      details: {
        sunrise: {
          left: sunriseViews.left,
          right: sunriseViews.right,
        },
        sunset: {
          left: sunsetViews.left,
          right: sunsetViews.right,
        },
      },
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
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={3} className="h-full w-full">
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

      {/* Move seat recommendation to the right panel */}
      {seatRecommendation.confidence > 0 && (
        <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-sm">
          <p className="text-sm font-medium text-gray-900">
            Best seat:{" "}
            <span className="font-bold">
              {seatRecommendation.recommendedSide}
            </span>{" "}
            side
          </p>
          <p className="text-xs text-gray-600">
            Confidence: {Math.round(seatRecommendation.confidence * 100)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default SunPositionFlightMap;
