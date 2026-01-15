import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer
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
  const [featureDailyData, setFeatureDailyData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [quickRange, setQuickRange] = useState(null);

  useEffect(() => {
    fetchAnalytics(filters, "");
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchAnalytics(filters, selectedFeature);
    // eslint-disable-next-line
  }, [selectedFeature]);

  const formatDateTime = (date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzOffset).toISOString().slice(0, 16);
  };

  const fetchAnalytics = async (currentFilters, feature) => {
    if (currentFilters.startDate > currentFilters.endDate) {
      alert("Start date cannot be after end date");
      return;
    }

    try {
      const res = await api.get("/api/analytics", {
        params: currentFilters
      });

      /** ---------- BAR DATA ---------- */
      const bars = Object.entries(res.data.barData || {}).map(
        ([feature, count]) => ({ feature, count })
      );
      setBarData(bars);

      /** ---------- LINE DATA ---------- */
      if (feature && res.data.lineData?.[feature]) {
        setFeatureDailyData(res.data.lineData[feature]);
      } else {
        setFeatureDailyData([]);
      }

      /** ---------- OVERALL MULTI LINE ---------- */
      const combined = [];
      const lineKeys = Object.keys(res.data.lineData || {});
      if (lineKeys.length) {
        const dates = res.data.lineData[lineKeys[0]].map(d => d.date);
        dates.forEach((date, i) => {
          const row = { date };
          lineKeys.forEach(k => {
            row[k] = res.data.lineData[k][i]?.count || 0;
          });
          combined.push(row);
        });
      }
      setLineData(combined);
      setAllLineData(lineKeys);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    Cookies.set(name, value);
    setQuickRange(null);

    const featureKey = `filter_${name}`;
    setSelectedFeature(featureKey);
    trackClick(featureKey);
    fetchAnalytics(newFilters, featureKey);
  };

  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username");
      if (!username) return;
      await api.post("/api/track", { username, featureName });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    trackClick(feature);
  };

  const applyQuickRange = (range) => {
    const now = new Date();
    let start, end;

    if (range === "today") {
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date();
    } else if (range === "last7") {
      start = new Date(now.setDate(now.getDate() - 6));
      start.setHours(0, 0, 0, 0);
      end = new Date();
    } else if (range === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const newFilters = {
      ...filters,
      startDate: formatDateTime(start),
      endDate: formatDateTime(end)
    };

    setFilters(newFilters);
    setQuickRange(range);
    setSelectedFeature(`quickrange_${range}`);
    fetchAnalytics(newFilters, `quickrange_${range}`);
  };

  const resetToOverall = () => {
    setSelectedFeature("");
    setQuickRange(null);
    fetchAnalytics(filters, "");
  };

  const handleLogout = () => {
    Cookies.remove("username");
    window.location.href = "/login";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Button color="error" variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button onClick={() => applyQuickRange("today")}>Today</Button>
            <Button onClick={() => applyQuickRange("last7")}>Last 7 Days</Button>
            <Button onClick={() => applyQuickRange("month")}>This Month</Button>
            <Button onClick={resetToOverall}>Reset</Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              type="datetime-local"
              name="startDate"
              label="Start"
              value={filters.startDate}
              onChange={handleFilterChange}
              disabled={!!quickRange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="datetime-local"
              name="endDate"
              label="End"
              value={filters.endDate}
              onChange={handleFilterChange}
              disabled={!!quickRange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* CHARTS */}
      <Grid container spacing={4}>
        {/* FEATURE TOTALS */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feature Usage (Totals)</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} onClick={handleBarClick}>
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* DAILY LINE GRAPH (IMAGE MATCH) */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Clicks Daily {selectedFeature && `– ${selectedFeature}`}
              </Typography>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={featureDailyData.length ? featureDailyData : lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {selectedFeature ? (
                    <Line
                      dataKey="count"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  ) : (
                    allLineData.map((f, i) => (
                      <Line
                        key={f}
                        dataKey={f}
                        stroke={["#ef4444", "#22c55e", "#3b82f6"][i % 3]}
                        dot={false}
                      />
                    ))
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
