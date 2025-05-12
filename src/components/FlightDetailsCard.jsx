import React from "react";
import { motion } from "framer-motion";
import FlightDetailsDisplay from "./FlightDetailsDisplay";

export default function FlightDetailsCard({
  source,
  destination,
  departureTime,
  flightHours,
  flightMinutes,
  totalFlightDuration,
  animations,
}) {
  if (!(source && destination && departureTime && totalFlightDuration() > 0)) {
    return null;
  }
  return (
    <motion.div
      variants={animations.fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <FlightDetailsDisplay
        source={source}
        destination={destination}
        departureTime={departureTime}
        flightHours={flightHours}
        flightMinutes={flightMinutes}
      />
    </motion.div>
  );
}
