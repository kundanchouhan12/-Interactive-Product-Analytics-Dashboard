// import React, { useEffect, useState } from "react";
// import api from "../api";
// import Cookies from "js-cookie";
// import { useNavigate } from "react-router-dom";

// import {
//   Container, Grid, Card, CardContent, Typography,
//   FormControl, InputLabel, Select, MenuItem,
//   Box, Button, TextField
// } from "@mui/material";

// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip,
//   LineChart, Line, Legend
// } from "recharts";

// import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs from "dayjs";

// export default function Dashboard() {
//   const navigate = useNavigate();

//   const dashboardFeatures = ["date_picker", "filter_age", "chart_bar", "filter_gender"];

//   const featureMap = {
//     "date_picker": ["date_picker"],
//     "filter_age": ["filter_age_<18", "filter_age_18-40", "filter_age_>40", "filter_age_all"],
//     "chart_bar": ["chart_bar"],
//     "filter_gender": ["filter_gender_Male", "filter_gender_Female", "filter_gender_Other", "filter_gender_all"]
//   };

//   // ---------------- STATE ----------------
//   const [filters, setFilters] = useState({
//     age: Cookies.get("age") || "",
//     gender: Cookies.get("gender") || ""
//   });

//   const [dateRange, setDateRange] = useState([
//     dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
//     dayjs(Cookies.get("endDate") || dayjs())
//   ]);

//   const [tempRange, setTempRange] = useState([...dateRange]); 
//   const [barData, setBarData] = useState([]);
//   const [lineData, setLineData] = useState([]);
//   const [selectedFeature, setSelectedFeature] = useState("");
//   const [customRangeOpen, setCustomRangeOpen] = useState(false);

//   // ---------------- TRACK CLICKS ----------------
//   const trackClick = (featureName) => {
//     api.post("/api/track", { featureName }).catch(() => {});
//   };

//   // ---------------- FETCH ANALYTICS ----------------
//   const fetchAnalytics = async () => {
//     try {
//       const params = {
//         startDate: dateRange[0].format("YYYY-MM-DD"),
//         endDate: dateRange[1].format("YYYY-MM-DD"),
//         age: filters.age || null,
//         gender: filters.gender || null
//       };

//       const res = await api.get("/api/analytics", { params });

//       // ---------------- BAR CHART ----------------
//       const bars = dashboardFeatures.map(f => {
//         let count = 0;
//         Object.keys(res.data.barData || {}).forEach(k => {
//           if (featureMap[f].includes(k)) count += res.data.barData[k];
//         });
//         return { feature: f, count };
//       });
//       setBarData(bars);

//       // ---------------- LINE CHART ----------------
//       let line = [];
//       if (selectedFeature) {
//         // LEFT chart click → right chart daily clicks
//         const keys = featureMap[selectedFeature] || [];
//         const datesSet = new Set();
//         keys.forEach(k => (res.data.lineData[k] || []).forEach(d => datesSet.add(d.date)));

//         line = [...datesSet].sort().map(date => {
//           let total = 0;
//           keys.forEach(k => {
//             const found = (res.data.lineData[k] || []).find(x => x.date === date);
//             if (found) total += found.count;
//           });
//           return { date, clicks: total };
//         });

//       } else {
//         // Default: combined 4 features
//         const datesSet = new Set();
//         dashboardFeatures.forEach(f => {
//           featureMap[f].forEach(k => (res.data.lineData[k] || []).forEach(d => datesSet.add(d.date)));
//         });

//         line = [...datesSet].sort().map(date => {
//           let total = 0;
//           dashboardFeatures.forEach(f => {
//             featureMap[f].forEach(k => {
//               const found = (res.data.lineData[k] || []).find(x => x.date === date);
//               if (found) total += found.count;
//             });
//           });
//           return { date, clicks: total };
//         });
//       }

//       setLineData(line);

//     } catch (err) {
//       console.error("Analytics error:", err);
//     }
//   };

//   useEffect(() => {
//     fetchAnalytics();
//   }, [filters.age, filters.gender, dateRange[0], dateRange[1], selectedFeature]);

