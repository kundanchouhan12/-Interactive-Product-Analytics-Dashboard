import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend
} from "recharts";
import Cookies from "js-cookie";
import dayjs from "dayjs";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Button
} from "@mui/material";

import {
  LocalizationProvider,
  DateTimePicker
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Dashboard() {

  const [filters, setFilters] = useState({
    startDate: dayjs().startOf("day"),
    endDate: dayjs().endOf("day"),
    age: "",
    gender: ""
  });

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedKey, setSelectedKey] = useState("TOTAL");

  // ---------------- FETCH ANALYTICS ----------------
  const fetchAnalytics = async (key = "TOTAL") => {
    const res = await api.get("/api/analytics", {
      params: {
        startDate: filters.startDate.toISOString(),
        endDate: filters.endDate.toISOString(),
        age: filters.age,
        gender: filters.gender
      }
    });

    // LEFT BAR → TOTAL CLICKS BY FILTER
    setBarData([
      { name: "Date Picker", key: "filter_date", count: res.data.dateClicks },
      { name: "Age Filter", key: "filter_age", count: res.data.ageClicks },
      { name: "Gender Filter", key: "filter_gender", count: res.data.genderClicks }
    ]);

    // RIGHT LINE → TOTAL CLICKS TREND
    setLineData(res.data.trend[key] || []);
  };

  useEffect(() => {
    fetchAnalytics(selectedKey);
  }, [filters]);

  // ---------------- TRACK ----------------
  const track = async (feature) => {
    const username = Cookies.get("username");
    if (!username) return;
    await api.post("/api/track", { username, featureName: feature });
  };

  // ---------------- HANDLERS ----------------
  const handleBarClick = (data) => {
    if (!data?.activePayload) return;
    const key = data.activePayload[0].payload.key;
    setSelectedKey(key);
    track(key);
    fetchAnalytics(key);
  };

  const handleDateChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    track("filter_date");
    setSelectedKey("filter_date");
  };

  const handleSelect = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    track(`filter_${name}`);
    setSelectedKey(`filter_${name}`);
  };

  // ---------------- UI ----------------
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" mb={3}>
          📊 Interactive Analytics Dashboard
        </Typography>

        {/* FILTERS */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Filters</Typography>

            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
              <DateTimePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(v) => handleDateChange("startDate", v)}
              />
              <DateTimePicker
                label="End Date"
                value={filters.endDate}
                onChange={(v) => handleDateChange("endDate", v)}
              />

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Age</InputLabel>
                <Select
                  name="age"
                  value={filters.age}
                  label="Age"
                  onChange={handleSelect}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="<18">&lt;18</MenuItem>
                  <MenuItem value="18-40">18-40</MenuItem>
                  <MenuItem value=">40">&gt;40</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={filters.gender}
                  label="Gender"
                  onChange={handleSelect}
                >
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
          {/* LEFT BAR */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Total Clicks by Filter
                </Typography>

                <BarChart width={450} height={300} data={barData} onClick={handleBarClick}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
                </BarChart>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT LINE */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Total Clicks Trend
                </Typography>

                <LineChart width={450} height={300} data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="count" stroke="#22c55e" />
                </LineChart>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
}
