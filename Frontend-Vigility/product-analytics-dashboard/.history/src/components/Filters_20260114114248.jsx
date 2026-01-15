import { Grid, TextField, Select, MenuItem } from "@mui/material";
import Cookies from "js-cookie";
import { trackEvent } from "../api/track";

export default function Filters({ filters, setFilters }) {

  const handleChange = (key, value) => {
  const updated = { ...filters, [key]: value };
  setFilters(updated);
  Cookies.set("dashboard_filters", JSON.stringify(updated));

  trackEvent(`${key}_filter`); // 👈 TRACK
};

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          type="date"
          label="Start Date"
          InputLabelProps={{ shrink: true }}
          value={filters.startDate}
          onChange={(e) => handleChange("startDate", e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Select
          fullWidth
          value={filters.age}
          onChange={(e) => handleChange("age", e.target.value)}
        >
          <MenuItem value="<18">&lt;18</MenuItem>
          <MenuItem value="18-40">18-40</MenuItem>
          <MenuItem value=">40">&gt;40</MenuItem>
        </Select>
      </Grid>

      <Grid item xs={12} md={4}>
        <Select
          fullWidth
          value={filters.gender}
          onChange={(e) => handleChange("gender", e.target.value)}
        >
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
          <MenuItem value="Other">Other</MenuItem>
        </Select>
      </Grid>
    </Grid>
  );
}
