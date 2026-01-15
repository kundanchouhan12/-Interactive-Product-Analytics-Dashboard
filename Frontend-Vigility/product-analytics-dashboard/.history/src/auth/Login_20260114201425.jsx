import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api"; // axios instance

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { username, password });
      const { token, userId } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        New user? <Link to="/signup">Signup here</Link>
      </p>
    </div>
  );
}