//   // ---------------- FILTER HANDLERS ----------------
//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     trackClick(`filter_${name}_${value || "all"}`);
//     setFilters(prev => {
//       Cookies.set(name, value);
//       return { ...prev, [name]: value };
//     });
//   };

//   // ---------------- QUICK DATE ----------------
//   const handleQuickDate = (option) => {
//     let start, end = dayjs();
//     switch(option){
//       case "today": start = dayjs(); end = dayjs(); break;
//       case "yesterday": start = dayjs().subtract(1,"day"); end = dayjs().subtract(1,"day"); break;
//       case "last7": start = dayjs().subtract(6,"day"); break;
//       case "thisMonth": start = dayjs().startOf("month"); break;
//       case "reset":
//         start = dayjs().subtract(7,"day"); 
//         end = dayjs(); 
//         setFilters({ age:"", gender:""});
//         Cookies.remove("age"); Cookies.remove("gender");
//         break;
//       default: return;
//     }
//     setDateRange([start,end]);
//     setTempRange([start,end]);
//     Cookies.set("startDate", start.format("YYYY-MM-DD"));
//     Cookies.set("endDate", end.format("YYYY-MM-DD"));
//     trackClick("date_picker");
//   };

//   // ---------------- CUSTOM RANGE APPLY/CANCEL ----------------
//   const handleCustomRangeApply = () => {
//     setDateRange([...tempRange]);
//     Cookies.set("startDate", tempRange[0].format("YYYY-MM-DD"));
//     Cookies.set("endDate", tempRange[1].format("YYYY-MM-DD"));
//     trackClick("date_picker");
//     setCustomRangeOpen(false);
//   };

//   const handleCustomRangeCancel = () => {
//     setTempRange([...dateRange]);
//     setCustomRangeOpen(false);
//   };

//   // ---------------- BAR CLICK ----------------
//   const handleBarClick = (state) => {
//     if (!state?.activePayload?.length) return;
//     const feature = state.activePayload[0].payload.feature;
//     trackClick(`bar_${feature}`);
//     setSelectedFeature(feature); // ← triggers right chart
//   };

//   // ---------------- LOGOUT ----------------
//   const handleLogout = () => {
//     trackClick("logout");
//     localStorage.clear();
//     Cookies.remove("age");
//     Cookies.remove("gender");
//     Cookies.remove("startDate");
//     Cookies.remove("endDate");
//     navigate("/login", { replace: true });
//   };

//   // ---------------- RENDER ----------------
//   return (
//     <Container maxWidth="lg" sx={{ py:4 }}>
//       <Box sx={{ display:"flex", justifyContent:"space-between", mb:3 }}>
//         <Typography variant="h4">📊 Product Analytics Dashboard</Typography>
//         <Button color="error" variant="contained" onClick={handleLogout}>Logout</Button>
//       </Box>

//       {/* FILTERS */}
//       <Card sx={{ mb:4 }}>
//         <CardContent>
//           <Typography variant="h6">Filters</Typography>
//           <Box sx={{ display:"flex", gap:2, my:2 }}>
//             <Button onClick={()=>handleQuickDate("today")}>Today</Button>
//             <Button onClick={()=>handleQuickDate("yesterday")}>Yesterday</Button>
//             <Button onClick={()=>handleQuickDate("last7")}>Last 7 days</Button>
//             <Button onClick={()=>handleQuickDate("thisMonth")}>This Month</Button>
//             <Button onClick={()=>setCustomRangeOpen(!customRangeOpen)}>Custom Range</Button>
//             <Button onClick={()=>handleQuickDate("reset")}>Reset Filter</Button>
//           </Box>

//           {customRangeOpen && (
//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <Box sx={{ display:"flex", gap:2, my:2, alignItems:"center" }}>
//                 <DatePicker 
//                   label="Start Date" 
//                   value={tempRange[0]} 
//                   onChange={v => setTempRange([v, tempRange[1]])} 
//                   renderInput={p => <TextField {...p} fullWidth/>} 
//                 />
//                 <DatePicker 
//                   label="End Date" 
//                   value={tempRange[1]} 
//                   onChange={v => setTempRange([tempRange[0], v])} 
//                   renderInput={p => <TextField {...p} fullWidth/>} 
//                 />
//                 <Button variant="contained" onClick={handleCustomRangeApply}>Apply</Button>
//                 <Button variant="outlined" color="error" onClick={handleCustomRangeCancel}>Cancel</Button>
//               </Box>
//             </LocalizationProvider>
//           )}

