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
  Box,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Login({ setToken }) {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
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
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      if (res.status === 200 && res.data.token) {
        // 🔥 TRACK LOGIN (non-blocking)
        api.post("/api/track", { featureName: "login" }).catch(() => {});

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        setToken(res.data.token);

        setSuccessMsg("Login successful! Redirecting...");
        setOpenSnackbar(true);

        setTimeout(() => {
          navigate("/dashboard");
        }, 1200);
      } else {
        setError(res.data?.message || "Login failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid username or password"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- HELPERS ----------------
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRegisterRedirect = () => {
    navigate("/signup");
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // ---------------- RENDER ----------------
  return (
    <Container
      maxWidth="sm"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card sx={{ width: "100%", boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            🔐 Login
          </Typography>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
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
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Button
              variant="text"
              color="secondary"
              onClick={handleRegisterRedirect}
              sx={{ fontWeight: "bold" }}
            >
              Don’t have an account? Create one
            </Button>
          </Box>

          {/* ERROR */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* SUCCESS */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={1200}
            onClose={handleSnackbarClose}
            message={successMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
