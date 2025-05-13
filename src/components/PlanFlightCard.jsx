import React, { Suspense } from "react";
import { Card, Form, Typography, DatePicker, Space, InputNumber } from "antd";
import { CalendarOutlined, HourglassOutlined } from "@ant-design/icons";

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
  return (
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
      styles={{
        header: { borderColor: "#303030", padding: "12px 16px" },
        body: { padding: "16px" },
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
              }}
            >
              Destination Airport
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
              onChange={setFlightHours}
              placeholder="Hours"
              style={{ width: "100%" }}
            />
            <InputNumber
              min={0}
              max={59}
              value={flightMinutes}
              onChange={setFlightMinutes}
              placeholder="Minutes"
              style={{ width: "100%" }}
            />
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
