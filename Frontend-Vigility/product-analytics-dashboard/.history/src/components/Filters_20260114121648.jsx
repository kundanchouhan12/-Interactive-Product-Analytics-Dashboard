import { Grid, TextField, MenuItem } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import Cookies from "js-cookie";
import dayjs from "dayjs";

export default function Filters({ filters, setFilters }) {
  const handleChange = (key, value) => {
    // If date picker, convert dayjs object to string
    const formatted =
      key === "startDate" || key === "endDate"
        ? value
          ? dayjs(value).format("YYYY-MM-DD")
          : null
        : value;

    const updated = { ...filters, [key]: formatted };
    setFilters(updated);
    Cookies.set("dashboard_filters", JSON.stringify(updated));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={2}>
        {/* Start Date */}
        <Grid xs={12} md={3}>
          <DatePicker
            label="Start Date"
            value={filters.startDate ? dayjs(filters.startDate) : null}
            onChange={(date) => handleChange("startDate", date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>

        {/* End Date */}
        <Grid xs={12} md={3}>
          <DatePicker
            label="End Date"
            value={filters.endDate ? dayjs(filters.endDate) : null}
            onChange={(date) => handleChange("endDate", date)}
            slotProps={{ textField: { fullWidth: true } }}
          />
        </Grid>

        {/* Age Filter */}
        <Grid xs={12} md={3}>
          <TextField
            select
            label="Age"
            fullWidth
            value={filters.age}
            onChange={(e) => handleChange("age", e.target.value)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="<18">{"<18"}</MenuItem>
            <MenuItem value="18-40">18-40</MenuItem>
            <MenuItem value=">40">{">40"}</MenuItem>
          </TextField>
        </Grid>

        {/* Gender Filter */}
        <Grid xs={12} md={3}>
          <TextField
            select
            label="Gender"
            fullWidth
            value={filters.gender || ""}
            onChange={(e) => handleChange("gender", e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
}
