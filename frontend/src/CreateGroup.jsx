import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import OnlineCreateMatch from "./gaming/OnlineCreateMatch";
import "./CreateGroup.css";
import useMatchShare from "./hooks/useMatchShare";

const initialFormData = {
  sport: "",
  location: "",
  date: "",
  time: "",
  maxPlayers: "",
  currentPlayers: "1",
  description: "",
};

function CreateGroup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("offline");
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdMatch, setCreatedMatch] = useState(null);
  const [creatingMatch, setCreatingMatch] = useState(false);
  const { shareMatch } = useMatchShare();
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (creatingMatch) return;

    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const sport = formData.sport.trim();
    const location = formData.location.trim();
    const description = formData.description.trim();

    const currentPlayers = Number(formData.currentPlayers);
    const maxPlayers = Number(formData.maxPlayers);

    if (
      !sport ||
      !location ||
      !formData.date ||
      !formData.time ||
      !formData.maxPlayers ||
      !description
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isInteger(currentPlayers) || currentPlayers < 1) {
      setError("Current players must be at least 1.");
      return;
    }

    if (!Number.isInteger(maxPlayers) || maxPlayers < 2) {
      setError("Maximum players must be at least 2.");
      return;
    }

    if (currentPlayers > maxPlayers) {
      setError("Current players cannot exceed maximum players.");
      return;
    }

    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);

    if (
      Number.isNaN(selectedDateTime.getTime()) ||
      selectedDateTime <= new Date()
    ) {
      setError("Please select a future date and time.");
      return;
    }

    setCreatingMatch(true);

    try {
      const response = await api.post(
        "/matches/create",
        {
          sport,
          location,
          match_date: formData.date,
          match_time: formData.time,
          max_players: maxPlayers,
          currentPlayers,
          description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const match = response.data?.match;

      if (!match?.id) {
        throw new Error(
          "Match was created, but the server returned an invalid response.",
        );
      }

      setCreatedMatch(match);
      setShowSuccessModal(true);
      setFormData(initialFormData);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to create the match. Please try again.",
      );
    } finally {
      setCreatingMatch(false);
    }
  };

  const handleViewCreatedMatch = () => {
    if (!createdMatch?.id) return;

    navigate(`/match/offline/${createdMatch.id}`);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/account");
  };

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
    .toISOString()
    .split("T")[0];

  const formatMatchDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMatchTime = (timeValue) => {
    if (!timeValue) return "";

    const time = String(timeValue);

    if (time.includes("T")) {
      const date = new Date(time);

      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      }
    }

    return time.slice(0, 5);
  };

  return (
    <div className="create-page">
      <div className="create-left">
        {/* LEFT FORM */}
        <div className="info-panel">
          {mode === "offline" ? (
            <>
              <div className="panel-header">
                <span className="badge">🏆 Notes</span>
                <h3>Make Your Match Better</h3>
              </div>

              <div className="suggestions">
                <div className="suggestion-card">
                  • Specifically mention the exact location to avoid confusion.
                </div>

                <div className="suggestion-card">
                  • create any match atleast 6 hours before the match to give
                  players enough time to join.
                </div>

                <div className="suggestion-card">
                  • clearly describe the match format,rules and duration.
                </div>

                <div className="suggestion-card">
                  • Keep team sizes realistic to get more join requests.
                </div>
              </div>

              <div className="cta-box">
                <p>Want to join instead?</p>

                <button type="button" onClick={() => navigate("/join-group")}>
                  Explore Matches →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="panel-header">
                <span className="badge">🏆 Notes</span>
                <h3>Make your Squad Better</h3>
              </div>

              <div className="suggestions">
                <div className="suggestion-card gaming-card-info">
                  • Mention your rank to attract players at a similar skill
                  level.
                </div>

                <div className="suggestion-card gaming-card-info">
                  • create any match atleast 3 hours before the match time to
                  give players enough time to join.
                </div>

                <div className="suggestion-card gaming-card-info">
                  • clearly describe the match format and rules,mention the
                  duration.
                </div>

                <div className="suggestion-card gaming-card-info">
                  • Clear room details reduce last-minute dropouts.
                </div>
              </div>

              <div className="cta-box">
                <p>Looking for gaming squads?</p>

                <button type="button" onClick={() => navigate("/join-group")}>
                  Explore Lobbies →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="create-right">
        {/* RIGHT PANEL */}
        <div className="create-header">
          <h1>{mode === "offline" ? "Create Match " : "Create Lobby "}</h1>

          <div className="create-toggle">
            <button
              type="button"
              className={mode === "offline" ? "active-toggle" : ""}
              onClick={() => setMode("offline")}
            >
              ⚽ Offline Sports
            </button>

            <button
              type="button"
              className={`mode-switch ${mode === "online" ? "online" : ""}`}
              onClick={() =>
                setMode((currentMode) =>
                  currentMode === "offline" ? "online" : "offline",
                )
              }
              aria-label="Switch between offline sports and online gaming"
            >
              <span className="mode-switch-thumb" />
            </button>

            <button
              type="button"
              className={mode === "online" ? "active-toggle" : ""}
              onClick={() => setMode("online")}
            >
              🎮 Online Gaming
            </button>
          </div>
        </div>

        <div className="create-main">
          {mode === "offline" ? (
            <div className="create-box">
              <div className="form-header">
                <h3>Create Match</h3>
                <p>Fill details to find players instantly</p>
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="sport"
                  value={formData.sport}
                  placeholder="Sport (Football, Cricket...)"
                  maxLength="80"
                  autoComplete="off"
                  onChange={handleChange}
                  aria-label="Sport"
                  required
                />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  placeholder="Location"
                  maxLength="150"
                  autoComplete="street-address"
                  onChange={handleChange}
                  aria-label="Match location"
                  required
                />
                <div className="row">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    min={today}
                    onChange={handleChange}
                    aria-label="Match date"
                    required
                  />

                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    aria-label="Match time"
                    required
                  />
                </div>
                <div className="row">
                  <input
                    type="number"
                    name="currentPlayers"
                    value={formData.currentPlayers}
                    placeholder="Current Players"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    onChange={handleChange}
                    aria-label="Current players"
                    required
                  />

                  <input
                    type="number"
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    placeholder="Max players"
                    min="2"
                    step="1"
                    inputMode="numeric"
                    onChange={handleChange}
                    aria-label="Maximum players"
                    required
                  />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  placeholder="Description...."
                  onChange={handleChange}
                  aria-label="Match description"
                  required
                />
                {error && (
                  <div className="form-error" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={creatingMatch}
                  aria-busy={creatingMatch}
                >
                  {creatingMatch ? (
                    <>
                      <span className="button-spinner" />
                      Creating Match...
                    </>
                  ) : (
                    "Create Match"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <OnlineCreateMatch />
          )}
        </div>
      </div>
      {showSuccessModal && (
        <div className="match-success-overlay">
          <div
            className="match-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-success-title"
          >
            <div className="match-success-top">
              <div className="match-success-icon">✓</div>

              <button
                type="button"
                className="match-success-close"
                onClick={handleCloseSuccessModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="match-success-content">
              <span className="match-success-label">MATCH CREATED</span>

              <h2 id="match-success-title">Your match is live!</h2>

              <p className="match-success-description">
                Your match is now visible to players looking for a game.
              </p>

              <div className="created-match-card">
                <div className="created-match-sport">⚽</div>

                <div className="created-match-info">
                  <strong>{createdMatch?.sport}</strong>

                  <span>
                    {formatMatchDate(createdMatch?.match_date)} •{" "}
                    {formatMatchTime(createdMatch?.match_time)}
                  </span>
                </div>
              </div>

              <div className="match-growth-tip">
                <div className="match-growth-tip-icon">🚀</div>

                <div>
                  <strong>Get players faster</strong>

                  <p>
                    Share your match with friends and groups to fill your slots
                    faster.
                  </p>
                </div>
              </div>

              <div className="match-success-actions">
                <button
                  type="button"
                  className="match-share-now-btn"
                  onClick={() => shareMatch(createdMatch, "offline")}
                >
                  Share Match
                </button>

                <button
                  type="button"
                  className="match-view-btn"
                  onClick={handleViewCreatedMatch}
                >
                  View Match
                </button>
              </div>

              <button
                type="button"
                className="match-later-btn"
                onClick={handleCloseSuccessModal}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateGroup;



