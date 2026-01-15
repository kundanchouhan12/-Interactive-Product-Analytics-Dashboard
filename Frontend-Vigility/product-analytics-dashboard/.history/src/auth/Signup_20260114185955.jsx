import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState(20);
  const [gender, setGender] = useState("Male");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post("/auth/register", { username, password, age, gender });
      // Auto-login after signup
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input type="number" placeholder="Age" value={age} onChange={e=>setAge(Number(e.target.value))} />
      <select value={gender} onChange={e=>setGender(e.target.value)}>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <button onClick={handleSignup}>Signup</button>
    </div>
  );
}
