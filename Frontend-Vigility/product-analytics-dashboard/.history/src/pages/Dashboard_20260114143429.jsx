import { useEffect, useState } from "react";
import api from "../api/axios";
import Cookies from "js-cookie";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";

export default function Dashboard() {

  // 🔹 filters with cookie persistence
  const [gender, setGender] = useState(Cookies.get("gender") || "");
  const [startDate, setStartDate] = useState(Cookies.get("startDate") || "");
  const [endDate, setEndDate] = useState(Cookies.get("endDate") || "");

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  // 🔹 save filters to cookies
  useEffect(() => {
    Cookies.set("gender", gender);
    Cookies.set("startDate", startDate);
    Cookies.set("endDate", endDate);
  }, [gender, startDate, endDate]);

  // 🔹 fetch bar chart data
  const fetchBarData = async () => {
    const res = await api.get("/api/analytics/features", {
      params: { gender, startDate, endDate }
    });
    setBarData(res.data);
  };

  useEffect(() => {
    fetchBarData();
  }, [gender, startDate, endDate]);

  // 🔹 bar click → line chart
  const onBarClick = async (data) => {
    setSelectedFeature(data.featureName);

    await api.post("/api/track", {
      featureName: "bar_chart_click"
    });

    const res = await api.get("/api/analytics/trend", {
      params: { featureName: data.featureName }
    });
    setLineData(res.data);
  };

  // 🔹 filter tracking
  const track = (name) => {
    api.post("/api/track", { featureName: name });
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>📊 Product Analytics Dashboard</h2>

      {/* 🔹 FILTERS */}
      <div style={{ display: "flex", gap: 10 }}>
        <select
          value={gender}
          onChange={e => { setGender(e.target.value); track("gender_filter"); }}
        >
          <option value="">All Genders</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={e => { setStartDate(e.target.value); track("date_filter"); }}
        />

        <input
          type="date"
          value={endDate}
          onChange={e => { setEndDate(e.target.value); track("date_filter"); }}
        />
      </div>

      {/* 🔹 BAR CHART */}
      <BarChart width={600} height={300} data={barData}>
        <XAxis dataKey="featureName" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" onClick={onBarClick} />
      </BarChart>

      {/* 🔹 LINE CHART */}
      {selectedFeature && (
        <>
          <h3>📈 Trend for {selectedFeature}</h3>
          <LineChart width={600} height={300} data={lineData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <CartesianGrid />
            <Line dataKey="count" />
          </LineChart>
        </>
      )}
    </div>
  );
}
