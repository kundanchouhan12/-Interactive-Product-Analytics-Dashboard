// src/components/FeatureBarChart.jsx
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import API from "../../api/axios";

export default function FeatureBarChart({ data, onSelect }) {
  const handleClick = async (feature) => {
    onSelect(feature);
    // 🔹 Track event
    await API.post(`/track?feature=${feature}`);
  };

  return (
    <BarChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="feature" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="clicks" fill="#1976d2" onClick={(data) => handleClick(data.feature)} />
    </BarChart>
  );
}
