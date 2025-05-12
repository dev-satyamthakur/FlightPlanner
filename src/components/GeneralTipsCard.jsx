import React from "react";
import { Card, Typography } from "antd";
const { Title } = Typography;

export default function GeneralTipsCard() {
  return (
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
  );
}
