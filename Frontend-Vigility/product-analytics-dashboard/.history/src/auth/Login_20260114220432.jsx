import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box
} from "@mui/material";

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      setToken(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            🔐 Login
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <TextField
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogin}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
