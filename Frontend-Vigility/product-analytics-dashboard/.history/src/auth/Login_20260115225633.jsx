import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Container, Card, CardContent, Typography,
  TextField, Button, Box, Alert, Snackbar,
  IconButton, InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Login({ setToken }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- LOGIN ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        username,
        password
      });

      if (res.status === 200 && res.data.token) {

        // ✅ GLOBAL LOGIN TRACK (NO FILTERS)
        api.post("/api/track", { featureName: "login" }).catch(() => {});

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        setToken(res.data.token);

        setSuccessMsg("Login successful! Redirecting...");
        setOpenSnackbar(true);

        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}>
      <Card sx={{ width: "100%", borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center">🔐 Login</Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

          <Snackbar
            open={openSnackbar}
            message={successMsg}
            autoHideDuration={1500}
            onClose={() => setOpenSnackbar(false)}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
