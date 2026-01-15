import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Signup({ setToken }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    age: "",
    gender: "Male",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(""); // clear previous error

    try {
      const res = await api.post("/auth/register", form);

      // response se token aur userId le lo
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        setToken(res.data.token);

        // redirect dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup failed", err);

      // Backend se message extract karo
      let message = "Signup failed. Try again.";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          message = err.response.data;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        } else {
          message = JSON.stringify(err.response.data);
        }
      }

      setError(message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Signup</h2>
      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          required
        />
        <select name="gender" value={form.gender} onChange={handleChange}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit">Signup</button>
      </form>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
    </div>
  );
}
