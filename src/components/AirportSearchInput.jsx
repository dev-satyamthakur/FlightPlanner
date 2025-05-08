import React, { useState, useRef, useCallback, useEffect } from "react";
import airportsData from "../data/airports.json";
import Fuse from "fuse.js";
import debounce from "lodash.debounce";
import { Input, Select, Typography } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

const airportsArray = Object.values(airportsData);
const fuseOptions = {
  keys: ["icao", "iata", "name", "city", "country"],
  threshold: 0.3,
};

export default function AirportSearchInput({ onSelect, excludeIcao }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const fuse = useRef(new Fuse(airportsArray, fuseOptions)).current;

  const debouncedSearch = useCallback(
    debounce((value) => {
      setLoading(true);
      let filtered = value ? fuse.search(value).map((r) => r.item) : [];
      if (excludeIcao) {
        filtered = filtered.filter((a) => a.icao !== excludeIcao);
      }
      setResults(filtered.slice(0, 10));
      setLoading(false);
    }, 300),
    [fuse, excludeIcao]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = (value) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelect = (value) => {
    const airport = results.find((a) => a.icao === value);
    if (airport) {
      setQuery(`${airport.city}, ${airport.country}`);
      onSelect(airport);
    }
  };

  return (
    <Select
      showSearch
      value={query}
      placeholder="Search for an airport..."
      notFoundContent={null}
      showArrow={false}
      filterOption={false}
      onSearch={handleChange}
      onChange={handleSelect}
      loading={loading}
      style={{ width: "100%" }}
      suffixIcon={<SearchOutlined />}
      optionLabelProp="label"
    >
      {results.map((airport) => (
        <Option
          key={airport.icao}
          value={airport.icao}
          label={`${airport.name} (${airport.icao}${
            airport.iata ? "/" + airport.iata : ""
          })`}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong>
              {airport.name} ({airport.icao}
              {airport.iata && `/${airport.iata}`})
            </Text>
            <Text type="secondary">
              <EnvironmentOutlined /> {airport.city}, {airport.country}
            </Text>
          </div>
        </Option>
      ))}
    </Select>
  );
}
