// import React, { useEffect, useState, useContext } from "react";
// import api from "../api";
// import Cookies from "js-cookie";
// import { useNavigate } from "react-router-dom";

// import {
//   Container,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   Box,
//   Button,
//   IconButton,
//   Skeleton,
// } from "@mui/material";

// import { Brightness4, Brightness7 } from "@mui/icons-material";
// import AnalyticsIcon from "@mui/icons-material/Analytics";

// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   LineChart,
//   Line,
//   ResponsiveContainer,
// } from "recharts";

// import dayjs from "dayjs";
// import { ColorModeContext } from "../context/ThemeContext";

// /* ================= CONFIG ================= */

// const dashboardFeatures = [
//   "date_picker",
//   "filter_age",
//   "chart_bar",
//   "filter_gender",
// ];

// const featureMap = {
//   date_picker: ["date_picker", "bar_date_picker"],
//   filter_age: [
//     "filter_age_<18",
//     "filter_age_18-40",
//     "filter_age_>40",
//     "filter_age_all",
//     "bar_filter_age",
//   ],
//   chart_bar: ["chart_bar", "bar_chart_bar"],
//   filter_gender: [
//     "filter_gender_Male",
//     "filter_gender_Female",
//     "filter_gender_Other",
//     "filter_gender_all",
//     "bar_filter_gender",
//   ],
// };

// /* ================= COMPONENT ================= */

// export default function Dashboard() {
//   const navigate = useNavigate();
//   const { mode, toggleColorMode } = useContext(ColorModeContext);

//   const [filters, setFilters] = useState({
//     age: Cookies.get("age") || "",
//     gender: Cookies.get("gender") || "",
//   });

//   const [dateRange, setDateRange] = useState([
//     dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
//     dayjs(Cookies.get("endDate") || dayjs()),
//   ]);

//   const [barData, setBarData] = useState([]);
//   const [lineData, setLineData] = useState([]);
//   const [selectedFeature, setSelectedFeature] = useState("");
//   const [loading, setLoading] = useState(false);

//   /* ================= TRACK ================= */

//   const trackClick = (featureName) => {
//     api.post("/api/track", { featureName }).catch(() => {});
//   };

//   /* ================= FETCH ANALYTICS ================= */

//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);

//       const params = {
//         startDate: dateRange[0].format("YYYY-MM-DD"),
//         endDate: dateRange[1].format("YYYY-MM-DD"),
//         age: filters.age || null,
//         gender: filters.gender || null,
//       };

//       const res = await api.get("/api/analytics", { params });

//       const bars = dashboardFeatures.map((f) => {
//         let count = 0;
//         Object.keys(res.data.barData || {}).forEach((k) => {
//           if (featureMap[f].includes(k)) count += res.data.barData[k];
//         });
//         return { feature: f, count };
//       });

//       setBarData(bars);

//       const keys = selectedFeature
//         ? featureMap[selectedFeature]
//         : [].concat(...Object.values(featureMap));

//       const dates = new Set();
//       keys.forEach((k) =>
//         (res.data.lineData[k] || []).forEach((d) => dates.add(d.date)),
//       );

//       const line = [...dates].sort().map((date) => {
//         let total = 0;
//         keys.forEach((k) => {
//           const found = (res.data.lineData[k] || []).find(
//             (x) => x.date === date,
//           );
//           if (found) total += found.count;
//         });
//         return { date, clicks: total };
//       });

//       setLineData(line);
//     } catch (e) {
//       console.error("Analytics error:", e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [filters, dateRange, selectedFeature]);

//   /* ================= HANDLERS ================= */

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     trackClick(`filter_${name}_${value || "all"}`);
//     Cookies.set(name, value);
//     setFilters((p) => ({ ...p, [name]: value }));
//   };

//   const handleQuickDate = (type) => {
//     let start = dayjs();
//     let end = dayjs();

//     if (type === "yesterday") start = end = dayjs().subtract(1, "day");
//     if (type === "last7") start = dayjs().subtract(6, "day");
//     if (type === "thisMonth") start = dayjs().startOf("month");
//     if (type === "reset") {
//       start = dayjs().subtract(7, "day");
//       setFilters({ age: "", gender: "" });
//       Cookies.remove("age");
//       Cookies.remove("gender");
//     }

//     setDateRange([start, end]);
//     Cookies.set("startDate", start.format("YYYY-MM-DD"));
//     Cookies.set("endDate", end.format("YYYY-MM-DD"));
//     trackClick("date_picker");
//   };

