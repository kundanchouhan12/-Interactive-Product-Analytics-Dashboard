import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Dashboard from "./pages/Dashboard";

function App() {
  // State to track token
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Watch localStorage changes (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem("token"));
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Protected Route Component
  const PrivateRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  // Public Route Component (login/signup) - redirect if already logged in
  const PublicRoute = ({ children }) => {
    return token ? <Navigate to="/dashboard" /> : children;
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />

        {/* Auth routes */}
        <Route path="/login" element={<PublicRoute><Login setToken={setToken} /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup setToken={setToken} /></PublicRoute>} />

        {/* Protected Dashboard */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
