import React, { useEffect, useState } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend
} from "recharts";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();

  /* ---------------- FEATURES ---------------- */
  const dashboardFeatures = [
    "date_picker",
    "filter_age",
    "chart_bar",
    "filter_gender"
  ];

  const featureMap = {
    date_picker: ["date_picker"],
    filter_age: [
      "filter_age_<18",
      "filter_age_18-40",
      "filter_age_>40",
      "filter_age_all"
    ],
    chart_bar: ["chart_bar"],
    filter_gender: [
      "filter_gender_Male",
      "filter_gender_Female",
      "filter_gender_Other",
      "filter_gender_all"
    ]
  };

  /* ---------------- STATE ---------------- */
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

  /* ---------------- TRACK CLICK ---------------- */
  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  /* ---------------- FETCH ANALYTICS ---------------- */
  const fetchAnalytics = async () => {
    try {
      const params = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        age: filters.age || null,
        gender: filters.gender || null
      };

      const res = await api.get("/api/analytics", { params });

      /* BAR DATA */
      const bars = dashboardFeatures.map((f) => {
        let count = 0;
        Object.keys(res.data.barData || {}).forEach((k) => {
          if (featureMap[f].includes(k)) {
            count += res.data.barData[k];
          }
        });
        return { feature: f, count };
      });
      setBarData(bars);

      /* LINE DATA */
      let datesSet = new Set();
      let features = selectedFeature
        ? featureMap[selectedFeature]
        : dashboardFeatures.flatMap((f) => featureMap[f]);

      features.forEach((k) =>
        (res.data.lineData[k] || []).forEach((d) =>
          datesSet.add(d.date)
        )
      );

      const line = [...datesSet].sort().map((date) => {
        let total = 0;
        features.forEach((k) => {
          const found = (res.data.lineData[k] || []).find(
            (x) => x.date === date
          );
          if (found) total += found.count;
        });
        return { date, clicks: total };
      });

      setLineData(line);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters, dateRange, selectedFeature]);

  /* ---------------- FILTER CHANGE ---------------- */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    Cookies.set(name, value);
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- DATE PICKER ---------------- */
  const handleDateChange = (index, value) => {
    const updated = [...dateRange];
    updated[index] = value;
    setDateRange(updated);

    Cookies.set("startDate", updated[0].format("YYYY-MM-DD"));
    Cookies.set("endDate", updated[1].format("YYYY-MM-DD"));
    trackClick("date_picker");
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    trackClick("logout");
    localStorage.clear();
    Cookies.remove("age");
    Cookies.remove("gender");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    navigate("/login", { replace: true });
  };

  /* ---------------- RENDER ---------------- */
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
          <Button variant="contained" color="error" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        {/* FILTERS */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6">Filters</Typography>

            {/* DATE PICKER */}
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <DatePicker
                label="Start Date"
                value={dateRange[0]}
                onChange={(v) => handleDateChange(0, v)}
              />
              <DatePicker
                label="End Date"
                value={dateRange[1]}
                onChange={(v) => handleDateChange(1, v)}
              />
            </Box>

            {/* AGE + GENDER */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Age</InputLabel>
                <Select
                  name="age"
                  value={filters.age}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="<18">&lt;18</MenuItem>
                  <MenuItem value="18-40">18-40</MenuItem>
                  <MenuItem value=">40">&gt;40</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
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
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">Feature Usage</Typography>

                {/* ✅ SINGLE CLICK FIX */}
                <BarChart
                  width={500}
                  height={300}
                  data={barData}
                  onClick={(e) => {
                    if (e && e.activePayload) {
                      const feature = e.activePayload[0].payload.feature;
                      setSelectedFeature(feature);
                      trackClick(`chart_bar_${feature}`);
                    }
                  }}
                >
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
                  Daily Clicks {selectedFeature && `: ${selectedFeature}`}
                </Typography>

                <LineChart width={500} height={300} data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="clicks" stroke="#6366f1" />
                </LineChart>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
}
