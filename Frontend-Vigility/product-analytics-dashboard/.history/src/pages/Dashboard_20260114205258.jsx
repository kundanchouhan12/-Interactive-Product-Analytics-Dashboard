import React, { useState, useEffect } from "react"; 
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import Cookies from "js-cookie";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    startDate: Cookies.get("startDate") || "2026-01-01T00:00",
    endDate: Cookies.get("endDate") || "2026-01-14T23:59",
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  useEffect(() => {
    if(selectedFeature) prepareLineChart();
  }, [selectedFeature, barData]);

  const fetchAnalytics = async () => {
  try {
    const res = await axios.get("/api/analytics", { params: filters });

    // safety check
    const barDataRaw = res?.data?.barData || {};
    const lineDataRaw = res?.data?.lineData || {};

    // bar chart data
    const barArr = Object.entries(barDataRaw).map(([feature, count]) => ({ feature, count }));
    setBarData(barArr);

    // reset line chart until user clicks a bar
    setLineData([]);
    window.lineDataMap = lineDataRaw; 
  } catch (e) {
    console.error("fetchAnalytics error:", e);
  }
};


  const prepareLineChart = () => {
    if(!selectedFeature || !window.lineDataMap[selectedFeature]) {
      setLineData([]);
      return;
    }
    const obj = window.lineDataMap[selectedFeature]; // {date: count}
    const arr = Object.entries(obj).map(([date, count]) => ({ date, count }));
    arr.sort((a,b) => new Date(a.date) - new Date(b.date));
    setLineData(arr);
  };

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    Cookies.set(name, value);
  };

  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username");
      await axios.post("/api/track", { username, featureName });
    } catch(e){ console.error(e); }
  };

  const handleBarClick = (data) => {
    if(!data || !data.activeLabel) return;
    const feature = data.activeLabel;
    setSelectedFeature(feature);
    trackClick(feature);
  };

  return (
    <div>
      <h2>Filters</h2>
      <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
      <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
      <select name="age" value={filters.age} onChange={handleFilterChange}>
        <option value="">All</option>
        <option value="<18">&lt;18</option>
        <option value="18-40">18-40</option>
        <option value=">40">&gt;40</option>
      </select>
      <select name="gender" value={filters.gender} onChange={handleFilterChange}>
        <option value="">All</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <h2>Feature Usage</h2>
      <BarChart width={600} height={300} data={barData} onClick={handleBarClick}>
        <XAxis dataKey="feature" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>

      <h2>Time Trend: {selectedFeature || "Select a feature"}</h2>
      <LineChart width={600} height={300} data={lineData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line dataKey="count" stroke="#82ca9d" />
      </LineChart>
    </div>
  );
}
