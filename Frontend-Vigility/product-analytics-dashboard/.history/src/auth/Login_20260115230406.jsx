import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment,
  Link
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

  // ---------------- LOGIN HANDLER ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔹 Hit auth API
      const res = await api.post("/auth/login", {
        username,
        password
      });

      if (res.status === 200 && res.data.token) {
        // 🔹 Track login (non-blocking)
        api.post("/api/track", { featureName: "login" }).catch(() => {});

        // 🔹 Save token & userId
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        setToken(res.data.token);

        setSuccessMsg("Login successful! Redirecting...");
        setOpenSnackbar(true);

        // 🔹 Redirect after short delay
        setTimeout(() => navigate("/dashboard"), 1200);
      }
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Card sx={{ width: "100%", borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            🔐 Login
          </Typography>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>

          {/* Signup Link */}
          <Typography align="center" sx={{ mt: 2 }}>
            Don’t have an account?{" "}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Link>
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Snackbar */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={1500}
            onClose={() => setOpenSnackbar(false)}
            message={successMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
