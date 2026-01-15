import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup({ setToken }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("Male");

  const handleSignup = async () => {
    try {
      await api.post("/auth/register", { username, password, age, gender });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input placeholder="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
      <select value={gender} onChange={(e) => setGender(e.target.value)}>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}
