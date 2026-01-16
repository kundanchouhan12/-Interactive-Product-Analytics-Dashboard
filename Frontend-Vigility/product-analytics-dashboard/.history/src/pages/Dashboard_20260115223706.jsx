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
  const [allLineKeys, setAllLineKeys] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  // ---------------- TRACK ----------------
  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  // 🔥 TRACK DASHBOARD VIEW (ONCE)
  useEffect(() => {
    trackClick("dashboard_view");
  }, []);

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

      // BAR
      const bars = Object.entries(res.data.barData || {})
        .map(([feature, count]) => ({ feature, count }));
      setBarData(bars);

      // LINE
      if (selectedFeature && res.data.lineData?.[selectedFeature]) {
        setLineData(res.data.lineData[selectedFeature]);
      } else {
        const keys = Object.keys(res.data.lineData || {});
        setAllLineKeys(keys);

        const dates = new Set();
        keys.forEach(k =>
          res.data.lineData[k].forEach(d => dates.add(d.date))
        );

        const combined = [...dates].sort().map(date => {
          const row = { date };
          keys.forEach(k => {
            const found = res.data.lineData[k].find(x => x.date === date);
            row[k] = found ? found.count : 0;
          });
          return row;
        });

        setLineData(combined);
      }
    } catch (e) {
      console.error("Analytics error", e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.age, filters.gender, dateRange, selectedFeature]);

  // ---------------- FILTERS ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    trackClick(`filter_${name}_${value || "all"}`);
    setSelectedFeature(""); // 🔥 IMPORTANT

    setFilters(prev => {
      Cookies.set(name, value);
      return { ...prev, [name]: value };
    });
  };

  // ---------------- DATE ----------------
  const handleStartDate = (v) => {
    if (!v) return;
    trackClick("filter_start_date");
    setSelectedFeature("");
    Cookies.set("startDate", v.format("YYYY-MM-DD"));
    setDateRange(prev => [v, prev[1]]);
  };

  const handleEndDate = (v) => {
    if (!v) return;
    trackClick("filter_end_date");
    setSelectedFeature("");
    Cookies.set("endDate", v.format("YYYY-MM-DD"));
    setDateRange(prev => [prev[0], v]);
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

  // ---------------- UI ----------------
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 2, my: 2 }}>
              <DatePicker label="Start Date" value={dateRange[0]} onChange={handleStartDate} />
              <DatePicker label="End Date" value={dateRange[1]} onChange={handleEndDate} />
            </Box>
          </LocalizationProvider>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl>
              <InputLabel>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18-40</MenuItem>
                <MenuItem value=">40">&gt;40</MenuItem>
              </Select>
            </FormControl>

            <FormControl>
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
              <Typography>Total Clicks</Typography>
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
              <Typography>
                Clicks Daily {selectedFeature && `: ${selectedFeature}`}
              </Typography>
              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedFeature ? (
                  <Line dataKey="count" stroke="#22c55e" />
                ) : (
                  allLineKeys.map((k, i) => (
                    <Line key={k} dataKey={k} />
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
