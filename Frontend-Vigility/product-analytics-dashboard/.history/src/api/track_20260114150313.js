import API from "./axios";

export const trackEvent = async (featureName) => {
  try {
    await API.post(`/track?featureName=${featureName}`);
  } catch (err) {
    console.error("Tracking failed:", err);
  }
};
