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
  Button,
  TextField,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();

  const dashboardFeatures = [
    "date_picker",
    "filter_age",
    "chart_bar",
    "filter_gender",
  ];

  const featureMap = {
    date_picker: ["date_picker"],
    filter_age: [
      "filter_age_<18",
      "filter_age_18-40",
      "filter_age_>40",
      "filter_age_all",
    ],
    chart_bar: ["chart_bar"],
    filter_gender: [
      "filter_gender_Male",
      "filter_gender_Female",
      "filter_gender_Other",
      "filter_gender_all",
    ],
  };

  // ---------------- STATE ----------------
  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || "",
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
    dayjs(Cookies.get("endDate") || dayjs()),
  ]);

  const [tempRange, setTempRange] = useState([...dateRange]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  // ---------------- TRACK CLICKS ----------------
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
        gender: filters.gender || null,
      };

      const res = await api.get("/api/analytics", { params });

      const bars = dashboardFeatures.map((f) => {
        let count = 0;
        Object.keys(res.data.barData || {}).forEach((k) => {
          if (featureMap[f].includes(k)) count += res.data.barData[k];
        });
        return { feature: f, count };
      });
      setBarData(bars);

      let line = [];
      if (selectedFeature) {
        const keys = featureMap[selectedFeature] || [];
        const datesSet = new Set();
        keys.forEach((k) =>
          (res.data.lineData[k] || []).forEach((d) => datesSet.add(d.date))
        );

        line = [...datesSet].sort().map((date) => {
          let total = 0;
          keys.forEach((k) => {
            const found = (res.data.lineData[k] || []).find(
              (x) => x.date === date
            );
            if (found) total += found.count;
          });
          return { date, clicks: total };
        });
      } else {
        const datesSet = new Set();
        dashboardFeatures.forEach((f) => {
          featureMap[f].forEach((k) =>
            (res.data.lineData[k] || []).forEach((d) => datesSet.add(d.date))
          );
        });

        line = [...datesSet].sort().map((date) => {
          let total = 0;
          dashboardFeatures.forEach((f) => {
            featureMap[f].forEach((k) => {
              const found = (res.data.lineData[k] || []).find(
                (x) => x.date === date
              );
              if (found) total += found.count;
            });
          });
          return { date, clicks: total };
        });
      }

      setLineData(line);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.age, filters.gender, dateRange, selectedFeature]);

  // ---------------- FILTER HANDLERS ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    setFilters((prev) => {
      Cookies.set(name, value);
      return { ...prev, [name]: value };
    });
  };

  // ---------------- QUICK DATE ----------------
  const handleQuickDate = (option) => {
    let start,
      end = dayjs();
    switch (option) {
      case "today":
        start = dayjs();
        break;
      case "yesterday":
        start = dayjs().subtract(1, "day");
        end = start;
        break;
      case "last7":
        start = dayjs().subtract(6, "day");
        break;
      case "thisMonth":
        start = dayjs().startOf("month");
        break;
      case "reset":
        start = dayjs().subtract(7, "day");
        setFilters({ age: "", gender: "" });
        Cookies.remove("age");
        Cookies.remove("gender");
        break;
      default:
        return;
    }
    setDateRange([start, end]);
    setTempRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
    trackClick("date_picker");
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
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Button
          variant="contained"
          color="error"
          size="large"
          sx={{ borderRadius: 3 }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, my: 2 }}>
            {["today", "yesterday", "last7", "thisMonth", "reset"].map((k) => (
              <Button
                key={k}
                size="large"
                variant="outlined"
                sx={{ borderRadius: 3 }}
                onClick={() => handleQuickDate(k)}
              >
                {k}
              </Button>
            ))}
            <Button
              size="large"
              variant="contained"
              sx={{ borderRadius: 3 }}
              onClick={() => setCustomRangeOpen(!customRangeOpen)}
            >
              Custom Range
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange}>
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
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">Feature Usage</Typography>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <BarChart width={500} height={300} data={barData}>
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                    cursor="pointer"
                    onClick={(data) => {
                      trackClick(`bar_${data.feature}`);
                      setSelectedFeature(data.feature);
                    }}
                  />
                </BarChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">
                Clicks Daily {selectedFeature && `: ${selectedFeature}`}
              </Typography>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <LineChart width={500} height={300} data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line dataKey="clicks" stroke="#6366f1" />
                </LineChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
