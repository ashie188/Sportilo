import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AccountMatchCard from "./AccountMatchCard";
import ShareSportiloCard from "./components/ShareSportiloCard";
import "./Account.css";
import "./components/ShareSportiloCard.css"

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Account({ user, setUser }) {
  const navigate = useNavigate();

  const [activeMatches, setActiveMatches] = useState([]);
  const [historyMatches, setHistoryMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:3000/account/accountpagematches",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

        navigate("/login", {
          replace: true,
          state: {
            message: "Your session has expired. Please login again.",
          },
        });

        return;
      }

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();

      setActiveMatches(data.activeMatches || []);
      setHistoryMatches(data.historyMatches || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="acc-loader">
        <div className="acc-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  const displayedMatches =
    activeTab === "active" ? activeMatches : historyMatches;

  return (
    <div className="acc-page">
      {/* HERO */}
      <div className="acc-hero">
        <div className="acc-hero-content">
          <div className="acc-avatar">{getInitials(user?.name)}</div>

          <div className="acc-user-info">
            <h1>{user?.name}</h1>
            <p>{user?.email}</p>

            <div className="acc-user-meta">
              <span>⚡ Active Player</span>
              <span>📍 India</span>
            </div>
          </div>

          <button
            className="acc-logout-btn"
            onClick={() => setShowLogoutModal(true)}
          >
            Logout
          </button>

          {showLogoutModal && (
            <div className="acc-modal-overlay">
              <div className="acc-modal">
                <h3>Are you sure you want to logout?</h3>

                <div className="acc-modal-actions">
                  <button onClick={() => setShowLogoutModal(false)}>
                    Cancel
                  </button>

                  <button onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="acc-stats">
        <div className="acc-stat-card">
          <h2>{activeMatches.length + historyMatches.length}</h2>
          <p>Total Matches</p>
        </div>

        <div className="acc-stat-card">
          <h2>{activeMatches.length}</h2>
          <p>Active</p>
        </div>

        <div className="acc-stat-card">
          <h2>{historyMatches.length}</h2>
          <p>Completed</p>
        </div>
      </div>

      {/* SHARE SPORTMANIA */}

      <ShareSportiloCard
        icon="🚀"
        title="Love Sportilo?"
        description="Help more players discover local sports matches and gaming lobbies."
        shareText="⚽ I've been using Sportilo to find local sports matches and gaming lobbies. Check it out!"
      />

      {/* TABS */}
      <div className="acc-tabs">
        <button
          className={activeTab === "active" ? "tab-active" : ""}
          onClick={() => setActiveTab("active")}
        >
          Active Matches
        </button>

        <button
          className={activeTab === "history" ? "tab-active" : ""}
          onClick={() => setActiveTab("history")}
        >
          Match History
        </button>
      </div>

      {/* MATCHES */}
      <div className="acc-grid">
        {displayedMatches.length > 0 ? (
          displayedMatches.map((m) => (
            <AccountMatchCard
              key={m.id}
              match={m}
              isHistory={activeTab === "history"}
              onClick={(match) => {
                const isActive = match.current_players < match.max_players;

                if (isActive) {
                  navigate(`/match/${match.type}/${match.id}`, {
                    state: match,
                  });
                }
              }}
            />
          ))
        ) : (
          <div className="acc-empty-modern">
            <h3>No Matches Available</h3>

            <p>
              {activeTab === "active"
                ? "No active matches available."
                : "No match history available."}
            </p>
            <Link to="/join-group" className="acc-empty-btn">
              Explore Matches
            </Link>
          </div>
        )}
      </div>

      {error && <p className="acc-error">{error}</p>}
    </div>
  );
}
