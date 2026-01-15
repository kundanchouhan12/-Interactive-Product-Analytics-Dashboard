import { useEffect, useState } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import Filters from "../components/Filters";
import FeatureBarChart from "../charts/FeatureBarChart";
import FeatureLineChart from "../charts/FeatureLineChart";
import { fetchAnalytics, fetchTrend } from "../../api/analytics";
import Cookies from "js-cookie";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    age: "ALL",
    gender: "",
  });

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Load filters from cookies
  useEffect(() => {
    const saved = Cookies.get("dashboard_filters");
    if (saved) setFilters(JSON.parse(saved));
  }, []);

  // Fetch bar chart data
  useEffect(() => {
    fetchAnalytics(filters)
      .then((res) => setBarData(res.data))
      .catch((err) => console.error(err));
  }, [filters]);

  // Fetch line chart data for selected feature
  useEffect(() => {
    if (!selectedFeature) return;
    fetchTrend(selectedFeature)
      .then((res) => setLineData(res.data))
      .catch((err) => console.error(err));
  }, [selectedFeature]);

  return (
    <Grid container spacing={2} sx={{ p: 2 }}>
      {/* Filters */}
      <Grid xs={12}>
        <Filters filters={filters} setFilters={setFilters} />
      </Grid>

      {/* Bar Chart */}
      <Grid xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Feature Usage
          </Typography>
          <FeatureBarChart
            data={barData}
            onSelect={(feature) => setSelectedFeature(feature)}
          />
        </Paper>
      </Grid>

      {/* Line Chart */}
      <Grid xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>
            Feature Trend
          </Typography>
          {selectedFeature ? (
            <FeatureLineChart feature={selectedFeature} data={lineData} />
          ) : (
            <Typography>Select a feature to see trend</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
