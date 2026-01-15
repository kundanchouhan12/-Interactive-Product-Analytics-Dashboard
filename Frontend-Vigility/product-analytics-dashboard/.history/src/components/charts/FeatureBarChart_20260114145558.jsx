import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function FeatureBarChart({ data, onSelect }) {
  return (
    <BarChart width={500} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="feature" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="clicks" fill="#1976d2" onClick={(d) => onSelect(d.feature)} />
    </BarChart>
  );
}
