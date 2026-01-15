import api from "./axios";

export const trackEvent = (featureName) => {
  return api.post(`/track?featureName=${featureName}`);
};
