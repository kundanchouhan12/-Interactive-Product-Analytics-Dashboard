import { Card, TextField, Button, Typography, Link } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [login, setLogin] = useState(""); // username or email
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!login || !password) {
      alert("Please enter username/email and password");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        login,     // <-- backend expects "login"
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
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
        value={login}
        onChange={(e) => setLogin(e.target.value)}
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
      >
        Login
      </Button>

      <Typography mt={2} align="center">
        Don’t have an account?{" "}
        <Link href="/signup">Sign up</Link>
      </Typography>
    </Card>
  );
}
