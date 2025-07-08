import React, { Suspense, useState } from "react";
import { Card, Form, Typography, DatePicker, Space, InputNumber } from "antd";
import {
  CalendarOutlined,
  HourglassOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";

const { Title } = Typography;
const AirportSearchInput = React.lazy(() => import("./AirportSearchInput"));

export default function PlanFlightCard({
  source,
  setSource,
  destination,
  setDestination,
  departureTime,
  setDepartureTime,
  flightHours,
  setFlightHours,
  flightMinutes,
  setFlightMinutes,
  handleSubmit,
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
        Plan Your Flight
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
                  fontFamily: "var(--font-primary)",
                }}
              >
                <RocketOutlined /> Source Airport
              </Typography.Text>
            }
            name="source"
            rules={[
              {
                required: true,
                message: "Please select a source airport",
              },
            ]}
          >
            <Suspense fallback={<div>Loading airports...</div>}>
              <AirportSearchInput
                onSelect={setSource}
                excludeIcao={destination?.icao}
                value={source}
              />
            </Suspense>
          </Form.Item>

          <Form.Item
            label={
              <Typography.Text
                style={{
                  color: "white",
                  fontSize: "14px",
                  marginBottom: "4px",
                  fontFamily: "var(--font-primary)",
                }}
              >
                <EnvironmentOutlined /> Destination Airport
              </Typography.Text>
            }
            name="destination"
            rules={[
              {
                required: true,
                message: "Please select a destination airport",
              },
            ]}
          >
            <Suspense fallback={<div>Loading airports...</div>}>
              <AirportSearchInput
                onSelect={setDestination}
                excludeIcao={source?.icao}
                value={destination}
              />
            </Suspense>
          </Form.Item>

          <Form.Item
            label={
              <Typography.Text
                style={{
                  color: "white",
                  fontSize: "14px",
                  marginBottom: "4px",
                  fontFamily: "var(--font-primary)",
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
              onChange={(date, dateString) => setDepartureTime(dateString)}
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
                  fontFamily: "var(--font-primary)",
                }}
              >
                <HourglassOutlined /> Flight Duration
              </Typography.Text>
            }
            required
            style={{ marginBottom: "0" }}
          >
            <Space style={{ width: "100%" }} align="baseline">
              <InputNumber
                min={0}
                value={flightHours}
                onChange={setFlightHours}
                placeholder="Hours"
                style={{ flex: 1 }}
              />
              <Typography.Text
                style={{
                  color: "white",
                  marginLeft: "4px",
                  marginRight: "8px",
                }}
              >
                hrs
              </Typography.Text>
              <InputNumber
                min={0}
                max={59}
                value={flightMinutes}
                onChange={setFlightMinutes}
                placeholder="Minutes"
                style={{ flex: 1 }}
              />
              <Typography.Text style={{ color: "white", marginLeft: "4px" }}>
                mins
              </Typography.Text>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Card>
  );
}
