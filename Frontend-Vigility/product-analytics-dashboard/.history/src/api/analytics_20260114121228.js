import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // backend base URL
  withCredentials: true, // agar cookies auth use ho rahi ho
});

// ========================
// FETCH BAR CHART DATA
// ========================
export const fetchAnalytics = ({ startDate, endDate, age, gender }) => {
  const params = {
    start: startDate,
    end: endDate,
    age,
    gender: gender || null,
  };
  return api.get("/analytics", { params });
};

// ========================
// FETCH LINE CHART TREND
// ========================
export const fetchTrend = (feature) => {
  return api.get("/analytics/trend", { params: { feature } });
};