//           <Box sx={{ display:"flex", gap:2 }}>
//             <FormControl sx={{ minWidth:120 }}>
//               <InputLabel>Age</InputLabel>
//               <Select name="age" value={filters.age} onChange={handleFilterChange}>
//                 <MenuItem value="">All</MenuItem>
//                 <MenuItem value="<18">&lt;18</MenuItem>
//                 <MenuItem value="18-40">18-40</MenuItem>
//                 <MenuItem value=">40">&gt;40</MenuItem>
//               </Select>
//             </FormControl>

//             <FormControl sx={{ minWidth:120 }}>
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

//       {/* CHARTS */}
//       <Grid container spacing={4}>
//         {/* LEFT BAR CHART */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">Feature Usage</Typography>
//               <BarChart width={500} height={300} data={barData} onClick={handleBarClick}>
//                 <XAxis dataKey="feature" />
//                 <YAxis />
//                 <Tooltip formatter={(value) => [value, "Clicks"]} />
//                 <Bar dataKey="count" fill="#6366f1" />
//               </BarChart>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* RIGHT LINE CHART */}
//         <Grid item xs={12} md={6}>
//           <Card>
//             <CardContent>
//               <Typography variant="h6">
//                 Clicks Daily {selectedFeature && `: ${selectedFeature}`}
//               </Typography>
//               <LineChart width={500} height={300} data={lineData}>
//                 <XAxis dataKey="date"/>
//                 <YAxis/>
//                 <Tooltip content={(props) => {
//                   if (!props.active || !props.payload) return null;
//                   const data = props.payload[0].payload;
//                   return (
//                     <div style={{ backgroundColor: "#fff", padding: "5px", border: "1px solid #ccc" }}>
//                       <strong>Date:</strong> {data.date} <br/>
//                       <strong>Clicks:</strong> {data.clicks}
//                     </div>
//                   );
//                 }} />
//                 <Legend />
//                 <Line dataKey="clicks" stroke="#6366f1" />
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
import { useNavigate } from "react-router-dom";

