// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Cookies from "js-cookie";
// import {
//   Container, Grid, Card, CardContent, Typography,
//   FormControl, InputLabel, Select, MenuItem,
//   Box, Button, TextField
// } from "@mui/material";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend } from "recharts";
// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";

// export default function Dashboard() {
//   const [filters, setFilters] = useState({
//     age: Cookies.get("age") || "",
//     gender: Cookies.get("gender") || ""
//   });

//   const [dateRange, setDateRange] = useState([
//     dayjs(Cookies.get("startDate") || "2026-01-01"),
//     dayjs(Cookies.get("endDate") || "2026-01-14")
//   ]);

//   const [barData, setBarData] = useState([]);
//   const [lineData, setLineData] = useState([]);
//   const [allLineData, setAllLineData] = useState([]);
//   const [selectedFeature, setSelectedFeature] = useState("");
//   const [quickRange, setQuickRangeState] = useState(null);

//   // ---------------- FETCH ANALYTICS ----------------
//   const fetchAnalytics = async () => {
//     const params = {
//       startDate: dateRange[0]?.format("YYYY-MM-DD"),
//       endDate: dateRange[1]?.format("YYYY-MM-DD"),
//       age: filters.age,
//       gender: filters.gender
//     };
//     const res = await api.get("/api/analytics", { params });

//     // BAR DATA
//     const bars = Object.entries(res.data.barData || {}).map(([f, count]) => ({ feature: f, count }));
//     setBarData(bars);

//     // LINE DATA
//     if (selectedFeature && res.data.lineData[selectedFeature]) {
//       setLineData(res.data.lineData[selectedFeature]);
//     } else {
//       const combined = [];
//       const keys = Object.keys(res.data.lineData || {});
//       if (keys.length) {
//         const dates = res.data.lineData[keys[0]].map(item => item.date);
//         dates.forEach((date, idx) => {
//           const point = { date };
//           keys.forEach(f => point[f] = res.data.lineData[f][idx]?.count || 0);
//           combined.push(point);
//         });
//       }
//       setLineData(combined);
//       setAllLineData(keys);
//     }
//   };

//   useEffect(() => { fetchAnalytics(); }, [filters, dateRange, selectedFeature]);

//   // ---------------- FILTER HANDLERS ----------------
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     const newFilters = { ...filters, [name]: value };
//     setFilters(newFilters);
//     Cookies.set(name, value);
//     trackClick(`filter_${name}`);
//   };

//   const handleBarClick = (state) => {
//     if (!state?.activePayload?.[0]) return;
//     const feature = state.activePayload[0].payload.feature;
//     setSelectedFeature(feature);
//     trackClick(feature);
//   };

//   const trackClick = async (featureName) => {
//     try {
//       const username = Cookies.get("username") || "demoUser";
//       await api.post("/api/track", { username, featureName });
//     } catch (err) { console.error(err); }
//   };

//   const handleLogout = () => {
//     Cookies.remove("username"); Cookies.remove("age"); Cookies.remove("gender");
//     Cookies.remove("startDate"); Cookies.remove("endDate");
//     window.location.href = "/login";
//   };

//   // ---------------- QUICK RANGE ----------------
//   const setQuickRange = (range) => {
//     const now = new Date();
//     let start, end;
//     switch (range) {
//       case "today":
//         start = end = dayjs();
//         break;
//       case "yesterday":
//         start = end = dayjs().subtract(1, "day");
//         break;
//       case "last7":
//         start = dayjs().subtract(6, "day"); end = dayjs();
//         break;
//       case "month":
//         start = dayjs().startOf("month"); end = dayjs().endOf("month");
//         break;
//       default: return;
//     }
//     setDateRange([start, end]);
//     Cookies.set("startDate", start.format("YYYY-MM-DD"));
//     Cookies.set("endDate", end.format("YYYY-MM-DD"));
//     setQuickRangeState(range);
//     trackClick(`quickrange_${range}`);
//   };

//   const resetToOverall = () => {
//     setSelectedFeature("");
//     setQuickRangeState(null);
//     fetchAnalytics();
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//         <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
//         <Button variant="contained" color="error" onClick={handleLogout}>Logout</Button>
//       </Box>

