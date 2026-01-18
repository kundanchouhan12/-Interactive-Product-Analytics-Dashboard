import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import {
  Container, Grid, Card, CardContent, Typography,
  Box, Button, Skeleton, IconButton
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line
} from "recharts";
import { ColorModeContext } from "../context/ThemeContext";
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

  const [loading, setLoading] = useState(true);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  const trackClick = (feature) => {
    api.post("/api/track", { featureName: feature }).catch(() => {});
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/analytics");

      /** ---------- BAR DATA ---------- */
      const bars = dashboardFeatures.map((feature) => {
        let count = 0;
        Object.keys(res.data.barData || {}).forEach((k) => {
          if (featureMap[feature].includes(k)) {
            count += res.data.barData[k];
          }
        });
        return { feature, count };
      });
      setBarData(bars);

      /** ---------- LINE DATA ---------- */
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
      console.error("Analytics error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedFeature]);

  const handleBarClick = (data) => {
    if (!data?.feature) return;
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
