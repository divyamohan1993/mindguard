// client/src/components/Signup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Signup({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    try {
      await api.signup(username, password);
      // Auto-login after signup
      const res = await api.login(username, password);
      const { token, aesKey } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("aesKey", aesKey);
      api.setToken(token);
      onLogin(username);
      navigate("/journal");
    } catch (err) {
      console.error("Signup error:", err);
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Signup failed.");
      }
    }
  }

  return (
    <div className="col-md-6 offset-md-3">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            id="username"
            type="text"
            className="form-control"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.trim())}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="form-control"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="form-text">At least 6 characters.</div>
        </div>
        <button type="submit" className="btn btn-primary">
          Sign Up
        </button>
      </form>
    </div>
  );
}
