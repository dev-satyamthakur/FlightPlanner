import "./App.css";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { bearing } from "@turf/turf";
import {
  Typography,
  Form,
  Card,
  Space,
  InputNumber,
  DatePicker,
  Alert,
} from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  HourglassOutlined,
} from "@ant-design/icons";
import { WiSunrise, WiSunset } from "react-icons/wi";
import AirportSearchInput from "./components/AirportSearchInput";
import GlobeApp from "./components/Globe";
import FlightDetailsDisplay from "./components/FlightDetailsDisplay";
import {
  calculateSunViewingWindows,
  getLocationName,
} from "./utils/sunTimingCalculator";
import PropTypes from "prop-types";

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

  useEffect(() => {
    const duration = totalFlightDuration();
    if (source && destination && departureTime && duration > 0) {
      const windows = calculateSunViewingWindows(
        [source.lat, source.lon],
        [destination.lat, destination.lon],
        new Date(departureTime),
        duration
      );
      setViewingWindows(windows);

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
  }, [source, destination, departureTime, totalFlightDuration]);

  return (
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
            <Card
              title={
                <Title level={4} style={{ color: "#fff", margin: 0 }}>
                  Plan Your Flight
                </Title>
              }
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(10px)",
                borderColor: "#303030",
                color: "#fff",
                borderRadius: "15px",
                height: "fit-content",
                marginBottom: "10px",
              }}
              headStyle={{
                borderColor: "#303030",
                padding: "12px 16px",
              }}
              bodyStyle={{
                padding: "16px",
              }}
            >
              <Form
                layout="vertical"
                onFinish={handleSubmit}
                style={{
                  width: "100%",
                }}
              >
                <Form.Item
                  label={
                    <Typography.Text
                      style={{
                        color: "white",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Source Airport
                    </Typography.Text>
                  }
                  required
                  style={{ marginBottom: "16px" }}
                >
                  <AirportSearchInput
                    onSelect={(airport) => setSource(airport)}
                    excludeIcao={destination?.icao}
                    formatDisplayValue={(airport) =>
                      `${airport.city}, ${airport.state}, ${airport.country}`
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Typography.Text
                      style={{
                        color: "white",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      Destination Airport
                    </Typography.Text>
                  }
                  required
                  style={{ marginBottom: "16px" }}
                >
                  <AirportSearchInput
                    onSelect={(airport) => setDestination(airport)}
                    excludeIcao={source?.icao}
                    formatDisplayValue={(airport) =>
                      `${airport.city}, ${airport.state}, ${airport.country}`
                    }
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Typography.Text
                      style={{
                        color: "white",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      <CalendarOutlined /> Departure Time
                    </Typography.Text>
                  }
                  required
                  style={{ marginBottom: "16px" }}
                >
                  <DatePicker
                    showTime
                    onChange={(date, dateString) =>
                      setDepartureTime(dateString)
                    }
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <Typography.Text
                      style={{
                        color: "white",
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      <HourglassOutlined /> Flight Duration
                    </Typography.Text>
                  }
                  required
                  style={{ marginBottom: "0" }}
                >
                  <Space style={{ width: "100%" }}>
                    <InputNumber
                      min={0}
                      value={flightHours}
                      onChange={(value) => setFlightHours(value)}
                      placeholder="Hours"
                      style={{ width: "100%" }}
                    />
                    <InputNumber
                      min={0}
                      max={59}
                      value={flightMinutes}
                      onChange={(value) => setFlightMinutes(value)}
                      placeholder="Minutes"
                      style={{ width: "100%" }}
                    />
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </motion.div>

          {/* Flight Details Card */}
          {source &&
            destination &&
            departureTime &&
            totalFlightDuration() > 0 && (
              <motion.div
                variants={animations.fadeInUp}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <FlightDetailsDisplay
                  source={source}
                  destination={destination}
                  departureTime={departureTime}
                  flightHours={flightHours}
                  flightMinutes={flightMinutes}
                />
              </motion.div>
            )}
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
            <Card
              title={
                <Title level={4} style={{ color: "#fff", margin: 0 }}>
                  Flight Tips
                </Title>
              }
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(10px)",
                borderColor: "#303030",
                color: "#fff",
                borderRadius: "15px",
                height: "fit-content",
                marginBottom: "10px",
              }}
              headStyle={{
                borderColor: "#303030",
                padding: "12px 16px",
              }}
              bodyStyle={{
                padding: "16px",
              }}
            >
              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {viewingWindows && (
                  <motion.div
                    variants={animations.fadeIn}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <div>
                      <Typography.Text
                        strong
                        style={{
                          color: "#1890ff",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        Seat Recommendations
                      </Typography.Text>
                      {(() => {
                        const recommendation = getSeatRecommendation(
                          source.lat,
                          source.lon,
                          destination.lat,
                          destination.lon
                        );
                        return (
                          <div>
                            {viewingWindows.sunrise.start && (
                              <Typography.Text
                                type="warning"
                                style={{
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                <WiSunrise
                                  style={{
                                    fontSize: "1.2em",
                                    marginRight: "4px",
                                  }}
                                />{" "}
                                For sunrise views, choose a{" "}
                                {recommendation.sunrise} side window seat
                              </Typography.Text>
                            )}
                            {viewingWindows.sunset.start && (
                              <Typography.Text
                                style={{ color: "#1890ff", display: "block" }}
                              >
                                <WiSunset
                                  style={{
                                    fontSize: "1.2em",
                                    marginRight: "4px",
                                  }}
                                />{" "}
                                For sunset views, choose a{" "}
                                {recommendation.sunset} side window seat
                              </Typography.Text>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {source && destination && viewingWindows && (
                  <motion.div
                    variants={animations.fadeInUp}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {viewingWindows.sunrise.start && (
                      <Card
                        style={{
                          background: "rgba(250, 173, 20, 0.1)",
                          borderColor: "#faad14",
                          marginBottom: "8px",
                        }}
                      >
                        <Title
                          level={5}
                          style={{
                            color: "#faad14",
                            margin: 0,
                            marginBottom: "8px",
                          }}
                        >
                          <WiSunrise
                            style={{
                              fontSize: "1.5em",
                              marginRight: "8px",
                              verticalAlign: "middle",
                            }}
                          />{" "}
                          Sunrise Viewing Window
                        </Title>
                        <div>
                          <div style={{ marginBottom: "8px" }}>
                            <Typography.Text
                              strong
                              style={{
                                color: "#fff",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Starts:
                            </Typography.Text>
                            <Typography.Text style={{ color: "#fff" }}>
                              {viewingWindows.sunrise.start.time}
                            </Typography.Text>
                            {locationNames.sunrise.start && (
                              <Typography.Text
                                type="warning"
                                style={{ display: "block", marginTop: "4px" }}
                              >
                                <EnvironmentOutlined />{" "}
                                {locationNames.sunrise.start}
                              </Typography.Text>
                            )}
                          </div>
                          <div>
                            <Typography.Text
                              strong
                              style={{
                                color: "#fff",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Ends:
                            </Typography.Text>
                            <Typography.Text style={{ color: "#fff" }}>
                              {viewingWindows.sunrise.end.time}
                            </Typography.Text>
                            {locationNames.sunrise.end && (
                              <Typography.Text
                                type="warning"
                                style={{ display: "block", marginTop: "4px" }}
                              >
                                <EnvironmentOutlined />{" "}
                                {locationNames.sunrise.end}
                              </Typography.Text>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {viewingWindows.sunset.start && (
                      <Card
                        style={{
                          background: "rgba(24, 144, 255, 0.1)",
                          borderColor: "#1890ff",
                          marginBottom: "8px",
                        }}
                      >
                        <Title
                          level={5}
                          style={{
                            color: "#1890ff",
                            margin: 0,
                            marginBottom: "8px",
                          }}
                        >
                          <WiSunset
                            style={{
                              fontSize: "1.5em",
                              marginRight: "8px",
                              verticalAlign: "middle",
                            }}
                          />{" "}
                          Sunset Viewing Window
                        </Title>
                        <div>
                          <div style={{ marginBottom: "8px" }}>
                            <Typography.Text
                              strong
                              style={{
                                color: "#fff",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Starts:
                            </Typography.Text>
                            <Typography.Text style={{ color: "#fff" }}>
                              {viewingWindows.sunset.start.time}
                            </Typography.Text>
                            {locationNames.sunset.start && (
                              <Typography.Text
                                style={{
                                  color: "#1890ff",
                                  display: "block",
                                  marginTop: "4px",
                                }}
                              >
                                <EnvironmentOutlined />{" "}
                                {locationNames.sunset.start}
                              </Typography.Text>
                            )}
                          </div>
                          <div>
                            <Typography.Text
                              strong
                              style={{
                                color: "#fff",
                                display: "block",
                                marginBottom: "4px",
                              }}
                            >
                              Ends:
                            </Typography.Text>
                            <Typography.Text style={{ color: "#fff" }}>
                              {viewingWindows.sunset.end.time}
                            </Typography.Text>
                            {locationNames.sunset.end && (
                              <Typography.Text
                                style={{
                                  color: "#1890ff",
                                  display: "block",
                                  marginTop: "4px",
                                }}
                              >
                                <EnvironmentOutlined />{" "}
                                {locationNames.sunset.end}
                              </Typography.Text>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {!viewingWindows.sunrise.start &&
                      !viewingWindows.sunset.start && (
                        <Alert
                          message="No sunrise or sunset viewing opportunities during this flight."
                          type="info"
                          showIcon
                        />
                      )}
                  </motion.div>
                )}

                <motion.div
                  variants={animations.fadeIn}
                  initial="initial"
                  animate="animate"
                >
                  <div>
                    <Typography.Text
                      type="secondary"
                      style={{
                        display: "block",
                        fontSize: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      * Times are shown in your local timezone
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ display: "block", fontSize: "12px" }}
                    >
                      * Viewing windows are calculated for civil twilight
                      periods
                    </Typography.Text>
                  </div>
                </motion.div>
              </Space>
            </Card>
          </motion.div>

          {/* General Tips Card */}
          <motion.div
            variants={animations.fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Card
              title={
                <Title level={4} style={{ color: "#fff", margin: 0 }}>
                  General Tips
                </Title>
              }
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(10px)",
                borderColor: "#303030",
                color: "#fff",
                borderRadius: "15px",
                height: "fit-content",
              }}
              headStyle={{
                borderColor: "#303030",
                padding: "12px 16px",
              }}
              bodyStyle={{
                padding: "16px",
              }}
            >
              <ul style={{ listStyle: "disc", paddingLeft: "20px", margin: 0 }}>
                <li style={{ marginBottom: "8px" }}>
                  <Typography.Text style={{ color: "#fff" }}>
                    Window seats offer the best views of sunrise/sunset
                  </Typography.Text>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Typography.Text style={{ color: "#fff" }}>
                    Consider the season when choosing your seat
                  </Typography.Text>
                </li>
                <li style={{ marginBottom: "8px" }}>
                  <Typography.Text style={{ color: "#fff" }}>
                    Flight direction affects sun position
                  </Typography.Text>
                </li>
                <li>
                  <Typography.Text style={{ color: "#fff" }}>
                    Morning and evening flights often offer better views
                  </Typography.Text>
                </li>
              </ul>
            </Card>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

App.propTypes = {
  source: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icao: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string,
    country: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  destination: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icao: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string,
    country: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  departureTime: PropTypes.string.isRequired,
  flightHours: PropTypes.string.isRequired,
  flightMinutes: PropTypes.string.isRequired,
  viewingWindows: PropTypes.object,
  locationNames: PropTypes.object.isRequired,
};
