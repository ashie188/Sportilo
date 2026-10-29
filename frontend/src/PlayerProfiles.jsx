import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import PlayerCard from "./components/PlayerCard";
import "./PlayerProfiles.css";

const DEFAULT_LIMIT = 20;

/* Routes for the bottom CTA — adjust here if your paths differ. */
const JOIN_MATCHES_ROUTE = "/matches";
const CREATE_MATCH_ROUTE = "/create-match";

export default function PlayerProfiles() {
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/players", {
        params: {
          limit: DEFAULT_LIMIT,
        },
      });

      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid players response");
      }

      setPlayers(data);
    } catch (err) {
      console.error("Error fetching player profiles:", err);

      setPlayers([]);
      setError("Unable to load players right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  return (
    <div className="pp-page">
      <section className="pp-hero">
        <div className="pp-hero-band">
          <div className="pp-container pp-hero-inner">
            <div className="pp-hero-content">
              <span className="pp-badge">Our Community</span>

              <h1>
                Players Near <span className="pp-accent">You</span>
              </h1>

              <p className="pp-subtitle">
                Meet fellow sports enthusiasts, connect, and play together in
                your city.
              </p>
            </div>

            <div className="pp-trust">
              <div className="pp-trust-item">
                <span className="pp-trust-icon" aria-hidden="true">
                  👥
                </span>
                <div className="pp-trust-text">
                  <strong>Real Players</strong>
                  <small>Local &amp; Genuine</small>
                </div>
              </div>

              <div className="pp-trust-item">
                <span className="pp-trust-icon" aria-hidden="true">
                  🎯
                </span>
                <div className="pp-trust-text">
                  <strong>All Skill Levels</strong>
                  <small>Everyone's Welcome</small>
                </div>
              </div>

              <div className="pp-trust-item">
                <span className="pp-trust-icon" aria-hidden="true">
                  🎮
                </span>
                <div className="pp-trust-text">
                  <strong>More Games</strong>
                  <small>Sports &amp; Gaming</small>
                </div>
              </div>
            </div>
          </div>

          <img
            className="pp-hero-img"
            src="/images/players-page-hero.webp"
            alt=""
            aria-hidden="true"
            loading="eager"
            decoding="async"
          />
        </div>
      </section>

      <section className="pp-body">
        <div className="pp-container">
          {!loading && !error && (
            <div className="pp-section-head">
              <div>
                <h2 className="pp-section-title">All Players</h2>
                <p className="pp-section-sub">
                  Discover players from your area and be part of the Sportilo
                  community.
                </p>
              </div>
              <span className="pp-count">{players.length} Players</span>
            </div>
          )}

          {loading && (
            <div
              className="pp-loading"
              role="status"
              aria-live="polite"
              aria-label="Loading player profiles"
            >
              <span className="pp-spinner" aria-hidden="true" />
              <p>Loading players...</p>
            </div>
          )}

          {!loading && error && (
            <div className="pp-error-state" role="alert">
              <h3>Something went wrong</h3>

              <p>{error}</p>

              <button type="button" onClick={fetchPlayers}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && players.length === 0 && (
            <div className="pp-empty-state">
              <div className="pp-empty-icon" aria-hidden="true">
                👥
              </div>

              <h3>No players yet</h3>

              <p>Be the first to complete your profile and show up here.</p>
            </div>
          )}

          {!loading && !error && players.length > 0 && (
            <div className="pp-grid">
              {players.map((player) => (
                <PlayerCard key={player.user_id} player={player} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pp-cta">
        <div className="pp-container">
          <div className="pp-cta-card">
            <div className="pp-cta-text">
              <h2>Ready to Play?</h2>

              <p>
                Join a match or create your own and start playing{" "}
                <span>with amazing people from your community.</span>
              </p>
            </div>

            <div className="pp-cta-actions">
              <button
                type="button"
                className="pp-cta-btn pp-cta-primary"
                onClick={() => navigate("/join-group")}
              >
                Join Matches <span aria-hidden="true">→</span>
              </button>

              <button
                type="button"
                className="pp-cta-btn pp-cta-secondary"
                onClick={() => navigate("/create-group")}
              >
                Create Match <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
