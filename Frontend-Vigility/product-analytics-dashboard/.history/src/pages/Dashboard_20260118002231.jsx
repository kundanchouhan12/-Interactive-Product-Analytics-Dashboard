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
  Skeleton,
  TextField,
} from "@mui/material";

import { Brightness4, Brightness7 } from "@mui/icons-material";
import AnalyticsIcon from "@mui/icons-material/Analytics";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { ColorModeContext } from "../context/ThemeContext";

/* ================= CONFIG ================= */

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

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || "",
  });

  /* ---------- DATE STATE (OLD LOGIC) ---------- */
  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
    dayjs(Cookies.get("endDate") || dayjs()),
  ]);
  const [tempRange, setTempRange] = useState([...dateRange]);
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= TRACK ================= */

  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  /* ================= FETCH ANALYTICS ================= */

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        age: filters.age || null,
        gender: filters.gender || null,
      };

      const res = await api.get("/api/analytics", { params });

      /* ----- BAR DATA ----- */
      const bars = dashboardFeatures.map((f) => {
        let count = 0;
        Object.keys(res.data.barData || {}).forEach((k) => {
          if (featureMap[f].includes(k)) count += res.data.barData[k];
        });
        return { feature: f, count };
      });
      setBarData(bars);

      /* ----- LINE DATA ----- */
      const keys = selectedFeature
        ? featureMap[selectedFeature]
        : [].concat(...Object.values(featureMap));

      const datesSet = new Set();
      keys.forEach((k) =>
        (res.data.lineData[k] || []).forEach((d) => datesSet.add(d.date))
      );

      const line = [...datesSet].sort().map((date) => {
        let total = 0;
        keys.forEach((k) => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.age, filters.gender, dateRange, selectedFeature]);

  /* ================= FILTER HANDLERS ================= */

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    Cookies.set(name, value);
    setFilters((p) => ({ ...p, [name]: value }));
  };

  /* ================= QUICK DATE ================= */

  const handleQuickDate = (type) => {
    let start,
      end = dayjs();

    switch (type) {
      case "today":
        start = end = dayjs();
        break;
      case "yesterday":
        start = end = dayjs().subtract(1, "day");
        break;
      case "last7":
        start = dayjs().subtract(6, "day");
        break;
      case "thisMonth":
        start = dayjs().startOf("month");
        break;
      case "reset":
        start = dayjs().subtract(7, "day");
        end = dayjs();
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

  /* ================= CUSTOM RANGE ================= */

  const handleCustomApply = () => {
    setDateRange([...tempRange]);
    Cookies.set("startDate", tempRange[0].format("YYYY-MM-DD"));
    Cookies.set("endDate", tempRange[1].format("YYYY-MM-DD"));
    trackClick("date_picker");
    setCustomRangeOpen(false);
  };

  const handleCustomCancel = () => {
    setTempRange([...dateRange]);
    setCustomRangeOpen(false);
  };

  /* ================= LOGOUT ================= */

  const handleLogout = () => {
    trackClick("logout");
    localStorage.clear();
    Cookies.remove("age");
    Cookies.remove("gender");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    navigate("/login", { replace: true });
  };

  /* ================= UI ================= */

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <AnalyticsIcon sx={{ fontSize: 42, color: "#6366f1" }} />
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{
              background: "linear-gradient(90deg,#6366f1,#22d3ee)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Product Analytics Dashboard
          </Typography>
        </Box>

        <Box>
          <IconButton onClick={toggleColorMode}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Button
            color="error"
            variant="contained"
            sx={{ ml: 2, borderRadius: 3 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <Box display="flex" gap={1} flexWrap="wrap" my={2}>
            {["today", "yesterday", "last7", "thisMonth", "reset"].map((k) => (
              <Button key={k} variant="outlined" onClick={() => handleQuickDate(k)}>
                {k}
              </Button>
            ))}
            <Button
              variant="contained"
              onClick={() => setCustomRangeOpen(!customRangeOpen)}
            >
              Custom Range
            </Button>
          </Box>

          {customRangeOpen && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box display="flex" gap={2} my={2}>
                <DatePicker
                  label="Start Date"
                  value={tempRange[0]}
                  onChange={(v) => setTempRange([v, tempRange[1]])}
                  renderInput={(p) => <TextField {...p} fullWidth />}
                />
                <DatePicker
                  label="End Date"
                  value={tempRange[1]}
                  onChange={(v) => setTempRange([tempRange[0], v])}
                  renderInput={(p) => <TextField {...p} fullWidth />}
                />
                <Button variant="contained" onClick={handleCustomApply}>
                  Apply
                </Button>
                <Button color="error" onClick={handleCustomCancel}>
                  Cancel
                </Button>
              </Box>
            </LocalizationProvider>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Age</InputLabel>
                <Select name="age" value={filters.age} onChange={handleFilterChange}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="<18">&lt;18</MenuItem>
                  <MenuItem value="18-40">18-40</MenuItem>
                  <MenuItem value=">40">&gt;40</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CHARTS */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">Total Clicks</Typography>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <BarChart width={500} height={300} data={barData}>
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    minPointSize={6}
                    fill="#6366f1"
                    onClick={(d) => {
                      trackClick(`bar_${d.feature}`);
                      setSelectedFeature(d.feature);
                    }}
                  />
                </BarChart>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">
                Clicks Daily {selectedFeature && `: ${selectedFeature}`}
              </Typography>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <LineChart width={500} height={300} data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    dataKey="clicks"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
