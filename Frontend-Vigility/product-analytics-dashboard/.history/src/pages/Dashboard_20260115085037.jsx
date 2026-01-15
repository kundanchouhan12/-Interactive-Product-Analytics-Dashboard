// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Cookies from "js-cookie";
// import {
//   Container, Grid, Card, CardContent, Typography,
//   FormControl, InputLabel, Select, MenuItem,
//   Box, Button, TextField
// } from "@mui/material";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip,
//   LineChart, Line
// } from "recharts";
// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";

// export default function Dashboard() {

//   // ---------------- STATE ----------------
//   const [filters, setFilters] = useState({
//     age: Cookies.get("age") || "",
//     gender: Cookies.get("gender") || ""
//   });

//   const [dateRange, setDateRange] = useState([
//     dayjs(Cookies.get("startDate") || "2026-01-01"),
//     dayjs(Cookies.get("endDate") || "2026-01-31")
//   ]);

//   const [barData, setBarData] = useState([]);
//   const [lineDataMap, setLineDataMap] = useState({});
//   const [lineData, setLineData] = useState([]);
//   const [selectedFeature, setSelectedFeature] = useState("");
//   const [quickRange, setQuickRange] = useState(null);

//   // ---------------- FETCH ANALYTICS ----------------
//   const fetchAnalytics = async () => {
//     const params = {
//       startDate: dateRange[0].format("YYYY-MM-DD"),
//       endDate: dateRange[1].format("YYYY-MM-DD"),
//       age: filters.age || undefined,
//       gender: filters.gender || undefined
//     };

//     const res = await api.get("/api/analytics", { params });

//     // BAR DATA
//     const bars = Object.entries(res.data.barData || {}).map(
//       ([feature, count]) => ({ feature, count })
//     );
//     setBarData(bars);

//     // LINE DATA
//     const map = res.data.lineData || {};
//     setLineDataMap(map);

//     if (selectedFeature && map[selectedFeature]) {
//       setLineData(map[selectedFeature]);
//     } else if (bars.length) {
//       setSelectedFeature(bars[0].feature);
//       setLineData(map[bars[0].feature] || []);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [filters, dateRange, selectedFeature]);

