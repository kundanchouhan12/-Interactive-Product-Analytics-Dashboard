import React, { useEffect, useState, useContext } from "react";
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
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import AnalyticsIcon from "@mui/icons-material/Analytics"; // analytics logo
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
import { ColorModeContext } from "../context/ThemeContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const dashboardFeatures = ["date_picker", "filter_age", "chart_bar", "filter_gender"];
  const featureMap = {
    date_picker: ["date_picker"],
    filter_age: ["filter_age_<18", "filter_age_18-40", "filter_age_>40", "filter_age_all"],
    chart_bar: ["chart_bar"],
    filter_gender: ["filter_gender_Male", "filter_gender_Female", "filter_gender_Other", "filter_gender_all"],
  };

  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || "",
  });
  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
    dayjs(Cookies.get("endDate") || dayjs()),
  ]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  const trackClick = (featureName) => api.post("/api/track", { featureName }).catch(() => {});

  const fetchAnalytics = async () => {
    try {
      const params = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        age: filters.age || null,
        gender: filters.gender || null,
      };
      const res = await api.get("/api/analytics", { params });

      const bars = dashboardFeatures.map(f => {
        let count = 0;
        Object.keys(res.data.barData || {}).forEach(k => {
          if (featureMap[f].includes(k)) count += res.data.barData[k];
        });
        return { feature: f, count };
      });
      setBarData(bars);

      // Line chart
      let line = [];
      const keys = selectedFeature ? featureMap[selectedFeature] : [].concat(...Object.values(featureMap));
      const datesSet = new Set();
      keys.forEach(k => (res.data.lineData[k] || []).forEach(d => datesSet.add(d.date)));
      line = [...datesSet].sort().map(date => {
        let total = 0;
        keys.forEach(k => {
          const found = (res.data.lineData[k] || []).find(x => x.date === date);
          if (found) total += found.count;
        });
        return { date, clicks: total };
      });
      setLineData(line);
    } catch (err) {
      console.error("Analytics error:", err);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [filters.age, filters.gender, dateRange, selectedFeature]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    setFilters(prev => { Cookies.set(name, value); return { ...prev, [name]: value }; });
  };

  const handleQuickDate = (option) => {
    let start, end = dayjs();
    switch (option) {
      case "today": start = dayjs(); break;
      case "yesterday": start = dayjs().subtract(1, "day"); end = start; break;
      case "last7": start = dayjs().subtract(6, "day"); break;
      case "thisMonth": start = dayjs().startOf("month"); break;
      case "reset": start = dayjs().subtract(7, "day"); setFilters({ age: "", gender: "" }); Cookies.remove("age"); Cookies.remove("gender"); break;
      default: return;
    }
    setDateRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
    trackClick("date_picker");
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AnalyticsIcon sx={{ fontSize: 40, color: "#6366f1" }} />
          <Typography variant="h4" sx={{ fontWeight: 700, background: "linear-gradient(90deg,#6366f1,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Product Analytics Dashboard
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconButton onClick={toggleColorMode} color="inherit">{mode === "dark" ? <Brightness7 /> : <Brightness4 />}</IconButton>
          <Button variant="contained" color="error" sx={{ px: 3, py: 1.2, borderRadius: 3, boxShadow: "0 0 20px rgba(99,102,241,0.35)" }} onClick={handleLogout}>Logout</Button>
        </Box>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, my: 2 }}>
            {["today", "yesterday", "last7", "thisMonth", "reset"].map(k => (
              <Button key={k} size="large" variant="outlined" sx={{ borderRadius: 3 }} onClick={() => handleQuickDate(k)}>{k}</Button>
            ))}
          </Box>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#c7d2fe" }}>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange} sx={{ color: "#c7d2fe" }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18-40</MenuItem>
                <MenuItem value=">40">&gt;40</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#c7d2fe" }}>Gender</InputLabel>
              <Select name="gender" value={filters.gender} onChange={handleFilterChange} sx={{ color: "#c7d2fe" }}>
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
          <Card sx={{ borderRadius: 4, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent>
              <Typography variant="h6">Feature Usage</Typography>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <BarChart width={500} height={300} data={barData}>
                  <XAxis dataKey="feature" stroke="#c7d2fe" />
                  <YAxis stroke="##284fea"/>
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} cursor="pointer" onClick={(data) => { trackClick(`bar_${data.feature}`); setSelectedFeature(data.feature); }} />
                </BarChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, backdropFilter: "blur(12px)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <CardContent>
              <Typography variant="h6">Clicks Daily {selectedFeature && `: ${selectedFeature}`}</Typography>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <LineChart width={500} height={300} data={lineData}>
                  <XAxis dataKey="date" stroke="#c7d2fe" />
                  <YAxis stroke="#284fea" />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff" }} />
                  <Legend wrapperStyle={{ color: "#c7d2fe" }} />
                  <Line dataKey="clicks" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
