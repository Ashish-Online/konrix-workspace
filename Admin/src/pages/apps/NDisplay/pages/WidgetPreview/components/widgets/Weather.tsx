import React, { useEffect, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";

interface WeatherProps {
  location: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

const weatherCodes: Record<number, string> = {
  0: "Clear",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  // …add more codes as needed
};

const Weather: React.FC<WeatherProps> = ({ location, onEdit, onDelete }) => {
  const [geo, setGeo] = useState<GeoLocation | null>(null);
  const [tempC, setTempC] = useState<number | null>(null);
  const [code, setCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1) Geocode
  useEffect(() => {
    if (!location) return;
    setLoading(true);
    fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        location
      )}&count=1`
    )
      .then(res => res.json())
      .then(data => {
        if (data.results?.length) {
          const r = data.results[0];
          setGeo({
            latitude: r.latitude,
            longitude: r.longitude,
            name: r.name,
            country: r.country,
          });
        } else {
          throw new Error("Location not found");
        }
      })
      .catch(() => setError("Could not geocode location"))
      .finally(() => setLoading(false));
  }, [location]);

  // 2) Fetch current weather
  useEffect(() => {
    if (!geo) return;
    setLoading(true);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&current_weather=true`
    )
      .then(res => res.json())
      .then(data => {
        const cw = data.current_weather;
        setTempC(cw.temperature);
        setCode(cw.weathercode);
      })
      .catch(() => setError("Could not fetch weather"))
      .finally(() => setLoading(false));
  }, [geo]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (tempC === null || code === null || !geo) return null;

  // derive other values
  const tempF = (tempC * 9) / 5 + 32;
  const weekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const desc = weatherCodes[code] || "Unknown";

  return (
    <div className="relative w-full h-full bg-white shadow rounded overflow-auto group">
      {/* hover controls */}
      <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {onEdit && (
          <button
            onClick={onEdit}
            className="bg-white rounded-full p-1 shadow hover:bg-gray-100"
          >
            <MdEdit size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="bg-white rounded-full p-1 shadow hover:bg-red-100"
          >
            <MdDelete size={18} color="red" />
          </button>
        )}
      </div>

      {/* main card */}
      <div
        className="relative rounded-2xl text-white bg-gradient-to-br from-blue-300 to-sky-400 shadow-lg flex flex-col justify-between items-center"
        style={{
          width: "100%",
          height: "100%",
          minWidth: 220,
          minHeight: 220,
          padding: 20,
          boxSizing: "border-box",
        }}
      >
        {/* sun icon */}
        <div className="absolute top-3 right-4 z-10 opacity-90">
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 30 30"
            className="text-yellow-200"
            height="60"
            width="60"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1.56,16.9c0,0.9,..."></path>
          </svg>
        </div>

        {/* location */}
        <div className="text-center font-semibold text-sm tracking-wide">
          {geo.name}, {geo.country}
        </div>

        {/* temperature */}
        <div className="flex flex-col justify-center items-center flex-1">
          <div className="text-5xl font-bold leading-snug">
            {tempC.toFixed(1)}°
          </div>
          <div className="text-base opacity-90">
            {tempF.toFixed(1)} F
          </div>
        </div>

        {/* day & description */}
        <div className="text-xs font-light text-center opacity-80">
          {weekday} · {desc}
        </div>
      </div>
    </div>
  );
};

export default Weather;
