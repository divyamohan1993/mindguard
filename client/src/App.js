// client/src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Journal from "./components/Journal";
import History from "./components/History";
import Analysis from "./components/Analysis";
import api from "./services/api";

function App() {
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in (via localStorage token)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.setToken(token);
      api.getProfile()
        .then((res) => setUsername(res.data.username))
        .catch(() => {
          localStorage.removeItem("token");
          api.setToken(null);
        });
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("aesKey"); // forget the AES key
    api.setToken(null);
    setUsername(null);
    navigate("/login");
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            MindGuard MVP
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavAltMarkup"
            aria-controls="navbarNavAltMarkup"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div className="navbar-nav">
              {username ? (
                <>
                  <Link className="nav-link" to="/journal">
                    Journal
                  </Link>
                  <Link className="nav-link" to="/history">
                    History
                  </Link>
                  <Link className="nav-link" to="/analysis">
                    Analysis
                  </Link>
                  <button className="btn btn-outline-danger ms-3" onClick={handleLogout}>
                    Logout ({username})
                  </button>
                </>
              ) : (
                <>
                  <Link className="nav-link" to="/signup">
                    Signup
                  </Link>
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<h2>Welcome to MindGuard MVP</h2>} />
          <Route path="/signup" element={<Signup onLogin={(u) => setUsername(u)} />} />
          <Route path="/login" element={<Login onLogin={(u) => setUsername(u)} />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/history" element={<History />} />
          <Route path="/analysis" element={<Analysis />} />
        </Routes>
      </div>
    </div>
  );
}

// Wrap App in Router
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
