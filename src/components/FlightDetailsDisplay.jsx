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
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Flight Details
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
        <div>
          <Text
            strong
            style={{ color: "#1890ff", display: "block", marginBottom: "4px" }}
          >
            <EnvironmentOutlined /> Source City
          </Text>
          <Text
            style={{ color: "#fff", display: "block", marginBottom: "4px" }}
          >
            {source.name} ({source.icao})
          </Text>
          <Text type="secondary" style={{ color: "#8c8c8c", display: "block" }}>
            <CompassOutlined /> [{source.lat}, {source.lon}]
          </Text>
        </div>
        <div>
          <Text
            strong
            style={{ color: "#1890ff", display: "block", marginBottom: "4px" }}
          >
            <EnvironmentOutlined /> Destination
          </Text>
          <Text
            style={{ color: "#fff", display: "block", marginBottom: "4px" }}
          >
            {destination.name} ({destination.icao})
          </Text>
          <Text type="secondary" style={{ color: "#8c8c8c", display: "block" }}>
            <CompassOutlined /> [{destination.lat}, {destination.lon}]
          </Text>
        </div>
        <div>
          <Text
            strong
            style={{ color: "#1890ff", display: "block", marginBottom: "4px" }}
          >
            <ClockCircleOutlined /> Departure
          </Text>
          <Text
            style={{ color: "#fff", display: "block", marginBottom: "8px" }}
          >
            {new Date(departureTime).toLocaleString()}
          </Text>
          <Text
            strong
            style={{ color: "#1890ff", display: "block", marginBottom: "4px" }}
          >
            <FieldTimeOutlined /> Duration
          </Text>
          <Text style={{ color: "#fff", display: "block" }}>
            {flightHours ? `${flightHours} hours ` : ""}
            {flightMinutes ? `${flightMinutes} minutes` : ""}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
