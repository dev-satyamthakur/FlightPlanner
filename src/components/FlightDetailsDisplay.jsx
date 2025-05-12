import React, { memo } from "react";
import PropTypes from "prop-types";
import { Card, Typography, Space } from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  FieldTimeOutlined,
  CompassOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DetailSection = memo(({ icon, title, mainText, subText }) => (
  <div>
    <Text
      strong
      style={{ color: "#1890ff", display: "block", marginBottom: "4px" }}
    >
      {icon} {title}
    </Text>
    <Text style={{ color: "#fff", display: "block", marginBottom: "4px" }}>
      {mainText}
    </Text>
    {subText && (
      <Text type="secondary" style={{ color: "#8c8c8c", display: "block" }}>
        <CompassOutlined /> {subText}
      </Text>
    )}
  </div>
));

DetailSection.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  mainText: PropTypes.string.isRequired,
  subText: PropTypes.string,
};

const cardStyle = {
  background: "rgba(0, 0, 0, 0.5)",
  backdropFilter: "blur(10px)",
  borderColor: "#303030",
  color: "#fff",
  borderRadius: "15px",
  height: "fit-content",
  marginBottom: "10px",
};

const headStyle = {
  borderColor: "#303030",
  padding: "12px 16px",
};

const bodyStyle = {
  padding: "16px",
};

const FlightDetailsDisplay = ({
  source,
  destination,
  departureTime,
  flightHours,
  flightMinutes,
}) => {
  const formatDuration = () => {
    const parts = [];
    if (flightHours) parts.push(`${flightHours} hours`);
    if (flightMinutes) parts.push(`${flightMinutes} minutes`);
    return parts.join(" ");
  };

  return (
    <Card
      title={
        <Title level={4} style={{ color: "#fff", margin: 0 }}>
          Flight Details
        </Title>
      }
      style={cardStyle}
      headStyle={headStyle}
      bodyStyle={bodyStyle}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <DetailSection
          icon={<EnvironmentOutlined />}
          title="Source City"
          mainText={`${
            source.city + ", " + source.state + ", " + source.country
          } (${source.icao})`}
          subText={`[${source.lat}, ${source.lon}]`}
        />
        <DetailSection
          icon={<EnvironmentOutlined />}
          title="Destination"
          mainText={`${
            destination.city +
            ", " +
            destination.state +
            ", " +
            destination.country
          } (${destination.icao})`}
          subText={`[${destination.lat}, ${destination.lon}]`}
        />
        <DetailSection
          icon={<ClockCircleOutlined />}
          title="Departure"
          mainText={new Date(departureTime).toLocaleString()}
        />
        <DetailSection
          icon={<FieldTimeOutlined />}
          title="Duration"
          mainText={formatDuration()}
        />
      </Space>
    </Card>
  );
};

FlightDetailsDisplay.propTypes = {
  source: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icao: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  destination: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icao: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  departureTime: PropTypes.string.isRequired,
  flightHours: PropTypes.string,
  flightMinutes: PropTypes.string,
};

export default memo(FlightDetailsDisplay);
