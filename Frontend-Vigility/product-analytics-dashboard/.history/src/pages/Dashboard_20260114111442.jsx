import { Card, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Filters from "../components/Filters";
import FeatureBarChart from "../components/charts/FeatureBarChart";
import FeatureLineChart from "../components/charts/FeatureLineChart";

export default function Dashboard() {
  const saved = Cookies.get("dashboard_filters");

  const [filters, setFilters] = useState(
    saved ? JSON.parse(saved) : {
      startDate: "",
      age: "18-40",
      gender: "Male",
    }
  );

  const [selectedFeature, setSelectedFeature] = useState("date_filter");

  return (
    <Grid container spacing={3} p={3}>
      <Grid item xs={12}>
        <Card sx={{ p: 2 }}>
          <Filters filters={filters} setFilters={setFilters} />
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <FeatureBarChart onSelect={setSelectedFeature} />
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 2 }}>
          <FeatureLineChart feature={selectedFeature} />
        </Card>
      </Grid>
    </Grid>
  );
}
