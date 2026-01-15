import api from "./axios";

export const fetchAnalytics = (filters) => {
  return api.get("/analytics", {
    params: {
      start: filters.startDate,
      end: filters.endDate,
      age: filters.age,
      gender: filters.gender,
    },
  });
};
