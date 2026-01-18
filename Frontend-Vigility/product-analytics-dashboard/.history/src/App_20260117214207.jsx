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
  <Route path="/" element={<Navigate to="/login" />} />

  {/* Public routes */}
  <Route
    path="/login"
    element={
      <PublicRoute>
        <Login setToken={setToken} />
      </PublicRoute>
    }
  />

  <Route
    path="/signup"
    element={
      <PublicRoute>
        <Signup setToken={setToken} />
      </PublicRoute>
    }
  />

  {/* Private route */}
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
    </BrowserRouter>
  );
}

export default App;
