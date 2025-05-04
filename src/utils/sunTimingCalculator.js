import SunCalc from "suncalc";

export const calculateSunViewingWindows = (
  source,
  destination,
  departureTime,
  flightDuration
) => {
  // Create points along the flight path (one point every 5 minutes)
  const totalPoints = Math.floor(flightDuration / 5);
  const viewingWindows = {
    sunrise: { start: null, end: null },
    sunset: { start: null, end: null },
  };

  // Calculate the great circle path
  const points = [];
  for (let i = 0; i <= totalPoints; i++) {
    const fraction = i / totalPoints;
    // Linear interpolation between source and destination
    const lat = source[0] + (destination[0] - source[0]) * fraction;
    const lon = source[1] + (destination[1] - source[1]) * fraction;
    const timeAtPoint = new Date(departureTime.getTime() + i * 5 * 60000); // 5 minutes intervals

    const sunTimes = SunCalc.getTimes(timeAtPoint, lat, lon);
    const sunPosition = SunCalc.getPosition(timeAtPoint, lat, lon);

    // Convert altitude to degrees
    const altitudeDeg = (sunPosition.altitude * 180) / Math.PI;

    // Check if we're in civil twilight period (-6° to 6° from horizon)
    if (Math.abs(altitudeDeg) <= 6) {
      const timeString = timeAtPoint.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      });

      // Determine if it's sunrise or sunset period
      if (timeAtPoint > sunTimes.sunrise && timeAtPoint < sunTimes.solarNoon) {
        // Sunrise period
        if (!viewingWindows.sunrise.start) {
          viewingWindows.sunrise.start = {
            time: timeString,
            position: { lat, lon },
          };
        }
        viewingWindows.sunrise.end = {
          time: timeString,
          position: { lat, lon },
        };
      } else if (
        timeAtPoint > sunTimes.solarNoon &&
        timeAtPoint < sunTimes.sunset
      ) {
        // Sunset period
        if (!viewingWindows.sunset.start) {
          viewingWindows.sunset.start = {
            time: timeString,
            position: { lat, lon },
          };
        }
        viewingWindows.sunset.end = {
          time: timeString,
          position: { lat, lon },
        };
      }
    }
  }

  return viewingWindows;
};

// Helper function to get location name from coordinates using reverse geocoding
export const getLocationName = async (lat, lon) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return (
      data.address?.city ||
      data.address?.state ||
      data.address?.country ||
      "Unknown location"
    );
  } catch (error) {
    console.error("Error fetching location name:", error);
    return "Unknown location";
  }
};
