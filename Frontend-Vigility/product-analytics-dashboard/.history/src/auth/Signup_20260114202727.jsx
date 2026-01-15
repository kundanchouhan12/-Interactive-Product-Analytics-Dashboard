import { useState } from "react";
import api from "../api"; // axios instance
import { useNavigate } from "react-router-dom";

export default function Signup({ setToken }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");
    if (!email || !password || !age) {
      setError("Please fill all required fields");
      return;
    }

    try {
      // Send email as username to backend
      const res = await api.post("/auth/register", {
        username: email, // backend expects username
        password,
        age: parseInt(age),
        gender,
      });

      console.log("Signup success", res.data);
      // Save token & userId
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setToken(res.data.token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup failed", err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError("Signup failed. Try again.");
      }
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Signup</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <select
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

      <button
        onClick={handleSignup}
        style={{ width: "100%", padding: "10px", background: "blue", color: "#fff", border: "none", borderRadius: "4px" }}
      >
        Signup
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
