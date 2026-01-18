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
//   useTheme,
//   useMediaQuery,
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
// } from "recharts";

// import dayjs from "dayjs";
// import { ColorModeContext } from "../context/ThemeContext";

// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

//   const [filters, setFilters] = useState({
//     age: Cookies.get("age") || "",
//     gender: Cookies.get("gender") || "",
//   });

//   const [dateRange, setDateRange] = useState([
//     dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
//     dayjs(Cookies.get("endDate") || dayjs()),
//   ]);

//   const [customOpen, setCustomOpen] = useState(false);
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
//         (res.data.lineData[k] || []).forEach((d) => dates.add(d.date))
//       );

//       const line = [...dates].sort().map((date) => {
//         let total = 0;
//         keys.forEach((k) => {
//           const found = (res.data.lineData[k] || []).find(
//             (x) => x.date === date
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

//     if (type === "today") start = end = dayjs();
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

//   const applyCustomRange = () => {
//     Cookies.set("startDate", dateRange[0].format("YYYY-MM-DD"));
//     Cookies.set("endDate", dateRange[1].format("YYYY-MM-DD"));
//     trackClick("date_picker_custom");
//     setCustomOpen(false);
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

//           {/* QUICK DATE */}
//           <Box
//             display="flex"
//             gap={2}
//             rowGap={1.5}
//             flexWrap="wrap"
//             mb={2}
//           >
//             {["today", "yesterday", "last7", "thisMonth", "custom", "reset"].map(
//               (k) => (
//                 <Button
//                   key={k}
//                   size="small"
//                   variant={k === "custom" ? "contained" : "outlined"}
//                   onClick={() =>
//                     k === "custom" ? setCustomOpen(true) : handleQuickDate(k)
//                   }
//                 >
//                   {k === "last7"
//                     ? "LAST 7 DAYS"
//                     : k === "thisMonth"
//                     ? "THIS MONTH"
//                     : k.toUpperCase()}
//                 </Button>
//               )
//             )}
//           </Box>

//           {/* CUSTOM RANGE */}
//           {customOpen && (
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
//                 <DatePicker
//                   label="Start Date"
//                   value={dateRange[0]}
//                   onChange={(v) => setDateRange([v, dateRange[1]])}
//                 />
//                 <DatePicker
//                   label="End Date"
//                   value={dateRange[1]}
//                   onChange={(v) => setDateRange([dateRange[0], v])}
//                 />
//                 <Button variant="contained" color="success" onClick={applyCustomRange}>
//                   Apply
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="error"
//                   onClick={() => setCustomOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//               </Box>
//             </LocalizationProvider>
//           )}

//           {/* AGE / GENDER */}
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm="auto">
//               <FormControl sx={{ minWidth: 280, maxWidth: 300 }}>
//                 <InputLabel>Age</InputLabel>
//                 <Select name="age" value={filters.age} onChange={handleFilterChange}>
//                   <MenuItem value="">All</MenuItem>
//                   <MenuItem value="<18">&lt;18</MenuItem>
//                   <MenuItem value="18-40">18-40</MenuItem>
//                   <MenuItem value=">40">&gt;40</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>

//             <Grid item xs={12} sm="auto">
//               <FormControl sx={{ minWidth: 280, maxWidth: 300 }}>
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
//                 <Box sx={{ overflowX: isMobile ? "auto" : "hidden" }}>
//                   <Box sx={{ width: 500, minWidth: 500 }}>
//                     <BarChart width={500} height={300} data={barData}>
//                       <XAxis dataKey="feature" />
//                       <YAxis />
//                       <Tooltip />
//                       <Bar
//                         dataKey="count"
//                         fill="#6366f1"
//                         onClick={(d) => setSelectedFeature(d.feature)}
//                       />
//                     </BarChart>
//                   </Box>
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
//                 <Box sx={{ overflowX: isMobile ? "auto" : "hidden" }}>
//                   <Box sx={{ width: 500, minWidth: 500 }}>
//                     <LineChart width={500} height={300} data={lineData}>
//                       <XAxis dataKey="date" />
//                       <YAxis />
//                       <Tooltip />
//                       <Line
//                         dataKey="clicks"
//                         stroke="#22d3ee"
//                         strokeWidth={3}
//                         dot={{ r: 4 }}
//                       />
//                     </LineChart>
//                   </Box>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// }


import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

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
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { Brightness4, Brightness7 } from "@mui/icons-material";
import AnalyticsIcon from "@mui/icons-material/Analytics";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import dayjs from "dayjs";
import { ColorModeContext } from "../context/ThemeContext";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

/* ================= COMPONENT ================= */

