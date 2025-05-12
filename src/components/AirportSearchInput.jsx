import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
  Suspense,
} from "react";
import PropTypes from "prop-types";
import debounce from "lodash.debounce";
import { Input, Select, Typography, Spin } from "antd";
import { SearchOutlined, EnvironmentOutlined } from "@ant-design/icons";

const { Option } = Select;
const { Text } = Typography;

const AirportOption = memo(({ airport }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <Text strong>
      {airport.name} ({airport.icao}
      {airport.iata && `/${airport.iata}`})
    </Text>
    <Text type="secondary">
      <EnvironmentOutlined /> {airport.city}, {airport.country}
    </Text>
  </div>
));

AirportOption.propTypes = {
  airport: PropTypes.shape({
    name: PropTypes.string.isRequired,
    icao: PropTypes.string.isRequired,
    iata: PropTypes.string,
    city: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
  }).isRequired,
};

const LazyAirportSearch = ({ onSelect, excludeIcao }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [airportsArray, setAirportsArray] = useState(null);
  const fuseRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([import("../data/airports.json"), import("fuse.js")]).then(
      ([airportsData, Fuse]) => {
        if (isMounted) {
          setAirportsArray(Object.values(airportsData.default || airportsData));
          fuseRef.current = new Fuse.default(
            Object.values(airportsData.default || airportsData),
            {
              keys: ["icao", "iata", "name", "city", "country"],
              threshold: 0.3,
            }
          );
        }
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setLoading(true);
      if (!fuseRef.current) {
        setResults([]);
        setLoading(false);
        return;
      }
      let filtered = value
        ? fuseRef.current.search(value).map((r) => r.item)
        : [];
      if (excludeIcao) {
        filtered = filtered.filter((a) => a.icao !== excludeIcao);
      }
      setResults(filtered.slice(0, 10));
      setLoading(false);
    }, 300),
    [excludeIcao]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleChange = useCallback(
    (value) => {
      setQuery(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleSelect = useCallback(
    (value) => {
      const airport = results.find((a) => a.icao === value);
      if (airport) {
        setQuery(
          `${airport.name} (${airport.icao}${
            airport.iata ? "/" + airport.iata : ""
          })`
        );
        onSelect(airport);
      }
    },
    [results, onSelect]
  );

  const getOptionLabel = useCallback(
    (airport) =>
      `${airport.name} (${airport.icao}${
        airport.iata ? "/" + airport.iata : ""
      })`,
    []
  );

  if (!airportsArray) {
    return <Spin style={{ width: "100%" }} />;
  }

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
          label={getOptionLabel(airport)}
        >
          <AirportOption airport={airport} />
        </Option>
      ))}
    </Select>
  );
};

LazyAirportSearch.propTypes = {
  onSelect: PropTypes.func.isRequired,
  excludeIcao: PropTypes.string,
};

export default memo(LazyAirportSearch);
