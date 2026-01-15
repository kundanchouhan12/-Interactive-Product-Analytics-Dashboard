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
  const [quickRange, setQuickRange] = useState(null);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    fetchAnalytics(filters, "");
    // eslint-disable-next-line
  }, []);

  // ---------------- FETCH ANALYTICS ----------------
  const fetchAnalytics = async (currentFilters, feature) => {
    try {
      const res = await api.get("/api/analytics", {
        params: currentFilters
      });

      // ---------- BAR DATA ----------
      const bars = Object.entries(res.data.barData || {})
        .map(([feature, count]) => ({ feature, count }));
      setBarData(bars);

      // ---------- LINE DATA SAFETY ----------
      if (!res.data.lineData || Object.keys(res.data.lineData).length === 0) {
        setLineData([]);
        setAllLineData([]);
        return;
      }

      // ---------- SINGLE FEATURE ----------
      if (feature && res.data.lineData[feature]) {
        setLineData(res.data.lineData[feature]);
        setAllLineData([]);
      }
      // ---------- OVERALL MULTI FEATURE ----------
      else {
        const features = Object.keys(res.data.lineData);
        const dates = res.data.lineData[features[0]].map(d => d.date);

        const combined = dates.map((date, i) => {
          const row = { date };
          features.forEach(f => {
            row[f] = res.data.lineData[f][i]?.count || 0;
          });
          return row;
        });

        setLineData(combined);
        setAllLineData(features);
      }

    } catch (err) {
      console.error("Analytics error", err);
    }
  };

  // ---------------- FILTER CHANGE ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    setFilters(newFilters);
    Cookies.set(name, value);

    setQuickRange(null);
    trackClick(`filter_${name}`);

    fetchAnalytics(newFilters, selectedFeature);
  };

  // ---------------- BAR CLICK ----------------
  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    trackClick(feature);
    fetchAnalytics(filters, feature);
  };

  // ---------------- QUICK RANGE ----------------
  const applyQuickRange = (range) => {
    const now = new Date();
    let start, end;

    switch (range) {
      case "today":
        start = new Date(); start.setHours(0,0,0,0);
        end = new Date(); end.setHours(23,59,59,999);
        break;
      case "last7":
        start = new Date(); start.setDate(start.getDate() - 6);
        start.setHours(0,0,0,0);
        end = new Date(); end.setHours(23,59,59,999);
        break;
      default:
        return;
    }

    const toLocal = (d) =>
      new Date(d - d.getTimezoneOffset() * 60000)
        .toISOString().slice(0,16);

    const newFilters = {
      ...filters,
      startDate: toLocal(start),
      endDate: toLocal(end)
    };

    setFilters(newFilters);
    Cookies.set("startDate", newFilters.startDate);
    Cookies.set("endDate", newFilters.endDate);

    setQuickRange(range);
    trackClick(`quickrange_${range}`);
    fetchAnalytics(newFilters, selectedFeature);
  };

  // ---------------- TRACK ----------------
  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username");
      if (!username) return;
      await api.post("/api/track", { username, featureName });
    } catch (e) {
      console.error("Track error", e);
    }
  };

  // ---------------- RESET ----------------
  const resetDashboard = () => {
    setSelectedFeature("");
    setQuickRange(null);
    fetchAnalytics(filters, "");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📊 Product Analytics Dashboard
      </Typography>

      {/* ---------------- FILTERS ---------------- */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <Button onClick={() => applyQuickRange("today")} variant={quickRange==="today"?"contained":"outlined"}>
              Today
            </Button>
            <Button onClick={() => applyQuickRange("last7")} variant={quickRange==="last7"?"contained":"outlined"}>
              Last 7 Days
            </Button>
            <Button onClick={resetDashboard}>Reset</Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              type="datetime-local"
              label="Start Date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              disabled={!!quickRange}
            />
            <TextField
              type="datetime-local"
              label="End Date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              disabled={!!quickRange}
            />

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18–40</MenuItem>
                <MenuItem value=">40">&gt;40</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={filters.gender} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* ---------------- CHARTS ---------------- */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feature Usage</Typography>
              <BarChart width={480} height={300} data={barData} onClick={handleBarClick}>
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Usage Trend {selectedFeature && `: ${selectedFeature}`}
              </Typography>

              <LineChart width={480} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                {selectedFeature ? (
                  <Line dataKey="count" stroke="#22c55e" />
                ) : (
                  allLineData.map((f, i) => (
                    <Line
                      key={f}
                      dataKey={f}
                      stroke={["#ef4444","#3b82f6","#f59e0b"][i % 3]}
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
