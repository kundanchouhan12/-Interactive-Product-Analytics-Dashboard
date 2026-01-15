// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Bar, Line } from "react-chartjs-2";

export default function Dashboard() {
  const [barData, setBarData] = useState({});
  const [lineData, setLineData] = useState({});
  const [selectedFeature, setSelectedFeature] = useState("");

  const fetchBarData = async () => {
    try {
      const res = await API.get("/analytics");
      const labels = res.data.map(item => item.featureName);
      const counts = res.data.map(item => item.count);
      setBarData({
        labels,
        datasets: [{ label: "Feature Clicks", data: counts, backgroundColor: "rgba(75,192,192,0.6)" }]
      });
    } catch (err) {
      console.error("AxiosError", err);
    }
  };

  const fetchLineData = async (feature) => {
    if (!feature) return;
    try {
      const res = await API.get(`/analytics/trend?feature=${feature}`);
      const labels = res.data.map(item => item.date);
      const counts = res.data.map(item => item.count);
      setLineData({
        labels,
        datasets: [{ label: `${feature} Click Trend`, data: counts, fill: false, borderColor: "rgba(153,102,255,1)" }]
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBarClick = async (feature) => {
    setSelectedFeature(feature);
    await API.post(`/track?featureName=${feature}`); // JWT sent automatically
    fetchLineData(feature);
  };

  useEffect(() => {
    fetchBarData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Feature Usage Dashboard</h2>
      <Bar
        data={barData}
        options={{
          onClick: (e, elements) => {
            if (elements.length > 0) {
              handleBarClick(barData.labels[elements[0].index]);
            }
          },
        }}
      />
      <Line data={lineData} />
    </div>
  );
}
