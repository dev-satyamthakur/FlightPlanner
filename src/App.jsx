import "./App.css";
import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  lazy,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { bearing } from "@turf/turf";
import { Typography, Spin } from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import { WiSunrise, WiSunset } from "react-icons/wi";
import PlanFlightCard from "./components/PlanFlightCard";
import FlightDetailsCard from "./components/FlightDetailsCard";
import FlightTipsCard from "./components/FlightTipsCard";
import GeneralTipsCard from "./components/GeneralTipsCard";
const AirportSearchInput = lazy(() =>
  import("./components/AirportSearchInput")
);
const GlobeApp = lazy(() => import("./components/Globe"));
import {
  calculateSunViewingWindows,
  getLocationName,
} from "./utils/sunTimingCalculator";

const { Title } = Typography;

const getSeatRecommendation = (sourceLat, sourceLon, destLat, destLon) => {
  const flightBearing = bearing([sourceLon, sourceLat], [destLon, destLat]);
  const normalizedBearing = (flightBearing + 360) % 360;

  return {
    sunrise:
      normalizedBearing >= 0 && normalizedBearing < 180
        ? "left (port)"
        : "right (starboard)",
    sunset:
      normalizedBearing >= 0 && normalizedBearing < 180
        ? "right (starboard)"
        : "left (port)",
  };
};

const animations = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
};

export default function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureTime, setDepartureTime] = useState("");
  const [flightHours, setFlightHours] = useState("");
  const [flightMinutes, setFlightMinutes] = useState("");
  const [viewingWindows, setViewingWindows] = useState(null);
  const [locationNames, setLocationNames] = useState({
    sunrise: { start: null, end: null },
    sunset: { start: null, end: null },
  });

  const totalFlightDuration = useCallback(
    () => parseInt(flightHours || "0") * 60 + parseInt(flightMinutes || "0"),
    [flightHours, flightMinutes]
  );

  // Memoize the sun viewing windows calculation
  const viewingWindowsMemo = useMemo(() => {
    const duration = totalFlightDuration();
    if (source && destination && departureTime && duration > 0) {
      return calculateSunViewingWindows(
        [source.lat, source.lon],
        [destination.lat, destination.lon],
        new Date(departureTime),
        duration
      );
    }
    return null;
  }, [source, destination, departureTime, totalFlightDuration]);

  useEffect(() => {
    setViewingWindows(viewingWindowsMemo);
    if (viewingWindowsMemo) {
      const windows = viewingWindowsMemo;
      const fetchLocationNames = async () => {
        const names = {
          sunrise: { start: null, end: null },
          sunset: { start: null, end: null },
        };
        if (windows.sunrise.start) {
          names.sunrise.start = await getLocationName(
            windows.sunrise.start.position.lat,
            windows.sunrise.start.position.lon
          );
          names.sunrise.end = await getLocationName(
            windows.sunrise.end.position.lat,
            windows.sunrise.end.position.lon
          );
        }
        if (windows.sunset.start) {
          names.sunset.start = await getLocationName(
            windows.sunset.start.position.lat,
            windows.sunset.start.position.lon
          );
          names.sunset.end = await getLocationName(
            windows.sunset.end.position.lat,
            windows.sunset.end.position.lon
          );
        }
        setLocationNames(names);
      };
      fetchLocationNames();
    }
  }, [viewingWindowsMemo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !source ||
      !destination ||
      !departureTime ||
      (!flightHours && !flightMinutes)
    ) {
      alert("Please fill in all fields");
      return;
    }
  };

  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            zIndex: 9999,
          }}
        >
          <Spin size="large" tip="Loading..." />
        </div>
      }
    >
      <div
        style={{
          height: "100vh",
          width: "100vw",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Globe taking the full viewport */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            pointerEvents: "auto",
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.05)",
                  padding: "20px",
                }}
              >
                <Spin size="large" />
                <div style={{ marginTop: "20px" }}>
                  <Typography.Text className="accent-text">
                    Loading interactive globe...
                  </Typography.Text>
                </div>
              </div>
            }
          >
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
                    `${destination.lat.toFixed(2)}, ${destination.lon.toFixed(
                      2
                    )}`,
                }
              }
              totalFlightTime={totalFlightDuration()}
            />
          </Suspense>
        </motion.div>

        {/* Overlay UI elements with glass effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            position: "absolute",
            top: "5%",
            left: "2%",
            right: "2%",
            bottom: "5%",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            height: "100vh",
            pointerEvents: "none",
          }}
        >
          {/* Left Column */}
          <motion.div
            className="scrollable-column left-column"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Plan Your Flight Card */}
            <motion.div
              layout
              variants={animations.fadeIn}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <PlanFlightCard
                source={source}
                setSource={setSource}
                destination={destination}
                setDestination={setDestination}
                departureTime={departureTime}
                setDepartureTime={setDepartureTime}
                flightHours={flightHours}
                setFlightHours={setFlightHours}
                flightMinutes={flightMinutes}
                setFlightMinutes={setFlightMinutes}
                handleSubmit={handleSubmit}
              />
            </motion.div>

            {/* Flight Details Card */}
            <FlightDetailsCard
              source={source}
              destination={destination}
              departureTime={departureTime}
              flightHours={flightHours}
              flightMinutes={flightMinutes}
              totalFlightDuration={totalFlightDuration}
              animations={animations}
            />
          </motion.div>

          {/* Right Column - Flight Tips */}
          <motion.div
            className="scrollable-column right-column"
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Viewing Opportunities Card */}
            <motion.div layout>
              <FlightTipsCard
                viewingWindows={viewingWindows}
                source={source}
                destination={destination}
                getSeatRecommendation={getSeatRecommendation}
                locationNames={locationNames}
                animations={animations}
              />
            </motion.div>

            {/* General Tips Card */}
            <motion.div
              variants={animations.fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <GeneralTipsCard />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </Suspense>
  );
}
