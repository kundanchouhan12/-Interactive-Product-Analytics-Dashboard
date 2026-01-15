import { Card, TextField, Button, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    // Basic validation
    if (!username || !email || !password) {
      alert("Username, email, and password are required.");
      return;
    }

    try {
      await api.post("/auth/register", { username, email, password, age, gender });
      alert("Account created! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error creating account. Please check your inputs.");
    }
  };

  return (
    <Card sx={{ width: 400, m: "100px auto", p: 4 }}>
      <Typography variant="h5" mb={2}>Sign Up</Typography>

      <TextField
        label="Username"
        fullWidth
        margin="normal"
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
      />

      <TextField
        label="Age"
        type="number"
        fullWidth
        margin="normal"
        onChange={(e) => setAge(e.target.value)}
      />

      <TextField
        label="Gender"
        fullWidth
        margin="normal"
        onChange={(e) => setGender(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSignup}
      >
        Sign Up
      </Button>

      <Typography mt={2} align="center">
        Already have an account?{" "}
        <Link href="/login">Login</Link>
      </Typography>
    </Card>
  );
}
