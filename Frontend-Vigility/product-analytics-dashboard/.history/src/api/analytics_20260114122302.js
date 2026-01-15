import api from "./axios"; // Axios instance with JWT and baseURL

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

// ========================
// TRACK USER EVENT
// ========================
export const trackEvent = (featureName) => {
  return api.post(`/track?featureName=${featureName}`);
};
