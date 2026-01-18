import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  Container, Grid, Card, CardContent, Typography,
  FormControl, InputLabel, Select, MenuItem,
  Box, Button, Skeleton, IconButton
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend
} from "recharts";
import { ColorModeContext } from "../ThemeContext";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const dashboardFeatures = ["date_picker", "filter_age", "chart_bar", "filter_gender"];

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
  const [loading, setLoading] = useState(true);

  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  const fetchAnalytics = async () => {
    setLoading(true);
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

      let dates = new Set();
      let keys = selectedFeature
        ? featureMap[selectedFeature]
        : dashboardFeatures.flatMap((f) => featureMap[f]);

      keys.forEach((k) =>
        (res.data.lineData[k] || []).forEach((d) => dates.add(d.date))
      );

      const line = [...dates].sort().map((date) => {
        let clicks = 0;
        keys.forEach((k) => {
          const found = (res.data.lineData[k] || []).find((x) => x.date === date);
          if (found) clicks += found.count;
        });
        return { date, clicks };
      });

      setLineData(line);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.age, filters.gender, dateRange, selectedFeature]);

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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Box>
          <IconButton onClick={toggleColorMode}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Button color="error" variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Box>

      {/* CHARTS */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feature Usage</Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <BarChart width={500} height={300} data={barData}>
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    cursor="pointer"
                    fill={mode === "dark" ? "#818cf8" : "#6366f1"}
                    onClick={(d) => {
                      setSelectedFeature(d.feature);
                      trackClick(`bar_${d.feature}`);
                    }}
                  />
                </BarChart>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Clicks Daily {selectedFeature && `: ${selectedFeature}`}
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={300} />
              ) : (
                <LineChart width={500} height={300} data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    dataKey="clicks"
                    stroke={mode === "dark" ? "#818cf8" : "#6366f1"}
                    strokeWidth={3}
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
