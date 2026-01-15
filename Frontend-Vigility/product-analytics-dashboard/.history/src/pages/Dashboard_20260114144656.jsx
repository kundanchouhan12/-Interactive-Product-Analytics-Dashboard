import { useEffect, useState } from "react";
import api from "../api/axios";
import Cookies from "js-cookie";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [gender, setGender] = useState(Cookies.get("gender") || "");
  const [startDate, setStartDate] = useState(Cookies.get("startDate") || "");
  const [endDate, setEndDate] = useState(Cookies.get("endDate") || "");
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  useEffect(() => {
    Cookies.set("gender", gender);
    Cookies.set("startDate", startDate);
    Cookies.set("endDate", endDate);
  }, [gender, startDate, endDate]);

  const fetchBarData = async () => {
    const res = await api.get("/api/analytics/features", {
      params: { gender, startDate, endDate }
    });
    setBarData(res.data);
  };

  useEffect(() => {
    fetchBarData();
  }, [gender, startDate, endDate]);

  const onBarClick = async (data) => {
    setSelectedFeature(data.featureName);
    await api.post("/api/track", { featureName: "bar_chart_click" });
    const res = await api.get("/api/analytics/trend", {
      params: { featureName: data.featureName }
    });
    setLineData(res.data);
  };

  const track = (name) => {
    api.post("/api/track", { featureName: name });
  };

  return (
    <div style={{
      padding: "40px",
      fontFamily: "Inter, sans-serif",
      backgroundColor: "#f9fafb",
      minHeight: "100vh"
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        background: "#fff",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ marginBottom: "20px", color: "#1f2937" }}>
          📊 Product Analytics Dashboard
        </h2>

        {/* 🔹 FILTERS */}
        <div style={{
          display: "flex",
          gap: "15px",
          marginBottom: "30px",
          alignItems: "center"
        }}>
          <label>
            Gender:
            <select
              value={gender}
              onChange={e => { setGender(e.target.value); track("gender_filter"); }}
              style={{
                marginLeft: "8px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            >
              <option value="">All</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={e => { setStartDate(e.target.value); track("date_filter"); }}
              style={{
                marginLeft: "8px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            />
          </label>

          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={e => { setEndDate(e.target.value); track("date_filter"); }}
              style={{
                marginLeft: "8px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #d1d5db"
              }}
            />
          </label>
        </div>

        {/* 🔹 BAR CHART */}
        <h3 style={{ marginBottom: "15px", color: "#374151" }}>Feature Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="featureName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" onClick={onBarClick} />
          </BarChart>
        </ResponsiveContainer>

        {/* 🔹 LINE CHART */}
        {selectedFeature && (
          <>
            <h3 style={{ margin: "30px 0 15px", color: "#374151" }}>
              📈 Trend for {selectedFeature}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <CartesianGrid stroke="#e5e7eb" />
                <Line dataKey="count" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
