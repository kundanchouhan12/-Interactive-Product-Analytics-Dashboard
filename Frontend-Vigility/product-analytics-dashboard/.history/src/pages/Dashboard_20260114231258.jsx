import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from "recharts";
import {
  Container, Grid, Card, CardContent,
  Typography, Button, Box
} from "@mui/material";

export default function Dashboard() {

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("date_picker");

  // ---------------- FETCH ----------------
  const fetchAnalytics = async (feature = selectedFeature) => {
    const res = await api.get("/api/analytics", {
      params: {
        startDate: "2026-01-01T00:00",
        endDate: "2026-01-31T23:59"
      }
    });

    // BAR
    const bars = Object.entries(res.data.barData).map(
      ([k, v]) => ({ feature: k, count: v })
    );
    setBarData(bars);

    // LINE
    setLineData(res.data.lineData[feature] || []);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ---------------- BAR CLICK ----------------
  const onBarClick = (data) => {
    if (!data?.activePayload) return;
    const feature = data.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    fetchAnalytics(feature);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>

      {/* ---------------- FILTER HEADER ---------------- */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6">Frontend</Typography>

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Button variant="outlined">Age</Button>
          <Button variant="outlined">Gender</Button>
        </Box>
      </Box>

      {/* ---------------- CHARTS ---------------- */}
      <Grid container spacing={4}>

        {/* -------- LEFT: TOTAL CLICKS -------- */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography align="center" gutterBottom>
                Total Clicks
              </Typography>

              <BarChart
                width={500}
                height={280}
                data={barData}
                layout="vertical"
                onClick={onBarClick}
              >
                <XAxis type="number" />
                <YAxis
                  type="category"
                  dataKey="feature"
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#2c5877" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        {/* -------- RIGHT: DAILY CLICKS -------- */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography align="center" gutterBottom>
                Clicks Daily
              </Typography>

              <LineChart
                width={500}
                height={280}
                data={lineData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2c5877"
                  dot={false}
                />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
    </Container>
  );
}
