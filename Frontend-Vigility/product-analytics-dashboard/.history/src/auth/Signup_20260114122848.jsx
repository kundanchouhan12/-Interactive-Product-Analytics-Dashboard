import { Card, TextField, Button, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post("/auth/signup", { username, password });
      alert("Account created! Please login.");
      navigate("/login");
    } catch {
      alert("Error creating account.");
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
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSignup}>
        Sign Up
      </Button>

      <Typography mt={2} align="center">
        Already have an account?{" "}
        <Link href="/login">Login</Link>
      </Typography>
    </Card>
  );
}
