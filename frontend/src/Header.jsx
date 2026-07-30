import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css"

export default function Header({ user, setUser }) {
  const navigate = useNavigate();

  // 🔥 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <Link to="/">
            <img
              src="/images/icon_best-optimized.svg"
              alt="Sportilo Logo"
              className="header-logo"
            />
            <span className="logo-text">Sportilo</span>
          </Link>
        </div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/create-group">Create Match</Link>
          <Link to="/join-group">Join Match</Link>
        </nav>

        <div className="auth-buttons">
          {user ? (
            <div className="user-menu">
              <Link to="/account" className="account-chip">
                <div className="account-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>

                <span className="account-name">{user.name.split(" ")[0]}</span>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Login
              </Link>
              <Link to="/register" className="register-btn">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
