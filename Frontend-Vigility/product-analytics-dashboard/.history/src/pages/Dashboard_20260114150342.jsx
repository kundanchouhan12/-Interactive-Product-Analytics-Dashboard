import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Line } from "react-chartjs-2";
import { trackEvent } from "../api/track";

export default function Dashboard() {
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState({});
  const [selectedFeature, setSelectedFeature] = useState("");
  const [filters, setFilters] = useState({
    gender: localStorage.getItem("gender") || "",
    start: localStorage.getItem("start") || "",
    end: localStorage.getItem("end") || "",
  });

  // 🔹 FETCH BAR DATA
  const fetchBarData = async () => {
    try {
      const res = await API.get("/analytics", { params: filters });
      setBarData(res.data.map((item) => ({ feature: item.featureName, clicks: item.count })));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 FETCH LINE DATA
  const fetchLineData = async (feature) => {
    if (!feature) return;
    try {
      const res = await API.get(`/analytics/trend?feature=${feature}`);
      setLineData({
        labels: res.data.map((item) => item.date),
        datasets: [
          {
            label: `${feature} Click Trend`,
            data: res.data.map((item) => item.count),
            fill: false,
            borderColor: "rgba(153,102,255,1)",
          },
        ],
      });
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 HANDLE BAR CLICK
  const handleBarClick = async (feature) => {
    setSelectedFeature(feature);
    await trackEvent(feature); // POST /track
    fetchLineData(feature);
  };

  // 🔹 HANDLE FILTER CHANGE
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    localStorage.setItem(name, value); // persist filter
  };

  useEffect(() => {
    fetchBarData();
    if (selectedFeature) fetchLineData(selectedFeature);
  }, [filters]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Feature Usage Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Gender:
          <select name="gender" value={filters.gender} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label>
          Start Date:
          <input type="date" name="start" value={filters.start} onChange={handleFilterChange} />
        </label>
        <label>
          End Date:
          <input type="date" name="end" value={filters.end} onChange={handleFilterChange} />
        </label>
      </div>

      <BarChart width={600} height={300} data={barData}>
        <XAxis dataKey="feature" />
        <YAxis />
        <Tooltip />
        <Bar
          dataKey="clicks"
          fill="#1976d2"
          onClick={(item) => handleBarClick(item.feature)}
        />
      </BarChart>

      <div style={{ marginTop: "40px" }}>
        <Line data={lineData} />
      </div>
    </div>
  );
}
