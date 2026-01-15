// import * as React from "react";
// import dayjs from "dayjs";
// import { Box, Button, Stack, Typography } from "@mui/material";

// import {
//   LocalizationProvider,
//   DateRangePicker
// } from "@mui/x-date-pickers";

// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// export default function DateFilter({ value, onChange }) {

//   const setPreset = (type) => {
//     const now = dayjs();
//     let range = [null, null];

//     switch (type) {
//       case "today":
//         range = [now.startOf("day"), now.endOf("day")];
//         break;
//       case "yesterday":
//         range = [
//           now.subtract(1, "day").startOf("day"),
//           now.subtract(1, "day").endOf("day")
//         ];
//         break;
//       case "last7":
//         range = [now.subtract(6, "day").startOf("day"), now.endOf("day")];
//         break;
//       case "month":
//         range = [now.startOf("month"), now.endOf("month")];
//         break;
//       default:
//         return;
//     }

//     onChange(range);
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Stack spacing={2}>
//         {/* Preset Buttons */}
//         <Box display="flex" gap={1} flexWrap="wrap">
//           <Button size="small" onClick={() => setPreset("today")}>Today</Button>
//           <Button size="small" onClick={() => setPreset("yesterday")}>Yesterday</Button>
//           <Button size="small" onClick={() => setPreset("last7")}>Last 7 Days</Button>
//           <Button size="small" onClick={() => setPreset("month")}>This Month</Button>
//         </Box>

//         {/* Calendar */}
//         <DateRangePicker
//           value={value}
//           onChange={onChange}
//         />

//         {/* Selected Range */}
//         {value?.[0] && value?.[1] && (
//           <Typography variant="caption">
//             {value[0].format("YYYY-MM-DD HH:mm:ss")} -{" "}
//             {value[1].format("YYYY-MM-DD HH:mm:ss")}
//           </Typography>
//         )}
//       </Stack>
//     </LocalizationProvider>
//   );
// }
