// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import FeatureBarChart from "./FeatureBarChart";
import API from "../../api/axios"; // JWT Axios

export default function Dashboard() {
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  // 🔹 Fetch bar chart data
  const fetchBarData = async () => {
    try {
      const res = await API.get("/analytics");
      const data = res.data.map((item) => ({
        feature: item.featureName,
        clicks: item.count,
      }));
      setBarData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Fetch line chart data
  const fetchLineData = async (feature) => {
    if (!feature) return;
    try {
      const res = await API.get(`/analytics/trend?feature=${feature}`);
      const data = res.data.map((item) => ({
        date: item.date,
        clicks: item.count,
      }));
      setLineData(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Handle bar click
  const handleBarClick = async (feature) => {
    setSelectedFeature(feature);
    await API.post(`/track?feature=${feature}`); // log click
    fetchLineData(feature);
  };

  useEffect(() => {
    fetchBarData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Feature Usage Dashboard</h2>

      <h3>Feature Clicks</h3>
      <FeatureBarChart data={barData} onSelect={handleBarClick} />

      <h3>Feature Trend: {selectedFeature}</h3>
      <LineChart width={600} height={300} data={lineData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="clicks" stroke="#1976d2" />
      </LineChart>
    </div>
  );
}