import {
  Container, Grid, Card, CardContent, Typography,
  FormControl, InputLabel, Select, MenuItem,
  Box, Button, TextField
} from "@mui/material";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, Legend
} from "recharts";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function Dashboard() {
  const navigate = useNavigate();

  const dashboardFeatures = ["date_picker", "filter_age", "chart_bar", "filter_gender"];

  const featureMap = {
    date_picker: ["date_picker"],
    filter_age: ["filter_age_<18", "filter_age_18-40", "filter_age_>40", "filter_age_all"],
    chart_bar: ["chart_bar"],
    filter_gender: ["filter_gender_Male", "filter_gender_Female", "filter_gender_Other", "filter_gender_all"]
  };

  const [filters, setFilters] = useState({
    age: Cookies.get("age") || "",
    gender: Cookies.get("gender") || ""
  });

  const [dateRange, setDateRange] = useState([
    dayjs(Cookies.get("startDate") || dayjs().subtract(7, "day")),
    dayjs(Cookies.get("endDate") || dayjs())
  ]);

  const [tempRange, setTempRange] = useState([...dateRange]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [customRangeOpen, setCustomRangeOpen] = useState(false);

  const trackClick = (featureName) => {
    api.post("/api/track", { featureName }).catch(() => {});
  };

  const fetchAnalytics = async () => {
    try {
      const params = {
        startDate: dateRange[0].format("YYYY-MM-DD"),
        endDate: dateRange[1].format("YYYY-MM-DD"),
        age: filters.age || null,
        gender: filters.gender || null
      };

      const res = await api.get("/api/analytics", { params });

      const bars = dashboardFeatures.map(f => {
        let count = 0;
        Object.keys(res.data.barData || {}).forEach(k => {
          if (featureMap[f].includes(k)) count += res.data.barData[k];
        });
        return { feature: f, count };
      });
      setBarData(bars);

      let line = [];
      if (selectedFeature) {
        const keys = featureMap[selectedFeature] || [];
        const datesSet = new Set();
        keys.forEach(k =>
          (res.data.lineData[k] || []).forEach(d => datesSet.add(d.date))
        );

        line = [...datesSet].sort().map(date => {
          let total = 0;
          keys.forEach(k => {
            const found = (res.data.lineData[k] || []).find(x => x.date === date);
            if (found) total += found.count;
          });
          return { date, clicks: total };
        });
      } else {
        const datesSet = new Set();
        dashboardFeatures.forEach(f =>
          featureMap[f].forEach(k =>
            (res.data.lineData[k] || []).forEach(d => datesSet.add(d.date))
          )
        );

        line = [...datesSet].sort().map(date => {
          let total = 0;
          dashboardFeatures.forEach(f =>
            featureMap[f].forEach(k => {
              const found = (res.data.lineData[k] || []).find(x => x.date === date);
              if (found) total += found.count;
            })
          );
          return { date, clicks: total };
        });
      }

      setLineData(line);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters.age, filters.gender, dateRange, selectedFeature]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    trackClick(`filter_${name}_${value || "all"}`);
    setFilters(prev => {
      Cookies.set(name, value);
      return { ...prev, [name]: value };
    });
  };

  const handleQuickDate = (option) => {
    let start, end = dayjs();
    switch (option) {
      case "today": start = dayjs(); break;
      case "yesterday": start = dayjs().subtract(1, "day"); end = start; break;
      case "last7": start = dayjs().subtract(6, "day"); break;
      case "thisMonth": start = dayjs().startOf("month"); break;
      case "reset":
        start = dayjs().subtract(7, "day");
        setFilters({ age: "", gender: "" });
        Cookies.remove("age"); Cookies.remove("gender");
        break;
      default: return;
    }
    setDateRange([start, end]);
    setTempRange([start, end]);
    Cookies.set("startDate", start.format("YYYY-MM-DD"));
    Cookies.set("endDate", end.format("YYYY-MM-DD"));
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          📊 Product Analytics Dashboard
        </Typography>

        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          fullWidth={true}
        >
          Logout
        </Button>
      </Box>

      {/* FILTERS */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Filters</Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, my: 2 }}>
            <Button onClick={() => handleQuickDate("today")}>Today</Button>
            <Button onClick={() => handleQuickDate("yesterday")}>Yesterday</Button>
            <Button onClick={() => handleQuickDate("last7")}>Last 7 Days</Button>
            <Button onClick={() => handleQuickDate("thisMonth")}>This Month</Button>
            <Button onClick={() => setCustomRangeOpen(!customRangeOpen)}>Custom</Button>
            <Button onClick={() => handleQuickDate("reset")}>Reset</Button>
          </Box>

          {customRangeOpen && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <DatePicker
                  label="Start Date"
                  value={tempRange[0]}
                  onChange={v => setTempRange([v, tempRange[1]])}
                  renderInput={p => <TextField {...p} fullWidth />}
                />
                <DatePicker
                  label="End Date"
                  value={tempRange[1]}
                  onChange={v => setTempRange([tempRange[0], v])}
                  renderInput={p => <TextField {...p} fullWidth />}
                />
                <Button fullWidth variant="contained">Apply</Button>
                <Button fullWidth variant="outlined" color="error">Cancel</Button>
              </Box>
            </LocalizationProvider>
          )}

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Age</InputLabel>
              <Select name="age" value={filters.age} onChange={handleFilterChange}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="<18">&lt;18</MenuItem>
                <MenuItem value="18-40">18-40</MenuItem>
                <MenuItem value=">40">&gt;40</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
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

      {/* CHARTS (UNCHANGED) */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Feature Usage</Typography>
              <BarChart width={500} height={300} data={barData}>
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Clicks Daily</Typography>
              <LineChart width={500} height={300} data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="clicks" stroke="#6366f1" />
              </LineChart>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