export default function Dashboard() {
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useContext(ColorModeContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || "",
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
    dayjs(Cookies.get("endDate") || dayjs()),
  ]);

  const [customOpen, setCustomOpen] = useState(false);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= TRACK ================= */

  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  /* ================= FETCH ANALYTICS ================= */

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        age: filters.age || null,
        gender: filters.gender || null,
      };

      const res = await api.get("/api/analytics", { params });

      /* ===== BAR DATA (DIRECT FROM DB) ===== */
      const bars = Object.entries(res.data.barData || {}).map(
        ([key, value]) => ({
          feature: key.replaceAll("_", " "),
          rawKey: key,
          count: value,
        })
      );

      setBarData(bars);

      /* ===== LINE DATA ===== */
      const keys = selectedFeature
        ? [selectedFeature]
        : Object.keys(res.data.lineData || {});

      const dates = new Set();
      keys.forEach((k) =>
        (res.data.lineData[k] || []).forEach((d) => dates.add(d.date))
      );

      const line = [...dates].sort().map((date) => {
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
    } catch (e) {
      console.error("Analytics error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters, dateRange, selectedFeature]);

  /* ================= HANDLERS ================= */

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    Cookies.set(name, value);
    setFilters((p) => ({ ...p, [name]: value }));
  };

  const handleQuickDate = (type) => {
    let start = dayjs();
    let end = dayjs();

    if (type === "today") start = end = dayjs();
    if (type === "yesterday") start = end = dayjs().subtract(1, "day");
    if (type === "last7") start = dayjs().subtract(6, "day");
    if (type === "thisMonth") start = dayjs().startOf("month");

    if (type === "reset") {
      start = dayjs().subtract(7, "day");
      setFilters({ age: "", gender: "" });
      Cookies.remove("age");
      Cookies.remove("gender");
    }

    setDateRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
    trackClick("date_picker");
  };

  const applyCustomRange = () => {
    Cookies.set("startDate", dateRange[0].format("YYYY-MM-DD"));
    Cookies.set("endDate", dateRange[1].format("YYYY-MM-DD"));
    trackClick("date_picker_custom");
    setCustomOpen(false);
  };

  const handleLogout = () => {
    trackClick("logout");
    localStorage.clear();
    Cookies.remove("age");
    Cookies.remove("gender");
    Cookies.remove("startDate");
    Cookies.remove("endDate");
    navigate("/login", { replace: true });
  };

  /* ================= UI ================= */

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <AnalyticsIcon sx={{ fontSize: 38, color: "#6366f1" }} />
          <Typography variant="h5" fontWeight={700}>
            Product Analytics Dashboard
          </Typography>
        </Box>

        <Box>
          <IconButton onClick={toggleColorMode}>
            {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <Button
            color="error"
            variant="contained"
            sx={{ ml: 2, borderRadius: 3 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h6" mb={2}>
            Filters
          </Typography>

          {/* QUICK DATE */}
          <Box display="flex" gap={2} rowGap={1.5} flexWrap="wrap" mb={2}>
            {["today", "yesterday", "last7", "thisMonth", "custom", "reset"].map(
              (k) => (
                <Button
                  key={k}
                  size="small"
                  variant={k === "custom" ? "contained" : "outlined"}
                  onClick={() =>
                    k === "custom" ? setCustomOpen(true) : handleQuickDate(k)
                  }
                >
                  {k === "last7"
                    ? "LAST 7 DAYS"
                    : k === "thisMonth"
                    ? "THIS MONTH"
                    : k.toUpperCase()}
                </Button>
              )
            )}
          </Box>

          {/* CUSTOM RANGE */}
          {customOpen && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
                <DatePicker
                  label="Start Date"
                  value={dateRange[0]}
                  onChange={(v) => setDateRange([v, dateRange[1]])}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange[1]}
                  onChange={(v) => setDateRange([dateRange[0], v])}
                />
                <Button variant="contained" onClick={applyCustomRange}>
                  Apply
                </Button>
              </Box>
            </LocalizationProvider>
          )}

          {/* AGE / GENDER */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 280 }}>
                <InputLabel>Age</InputLabel>
                <Select name="age" value={filters.age} onChange={handleFilterChange}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="<18">&lt;18</MenuItem>
                  <MenuItem value="18-40">18-40</MenuItem>
                  <MenuItem value=">40">&gt;40</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm="auto">
              <FormControl sx={{ minWidth: 280 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* CHARTS */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">Total Clicks</Typography>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <BarChart width={500} height={300} data={barData}>
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      onClick={(d) => setSelectedFeature(d.rawKey)}
                    />
                  </BarChart>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography variant="h6">
                Daily Clicks {selectedFeature && `: ${selectedFeature}`}
              </Typography>
              {loading ? (
                <Skeleton height={300} />
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <LineChart width={500} height={300} data={lineData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      dataKey="clicks"
                      stroke="#22d3ee"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
