import { Card, TextField, Button, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
    const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <Card sx={{ width: 400, m: "100px auto", p: 4 }}>
      <Typography variant="h5" mb={2}>Login</Typography>

      <TextField
        label="Username or Email"
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

      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleLogin}>
        Login
      </Button>

      <Typography mt={2} align="center">
        Don’t have an account?{" "}
        <Link href="/signup">Sign up</Link>
      </Typography>
    </Card>
  );
}
