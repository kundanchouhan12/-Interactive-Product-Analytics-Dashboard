import React, { useEffect, useState } from "react";
import api from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import Cookies from "js-cookie";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";

const FEATURE_LABELS = {
  date_picker: "Date Picker",
  age_filter: "Age Filter",
  gender_filter: "Gender Filter",
  bar_chart: "Bar Chart"
};

export default function Dashboard() {
  const [filters, setFilters] = useState({
    startDate: "2026-01-01T00:00",
    endDate: "2026-01-10T23:59"
  });

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (feature = "") => {
    const res = await api.get("/api/analytics", {
      params: { ...filters, feature }
    });

    const bars = Object.entries(res.data.barData).map(([k, v]) => ({
      feature: k,
      label: FEATURE_LABELS[k],
      count: v
    }));

    setBarData(bars);
    setLineData(res.data.lineData || []);
  };

  const track = async (feature) => {
    await api.post("/api/track", { feature_name: feature });
  };

  const onBarClick = (data) => {
    const feature = data.feature;
    setSelectedFeature(feature);
    track(feature);
    fetchAnalytics(feature);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        📊 Product Analytics Dashboard
      </Typography>

      <Grid container spacing={4}>
        {/* LEFT BAR */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Clicks (Feature Usage)</Typography>
              <BarChart width={500} height={300} data={barData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" onClick={onBarClick} />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT LINE */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                Usage Trend: {FEATURE_LABELS[selectedFeature] || "Select Feature"}
              </Typography>

              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="count" stroke="#22c55e" />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
