import React, { useEffect, useState } from "react";
import FeatureBarChart from "./../components/charts/FeatureBarChart";
import Filters from "../components/Filters";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import API from "../api/axios";

export default function Dashboard() {
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [filters, setFilters] = useState({ start: null, end: null, age: null, gender: null });

  const fetchBarData = async () => {
    const params = {};
    if (filters.gender) params.gender = filters.gender;
    if (filters.start) params.start = filters.start;
    if (filters.end) params.end = filters.end;

    const res = await API.get("/analytics", { params });
    setBarData(res.data.map(item => ({ feature: item.featureName, clicks: item.count })));
  };

  const fetchLineData = async (feature) => {
    if (!feature) return;
    const res = await API.get(`/analytics/trend?feature=${feature}`);
    setLineData(res.data.map(item => ({ date: item.date, clicks: item.count })));
  };

  const handleBarClick = async (feature) => {
    setSelectedFeature(feature);
    await API.post(`/track?feature=${feature}`);
    fetchLineData(feature);
  };

  useEffect(() => { fetchBarData(); }, [filters]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Feature Usage Dashboard</h2>
      <Filters filters={filters} setFilters={setFilters} />
      <FeatureBarChart data={barData} onSelect={handleBarClick} />
      <h3>Trend: {selectedFeature}</h3>
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
