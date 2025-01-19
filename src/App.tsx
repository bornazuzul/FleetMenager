import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedPage from "./pages/ProtectedPage";
import AdminPage from "./pages/AdminPage";
import ReservationsPage from "./pages/ReservationsPage";
import "./App.css";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const accessProtectedRoute = async () => {
    try {
      const response = await fetch("http://localhost:3000/zasticena-ruta", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.text();
        // alert(`Odgovor sa servera: ${data}`);
      } else {
        alert("Isteklo vrijeme sesije");
        logout();
      }
    } catch (error) {
      console.error("Greška:", error);
    }
  };

  useEffect(() => {
    if (token) {
      accessProtectedRoute();
    }
  }, [token]);

  return (
    <Router>
      <div className="content">
        <h1>Fleet manager</h1>
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <Navigate to="/protected" />
              ) : (
                <LoginPage setToken={setToken} />
              )
            }
          />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/protected"
            element={
              token ? (
                <ProtectedPage token={token} logout={logout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/reservations"
            element={<ReservationsPage token={token} logout={logout} />}
          />
          <Route
            path="/admin"
            element={
              token ? (
                <AdminPage token={token} logout={logout} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
