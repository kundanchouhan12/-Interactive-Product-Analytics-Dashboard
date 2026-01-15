import { Card, TextField, Button, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const token = res.data.token;
      if (!token) throw new Error("Token missing from response");

      // Save JWT token to localStorage
      localStorage.setItem("token", token);

      // Navigate to dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Invalid credentials or server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: 400, m: "100px auto", p: 4 }}>
      <Typography variant="h5" mb={2} align="center">
        Login
      </Typography>

      <TextField
        label="Username or Email"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <Typography mt={2} align="center">
        Don’t have an account?{" "}
        <Link href="/signup" underline="hover">
          Sign up
        </Link>
      </Typography>
    </Card>
  );
}
