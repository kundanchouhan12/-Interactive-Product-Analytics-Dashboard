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
  Snackbar
} from "@mui/material";

export default function Login({ setToken }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  // ---------------- LOGIN HANDLER ----------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setOpenSnackbar(false);
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });

      if (res.status === 200 && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.userId);
        setToken(res.data.token);

        setSuccessMsg("Login successful! Redirecting...");
        setOpenSnackbar(true);

        // Redirect after 1.5s
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        (err.response && err.response.data?.message) || "Login failed. Try again."
      );
    } finally {
      setLoading(false);
    }
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
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
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

            <Button
              variant="text"
              color="secondary"
              onClick={handleRegisterRedirect}
              sx={{ fontWeight: "bold" }}
            >
              Don’t have an account? Create one
            </Button>
          </Box>

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
            onClose={handleSnackbarClose}
            message={successMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
