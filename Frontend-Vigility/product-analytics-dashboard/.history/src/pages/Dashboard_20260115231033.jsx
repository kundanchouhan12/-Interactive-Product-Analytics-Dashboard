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
    dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
    dayjs(Cookies.get("endDate") || dayjs())
  ]);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

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

      // ----- FILTER DATA TO DOCUMENTED FEATURES -----
      const documentedFeatures = ['login', 'logout', 'dashboard_view'];

      // Bar chart
      const bars = Object.entries(res.data.barData || {})
        .filter(([feature]) => documentedFeatures.includes(feature))
        .map(([feature, count]) => ({ feature, count }));
      setBarData(bars);

      // Line chart
      if (selectedFeature && documentedFeatures.includes(selectedFeature)) {
        setLineData(res.data.lineData[selectedFeature] || []);
      } else {
        setLineData([]); // default empty chart
      }

    } catch (err) {
      console.error("Analytics error", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [
    filters.age,
    filters.gender,
    dateRange[0],
    dateRange[1],
    selectedFeature
  ]);

  // ---------------- FILTER HANDLERS ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    trackClick(`filter_${name}_${value || "all"}`);

    setFilters(prev => {
      const updated = { ...prev, [name]: value };
      Cookies.set(name, value);
      return updated;
    });
  };

  const handleDateChange = (index, value) => {
    if (!value) return;
    trackClick(index === 0 ? "filter_date_start" : "filter_date_end");

    setDateRange(prev => {
      const newRange = [...prev];
      newRange[index] = value;
      Cookies.set(index === 0 ? "startDate" : "endDate", value.format("YYYY-MM-DD"));
      return newRange;
    });
  };

  // ---------------- BAR CLICK ----------------
  const handleBarClick = (state) => {
    if (!state?.activePayload?.length) return;

    const feature = state.activePayload[0].payload.feature;

    trackClick(`bar_${feature}`);
    setSelectedFeature(feature);
  };

  // ---------------- LOGOUT ----------------
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
        <Button color="error" variant="contained" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 2, my: 2 }}>
              <DatePicker
                label="Start Date"
                value={dateRange[0]}
                onChange={(v) => handleDateChange(0, v)}
                renderInput={(p) => <TextField {...p} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={dateRange[1]}
                onChange={(v) => handleDateChange(1, v)}
                renderInput={(p) => <TextField {...p} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

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
                {selectedFeature && <Line dataKey="count" stroke="#22c55e" />}
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
