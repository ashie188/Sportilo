import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api/axios";
import { GoogleLogin } from "@react-oauth/google";
import "./Auth.css";

export default function Auth({ setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(""); // 🔥 error state
  const [loading, setLoading] = useState(false); // 🔥 loading state

  const fullNameRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+)+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const handleToggle = () => {
    setError("");
    navigate(isLogin ? "/register" : "/login");
  };

  // input handler
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // submit handler
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await api.post(
          "/auth/login", // ✅ FIXED
          {
            email: formData.email,
            password: formData.password,
          },
        );

        // ✅ STORE TOKEN
        localStorage.setItem("token", response.data.token);

        // ✅ ADD THIS (IMPORTANT)
        localStorage.setItem("user", JSON.stringify(response.data.user));

        // update user state in App
        setUser(response.data.user);

        // ✅ REDIRECT
        navigate("/account");
      } else {
        if (!fullNameRegex.test(formData.name.trim())) {
          setError("Please enter your first and last name.");
          setLoading(false);
          return;
        }

        if (!emailRegex.test(formData.email.trim())) {
          setError("Please enter a valid email address.");
          setLoading(false);
          return;
        }
        if (!passwordRegex.test(formData.password)) {
          setError(
            "Password must contain at least 8 characters, one uppercase letter and one number.",
          );
          setLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }

        response = await api.post(
          "/auth/register", // ✅ FIXED
          {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          },
        );

        // auto switch to login
        navigate("/login");
      }

      // reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message); // backend message
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  //google login handler
  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/google", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);

      navigate("/account");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* LEFT / AUTH HERO */}
      <div className="auth-left">
        <div className="auth-left-overlay" />

        <div className="auth-left-content">
          <div className="auth-logo">
            <img src="/images/icon_best-optimized.svg" alt="Sportilo" />
            <h1>Sportilo</h1>
          </div>

          <div className="auth-hero-copy">
            <h2>
              Find players.
              <br />
              Join matches.
              <br />
              <span>Play together.</span>
            </h2>

            <p>
              A community for real players,
              <br />
              on and off the field.
            </p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="8" r="3" />
                  <circle cx="17" cy="9" r="2.5" />
                  <path d="M3.5 19c.4-3.2 2.2-5 5.5-5s5.1 1.8 5.5 5" />
                  <path d="M14.5 15.2c.8-.8 1.8-1.2 3.2-1.2 2.3 0 3.7 1.3 4 4" />
                </svg>
              </div>

              <div className="auth-feature-text">
                <strong>Meet</strong>
                <span>New Players</span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="5" width="16" height="15" rx="2" />
                  <path d="M8 3v4M16 3v4M4 10h16" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
                </svg>
              </div>

              <div className="auth-feature-text">
                <strong>Join or Create</strong>
                <span>Matches</span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M7 8.5h10a3.5 3.5 0 0 1 3.3 4.7l-1.1 3.1a2.5 2.5 0 0 1-4.5.5L14 15H10l-.7 1.8a2.5 2.5 0 0 1-4.5-.5l-1.1-3.1A3.5 3.5 0 0 1 7 8.5Z" />
                  <path d="M8 11v3M6.5 12.5h3M16.5 12h.01M18 13.5h.01" />
                </svg>
              </div>

              <div className="auth-feature-text">
                <strong>Play Your</strong>
                <span>Favorite Games</span>
              </div>
            </div>

            <div className="auth-feature">
              <div className="auth-feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="m12 3 1.9 4.3 4.6.4-3.5 3 1.1 4.5-4.1-2.4-4.1 2.4 1.1-4.5-3.5-3 4.6-.4L12 3Z" />
                  <path d="M7 18h10M9 21h6" />
                </svg>
              </div>

              <div className="auth-feature-text">
                <strong>Be Part of a</strong>
                <span>Growing Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <div className="auth-box">
          <h2>{isLogin ? "Login" : "Create Account"}</h2>

          {/* 🔥 ERROR MESSAGE */}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            )}
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              type="password"
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            )}

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : isLogin ? "Login" : "Register"}
            </button>
          </form>

          <p className="toggle-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={handleToggle}>
              {isLogin ? " Register" : " Login"}
            </span>
          </p>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          {/* GOOGLE OAUTH LOGIN */}
          {!loading && (
            <div className="google-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() =>
                  setError("Google login failed. Please try again.")
                }
                text="continue_with"
              />
            </div>
          )}
          <p className="auth-terms">
            By continuing, you agree to our{" "}
            <span onClick={() => navigate("/legal")}>Terms of Service</span> and{" "}
            <span onClick={() => navigate("/legal")}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
