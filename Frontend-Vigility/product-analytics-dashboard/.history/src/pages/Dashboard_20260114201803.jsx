import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");

    if (!token || !storedUserId) {
      navigate("/login", { replace: true });
    } else {
      setUserId(storedUserId);
    }
  }, []);

  // Example: track click only if user is logged in
  const trackClick = async (featureName) => {
    if (!userId) {
      console.log("No userId found; skipping click tracking");
      return;
    }

    try {
      await api.post("/features/track", { userId, featureName });
    } catch (err) {
      console.error("Failed to track click", err);
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={() => trackClick("example_feature")}>Click Me</button>
    </div>
  );
}
