import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as turf from "@turf/turf";
import L from "leaflet";
import planeLeftIconUrl from "./assets/plane_left.png";
import planeRightIconUrl from "./assets/plane_right.png";
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
  // Define coordinates - Note format: [longitude, latitude]
  const newDelhi = [77.1025, 28.5562];
  const london = [-0.4543, 51.47];
  const start = turf.point(newDelhi);
  const end = turf.point(london);

  // Determine overall flight direction
  const isWestToEast =
    end.geometry.coordinates[0] > start.geometry.coordinates[0];
  const flightDirection = isWestToEast ? "west-to-east" : "east-to-west";

  // Create a great circle line with more points for smoother path
  const greatCircle = turf.greatCircle(start, end, { npoints: 20 });

  // Get coordinates for the path
  const path = greatCircle.geometry.coordinates.map(([lng, lat]) => ({
    position: [lat, lng],
    direction: flightDirection,
  }));

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
        {path.map((point, index) => (
          <Marker
            key={index}
            position={point.position}
            icon={createPlaneIcon(point.direction)}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default FlightMap;
