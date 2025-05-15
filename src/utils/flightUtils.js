import { bearing } from "@turf/turf";

export const getSeatRecommendation = (
  sourceLat,
  sourceLon,
  destLat,
  destLon
) => {
  const flightBearingTurf = bearing([sourceLon, sourceLat], [destLon, destLat]);
  const normalizedFlightBearing = (flightBearingTurf + 360) % 360;

  const recommendations = { sunrise: "N/A", sunset: "N/A" };

  // Approximate azimuth of the sun (degrees from North)
  const sunriseAzimuth = 90; // East
  const sunsetAzimuth = 270; // West

  // Calculate angle of sunrise relative to aircraft's nose
  // Positive result means sun is clockwise (right) from nose, negative means counter-clockwise (left)
  let angleToSunrise = (sunriseAzimuth - normalizedFlightBearing + 360) % 360;

  if (angleToSunrise > 0 && angleToSunrise < 180) {
    // Sun is 1-179 degrees clockwise from nose
    recommendations.sunrise = "right (starboard)";
  } else if (angleToSunrise > 180 && angleToSunrise < 360) {
    // Sun is 181-359 degrees clockwise (or 1-179 counter-clockwise)
    recommendations.sunrise = "left (port)";
  } else if (angleToSunrise === 0) {
    // Sun directly ahead
    recommendations.sunrise = "left (port)"; // Or "either side / ahead"
  } else if (angleToSunrise === 180) {
    // Sun directly behind
    recommendations.sunrise = "right (starboard)"; // Or "either side / behind"
  }

  // Calculate angle of sunset relative to aircraft's nose
  let angleToSunset = (sunsetAzimuth - normalizedFlightBearing + 360) % 360;

  if (angleToSunset > 0 && angleToSunset < 180) {
    recommendations.sunset = "right (starboard)";
  } else if (angleToSunset > 180 && angleToSunset < 360) {
    recommendations.sunset = "left (port)";
  } else if (angleToSunset === 0) {
    // Sun directly ahead
    recommendations.sunset = "left (port)";
  } else if (angleToSunset === 180) {
    // Sun directly behind
    recommendations.sunset = "right (starboard)";
  }

  return recommendations;
};
