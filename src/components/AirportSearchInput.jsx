import React, { useState, useRef, useCallback, useEffect } from "react";
import airportsData from "../data/airports.json";
import Fuse from "fuse.js";
import debounce from "lodash.debounce";

const airportsArray = Object.values(airportsData);
const fuseOptions = {
  keys: ["icao", "iata", "name", "city", "country"],
  threshold: 0.3,
};

export default function AirportSearchInput({ label, onSelect, excludeIcao }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const fuse = useRef(new Fuse(airportsArray, fuseOptions)).current;

  const debouncedSearch = useCallback(
    debounce((value) => {
      let filtered = value ? fuse.search(value).map((r) => r.item) : [];
      if (excludeIcao) {
        filtered = filtered.filter((a) => a.icao !== excludeIcao);
      }
      setResults(filtered.slice(0, 10));
    }, 300),
    [fuse, excludeIcao]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelect = (airport) => {
    setQuery(
      `${airport.name} (${airport.icao}${
        airport.iata ? "/" + airport.iata : ""
      })`
    );
    setResults([]);
    onSelect(airport);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", marginBottom: "5px" }}>{label}</label>
      <input
        type="text"
        placeholder={`Search ${label.toLowerCase()}...`}
        aria-label={label}
        value={query}
        onChange={handleChange}
        autoComplete="off"
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "5px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
      {results.length > 0 && (
        <ul
          role="listbox"
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            border: "1px solid #ccc",
            borderRadius: "4px",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((airport) => (
            <li
              key={airport.icao}
              role="option"
              onClick={() => handleSelect(airport)}
              style={{
                padding: "8px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                ":hover": {
                  backgroundColor: "#f0f0f0",
                },
              }}
            >
              {airport.name} ({airport.icao}
              {airport.iata && `/${airport.iata}`}) - {airport.city},{" "}
              {airport.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
