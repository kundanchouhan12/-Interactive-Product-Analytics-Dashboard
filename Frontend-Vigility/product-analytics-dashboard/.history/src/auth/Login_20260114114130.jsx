import { Card, TextField, Button, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


const handleLogin = async () => {
  const res = await api.post("/auth/login", {
    username,
    password,
  });

  localStorage.setItem("token", res.data.token);
  navigate("/dashboard");
};


  return (
    <Card sx={{ width: 400, m: "100px auto", p: 4 }}>
      <Typography variant="h5" mb={2}>Login</Typography>

      <TextField
        fullWidth
        label="Username"
        margin="normal"
        onChange={(e) => setUsername(e.target.value)}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2 }}
        onClick={handleLogin}
      >
        Login
      </Button>
    </Card>
  );
}
