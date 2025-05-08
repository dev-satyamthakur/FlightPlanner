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
          zIndex: 2, // Ensure it's above the globe
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          height: "100vh", // Ensure it fits within the viewport
          pointerEvents: "none", // Prevent overlay from capturing pointer events
        }}
      >
        {/* Left Column */}
        <div
          style={{
            width: "25%",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            height: "100%",
            pointerEvents: "auto", // Allow interaction with these elements
          }}
        >
          {/* Plan Your Flight Card */}
          <div
            style={{
              backdropFilter: "blur(10px)", // Glass effect
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark background
              borderRadius: "15px",
              padding: "10px",
              // Allow it to grow and shrink
              overflow: "hidden", // Prevent overflow
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
              <RocketOutlined /> Plan Your Flight
            </Title>

            <Form
              layout="vertical"
              onFinish={handleSubmit}
              className="space-y-2"
              style={{
                flex: 1,
                height: "100vh",
                overflow: "hidden",
                padding: "10px",
              }}
            >
              <Form.Item
                label={
                  <Text style={{ color: "white", fontSize: "14px" }}>
                    Source Airport
                  </Text>
                }
                required
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
                  <Text style={{ color: "white", fontSize: "14px" }}>
                    Destination Airport
                  </Text>
                }
                required
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
                  <Text style={{ color: "white", fontSize: "14px" }}>
                    <CalendarOutlined /> Departure Time
                  </Text>
                }
                required
              >
                <DatePicker
                  showTime
                  onChange={(date, dateString) => setDepartureTime(dateString)}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Text style={{ color: "white", fontSize: "14px" }}>
                    <HourglassOutlined /> Flight Duration
                  </Text>
                }
                required
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
          </div>

          {/* Flight Details Card */}
          <div
            style={{
              backdropFilter: "blur(10px)", // Glass effect
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark background
              borderRadius: "15px",
              padding: "10px",
              flex: 1, // Allow it to grow and shrink
              overflow: "hidden", // Prevent overflow
              display: "flex",
              flexDirection: "column",
              marginBottom: "10px",
            }}
          >
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
                  style={{ flex: 1, overflowY: "auto" }} // Allow details to scroll if needed
                />
              )}
          </div>
        </div>

        {/* Right Column - Flight Tips */}
        <div
          style={{
            width: "25%",
            backdropFilter: "blur(10px)", // Glass effect
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent dark background
            borderRadius: "15px",
            padding: "10px",
            height: "100%",
            overflowY: "auto", // Allow scrolling if content overflows
            pointerEvents: "auto", // Allow interaction with these elements
          }}
        >
          <Title level={4} style={{ color: "white", marginBottom: "16px" }}>
            <InfoCircleOutlined /> Flight Tips
          </Title>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Card
              title="Viewing Opportunities"
              bordered={false}
              className="bg-gray-800 text-white"
            >
              {viewingWindows && (
                <div className="mb-4">
                  <Text strong style={{ color: "white" }}>
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
                          <Text type="warning" style={{ display: "block" }}>
                            <RiseOutlined /> For sunrise views, choose a{" "}
                            {recommendation.sunrise} side window seat
                          </Text>
                        )}
                        {viewingWindows.sunset.start && (
                          <Text
                            type="secondary"
                            style={{ display: "block", color: "#1890ff" }}
                          >
                            <SettingOutlined /> For sunset views, choose a{" "}
                            {recommendation.sunset} side window seat
                          </Text>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {source &&
              destination &&
              departureTime &&
              totalFlightDuration > 0 ? (
                <div>
                  {viewingWindows ? (
                    <>
                      {viewingWindows.sunrise.start && (
                        <Card
                          className="mb-2"
                          style={{ backgroundColor: "rgba(250, 173, 20, 0.1)" }}
                        >
                          <Title level={5} style={{ color: "#faad14" }}>
                            <RiseOutlined /> Sunrise Viewing Window
                          </Title>
                          <div>
                            <div>
                              <Text strong style={{ color: "white" }}>
                                Starts:
                              </Text>{" "}
                              <Text style={{ color: "white" }}>
                                {viewingWindows.sunrise.start.time}
                              </Text>
                              {locationNames.sunrise.start && (
                                <div>
                                  <EnvironmentOutlined
                                    style={{ color: "#faad14" }}
                                  />{" "}
                                  <Text type="warning">
                                    {locationNames.sunrise.start}
                                  </Text>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <Text strong style={{ color: "white" }}>
                                Ends:
                              </Text>{" "}
                              <Text style={{ color: "white" }}>
                                {viewingWindows.sunrise.end.time}
                              </Text>
                              {locationNames.sunrise.end && (
                                <div>
                                  <EnvironmentOutlined
                                    style={{ color: "#faad14" }}
                                  />{" "}
                                  <Text type="warning">
                                    {locationNames.sunrise.end}
                                  </Text>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      )}

                      {viewingWindows.sunset.start && (
                        <Card
                          className="mb-2"
                          style={{ backgroundColor: "rgba(24, 144, 255, 0.1)" }}
                        >
                          <Title level={5} style={{ color: "#1890ff" }}>
                            <SettingOutlined /> Sunset Viewing Window
                          </Title>
                          <div>
                            <div>
                              <Text strong style={{ color: "white" }}>
                                Starts:
                              </Text>{" "}
                              <Text style={{ color: "white" }}>
                                {viewingWindows.sunset.start.time}
                              </Text>
                              {locationNames.sunset.start && (
                                <div>
                                  <EnvironmentOutlined
                                    style={{ color: "#1890ff" }}
                                  />{" "}
                                  <Text style={{ color: "#1890ff" }}>
                                    {locationNames.sunset.start}
                                  </Text>
                                </div>
                              )}
                            </div>
                            <div className="mt-2">
                              <Text strong style={{ color: "white" }}>
                                Ends:
                              </Text>{" "}
                              <Text style={{ color: "white" }}>
                                {viewingWindows.sunset.end.time}
                              </Text>
                              {locationNames.sunset.end && (
                                <div>
                                  <EnvironmentOutlined
                                    style={{ color: "#1890ff" }}
                                  />{" "}
                                  <Text style={{ color: "#1890ff" }}>
                                    {locationNames.sunset.end}
                                  </Text>
                                </div>
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
                    </>
                  ) : (
                    <div className="flex justify-center items-center h-24">
                      <Spin size="large" />
                    </div>
                  )}

                  <div className="mt-4">
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: "12px" }}
                    >
                      * Times are shown in your local timezone
                    </Text>
                    <Text
                      type="secondary"
                      style={{ display: "block", fontSize: "12px" }}
                    >
                      * Viewing windows are calculated for civil twilight
                      periods
                    </Text>
                  </div>
                </div>
              ) : (
                <Alert
                  message="Enter flight details to get viewing opportunities"
                  type="info"
                  showIcon
                />
              )}
            </Card>

            <Card
              title="General Tips"
              bordered={false}
              className="bg-gray-800 text-white"
            >
              <Collapse ghost>
                <Panel
                  header={
                    <Text style={{ color: "white" }}>
                      Tips for the best views
                    </Text>
                  }
                  key="1"
                >
                  <ul className="pl-5 space-y-2">
                    <li>
                      <Text style={{ color: "white" }}>
                        Window seats offer the best views of sunrise/sunset
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "white" }}>
                        Consider the season when choosing your seat
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "white" }}>
                        Flight direction affects sun position
                      </Text>
                    </li>
                    <li>
                      <Text style={{ color: "white" }}>
                        Morning and evening flights often offer better views
                      </Text>
                    </li>
                  </ul>
                </Panel>
              </Collapse>
            </Card>
          </Space>
        </div>
      </div>
    </div>
  );
}
