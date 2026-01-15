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
  Snackbar
} from "@mui/material";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    age: "",
    gender: "Male",
  });

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post("/auth/register", form);

      // ✅ Successful signup → show message and redirect
      if (res.status === 201 || res.data.success) {
        setSuccessMsg("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000); // 2 seconds delay for user to see the message
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
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

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
              type="password"
              variant="outlined"
              value={form.password}
              onChange={handleChange}
              required
              fullWidth
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
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              Signup
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

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {/* Success Snackbar */}
          <Snackbar
            open={!!successMsg}
            autoHideDuration={2000}
            message={successMsg}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
