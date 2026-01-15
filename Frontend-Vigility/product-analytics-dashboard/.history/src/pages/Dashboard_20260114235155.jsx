import React, { useEffect, useState } from "react";
import api from "../api";
import Cookies from "js-cookie";
import {
  Container, Grid, Card, CardContent, Typography,
  FormControl, InputLabel, Select, MenuItem,
  Box, Button, TextField
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || "2026-01-01"),
    dayjs(Cookies.get("endDate") || "2026-01-14")
  ]);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [allLineData, setAllLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  // ---------------- FETCH ANALYTICS ----------------
  const fetchAnalytics = async () => {
    const params = {
      startDate: dateRange[0]?.format("YYYY-MM-DD"),
      endDate: dateRange[1]?.format("YYYY-MM-DD"),
      age: filters.age,
      gender: filters.gender
    };
    const res = await api.get("/api/analytics", { params });

    // Bar Data
    const bars = Object.entries(res.data.barData || {}).map(([f, count]) => ({ feature: f, count }));
    setBarData(bars);

    // Line Data
    if (selectedFeature && res.data.lineData[selectedFeature]) {
      setLineData(res.data.lineData[selectedFeature]);
    } else {
      const combined = [];
      const keys = Object.keys(res.data.lineData || {});
      if (keys.length) {
        const dates = res.data.lineData[keys[0]].map(item => item.date);
        dates.forEach((date, idx) => {
          const point = { date };
          keys.forEach(f => point[f] = res.data.lineData[f][idx]?.count || 0);
          combined.push(point);
        });
      }
      setLineData(combined);
      setAllLineData(keys);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [filters, dateRange, selectedFeature]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    Cookies.set(name, value);
    trackClick(`filter_${name}`);
  };

  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    trackClick(feature);
  };

  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username") || "demoUser";
      await api.post("/api/track", { username, featureName });
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    Cookies.remove("username"); Cookies.remove("age"); Cookies.remove("gender");
    Cookies.remove("startDate"); Cookies.remove("endDate");
    window.location.href = "/login";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          {/* Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 2, my: 2 }}>
              <DatePicker
                label="Start Date"
                value={dateRange[0]}
                onChange={(newVal) => {
                  setDateRange([newVal, dateRange[1]]);
                  Cookies.set("startDate", newVal?.format("YYYY-MM-DD"));
                  trackClick("date_picker");
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={dateRange[1]}
                onChange={(newVal) => {
                  setDateRange([dateRange[0], newVal]);
                  Cookies.set("endDate", newVal?.format("YYYY-MM-DD"));
                  trackClick("date_picker");
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

          {/* Age + Gender */}
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

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feature Usage (Total Clicks)</Typography>
              <BarChart
                layout="vertical"
                width={500}
                height={300}
                data={barData}
                onClick={handleBarClick}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Clicks Daily: {selectedFeature || "Overall"}</Typography>
              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedFeature ? (
                  <Line dataKey="count" stroke="#22c55e" />
                ) : (
                  allLineData.map((f, idx) => (
                    <Line key={f} dataKey={f} stroke={["#ff6384","#36a2eb","#ffcd56","#f97316"][idx%4]} />
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
