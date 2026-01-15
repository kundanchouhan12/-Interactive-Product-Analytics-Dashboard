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
  const [featureData, setFeatureData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, [filters, selectedFeature]);

  // Fetch analytics from backend
  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("/api/analytics", { params: filters });
      
      // Transform backend data into chart data
      const data = Object.entries(res.data.featureCounts || {}).map(([feature, count]) => ({ feature, count }));
      setFeatureData(data);

      if(selectedFeature) {
        const line = (res.data.timeSeries[selectedFeature] || []).map(item => ({
          date: item.date,
          count: item.count
        }));
        setLineData(line);
      } else {
        setLineData([]);
      }
    } catch(e) {
      console.error("Error fetching analytics:", e);
    }
  };

  // Handle filter change
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    Cookies.set(name, value);

    // Track filter usage
    trackClick(name);
  };

  // Track user interactions
  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username");
      if(!username) return;
      await axios.post("/api/track", { username, featureName });
    } catch(e) {
      console.error("Error tracking click:", e);
    }
  };
  
  // Handle bar click
  const handleBarClick = (data) => {
    if(data && data.activePayload && data.activePayload[0]) {
      const feature = data.activePayload[0].payload.feature;
      setSelectedFeature(feature);
      trackClick(feature);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
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
      <BarChart width={600} height={300} data={featureData} onClick={handleBarClick}>
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
