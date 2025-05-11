import "./App.css";
import SunPositionFlightMap from "./components/SunPositionFlightMap";
import AirportSearchInput from "./components/AirportSearchInput";
import React, { useState, useEffect } from "react";
import {
  calculateSunViewingWindows,
  getLocationName,
} from "./utils/sunTimingCalculator";
import GlobeApp from "./components/Globe";
import { bearing } from "@turf/turf";
import FlightDetailsDisplay from "./components/FlightDetailsDisplay";
import {
  Layout,
  Typography,
  Form,
  Input,
  Button,
  Card,
  Space,
  Spin,
  InputNumber,
  DatePicker,
  Alert,
  Collapse,
  theme,
} from "antd";
import {
  RiseOutlined,
  SettingOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  HourglassOutlined,
  RocketOutlined,
  SunOutlined,
  CloudOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Header, Content, Sider } = Layout;
const { Panel } = Collapse;

const getSeatRecommendation = (
  sourceLat,
  sourceLon,
  destLat,
  destLon,
  hasSunrise,
  hasSunset
) => {
  // Calculate initial bearing of flight path
  const flightBearing = bearing([sourceLon, sourceLat], [destLon, destLat]);

  // Normalize bearing to 0-360
  const normalizedBearing = (flightBearing + 360) % 360;

  let recommendation = {
    sunrise: "",
    sunset: "",
  };

  // For sunrise (sun rises in the east)
  if (normalizedBearing >= 0 && normalizedBearing < 180) {
    recommendation.sunrise = "left (port)";
    recommendation.sunset = "right (starboard)";
  } else {
    recommendation.sunrise = "right (starboard)";
    recommendation.sunset = "left (port)";
  }

  return recommendation;
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

  const totalFlightDuration =
    parseInt(flightHours || "0") * 60 + parseInt(flightMinutes || "0");

  useEffect(() => {
    if (source && destination && departureTime && totalFlightDuration > 0) {
      const windows = calculateSunViewingWindows(
        [source.lat, source.lon],
        [destination.lat, destination.lon],
        new Date(departureTime),
        totalFlightDuration
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
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1, // Ensure it's behind other elements
          pointerEvents: "auto", // Ensure globe can capture pointer events
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
      </div>

      {/* Overlay UI elements with glass effect */}
      <div
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
        <div className="scrollable-column left-column">
          {/* Plan Your Flight Card */}
          <Card
            title={
              <Title level={4} style={{ color: "#fff", margin: 0 }}>
                <RocketOutlined /> Plan Your Flight
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
                  <Text
                    style={{
                      color: "white",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    Source Airport
                  </Text>
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
                  <Text
                    style={{
                      color: "white",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    Destination Airport
                  </Text>
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
                  <Text
                    style={{
                      color: "white",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    <CalendarOutlined /> Departure Time
                  </Text>
                }
                required
                style={{ marginBottom: "16px" }}
              >
                <DatePicker
                  showTime
                  onChange={(date, dateString) => setDepartureTime(dateString)}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text
                    style={{
                      color: "white",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    <HourglassOutlined /> Flight Duration
                  </Text>
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

          {/* Flight Details Card */}
          {source &&
            destination &&
            departureTime &&
            totalFlightDuration > 0 && (
              <FlightDetailsDisplay
                source={source}
                destination={destination}
                departureTime={departureTime}
                flightHours={flightHours}
                flightMinutes={flightMinutes}
              />
            )}
        </div>

        {/* Right Column - Flight Tips */}
        <div className="scrollable-column right-column">
          {/* Viewing Opportunities Card */}
          <Card
            title={
              <Title level={4} style={{ color: "#fff", margin: 0 }}>
                <InfoCircleOutlined /> Flight Tips
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
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {viewingWindows && (
                <div>
                  <Text
                    strong
                    style={{
                      color: "#1890ff",
                      display: "block",
                      marginBottom: "8px",
                    }}
                  >
                    Seat Recommendations
                  </Text>
                  {(() => {
                    const recommendation = getSeatRecommendation(
                      source.lat,
                      source.lon,
                      destination.lat,
                      destination.lon,
                      !!viewingWindows.sunrise.start,
                      !!viewingWindows.sunset.start
                    );
                    return (
                      <div>
                        {viewingWindows.sunrise.start && (
                          <Text
                            type="warning"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            <SunOutlined style={{ color: "#faad14" }} /> For
                            sunrise views, choose a {recommendation.sunrise}{" "}
                            side window seat
                          </Text>
                        )}
                        {viewingWindows.sunset.start && (
                          <Text style={{ color: "#1890ff", display: "block" }}>
                            <CloudOutlined style={{ color: "#1890ff" }} /> For
                            sunset views, choose a {recommendation.sunset} side
                            window seat
                          </Text>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {source && destination && viewingWindows ? (
                <div>
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
                        <SunOutlined /> Sunrise Viewing Window
                      </Title>
                      <div>
                        <div style={{ marginBottom: "8px" }}>
                          <Text
                            strong
                            style={{
                              color: "#fff",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Starts:
                          </Text>
                          <Text style={{ color: "#fff" }}>
                            {viewingWindows.sunrise.start.time}
                          </Text>
                          {locationNames.sunrise.start && (
                            <Text
                              type="warning"
                              style={{ display: "block", marginTop: "4px" }}
                            >
                              <EnvironmentOutlined />{" "}
                              {locationNames.sunrise.start}
                            </Text>
                          )}
                        </div>
                        <div>
                          <Text
                            strong
                            style={{
                              color: "#fff",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Ends:
                          </Text>
                          <Text style={{ color: "#fff" }}>
                            {viewingWindows.sunrise.end.time}
                          </Text>
                          {locationNames.sunrise.end && (
                            <Text
                              type="warning"
                              style={{ display: "block", marginTop: "4px" }}
                            >
                              <EnvironmentOutlined />{" "}
                              {locationNames.sunrise.end}
                            </Text>
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
                        <CloudOutlined /> Sunset Viewing Window
                      </Title>
                      <div>
                        <div style={{ marginBottom: "8px" }}>
                          <Text
                            strong
                            style={{
                              color: "#fff",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Starts:
                          </Text>
                          <Text style={{ color: "#fff" }}>
                            {viewingWindows.sunset.start.time}
                          </Text>
                          {locationNames.sunset.start && (
                            <Text
                              style={{
                                color: "#1890ff",
                                display: "block",
                                marginTop: "4px",
                              }}
                            >
                              <EnvironmentOutlined />{" "}
                              {locationNames.sunset.start}
                            </Text>
                          )}
                        </div>
                        <div>
                          <Text
                            strong
                            style={{
                              color: "#fff",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            Ends:
                          </Text>
                          <Text style={{ color: "#fff" }}>
                            {viewingWindows.sunset.end.time}
                          </Text>
                          {locationNames.sunset.end && (
                            <Text
                              style={{
                                color: "#1890ff",
                                display: "block",
                                marginTop: "4px",
                              }}
                            >
                              <EnvironmentOutlined /> {locationNames.sunset.end}
                            </Text>
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
                </div>
              ) : (
                <Alert
                  message="Enter flight details to get viewing opportunities"
                  type="info"
                  showIcon
                />
              )}

              <div>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    marginBottom: "4px",
                  }}
                >
                  * Times are shown in your local timezone
                </Text>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "12px" }}
                >
                  * Viewing windows are calculated for civil twilight periods
                </Text>
              </div>
            </Space>
          </Card>

          {/* General Tips Card */}
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
                <Text style={{ color: "#fff" }}>
                  Window seats offer the best views of sunrise/sunset
                </Text>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <Text style={{ color: "#fff" }}>
                  Consider the season when choosing your seat
                </Text>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <Text style={{ color: "#fff" }}>
                  Flight direction affects sun position
                </Text>
              </li>
              <li>
                <Text style={{ color: "#fff" }}>
                  Morning and evening flights often offer better views
                </Text>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
