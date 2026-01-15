// import api from "../api";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
// import Cookies from "js-cookie";

// export default function Dashboard() {

//   const [filters, setFilters] = useState({
//     startDate: Cookies.get("startDate") || "2026-01-01T00:00",
//     endDate: Cookies.get("endDate") || "2026-01-14T23:59",
//     age: Cookies.get("age") || "",
//     gender: Cookies.get("gender") || ""
//   });

//   const [barData, setBarData] = useState([]);
//   const [lineData, setLineData] = useState([]);
//   const [selectedFeature, setSelectedFeature] = useState("");

//   // ---------------- FETCH ANALYTICS ----------------
//   useEffect(() => {
//     fetchAnalytics();
//   }, [filters, selectedFeature]);

//   const fetchAnalytics = async () => {

//     // ✅ DATE VALIDATION
//     if (filters.startDate > filters.endDate) {
//       alert("Start date cannot be after end date");
//       return;
//     }

//     try {
//       const res = await api.get("/api/analytics", {
//         params: filters
//       });

//       // BAR CHART DATA
//       const bars = Object.entries(res.data.barData || {}).map(
//         ([feature, count]) => ({ feature, count })
//       );
//       setBarData(bars);

//       // LINE CHART DATA
//       if (selectedFeature && res.data.lineData?.[selectedFeature]) {
//         setLineData(res.data.lineData[selectedFeature]);
//       } else {
//         setLineData([]);
//       }

//     } catch (err) {
//       console.error("Analytics error:", err);
//     }
//   };

//   // ---------------- FILTER HANDLER ----------------
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//     Cookies.set(name, value);
//   };

//   // ---------------- TRACK CLICK ----------------
//   const trackClick = async (featureName) => {
//     try {
//       const username = Cookies.get("username");
//       if (!username) return;

//       await api.post("/api/track", {
//         username,
//         featureName
//       });

//     } catch (err) {
//       console.error("Track click error:", err);
//     }
//   };

//   // ---------------- BAR CLICK ----------------
//   const handleBarClick = (state) => {
//     if (!state?.activePayload?.[0]) return;

//     const feature = state.activePayload[0].payload.feature;
//     setSelectedFeature(feature);
//     trackClick(feature);
//   };

//   // ---------------- UI ----------------
//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>📊 Product Analytics Dashboard</h2>

//       {/* FILTERS */}
//       <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
//         <input
//           type="datetime-local"
//           name="startDate"
//           value={filters.startDate}
//           onChange={handleFilterChange}
//         />

//         <input
//           type="datetime-local"
//           name="endDate"
//           value={filters.endDate}
//           onChange={handleFilterChange}
//         />

//         <select name="age" value={filters.age} onChange={handleFilterChange}>
//           <option value="">All Ages</option>
//           <option value="<18">&lt;18</option>
//           <option value="18-40">18–40</option>
//           <option value=">40">&gt;40</option>
//         </select>

//         <select name="gender" value={filters.gender} onChange={handleFilterChange}>
//           <option value="">All Genders</option>
//           <option value="Male">Male</option>
//           <option value="Female">Female</option>
//           <option value="Other">Other</option>
//         </select>
//       </div>

//       {/* BAR CHART */}
//       <h3>Feature Usage</h3>
//       <BarChart width={700} height={300} data={barData} onClick={handleBarClick}>
//         <XAxis dataKey="feature" />
//         <YAxis />
//         <Tooltip />
//         <Bar dataKey="count" fill="#6366f1" />
//       </BarChart>

//       {/* LINE CHART */}
//       <h3 style={{ marginTop: "30px" }}>
//         Usage Trend: {selectedFeature || "Select a feature"}
//       </h3>

//       <LineChart width={700} height={300} data={lineData}>
//         <XAxis dataKey="date" />
//         <YAxis />
//         <Tooltip />
//         <Line dataKey="count" stroke="#22c55e" />
//       </LineChart>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import api from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
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
  const [allLineData, setAllLineData] = useState([]); // For showing overall trend
  const [selectedFeature, setSelectedFeature] = useState("");

  // ---------------- FETCH ANALYTICS ----------------
  useEffect(() => {
    fetchAnalytics();
  }, [filters, selectedFeature]);

  const fetchAnalytics = async () => {
    if (filters.startDate > filters.endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    try {
      const res = await api.get("/api/analytics", { params: filters });

      // BAR CHART DATA
      const bars = Object.entries(res.data.barData || {}).map(([feature, count]) => ({ feature, count }));
      setBarData(bars);

      // LINE CHART DATA
      if (selectedFeature && res.data.lineData?.[selectedFeature]) {
        setLineData(res.data.lineData[selectedFeature]);
      } else {
        // Show combined data for all features
        const combined = [];
        const lineKeys = Object.keys(res.data.lineData || {});
        if (lineKeys.length > 0) {
          const dates = res.data.lineData[lineKeys[0]].map(item => item.date);
          dates.forEach((date, idx) => {
            const point = { date };
            lineKeys.forEach(feature => {
              point[feature] = res.data.lineData[feature][idx]?.count || 0;
            });
            combined.push(point);
          });
        }
        setLineData(combined);
        setAllLineData(lineKeys);
      }

    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  // ---------------- FILTER HANDLER ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    Cookies.set(name, value);
  };

  // ---------------- TRACK CLICK ----------------
  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username");
      if (!username) return;

      await api.post("/api/track", { username, featureName });
    } catch (err) {
      console.error("Track click error:", err);
    }
  };

  // ---------------- BAR CLICK ----------------
  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    trackClick(feature);
  };

  // ---------------- UI ----------------
  return (
    <div style={{ padding: "20px" }}>
      <h2>📊 Product Analytics Dashboard</h2>

      {/* FILTERS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
        <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
        <select name="age" value={filters.age} onChange={handleFilterChange}>
          <option value="">All Ages</option>
          <option value="<18">&lt;18</option>
          <option value="18-40">18–40</option>
          <option value=">40">&gt;40</option>
        </select>
        <select name="gender" value={filters.gender} onChange={handleFilterChange}>
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* BAR CHART */}
      <h3>Feature Usage</h3>
      <BarChart width={700} height={300} data={barData} onClick={handleBarClick}>
        <XAxis dataKey="feature" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#6366f1" />
      </BarChart>

      {/* LINE CHART */}
      <h3 style={{ marginTop: "30px" }}>
        Usage Trend: {selectedFeature || "Overall"}
      </h3>

      <LineChart width={700} height={300} data={lineData}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {selectedFeature
          ? <Line dataKey="count" stroke="#22c55e" />
          : allLineData.map((feature, idx) => (
              <Line key={feature} dataKey={feature} stroke={["#ff6384", "#36a2eb", "#ffcd56", "#f97316"][idx % 4]} />
            ))
        }
      </LineChart>
    </div>
  );
}