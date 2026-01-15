import { useEffect, useState } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { Bar, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Chart.js v4 registration
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  // Load filters from cookies or set defaults
  const savedFilters = JSON.parse(Cookies.get("filters") || "{}");
  const [filters, setFilters] = useState({
    startDate: savedFilters.startDate
      ? new Date(savedFilters.startDate)
      : new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: savedFilters.endDate
      ? new Date(savedFilters.endDate)
      : new Date(),
    age: savedFilters.age || "18-40",
    gender: savedFilters.gender || "Male",
  });

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [selectedFeature, setSelectedFeature] = useState("");

  // Save filters to cookies whenever they change
  useEffect(() => {
    Cookies.set("filters", JSON.stringify(filters));
  }, [filters]);

  // ===== Fetch Bar Chart Data =====
  const fetchBarData = async () => {
    if (!filters.startDate || !filters.endDate) return;

    try {
      const start = filters.startDate.toISOString();
      const end = filters.endDate.toISOString();
      const res = await api.get(
        `/features/analytics?start=${start}&end=${end}&age=${filters.age}&gender=${filters.gender}`
      );

      // Format: [{featureName, count}]
      setBarData(res.data.map(([name, count]) => ({ featureName: name, count })));
    } catch (err) {
      console.error("Failed to fetch bar data", err);
    }
  };

  // Auto-fetch bar chart on filters change
  useEffect(() => {
    fetchBarData();
  }, [filters]);

  // ===== Fetch Line Chart for selected feature =====
  const fetchLineData = async (featureName) => {
    if (!filters.startDate || !filters.endDate) return;
    try {
      const start = filters.startDate.toISOString();
      const end = filters.endDate.toISOString();
      const res = await api.get(
        `/features/analytics/feature?feature=${featureName}&start=${start}&end=${end}&age=${filters.age}&gender=${filters.gender}`
      );

      const labels = Object.keys(res.data);
      const data = Object.values(res.data);

      setLineData({
        labels,
        datasets: [
          {
            label: featureName,
            data,
            borderColor: "blue",
            backgroundColor: "rgba(0,0,255,0.2)",
          },
        ],
      });
    } catch (err) {
      console.error("Failed to fetch line data", err);
    }
  };

  // ===== Track clicks to backend =====
  const trackClick = async (featureName) => {
    try {
      await api.post("/features/track", {
        userId: localStorage.getItem("userId"),
        featureName,
      });
    } catch (err) {
      console.error("Failed to track click", err);
    }
  };

  // ===== Handle Bar Chart click =====
  const handleBarClick = (e, elements) => {
    if (elements.length === 0) return;
    const idx = elements[0].index;
    const featureName = barData[idx].featureName;
    setSelectedFeature(featureName);
    trackClick(featureName);
    fetchLineData(featureName);
  };

  // ===== Apply filters button =====
  const handleApplyFilters = () => {
    fetchBarData();
    trackClick("filter_apply");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Interactive Product Analytics Dashboard</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <DatePicker
          selected={filters.startDate}
          onChange={(date) => setFilters({ ...filters, startDate: date })}
        />
        <DatePicker
          selected={filters.endDate}
          onChange={(date) => setFilters({ ...filters, endDate: date })}
        />
        <select
          value={filters.age}
          onChange={(e) => setFilters({ ...filters, age: e.target.value })}
        >
          <option value="<18">&lt;18</option>
          <option value="18-40">18-40</option>
          <option value=">40">&gt;40</option>
        </select>
        <select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        >
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button onClick={handleApplyFilters}>Apply</button>
      </div>

      {/* Bar Chart */}
      <div style={{ maxWidth: "700px", marginBottom: "40px" }}>
        <Bar
          key={JSON.stringify(barData)}
          data={{
            labels: barData.map((d) => d.featureName),
            datasets: [
              { label: "Total Clicks", data: barData.map((d) => d.count), backgroundColor: "orange" },
            ],
          }}
          onClick={handleBarClick}
        />
      </div>

      {/* Line Chart */}
      {selectedFeature && (
        <div style={{ maxWidth: "700px" }}>
          <Line key={selectedFeature + JSON.stringify(lineData)} data={lineData} />
        </div>
      )}
    </div>
  );
}
