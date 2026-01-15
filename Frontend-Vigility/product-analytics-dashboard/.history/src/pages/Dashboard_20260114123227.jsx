import { useEffect, useState } from "react";
import { Typography, Button, Card, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import api from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch data from backend
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/dashboard-data", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data); // expects array of objects [{ name: 'Jan', value: 400 }, ...]
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Optional: Real-time updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ textAlign: "center", margin: "50px" }}>
      <Typography variant="h4" mb={4}>
        Dashboard Analytics
      </Typography>

      <Button variant="contained" onClick={handleLogout} sx={{ mb: 4 }}>
        Logout
      </Button>

      {loading ? (
        <CircularProgress />
      ) : (
        <Card sx={{ p: 4, maxWidth: 800, margin: "0 auto" }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
