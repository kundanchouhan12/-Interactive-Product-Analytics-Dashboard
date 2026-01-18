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
  LineChart, Line
} from "recharts";
import { ColorModeContext } from "../ThemeContext";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  const dashboardFeatures = ["date_picker", "filter_age", "chart_bar", "filter_gender"];

  const trackClick = (feature) => {
    api.post("/api/track", { featureName: feature }).catch(() => {});
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/analytics");
      const bars = dashboardFeatures.map((f) => ({
        feature: f,
        count: res.data.barData?.[f] || 0,
      }));
      setBarData(bars);
      setLineData(res.data.lineData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleBarClick = (data) => {
    if (!data || !data.feature) return;
    setSelectedFeature(data.feature);
    trackClick(`chart_bar_${data.feature}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    Cookies.remove("age");
    Cookies.remove("gender");
    navigate("/login", { replace: true });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">📊 Product Analytics</Typography>
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
                <Skeleton variant="rectangular" height={280} />
              ) : (
                <BarChart width={500} height={300} data={barData}>
                  <XAxis dataKey="feature" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    onClick={handleBarClick}
                    cursor="pointer"
                    fill={mode === "dark" ? "#818cf8" : "#6366f1"}
                    isAnimationActive={false}
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
                Daily Clicks {selectedFeature && `: ${selectedFeature}`}
              </Typography>

              {loading ? (
                <Skeleton variant="rectangular" height={280} />
              ) : (
                <LineChart width={500} height={300} data={lineData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#6366f1"
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