//   // ---------------- FILTER HANDLERS ----------------
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => {
//       Cookies.set(name, value);
//       return { ...prev, [name]: value };
//     });
//     trackClick(`filter_${name}`);
//   };

//   const handleBarClick = (data) => {
//     if (!data?.feature) return;
//     setSelectedFeature(data.feature);
//     setLineData(lineDataMap[data.feature] || []);
//     trackClick(data.feature);
//   };

//   const trackClick = async (featureName) => {
//     try {
//       await api.post("/api/track", {
//         username: Cookies.get("username"),
//         featureName
//       });
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleLogout = () => {
//     Cookies.remove("username");
//     Cookies.remove("age");
//     Cookies.remove("gender");
//     Cookies.remove("startDate");
//     Cookies.remove("endDate");
//     window.location.href = "/login";
//   };

//   // ---------------- QUICK DATE RANGE ----------------
//   const applyQuickRange = (type) => {
//     let start, end;
//     switch (type) {
//       case "today":
//         start = end = dayjs();
//         break;
//       case "last7":
//         start = dayjs().subtract(6, "day");
//         end = dayjs();
//         break;
//       case "month":
//         start = dayjs().startOf("month");
//         end = dayjs().endOf("month");
//         break;
//       default:
//         return;
//     }
//     setDateRange([start, end]);
//     Cookies.set("startDate", start.format("YYYY-MM-DD"));
//     Cookies.set("endDate", end.format("YYYY-MM-DD"));
//     setQuickRange(type);
//     trackClick(`quickrange_${type}`);
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
//         <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
//         <Button variant="contained" color="error" onClick={handleLogout}>
//           Logout
//         </Button>
//       </Box>

//       {/* ---------------- FILTERS ---------------- */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h6">Filters</Typography>

//           {/* Quick Range */}
//           <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//             {["today", "last7", "month"].map(q => (
//               <Button
//                 key={q}
//                 variant={quickRange === q ? "contained" : "outlined"}
//                 onClick={() => applyQuickRange(q)}
//               >
//                 {q.toUpperCase()}
//               </Button>
//             ))}
//           </Box>

//           {/* Date Pickers */}
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
//               <DatePicker
//                 label="Start Date"
//                 value={dateRange[0]}
//                 onChange={(v) => setDateRange([v, dateRange[1]])}
//                 renderInput={(p) => <TextField {...p} />}
//               />
//               <DatePicker
//                 label="End Date"
//                 value={dateRange[1]}
//                 onChange={(v) => setDateRange([dateRange[0], v])}
//                 renderInput={(p) => <TextField {...p} />}
//               />
//             </Box>
//           </LocalizationProvider>

//           {/* Age + Gender */}
//           <Box sx={{ display: "flex", gap: 2 }}>
//             <FormControl sx={{ minWidth: 120 }}>
//               <InputLabel>Age</InputLabel>
//               <Select name="age" value={filters.age} onChange={handleFilterChange}>
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="<18">&lt;18</MenuItem>
//                 <MenuItem value="18-40">18-40</MenuItem>
//                 <MenuItem value=">40">&gt;40</MenuItem>
//               </Select>
//             </FormControl>

//             <FormControl sx={{ minWidth: 120 }}>
//               <InputLabel>Gender</InputLabel>
//               <Select name="gender" value={filters.gender} onChange={handleFilterChange}>
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="Male">Male</MenuItem>
//                 <MenuItem value="Female">Female</MenuItem>
//                 <MenuItem value="Other">Other</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>
//         </CardContent>
//       </Card>

//       {/* ---------------- CHARTS ---------------- */}
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Total Feature Clicks</Typography>
//               <BarChart
//                 layout="vertical"
//                 width={500}
//                 height={300}
//                 data={barData}
//                 onClick={handleBarClick}
//               >
//                 <XAxis type="number" />
//                 <YAxis type="category" dataKey="feature" />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#6366f1" />
//               </BarChart>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">
//                 Click Trend: {selectedFeature}
//               </Typography>
//               <LineChart width={500} height={300} data={lineData}>
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line dataKey="count" stroke="#22c55e" />
//               </LineChart>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// }
import React, { useEffect, useState } from "react";
import api from "../api";
import Cookies from "js-cookie";
import {
  Container, Grid, Card, CardContent, Typography,
  FormControl, InputLabel, Select, MenuItem,
  Box, Button, TextField
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  // ---------------- STATE ----------------
  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || "2026-01-01"),
    dayjs(Cookies.get("endDate") || "2026-01-31")
  ]);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [allLineDataKeys, setAllLineDataKeys] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [quickRange, setQuickRangeState] = useState(null);

  // ---------------- FETCH ANALYTICS ----------------
  const fetchAnalytics = async () => {
    try {
      const params = {
        startDate: dateRange[0]?.format("YYYY-MM-DD"),
        endDate: dateRange[1]?.format("YYYY-MM-DD"),
        age: filters.age,
        gender: filters.gender
      };
      const res = await api.get("/api/analytics", { params });

      // ---------- BAR DATA ----------
      const bars = Object.entries(res.data.barData || {}).map(([f, count]) => ({ feature: f, count }));
      setBarData(bars);

      // ---------- LINE DATA ----------
      const lineObj = res.data.lineData || {};
      if (selectedFeature && lineObj[selectedFeature]) {
        setLineData(lineObj[selectedFeature]);
      } else {
        // Combine all features
        const keys = Object.keys(lineObj);
        const combined = [];

        if (keys.length) {
          const allDates = Array.from(new Set(keys.flatMap(f => lineObj[f].map(d => d.date)))).sort();
          allDates.forEach(date => {
            const point = { date };
            keys.forEach(f => {
              const dayObj = lineObj[f].find(d => d.date === date);
              point[f] = dayObj ? dayObj.count : 0;
            });
            combined.push(point);
          });
        }

        setLineData(combined);
        setAllLineDataKeys(keys);
      }

    } catch (err) {
      console.error("Error fetching analytics:", err);
    }
  };

  useEffect(() => { fetchAnalytics(); }, [filters, dateRange, selectedFeature]);

  // ---------------- FILTER HANDLERS ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    Cookies.set(name, value);
  };

  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
  };

  // ---------------- QUICK RANGE ----------------
  const setQuickRange = (range) => {
    let start, end;
    switch (range) {
      case "today":
        start = end = dayjs();
        break;
      case "yesterday":
        start = end = dayjs().subtract(1, "day");
        break;
      case "last7":
        start = dayjs().subtract(6, "day"); end = dayjs();
        break;
      case "month":
        start = dayjs().startOf("month"); end = dayjs().endOf("month");
        break;
      default: return;
    }
    setDateRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
    setQuickRangeState(range);
  };

  const resetToOverall = () => {
    setSelectedFeature("");
    setQuickRangeState(null);
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    Cookies.remove("username");
    Cookies.remove("age");
    Cookies.remove("gender");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    window.location.href = "/login";
  };

  // ---------------- RENDER ----------------
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
        <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          {/* Quick Range */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            {["today","yesterday","last7","month"].map(q => (
              <Button
                key={q}
                variant={quickRange===q ? "contained":"outlined"}
                onClick={()=>setQuickRange(q)}
              >
                {q.charAt(0).toUpperCase() + q.slice(1)}
              </Button>
            ))}
            <Button variant="text" onClick={resetToOverall}>Custom / Reset</Button>
          </Box>

          {/* Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <DatePicker
                label="Start Date"
                value={dateRange[0]}
                onChange={(newVal) => setDateRange([newVal, dateRange[1]])}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={dateRange[1]}
                onChange={(newVal) => setDateRange([dateRange[0], newVal])}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>
          </LocalizationProvider>

          {/* Age + Gender */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18-40</MenuItem>
                <MenuItem value=">40">&gt;40</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select name="gender" value={filters.gender} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Clicks</Typography>
              <BarChart
                layout="vertical"
                width={500}
                height={300}
                data={barData}
                onClick={handleBarClick}
                margin={{top:20,right:30,left:40,bottom:20}}
              >
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Clicks Daily: {selectedFeature || "Overall"}</Typography>
              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                {selectedFeature ? (
                  <Line dataKey="count" stroke="#22c55e" />
                ) : (
                  allLineDataKeys.map((f, idx)=>(
                    <Line key={f} dataKey={f} stroke={["#ff6384","#36a2eb","#ffcd56","#f97316"][idx%4]} />
                  ))
                )}
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
