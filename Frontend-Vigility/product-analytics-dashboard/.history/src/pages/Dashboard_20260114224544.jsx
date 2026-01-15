import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend
} from "recharts";
import Cookies from "js-cookie";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button
} from "@mui/material";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    startDate: Cookies.get("startDate") || "2026-01-01T00:00",
    endDate: Cookies.get("endDate") || "2026-01-14T23:59",
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [allLineData, setAllLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [quickRange, setQuickRangeState] = useState(null); // "today", "yesterday", "last7", "month" or null

  // Fetch initial overall analytics on mount
  useEffect(() => {
    fetchAnalytics(filters, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when selectedFeature changes (bar clicks or quick range selection)
  useEffect(() => {
    if (selectedFeature) {
      fetchAnalytics(filters, selectedFeature);
    } else {
      // if cleared, fetch overall with current filters
      fetchAnalytics(filters, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature]);

  // Helper to format date/time as "YYYY-MM-DDTHH:mm"
  const formatDateTime = (date) => {
    // ensure local timezone formatting to match input type="datetime-local"
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date - tzOffset).toISOString().slice(0, 16);
    return localISO;
  };

  const fetchAnalytics = async (currentFilters = filters, feature = selectedFeature) => {
    if (currentFilters.startDate > currentFilters.endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    try {
      const res = await api.get("/api/analytics", { params: currentFilters });

      const bars = Object.entries(res.data.barData || {}).map(([f, count]) => ({ feature: f, count }));
      setBarData(bars);

      if (feature && res.data.lineData?.[feature]) {
        setLineData(res.data.lineData[feature]);
      } else {
        const combined = [];
        const lineKeys = Object.keys(res.data.lineData || {});
        if (lineKeys.length > 0) {
          const dates = res.data.lineData[lineKeys[0]].map(item => item.date);
          dates.forEach((date, idx) => {
            const point = { date };
            lineKeys.forEach(f => {
              point[f] = res.data.lineData[f][idx]?.count || 0;
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    Cookies.set(name, value);

    // If user manually changes a filter, clear quick range state
    setQuickRangeState(null);

    // Track filter click as feature usage
    trackClick(`filter_${name}`);

    // Auto-select the filter feature so line chart zooms in
    setSelectedFeature(`filter_${name}`);

    // Fetch chart data immediately with the updated filters
    fetchAnalytics(newFilters, `filter_${name}`);
  };

  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username");
      if (!username) return;
      await api.post("/api/track", { username, featureName });
    } catch (err) {
      console.error("Track click error:", err);
    }
  };

  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    trackClick(feature);
  };

  const setQuickRange = (range) => {
    const now = new Date();
    let start, end;

    switch (range) {
      case "today":
        start = new Date();
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      case "yesterday": {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        start = new Date(y);
        start.setHours(0, 0, 0, 0);
        end = new Date(y);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case "last7": {
        const s7 = new Date();
        s7.setDate(s7.getDate() - 6); // include today -> 7 days
        start = new Date(s7);
        start.setHours(0, 0, 0, 0);
        end = new Date();
        end.setHours(23, 59, 59, 999);
        break;
      }
      case "month": {
        const m = new Date();
        start = new Date(m.getFullYear(), m.getMonth(), 1, 0, 0, 0);
        end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59);
        break;
      }
      default:
        return;
    }

    const newFilters = {
      ...filters,
      startDate: formatDateTime(start),
      endDate: formatDateTime(end)
    };

    setFilters(newFilters);
    Cookies.set("startDate", newFilters.startDate);
    Cookies.set("endDate", newFilters.endDate);

    // mark quick range active
    setQuickRangeState(range);

    // track and select feature for line chart
    const featureKey = `quickrange_${range}`;
    trackClick(featureKey);
    setSelectedFeature(featureKey);

    // fetch analytics with new range
    fetchAnalytics(newFilters, featureKey);
  };

  const resetToOverall = () => {
    setSelectedFeature("");
    setQuickRangeState(null);
    // fetch overall with current filters
    fetchAnalytics(filters, "");
  };

  // ---------------- LOGOUT HANDLER ----------------
  const handleLogout = () => {
    Cookies.remove("username");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    Cookies.remove("age");
    Cookies.remove("gender");
    window.location.href = "/login"; // redirect to login page
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">
          📊 Product Analytics Dashboard
        </Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>

          {/* Quick range buttons */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Button
              variant={quickRange === "today" ? "contained" : "outlined"}
              onClick={() => setQuickRange("today")}
            >
              Today
            </Button>
            <Button
              variant={quickRange === "yesterday" ? "contained" : "outlined"}
              onClick={() => setQuickRange("yesterday")}
            >
              Yesterday
            </Button>
            <Button
              variant={quickRange === "last7" ? "contained" : "outlined"}
              onClick={() => setQuickRange("last7")}
            >
              Last 7 Days
            </Button>
            <Button
              variant={quickRange === "month" ? "contained" : "outlined"}
              onClick={() => setQuickRange("month")}
            >
              This Month
            </Button>
            <Button variant="text" onClick={resetToOverall}>
              Reset to Overall
            </Button>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <TextField
              type="datetime-local"
              name="startDate"
              label="Start Date"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              disabled={!!quickRange} // disable when quick range active
            />
            <TextField
              type="datetime-local"
              name="endDate"
              label="End Date"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              disabled={!!quickRange} // disable when quick range active
            />
            <FormControl sx={{ minWidth: 120 }} variant="outlined">
              <InputLabel shrink>Age</InputLabel>
              <Select
                name="age"
                value={filters.age}
                onChange={handleFilterChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>All Ages</em>
                </MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18–40</MenuItem>
                <MenuItem value=">40">&gt;40</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }} variant="outlined">
              <InputLabel shrink>Gender</InputLabel>
              <Select
                name="gender"
                value={filters.gender}
                onChange={handleFilterChange}
                displayEmpty
              >
                <MenuItem value="">
                  <em>All Genders</em>
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feature Usage
              </Typography>
              <BarChart width={500} height={300} data={barData} onClick={handleBarClick}>
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usage Trend: {selectedFeature || "Overall"}
              </Typography>
              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedFeature ? (
                  <Line dataKey="count" stroke="#22c55e" />
                ) : (
                  allLineData.map((feature, idx) => (
                    <Line
                      key={feature}
                      dataKey={feature}
                      stroke={["#ff6384", "#36a2eb", "#ffcd56", "#f97316"][idx % 4]}
                    />
                  ))
                )}
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