//       {/* Filters */}
//       <Card sx={{ mb: 4 }}>
//         <CardContent>
//           <Typography variant="h6">Filters</Typography>

//           {/* Quick Range */}
//           <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
//             {["today","yesterday","last7","month"].map(q => (
//               <Button
//                 key={q}
//                 variant={quickRange===q ? "contained":"outlined"}
//                 onClick={()=>setQuickRange(q)}
//               >
//                 {q.charAt(0).toUpperCase() + q.slice(1)}
//               </Button>
//             ))}
//             <Button variant="text" onClick={resetToOverall}>Custom / Reset</Button>
//           </Box>

//           {/* Date Picker */}
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
//               <DatePicker
//                 label="Start Date"
//                 value={dateRange[0]}
//                 onChange={(newVal) => setDateRange([newVal, dateRange[1]])}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
//               />
//               <DatePicker
//                 label="End Date"
//                 value={dateRange[1]}
//                 onChange={(newVal) => setDateRange([dateRange[0], newVal])}
//                 renderInput={(params) => <TextField {...params} fullWidth />}
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

//       {/* Charts */}
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Total Clicks</Typography>
//               <BarChart
//                 layout="vertical"
//                 width={500}
//                 height={300}
//                 data={barData}
//                 onClick={handleBarClick}
//                 margin={{top:20,right:30,left:40,bottom:20}}
//               >
//                 <XAxis type="number" tickFormatter={v=>v} />
//                 <YAxis type="category" dataKey="feature" />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
//               </BarChart>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Clicks Daily: {selectedFeature || "Overall"}</Typography>
//               <LineChart width={500} height={300} data={lineData}>
//                 <XAxis dataKey="date" />
//                 <YAxis tickFormatter={v=>v} />
//                 <Tooltip />
//                 <Legend />
//                 {selectedFeature ? (
//                   <Line dataKey="count" stroke="#22c55e" />
//                 ) : (
//                   allLineData.map((f, idx)=>(
//                     <Line key={f} dataKey={f} stroke={["#ff6384","#36a2eb","#ffcd56","#f97316"][idx%4]} />
//                   ))
//                 )}
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
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  TextField,
  Stack,
  useTheme,
  IconButton,
  Divider
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend, ResponsiveContainer } from "recharts";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  const theme = useTheme();

  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || "2026-01-01"),
    dayjs(Cookies.get("endDate") || "2026-01-14")
  ]);

  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [allLineData, setAllLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [quickRange, setQuickRangeState] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------- FETCH ANALYTICS ----------------
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0]?.format("YYYY-MM-DD"),
        endDate: dateRange[1]?.format("YYYY-MM-DD"),
        age: filters.age,
        gender: filters.gender
      };
      const res = await api.get("/api/analytics", { params });

      // BAR DATA
      const bars = Object.entries(res.data.barData || {}).map(([f, count]) => ({ feature: f, count }));
      setBarData(bars);

      // LINE DATA
      if (selectedFeature && res.data.lineData[selectedFeature]) {
        setLineData(res.data.lineData[selectedFeature]);
        setAllLineData([selectedFeature]);
      } else {
        const combined = [];
        const keys = Object.keys(res.data.lineData || {});
        if (keys.length) {
          const dates = res.data.lineData[keys[0]].map(item => item.date);
          dates.forEach((date, idx) => {
            const point = { date };
            keys.forEach(f => (point[f] = res.data.lineData[f][idx]?.count || 0));
            combined.push(point);
          });
        }
        setLineData(combined);
        setAllLineData(keys);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, dateRange, selectedFeature]);

  // ---------------- FILTER HANDLERS ----------------
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    Cookies.set(name, value);
    trackClick(`filter_${name}`);
  };

  const handleBarClick = (state) => {
    if (!state?.activePayload?.[0]) return;
    const feature = state.activePayload[0].payload.feature;
    setSelectedFeature(feature);
    trackClick(feature);
  };

  const trackClick = async (featureName) => {
    try {
      const username = Cookies.get("username") || "demoUser";
      await api.post("/api/track", { username, featureName });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    Cookies.remove("username");
    Cookies.remove("age");
    Cookies.remove("gender");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    window.location.href = "/login";
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
        start = dayjs().subtract(6, "day");
        end = dayjs();
        break;
      case "month":
        start = dayjs().startOf("month");
        end = dayjs().endOf("month");
        break;
      default:
        return;
    }
    setDateRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
    setQuickRangeState(range);
    trackClick(`quickrange_${range}`);
  };

  const resetToOverall = () => {
    setSelectedFeature("");
    setQuickRangeState(null);
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    fetchAnalytics();
  };

  // ---------------- RENDER HELPERS ----------------
  const quickRanges = [
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last7", label: "Last 7" },
    { key: "month", label: "This Month" }
  ];

  const palette = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  // ---------------- RENDER ----------------
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(90deg, ${theme.palette.primary.main}22, ${theme.palette.success.main}11)`,
          borderRadius: 2,
          p: 2,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            📊 Product Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dateRange[0]?.format("YYYY-MM-DD")} — {dateRange[1]?.format("YYYY-MM-DD")}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            color="inherit"
            onClick={resetToOverall}
            sx={{ textTransform: "none" }}
          >
            Reset View
          </Button>
          <IconButton
            onClick={handleLogout}
            color="error"
            title="Logout"
            sx={{ bgcolor: "transparent" }}
          >
            <LogoutIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Filters
          </Typography>

          <Stack direction="row" spacing={2} flexWrap="wrap" alignItems="center" mb={2}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              {quickRanges.map((q) => (
                <Button
                  key={q.key}
                  variant={quickRange === q.key ? "contained" : "outlined"}
                  onClick={() => setQuickRange(q.key)}
                  sx={{
                    borderRadius: 20,
                    textTransform: "none",
                    px: 2,
                    py: 0.6,
                    minWidth: 96
                  }}
                >
                  {q.label}
                </Button>
              ))}
              <Button variant="text" onClick={resetToOverall} sx={{ textTransform: "none" }}>
                Custom / Reset
              </Button>
            </Stack>
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={dateRange[0]}
                  onChange={(newVal) => setDateRange([newVal, dateRange[1]])}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={dateRange[1]}
                  onChange={(newVal) => setDateRange([dateRange[0], newVal])}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel>Age</InputLabel>
                    <Select name="age" value={filters.age} onChange={handleFilterChange} label="Age">
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="<18">&lt;18</MenuItem>
                      <MenuItem value="18-40">18-40</MenuItem>
                      <MenuItem value=">40">&gt;40</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Gender</InputLabel>
                    <Select name="gender" value={filters.gender} onChange={handleFilterChange} label="Gender">
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
            </Grid>
          </LocalizationProvider>

          <Divider sx={{ my: 1 }} />

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              onClick={fetchAnalytics}
              sx={{ textTransform: "none" }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Apply"}
            </Button>
            <Button variant="outlined" onClick={() => { setFilters({ age: "", gender: "" }); Cookies.remove("age"); Cookies.remove("gender"); }} sx={{ textTransform: "none" }}>
              Clear Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Charts */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Total Clicks
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Click counts by feature. Click a bar to focus on that feature.
              </Typography>

              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={barData}
                    onClick={handleBarClick}
                    margin={{ top: 8, right: 16, left: 16, bottom: 8 }}
                  >
                    <XAxis type="number" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis type="category" dataKey="feature" tick={{ fill: theme.palette.text.primary }} width={120} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "none", boxShadow: theme.shadows[3] }}
                      itemStyle={{ color: theme.palette.text.primary }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 6, 6]} fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <div>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Clicks Daily
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedFeature ? `Feature: ${selectedFeature}` : "Overall trends"}
                  </Typography>
                </div>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    variant={selectedFeature ? "outlined" : "contained"}
                    onClick={() => setSelectedFeature("")}
                    sx={{ textTransform: "none" }}
                  >
                    Overall
                  </Button>
                </Stack>
              </Stack>

              <Box sx={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "none", boxShadow: theme.shadows[3] }}
                      itemStyle={{ color: theme.palette.text.primary }}
                    />
                    <Legend />
                    {selectedFeature ? (
                      <Line type="monotone" dataKey="count" stroke={theme.palette.success.main} strokeWidth={2} dot={{ r: 3 }} />
                    ) : (
                      allLineData.map((f, idx) => (
                        <Line
                          key={f}
                          type="monotone"
                          dataKey={f}
                          stroke={palette[idx % palette.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
