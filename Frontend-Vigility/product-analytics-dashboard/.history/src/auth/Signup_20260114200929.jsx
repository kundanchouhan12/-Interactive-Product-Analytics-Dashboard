import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      const res = await api.post("/auth/register", { username, password, age, gender });
      // Backend may return success message, now login automatically:
      const loginRes = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", loginRes.data.token);
      localStorage.setItem("userId", loginRes.data.userId);
      setToken(loginRes.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <input type="number" placeholder="Age" value={age} onChange={e => setAge(parseInt(e.target.value))} />
      <select value={gender} onChange={e => setGender(e.target.value)}>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <button onClick={handleSignup}>Signup</button>
      {error && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
}
