import {
  Card, TextField, Button, Typography, MenuItem
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Signup() {

  const [form, setForm] = useState({
    username: "",
    password: "",
    age: "",
    gender: ""
  });

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSignup = async () => {
    await api.post("/auth/register", form);
    navigate("/");
  };

  return (
    <Card sx={{ width: 400, m: "80px auto", p: 4 }}>
      <Typography variant="h5" mb={2}>Sign Up</Typography>

      <TextField
        label="Username or Email"
        fullWidth
        margin="normal"
        onChange={(e) => handleChange("username", e.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        onChange={(e) => handleChange("password", e.target.value)}
      />

      <TextField
        label="Age"
        type="number"
        fullWidth
        margin="normal"
        onChange={(e) => handleChange("age", e.target.value)}
      />

      <TextField
        select
        label="Gender"
        fullWidth
        margin="normal"
        onChange={(e) => handleChange("gender", e.target.value)}
      >
        <MenuItem value="Male">Male</MenuItem>
        <MenuItem value="Female">Female</MenuItem>
        <MenuItem value="Other">Other</MenuItem>
      </TextField>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleSignup}
      >
        Sign Up
      </Button>
    </Card>
  );
}
