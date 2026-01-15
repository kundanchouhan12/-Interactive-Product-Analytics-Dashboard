import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Watch localStorage changes (login/logout)
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        {/* Login & Signup */}
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
