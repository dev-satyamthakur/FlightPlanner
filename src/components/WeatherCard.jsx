import React, { useState, useEffect } from "react";
import { Card, Typography, Space, Spin, Alert } from "antd";
import { CaretRightOutlined, EnvironmentOutlined } from "@ant-design/icons";
import {
  WiThermometer,
  WiHumidity,
  WiStrongWind,
  WiCloudy,
  WiRain,
  WiDaySunny,
  WiNightClear,
  WiDayCloudy,
  WiNightCloudy,
  WiRainMix,
  WiSnow,
  WiThunderstorm,
  WiDust,
  WiFog,
} from "react-icons/wi";

const { Title, Text } = Typography;

const weatherIcons = {
  "01d": <WiDaySunny />,
  "01n": <WiNightClear />,
  "02d": <WiDayCloudy />,
  "02n": <WiNightCloudy />,
  "03d": <WiCloudy />,
  "03n": <WiCloudy />,
  "04d": <WiCloudy />,
  "04n": <WiCloudy />,
  "09d": <WiRainMix />,
  "09n": <WiRainMix />,
  "10d": <WiRain />,
  "10n": <WiRain />,
  "11d": <WiThunderstorm />,
  "11n": <WiThunderstorm />,
  "13d": <WiSnow />,
  "13n": <WiSnow />,
  "50d": <WiFog />,
  "50n": <WiFog />,
};

const WeatherInfo = ({ weather, location, loading, error }) => {
  if (loading) {
    return <Spin size="small" />;
  }

  if (error) {
    return (
      <Alert
        message={error}
        type="error"
        showIcon
        style={{ marginBottom: "8px" }}
      />
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <div style={{ marginBottom: "16px" }}>
      <Text
        strong
        style={{
          color: "#1890ff",
          display: "block",
          marginBottom: "8px",
          fontFamily: "var(--font-primary)",
        }}
      >
        <EnvironmentOutlined /> {location}
      </Text>
      <Space direction="vertical" size={2} style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              fontSize: "2em",
              marginRight: "8px",
              color: "#fff",
            }}
          >
            {weatherIcons[weather.weather[0].icon]}
          </span>
          <Text
            style={{
              color: "#fff",
              fontSize: "1.2em",
              fontFamily: "var(--font-secondary)",
            }}
          >
            {Math.round(weather.main.temp)}°C
          </Text>
        </div>
        <Text
          style={{
            color: "#fff",
            textTransform: "capitalize",
            fontFamily: "var(--font-secondary)",
          }}
        >
          {weather.weather[0].description}
        </Text>
        <Space size={16}>
          <Text style={{ color: "#fff" }}>
            <WiThermometer
              style={{ fontSize: "1.2em", verticalAlign: "middle" }}
            />{" "}
            Feels like: {Math.round(weather.main.feels_like)}°C
          </Text>
          <Text style={{ color: "#fff" }}>
            <WiHumidity
              style={{ fontSize: "1.2em", verticalAlign: "middle" }}
            />{" "}
            {weather.main.humidity}%
          </Text>
        </Space>
        <Text style={{ color: "#fff" }}>
          <WiStrongWind
            style={{ fontSize: "1.2em", verticalAlign: "middle" }}
          />{" "}
          Wind: {Math.round(weather.wind.speed * 3.6)} km/h
        </Text>
      </Space>
    </div>
  );
};

export default function WeatherCard({
  source,
  destination,
  departureTime,
  flightHours,
  flightMinutes,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sourceWeather, setSourceWeather] = useState(null);
  const [destWeather, setDestWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

  useEffect(() => {
    const fetchWeatherForecast = async (lat, lon, targetTime) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
        );
        if (!response.ok) {
          throw new Error("Weather forecast not available");
        }
        const data = await response.json();

        // Find the closest forecast time to our target time
        const targetTimestamp = new Date(targetTime).getTime() / 1000;
        const closestForecast = data.list.reduce((prev, curr) => {
          const prevDiff = Math.abs(prev.dt - targetTimestamp);
          const currDiff = Math.abs(curr.dt - targetTimestamp);
          return currDiff < prevDiff ? curr : prev;
        });

        return closestForecast;
      } catch (err) {
        throw new Error("Failed to fetch weather forecast");
      }
    };

    const updateWeather = async () => {
      if (!API_KEY) {
        setError("OpenWeatherMap API key is not configured");
        return;
      }

      if (source?.lat && source?.lon && departureTime) {
        setLoading(true);
        setError(null);
        try {
          // Calculate arrival time for destination
          const arrivalTime = new Date(departureTime);
          const totalMinutes =
            (parseInt(flightHours) || 0) * 60 + (parseInt(flightMinutes) || 0);
          arrivalTime.setMinutes(arrivalTime.getMinutes() + totalMinutes);

          const [sourceData, destData] = await Promise.all([
            fetchWeatherForecast(source.lat, source.lon, departureTime),
            destination?.lat && destination?.lon
              ? fetchWeatherForecast(
                  destination.lat,
                  destination.lon,
                  arrivalTime
                )
              : null,
          ]);
          setSourceWeather(sourceData);
          setDestWeather(destData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    updateWeather();
    // Update weather forecast every 30 minutes
    const interval = setInterval(updateWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [source, destination, departureTime, flightHours, flightMinutes, API_KEY]);

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
        Weather Information
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
        {!source && !destination ? (
          <Alert
            message="Select airports to view weather information"
            type="info"
            showIcon
          />
        ) : (
          <>
            {source && (
              <WeatherInfo
                weather={sourceWeather}
                location={`${source.city}, ${source.country} (Source)`}
                loading={loading}
                error={error}
              />
            )}
            {destination && (
              <WeatherInfo
                weather={destWeather}
                location={`${destination.city}, ${destination.country} (Destination)`}
                loading={loading}
                error={error}
              />
            )}
          </>
        )}
      </div>
    </Card>
  );
}