//   const handleLogout = () => {
//     trackClick("logout");
//     localStorage.clear();
//     Cookies.remove("age");
//     Cookies.remove("gender");
//     Cookies.remove("startDate");
//     Cookies.remove("endDate");
//     navigate("/login", { replace: true });
//   };

//   /* ================= UI ================= */

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       {/* HEADER */}
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         flexWrap="wrap"
//         gap={2}
//         mb={3}
//       >
//         <Box display="flex" alignItems="center" gap={1}>
//           <AnalyticsIcon sx={{ fontSize: 38, color: "#6366f1" }} />
//           <Typography variant="h5" fontWeight={700}>
//             Product Analytics Dashboard
//           </Typography>
//         </Box>

//         <Box>
//           <IconButton onClick={toggleColorMode}>
//             {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
//           </IconButton>
//           <Button
//             color="error"
//             variant="contained"
//             sx={{ ml: 2, borderRadius: 3 }}
//             onClick={handleLogout}
//           >
//             Logout
//           </Button>
//         </Box>
//       </Box>

//       {/* FILTERS */}
//       <Card sx={{ mb: 4, borderRadius: 4 }}>
//         <CardContent>
//           <Typography variant="h6" mb={2}>
//             Filters
//           </Typography>

//           <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
//             {["today", "yesterday", "last 7", "this Month", "reset"].map((k) => (
//               <Button
//                 key={k}
//                 size="small"
//                 variant="outlined"
//                 onClick={() => handleQuickDate(k)}
//               >
//                 {k}
//               </Button>
//             ))}
//           </Box>

//           <Grid container spacing={2}>
//             <Grid item xs={12} sm="auto">
//               <FormControl sx={{ minWidth: 220, maxWidth: 260 }} fullWidth>
//                 <InputLabel>Age</InputLabel>
//                 <Select
//                   name="age"
//                   value={filters.age}
//                   onChange={handleFilterChange}
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   <MenuItem value="<18">&lt;18</MenuItem>
//                   <MenuItem value="18-40">18-40</MenuItem>
//                   <MenuItem value=">40">&gt;40</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm="auto">
//               <FormControl sx={{ minWidth: 220, maxWidth: 260 }} fullWidth>
//                 <InputLabel>Gender</InputLabel>
//                 <Select
//                   name="gender"
//                   value={filters.gender}
//                   onChange={handleFilterChange}
//                 >
//                   <MenuItem value="">All</MenuItem>
//                   <MenuItem value="Male">Male</MenuItem>
//                   <MenuItem value="Female">Female</MenuItem>
//                   <MenuItem value="Other">Other</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         </CardContent>
//       </Card>

//       {/* CHARTS */}
//       <Grid container spacing={4}>
//         {/* BAR */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ borderRadius: 4 }}>
//             <CardContent>
//               <Typography variant="h6">Total Clicks</Typography>
//               {loading ? (
//                 <Skeleton height={300} />
//               ) : (
//                 <Box height={300}>
//                   <BarChart width={500} height={300} data={barData}>
//                     <XAxis dataKey="feature" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar
//                       dataKey="count"
//                       fill="#6366f1"
//                       onClick={(d) => {
//                         trackClick(`bar_${d.feature}`);
//                         setSelectedFeature(d.feature);
//                       }}
//                     />
//                   </BarChart>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* LINE */}
//         <Grid item xs={12} md={6}>
//           <Card sx={{ borderRadius: 4 }}>
//             <CardContent>
//               <Typography variant="h6">
//                 Daily Clicks {selectedFeature && `: ${selectedFeature}`}
//               </Typography>

//               {loading ? (
//                 <Skeleton height={300} />
//               ) : (
//                 <Box height={300}>
//                   <LineChart width={500} height={300} data={lineData}>
//                     <XAxis dataKey="date" />
//                     <YAxis />
//                     <Tooltip />
//                     <Line
//                       dataKey="clicks"
//                       stroke="#22d3ee"
//                       strokeWidth={3}
//                       dot={{ r: 4 }}
//                     />
//                   </LineChart>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// }


import React, { useEffect, useState } from "react";
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
  Fade,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import api from "../api";

/* -------------------- HELPERS -------------------- */
const getDatesBetween = (start, end) => {
  const dates = [];
  let current = start.startOf("day");
  while (current.isSameOrBefore(end, "day")) {
    dates.push(current.format("YYYY-MM-DD"));
    current = current.add(1, "day");
  }
  return dates;
};

