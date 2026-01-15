import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Signup({ setToken }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { username, password, age: Number(age), gender });
      // auto login after signup
      const res = await api.post("/auth/login", { username, password });
      const { token, userId } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", userId);
      setToken(token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Signup failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        /><br/>
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select><br/>
        <button type="submit">Signup</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}
