import React, { useState } from "react";
import { Card, Typography } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";

const { Title } = Typography;

export default function GeneralTipsCard() {
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
        General Tips
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
        <ul style={{ listStyle: "disc", paddingLeft: "20px", margin: 0 }}>
          <li style={{ marginBottom: "8px" }}>
            <Typography.Text
              style={{ color: "#fff", fontFamily: "var(--font-secondary)" }}
            >
              Window seats offer the best views of sunrise/sunset
            </Typography.Text>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <Typography.Text
              style={{ color: "#fff", fontFamily: "var(--font-secondary)" }}
            >
              Consider the season when choosing your seat
            </Typography.Text>
          </li>
          <li style={{ marginBottom: "8px" }}>
            <Typography.Text
              style={{ color: "#fff", fontFamily: "var(--font-secondary)" }}
            >
              Flight direction affects sun position
            </Typography.Text>
          </li>
          <li>
            <Typography.Text
              style={{ color: "#fff", fontFamily: "var(--font-secondary)" }}
            >
              Morning and evening flights often offer better views
            </Typography.Text>
          </li>
        </ul>
      </div>
    </Card>
  );
}