export default function Dashboard() {
  /* -------------------- STATE -------------------- */
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || "",
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate")) || dayjs(),
    dayjs(Cookies.get("endDate")) || dayjs(),
  ]);

  /* -------------------- TRACK CLICK -------------------- */
  const trackClick = async (feature) => {
    try {
      await api.post("/track", { feature });
    } catch (e) {
      console.error("Track error", e);
    }
  };

  /* -------------------- QUICK DATES -------------------- */
  const handleQuickDate = (type) => {
    let start = dayjs();
    let end = dayjs();

    if (type === "today") {
      start = end = dayjs();
      trackClick("date_picker_today");
    }

    if (type === "last7") {
      start = dayjs().subtract(6, "day");
      trackClick("date_picker_last7");
    }

    if (type === "month") {
      start = dayjs().startOf("month");
      trackClick("date_picker_month");
    }

    if (type === "reset") {
      start = dayjs().subtract(7, "day");
      setFilters({ age: "", gender: "" });
      Cookies.remove("age");
      Cookies.remove("gender");
      trackClick("date_picker_reset");
    }

    setDateRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
  };

  /* -------------------- FILTER HANDLERS -------------------- */
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    Cookies.set(key, value);
    trackClick(`filter_${key}`);
  };

  /* -------------------- FETCH ANALYTICS -------------------- */
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/analytics", {
        params: {
          startDate: dateRange[0].format("YYYY-MM-DD"),
          endDate: dateRange[1].format("YYYY-MM-DD"),
          age: filters.age,
          gender: filters.gender,
        },
      });

      /* -------- BAR DATA (ZERO SAFE) -------- */
      const bar = (res.data.barData || []).map((d) => ({
        feature: d.feature_name,
        count: d.count || 0,
      }));
      setBarData(bar);

      /* -------- LINE DATA (FIXED RANGE ISSUE) -------- */
      const allDates = getDatesBetween(dateRange[0], dateRange[1]);
      const keys = Object.keys(res.data.lineData || {});

      const line = allDates.map((date) => {
        let total = 0;
        keys.forEach((k) => {
          const found = (res.data.lineData[k] || []).find(
            (x) => x.date === date
          );
          if (found) total += found.count;
        });
        return { date, clicks: total };
      });

      setLineData(line);
    } catch (err) {
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- EFFECT -------------------- */
  useEffect(() => {
    fetchAnalytics();
  }, [filters, dateRange]);

  /* -------------------- UI -------------------- */
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Fade in timeout={600}>
        <Typography variant="h4" sx={{ mb: 3, color: "#c7d2fe" }}>
          📊 Product Analytics Dashboard
        </Typography>
      </Fade>

      {/* -------- FILTERS -------- */}
      <Card sx={{ mb: 3, bgcolor: "#020617" }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Age</InputLabel>
                <Select
                  value={filters.age}
                  label="Age"
                  onChange={(e) =>
                    handleFilterChange("age", e.target.value)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="18-25">18-25</MenuItem>
                  <MenuItem value="26-35">26-35</MenuItem>
                  <MenuItem value="36+">36+</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender"
                  onChange={(e) =>
                    handleFilterChange("gender", e.target.value)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Button onClick={() => handleQuickDate("today")}>
                  Today
                </Button>
                <Button onClick={() => handleQuickDate("last7")}>
                  Last 7 Days
                </Button>
                <Button onClick={() => handleQuickDate("month")}>
                  This Month
                </Button>
                <Button color="error" onClick={() => handleQuickDate("reset")}>
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* -------- BAR CHART -------- */}
      <Card sx={{ mb: 3, bgcolor: "#020617" }}>
        <CardContent>
          <Typography sx={{ mb: 2, color: "#c7d2fe" }}>
            Feature Usage
          </Typography>

          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={barData}>
              <XAxis dataKey="feature" stroke="#818cf8" />
              <YAxis stroke="#818cf8" />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#22d3ee"
                onClick={(data) =>
                  data && trackClick(`bar_${data.feature}`)
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* -------- LINE CHART -------- */}
      <Card sx={{ bgcolor: "#020617" }}>
        <CardContent>
          <Typography sx={{ mb: 2, color: "#c7d2fe" }}>
            Clicks Over Time
          </Typography>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <XAxis dataKey="date" stroke="#818cf8" />
              <YAxis stroke="#818cf8" />
              <Tooltip />
              <Line
                dataKey="clicks"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Container>
  );
}
