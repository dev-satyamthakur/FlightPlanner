import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Make sure the Leaflet default icon images are properly loaded in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapComponent() {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Initialize the map only once when component mounts
    if (mapRef.current === null) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [51.505, -0.09],
        13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add a marker
      L.marker([51.5, -0.09])
        .addTo(mapRef.current)
        .bindPopup("A pretty CSS popup.<br> Easily customizable.")
        .openPopup();
    }

    // Cleanup function to run when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div
      ref={mapContainerRef}
      className="map-container"
      style={{ height: "400px", width: "100%" }}
    />
  );
}

export default MapComponent;
