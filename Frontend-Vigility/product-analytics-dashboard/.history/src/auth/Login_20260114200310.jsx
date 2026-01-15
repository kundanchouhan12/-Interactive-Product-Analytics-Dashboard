import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // axios instance

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      // Suppose backend returns { userId, username, token }
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("token", res.data.token); // optional, for auth
      navigate("/dashboard"); // redirect to dashboard
    } catch (err) {
      console.error("Login failed", err);
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
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
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
