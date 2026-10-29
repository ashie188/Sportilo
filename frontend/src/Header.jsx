import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Header.css";

export default function Header({ user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const userName = typeof user?.name === "string" ? user.name.trim() : "";

  const firstName = userName ? userName.split(/\s+/)[0] : "Account";

  const avatarLetter =
    firstName === "Account" ? "A" : firstName.charAt(0).toUpperCase();

  const navItems = [
    { to: "/", label: "Home", end: true },
    { to: "/join-group", label: "Matches" },
    { to: "/player-profiles", label: "Players" },
    { to: "/create-group", label: "Create Match" },
  ];

  return (
    <header className="header">
      <div className="header-inner">
        {/* Mobile menu button */}
        <button
          className={`mobile-menu-btn${mobileMenuOpen ? " is-open" : ""}`}
          type="button"
          aria-label={
            mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Brand */}
        <div className="logo">
          <Link to="/" aria-label="Sportilo home" onClick={closeMobileMenu}>
            <img
              src="/images/icon_best-optimized.svg"
              alt=""
              className="header-logo"
              width="30"
              height="30"
            />
            <span className="logo-text">Sportilo</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Authentication / account */}
        <div className="auth-buttons">
          {user ? (
            <Link
              to="/account"
              className="account-chip"
              aria-label={`Open account for ${userName || "user"}`}
              onClick={closeMobileMenu}
            >
              <span className="account-avatar" aria-hidden="true">
                {avatarLetter}
              </span>
              <span className="account-name">{firstName}</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="login-btn" onClick={closeMobileMenu}>
                Login
              </Link>

              <Link
                to="/register"
                className="register-btn"
                onClick={closeMobileMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile dropdown */}
        <nav
          id="mobile-navigation"
          className={`mobile-nav${mobileMenuOpen ? " mobile-nav-open" : ""}`}
          aria-label="Mobile navigation"
          aria-hidden={!mobileMenuOpen}
          inert={!mobileMenuOpen}
        >
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `mobile-nav-link${isActive ? " active" : ""}`
              }
              onClick={closeMobileMenu}
            >
              {label}
            </NavLink>
          ))}

          {user && (
            <NavLink
              to="/account"
              className={({ isActive }) =>
                `mobile-nav-link${isActive ? " active" : ""}`
              }
              onClick={closeMobileMenu}
            >
              My Account
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
