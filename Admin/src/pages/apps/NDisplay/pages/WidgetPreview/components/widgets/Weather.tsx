import React, { useEffect, useState } from "react";

interface WeatherProps {
  location: string;
}

interface GeoLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

const Weather: React.FC<WeatherProps> = ({ location }) => {
  const [geoData, setGeoData] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;

    const fetchGeoData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
          const loc = data.results[0];
          setGeoData({
            name: loc.name,
            country: loc.country,
            latitude: loc.latitude,
            longitude: loc.longitude,
          });
        } else {
          setError("Location not found");
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchGeoData();
  }, [location]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4 border rounded shadow max-w-sm">
      <h2 className="text-lg font-semibold mb-2">Location: {geoData?.name}</h2>
      <p>Country: {geoData?.country}</p>
      <p>Latitude: {geoData?.latitude}</p>
      <p>Longitude: {geoData?.longitude}</p>
    </div>
  );
};

export default Weather;
