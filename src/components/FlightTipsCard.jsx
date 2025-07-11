import React, { useState } from "react";
import { Card, Typography, Space, Alert } from "antd";
import { motion } from "framer-motion";
import { WiSunrise, WiSunset } from "react-icons/wi";
import { EnvironmentOutlined } from "@ant-design/icons";
import { CaretRightOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function FlightTipsCard({
  viewingWindows,
  source,
  destination,
  getSeatRecommendation,
  locationNames,
  animations,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const cardTitle = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
      }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <CaretRightOutlined
        rotate={isExpanded ? 90 : 0}
        style={{
          marginRight: "8px",
          transition: "all 0.3s",
          color: "#fff",
        }}
      />
      <Title
        level={4}
        style={{
          color: "#fff",
          margin: 0,
          fontFamily: "var(--font-accent)",
          cursor: "pointer",
        }}
      >
        Flight Tips
      </Title>
    </div>
  );

  return (
    <Card
      title={cardTitle}
      style={{
        background: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(10px)",
        borderColor: "#303030",
        color: "#fff",
        borderRadius: "15px",
        height: "fit-content",
        marginBottom: "10px",
        overflow: "hidden",
      }}
      styles={{
        header: {
          borderColor: isExpanded ? "#303030" : "transparent",
          padding: "12px 16px",
          cursor: "pointer",
          borderBottomWidth: isExpanded ? "1px" : "0px",
          transition:
            "border-color 0.3s ease-in-out, border-bottom-width 0.3s ease-in-out",
        },
        body: {
          padding: "0 16px",
          maxHeight: isExpanded ? "2000px" : "0",
          opacity: isExpanded ? 1 : 0,
          overflow: "hidden",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      }}
    >
      <div
        style={{
          transform: `translateY(${isExpanded ? "0" : "-20px"})`,
          opacity: isExpanded ? 1 : 0,
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          padding: isExpanded ? "16px 0" : "0",
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {/* Info alert if details are missing */}
          {(!source || !destination || !viewingWindows) && (
            <Alert
              message="Enter your flight details to get tips and viewing opportunities."
              type="info"
              showIcon
              style={{ marginBottom: 8 }}
            />
          )}

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
                    fontFamily: "var(--font-primary)",
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
                          For sunrise views, choose a {recommendation.sunrise}{" "}
                          side window seat
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
                          For sunset views, choose a {recommendation.sunset}{" "}
                          side window seat
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
                      fontFamily: "var(--font-accent)",
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
                          <EnvironmentOutlined /> {locationNames.sunrise.start}
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
                          <EnvironmentOutlined /> {locationNames.sunrise.end}
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
                      fontFamily: "var(--font-accent)",
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
                          <EnvironmentOutlined /> {locationNames.sunset.start}
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
                          <EnvironmentOutlined /> {locationNames.sunset.end}
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
                * Viewing windows are calculated for civil twilight periods
              </Typography.Text>
            </div>
          </motion.div>
        </Space>
      </div>
    </Card>
  );
}
