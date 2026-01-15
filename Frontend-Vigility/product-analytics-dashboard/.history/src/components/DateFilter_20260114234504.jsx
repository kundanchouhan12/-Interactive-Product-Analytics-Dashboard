import * as React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField, Box } from "@mui/material";

export default function DateFilter({ value, onChange }) {
  const [start, end] = value;

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <DatePicker
        label="Start"
        value={start}
        onChange={(newVal) => onChange([newVal, end])}
        renderInput={(params) => <TextField {...params} />}
      />
      <DatePicker
        label="End"
        value={end}
        onChange={(newVal) => onChange([start, newVal])}
        renderInput={(params) => <TextField {...params} />}
      />
    </Box>
  );
}
