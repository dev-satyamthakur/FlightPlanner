import React from "react";
import { Card, Typography, Space } from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  CompassOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function FlightDetailsDisplay({
  source,
  destination,
  departureTime,
  flightHours,
  flightMinutes,
}) {
  return (
    <Card
      title={
        <Title level={4} style={{ color: "#fff" }}>
          Flight Details
        </Title>
      }
      style={{
        background: "#141414",
        borderColor: "#303030",
        color: "#fff",
      }}
      headStyle={{ borderColor: "#303030" }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            <EnvironmentOutlined /> Source City
          </Text>
          <Text style={{ color: "#fff" }}>
            {source.name} ({source.icao})
          </Text>
          <Text type="secondary" style={{ color: "#8c8c8c" }}>
            <CompassOutlined /> [{source.lat}, {source.lon}]
          </Text>
        </div>
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            <EnvironmentOutlined /> Destination
          </Text>
          <Text style={{ color: "#fff" }}>
            {destination.name} ({destination.icao})
          </Text>
          <Text type="secondary" style={{ color: "#8c8c8c" }}>
            <CompassOutlined /> [{destination.lat}, {destination.lon}]
          </Text>
        </div>
        <div>
          <Text strong style={{ color: "#1890ff" }}>
            <ClockCircleOutlined /> Departure
          </Text>
          <Text style={{ color: "#fff" }}>
            {new Date(departureTime).toLocaleString()}
          </Text>
          <Text strong style={{ color: "#1890ff" }}>
            <FieldTimeOutlined /> Duration
          </Text>
          <Text style={{ color: "#fff" }}>
            {flightHours ? `${flightHours} hours ` : ""}
            {flightMinutes ? `${flightMinutes} minutes` : ""}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
