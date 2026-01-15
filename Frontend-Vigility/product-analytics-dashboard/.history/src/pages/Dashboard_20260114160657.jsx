import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker"; // npm install react-datepicker
import "react-datepicker/dist/react-datepicker.css";

function Dashboard() {
  // Filters state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [ageFilter, setAgeFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");

  // Chart data state
  const [barData, setBarData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [lineData, setLineData] = useState([]);

  const token = localStorage.getItem("token"); // JWT token

  // Fetch Bar Chart data
  const fetchBarData = async () => {
    try {
      const params = {
        start: startDate ? startDate.toISOString() : undefined,
        end: endDate ? endDate.toISOString() : undefined,
        gender: genderFilter || undefined,
      };

      const res = await axios.get("http://localhost:8080/api/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      setBarData(res.data);
    } catch (err) {
      console.error("AxiosError", err);
    }
  };

  // Fetch Line Chart data for selected feature
  const fetchLineData = async (feature) => {
    if (!feature) return;
    try {
      const res = await axios.get(
        `http://localhost:8080/api/analytics/trend`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { feature },
        }
      );
      setLineData(res.data);
    } catch (err) {
      console.error("AxiosError", err);
    }
  };

  // Track user interaction
  const trackClick = async (featureName) => {
    try {
      await axios.post(
        "http://localhost:8080/api/track",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { feature: featureName },
        }
      );
    } catch (err) {
      console.error("Tracking error", err);
    }
  };

  // Load Bar Chart when filters change
  useEffect(() => {
    fetchBarData();
    if (selectedFeature) fetchLineData(selectedFeature);
  }, [startDate, endDate, genderFilter, ageFilter]);

  // Update Line Chart when a Bar is clicked
  const handleBarClick = (feature) => {
    setSelectedFeature(feature);
    trackClick(`Bar Chart Click: ${feature}`);
    fetchLineData(feature);
  };

  // Track filter changes
  const handleFilterChange = (type, value) => {
    trackClick(`Filter Change: ${type} => ${value}`);
    if (type === "gender") setGenderFilter(value);
    if (type === "age") setAgeFilter(value);
  };

  // Prepare Bar Chart data
  const barChartData = {
    labels: barData.map((item) => item.featureName),
    datasets: [
      {
        label: "Total Clicks",
        data: barData.map((item) => item.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: lineData.map((item) => item.date),
    datasets: [
      {
        label: selectedFeature ? `${selectedFeature} Clicks` : "Clicks",
        data: lineData.map((item) => item.count),
        fill: false,
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  return (
    <div className="dashboard">
      <h2>Analytics Dashboard</h2>

      {/* Filters */}
      <div className="filters" style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div>
          <label>Start Date:</label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </div>
        <div>
          <label>End Date:</label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        </div>
        <div>
          <label>Age:</label>
          <select value={ageFilter} onChange={(e) => handleFilterChange("age", e.target.value)}>
            <option value="">All</option>
            <option value="<18">&lt;18</option>
            <option value="18-40">18-40</option>
            <option value=">40">&gt;40</option>
          </select>
        </div>
        <div>
          <label>Gender:</label>
          <select value={genderFilter} onChange={(e) => handleFilterChange("gender", e.target.value)}>
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Feature Usage</h3>
        {barData.length > 0 ? (
          <Bar
            data={barChartData}
            options={{
              onClick: (evt, elements) => {
                if (elements.length > 0) {
                  const index = elements[0].index;
                  handleBarClick(barData[index].featureName);
                }
              },
              plugins: { legend: { display: false } },
            }}
          />
        ) : (
          <p>Loading Bar Chart...</p>
        )}
      </div>

      {/* Line Chart */}
      <div>
        <h3>Trend Over Time {selectedFeature && `for ${selectedFeature}`}</h3>
        {lineData.length > 0 ? <Line data={lineChartData} /> : <p>Select a feature to view trend</p>}
      </div>
    </div>
  );
}

export default Dashboard;
