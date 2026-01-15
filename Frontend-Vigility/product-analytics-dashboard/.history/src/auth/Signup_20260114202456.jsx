import { useState } from "react";
import api from "../api"; // axios instance
import { useNavigate } from "react-router-dom";

export default function Signup({ setToken }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Make sure age is number
    const ageNumber = parseInt(age);
    if (!username || !password || !ageNumber || !gender) {
      setError("Please fill all fields correctly");
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        username,
        password,
        age: ageNumber,
        gender
      });

      // Save token & userId to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);

      // Update App state
      setToken(res.data.token);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("signup failed", err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Signup failed");
      }
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Signup</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "300px" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit">Signup</button>
      </form>
      <p>Already have an account? <span style={{ color: "blue", cursor: "pointer" }} onClick={() => navigate("/login")}>Login</span></p>
    </div>
  );
}
