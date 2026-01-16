import React, { useEffect, useState } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import {
  Container, Grid, Card, CardContent, Typography,
  FormControl, InputLabel, Select, MenuItem,
  Box, Button, TextField
} from "@mui/material";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend
} from "recharts";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || dayjs().subtract(6, "day")),
    dayjs(Cookies.get("endDate") || dayjs())
  ]);

  const [quickRange, setQuickRange] = useState("Last 7 Days");
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  const dashboardFeatures = ["date_picker", "filter_age", "chart_bar", "filter_gender"];

  const quickRanges = [
    { label: "Today", start: dayjs(), end: dayjs() },
    { label: "Yesterday", start: dayjs().subtract(1, "day"), end: dayjs().subtract(1, "day") },
    { label: "Last 7 Days", start: dayjs().subtract(6, "day"), end: dayjs() },
    { label: "This Month", start: dayjs().startOf("month"), end: dayjs().endOf("month") },
    { label: "Custom Range", start: null, end: null }
  ];

  // ---------------- TRACK CLICK ----------------
  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  // ---------------- FETCH ANALYTICS ----------------
  const fetchAnalytics = async () => {
    try {
      const params = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        age: filters.age || null,
        gender: filters.gender || null
      };

      const res = await api.get("/api/analytics", { params });

      // ---------------- BAR CHART ----------------
      const bars = dashboardFeatures.map(f => ({
        feature: f,
        count: res.data.barData?.[f] || 0
      }));
      setBarData(bars);

      // ---------------- LINE CHART ----------------
      if (selectedFeature && res.data.lineData?.[selectedFeature]) {
        setLineData(
          res.data.lineData[selectedFeature].map(d => ({
            date: d.date,
            count: d.count
          }))
        );
      } else {
        const dateSet = new Set();
        dashboardFeatures.forEach(f => {
          res.data.lineData?.[f]?.forEach(d => dateSet.add(d.date));
        });

        const combined = [...dateSet].sort().map(date => {
          const row = { date };
          dashboardFeatures.forEach(f => {
            const found = res.data.lineData?.[f]?.find(x => x.date === date);
            row[f] = found ? found.count : 0;
          });
          return row;
        });

        setLineData(combined);
      }
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.age, filters.gender, dateRange[0], dateRange[1], selectedFeature]);

  // ---------------- FILTER HANDLERS ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    setFilters(prev => {
      Cookies.set(name, value);
      return { ...prev, [name]: value };
    });
  };

  const handleDateChange = (type, value) => {
    if (!value) return;
    trackClick(`filter_${type}`);
    setDateRange(prev => {
      const updated = type === "start" ? [value, prev[1]] : [prev[0], value];
      Cookies.set(type === "start" ? "startDate" : "endDate", value.format("YYYY-MM-DD"));
      setQuickRange("Custom Range");
      return updated;
    });
  };

  const handleQuickRangeChange = (label) => {
    const range = quickRanges.find(r => r.label === label);
    if (range.start && range.end) {
      setDateRange([range.start, range.end]);
      Cookies.set("startDate", range.start.format("YYYY-MM-DD"));
      Cookies.set("endDate", range.end.format("YYYY-MM-DD"));
    }
    setQuickRange(label);
    trackClick(`date_picker_quick_${label.replace(/\s+/g, "_").toLowerCase()}`);
  };

  const handleBarClick = (state) => {
    if (!state?.activePayload?.length) return;
    const feature = state.activePayload[0].payload.feature;
    trackClick(`bar_${feature}`);
    setSelectedFeature(feature);
  };

  const handleLogout = () => {
    trackClick("logout");
    localStorage.clear();
    Cookies.remove("age");
    Cookies.remove("gender");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    navigate("/login", { replace: true });
  };

  // ---------------- RENDER ----------------
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Button color="error" variant="contained" onClick={handleLogout}>Logout</Button>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          {/* QUICK RANGE SELECT + CUSTOM PICKERS */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Quick Range</InputLabel>
              <Select value={quickRange} onChange={(e) => handleQuickRangeChange(e.target.value)}>
                {quickRanges.map(r => (
                  <MenuItem key={r.label} value={r.label}>{r.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={dateRange[0]}
                onChange={(v) => handleDateChange("start", v)}
                renderInput={(p) => <TextField {...p} />}
              />
              <DatePicker
                label="End Date"
                value={dateRange[1]}
                onChange={(v) => handleDateChange("end", v)}
                renderInput={(p) => <TextField {...p} />}
              />
            </LocalizationProvider>

            <Button variant="outlined" onClick={() => {
              setFilters({ age: "", gender: "" });
              setDateRange([dayjs().subtract(6, "day"), dayjs()]);
              Cookies.remove("age");
              Cookies.remove("gender");
              Cookies.set("startDate", dayjs().subtract(6, "day").format("YYYY-MM-DD"));
              Cookies.set("endDate", dayjs().format("YYYY-MM-DD"));
              setQuickRange("Last 7 Days");
            }}>
              Reset Filter
            </Button>
          </Box>

          {/* AGE & GENDER FILTERS */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18-40</MenuItem>
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

      {/* CHARTS */}
      <Grid container spacing={4}>
        {/* LEFT BAR CHART */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Clicks</Typography>
              <BarChart width={500} height={300} data={barData} onClick={handleBarClick}>
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT LINE CHART */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Clicks Daily {selectedFeature && `: ${selectedFeature}`}
              </Typography>
              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedFeature ? (
                  <Line dataKey="count" stroke="#6366f1" />
                ) : (
                  dashboardFeatures.map((f) => (
                    <Line key={f} dataKey={f} stroke="#6366f1" />
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
