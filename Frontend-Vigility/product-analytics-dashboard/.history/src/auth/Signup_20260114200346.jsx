import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await api.post("/auth/register", { username, password });
      // Signup returns userId after creation
      localStorage.setItem("userId", res.data.userId);
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup failed", err);
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSignup}>Signup</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
