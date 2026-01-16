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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    age: "",
    gender: "Male",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ---------------- FORM HANDLERS ----------------
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setOpenSnackbar(false);
    setLoading(true);

    try {
      const res = await api.post("/auth/register", form);

      if (res.status === 200) {
        setSuccessMsg("Account created successfully!");
        setOpenSnackbar(true);

        // Redirect to login after 1.5s
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else if (res.data.message) {
        setError(res.data.message); // User already exists
      }
    } catch (err) {
      console.error("Signup failed", err);
      let message = "Signup failed. Try again.";
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          message = err.response.data;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        } else {
          message = JSON.stringify(err.response.data);
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
            📝 Signup
          </Typography>

          <Box
            component="form"
            onSubmit={handleSignup}
            sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}
          >
            <TextField
              label="Username"
              name="username"
              variant="outlined"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Age"
              name="age"
              type="number"
              variant="outlined"
              value={form.age}
              onChange={handleChange}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                label="Gender"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {loading ? "Signing up..." : "Signup"}
            </Button>

            <Button
              variant="text"
              color="secondary"
              onClick={handleLoginRedirect}
              sx={{ fontWeight: "bold" }}
            >
              Already have an account? Login
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
