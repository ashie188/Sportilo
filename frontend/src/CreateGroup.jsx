import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api/axios";
import OnlineCreateMatch from "./gaming/OnlineCreateMatch";
import "./CreateGroup.css";
import useMatchShare from "./hooks/useMatchShare";
import createHeroBg from "/images/create-match-hero.webp";

const initialFormData = {
  sport: "",
  location: "",
  area: "",
  city: "",
  date: "",
  time: "",
  maxPlayers: "",
  currentPlayers: "1",
  description: "",
};

/* =========================================================
   ICONS — inline SVG, no emoji
========================================================= */

function IconBall(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M6.5 6.5l2 2M15.5 15.5l2 2M17.5 6.5l-2 2M8.5 15.5l-2 2" />
    </svg>
  );
}

function IconGamepad(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M6 12h4M8 10v4" />
      <circle cx="16.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M7 7h10a5 5 0 0 1 5 5.2c0 2.4-1.4 3.8-3 3.8-1 0-1.6-.5-2.3-1.3l-.7-.9a2 2 0 0 0-1.6-.8h-2.8a2 2 0 0 0-1.6.8l-.7.9C8.6 15.5 8 16 7 16c-1.6 0-3-1.4-3-3.8A5 5 0 0 1 7 7z" />
    </svg>
  );
}

function IconMapPin(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconCalendar(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function IconClock(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconUsers(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconUser(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconFileText(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
    </svg>
  );
}

function IconClipboard(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

function IconBulb(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

function IconArrowRight(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function IconRocket(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.8-.8 1-2 .5-3-1-.5-2.2-.3-3 .5z" />
      <path d="M12 15l-3-3c1-3 3-8 8-10 2 5-3 7-10 8l3 3z" />
      <circle cx="15" cy="9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

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
    const area = formData.area.trim();
    const city = formData.city.trim();
    const description = formData.description.trim();

    const currentPlayers = Number(formData.currentPlayers);
    const maxPlayers = Number(formData.maxPlayers);

    if (
      !sport ||
      !location ||
      !area ||
      !city ||
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
          area,
          city,
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

  const isOffline = mode === "offline";

  return (
    <div className="create-page">
      {creatingMatch && !showSuccessModal && (
        <div
          className="create-page-loader"
          role="status"
          aria-live="polite"
          aria-label="Creating your match"
        >
          <div className="create-page-loader-spinner" aria-hidden="true" />
          <p>Creating your match...</p>
          <span>Please wait while we set everything up.</span>
        </div>
      )}

      {/* =================================================
          HERO — real 1920×400 artwork, shown at 300px on
          desktop (per spec — this asset is fine to crop,
          unlike the Account page's photo). The image itself
          already contains the sport/gaming icons and the
          cursive tag on its right side — nothing here is
          hand-drawn; the left side of the artwork is a pale
          wash the text sits directly on. DOM order is
          [text, image] rather than [image, text] so the same
          markup can flex into "text left / small icon chip
          right" on mobile without reordering anything.
      ================================================= */}
      <div className="create-hero">
        <div className="create-hero-inner">
          <span className="create-eyebrow">Create a Match</span>

          <h1 className="create-heading">
            Bring People <span className="accent">Together</span>
          </h1>

          <p className="create-subtext">
            Create a match in just a few steps and get players to join.
          </p>
        </div>

        <img
          className="create-hero-bg"
          src={createHeroBg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={400}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* =================================================
          MODE TOGGLE — two pills with a physical switch
          between them; both trigger the same setMode already
          used by the pills, just a second way to reach it.
      ================================================= */}
      <div className="create-toggle-row" role="tablist" aria-label="Match type">
        <button
          type="button"
          role="tab"
          aria-selected={isOffline}
          className={`create-toggle-pill ${isOffline ? "active" : ""}`}
          onClick={() => setMode("offline")}
        >
          <IconBall width={18} height={18} />
          <span>
            Offline Match
            <small>Play on the field</small>
          </span>
        </button>

        <button
          type="button"
          className={`create-mode-switch ${!isOffline ? "online" : ""}`}
          onClick={() =>
            setMode((currentMode) =>
              currentMode === "offline" ? "online" : "offline",
            )
          }
          aria-label="Switch between offline sports and online gaming"
        >
          <span className="create-mode-switch-thumb" />
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={!isOffline}
          className={`create-toggle-pill ${!isOffline ? "active" : ""}`}
          onClick={() => setMode("online")}
        >
          <IconGamepad width={18} height={18} />
          <span>
            Online Match
            <small>Play from anywhere</small>
          </span>
        </button>
      </div>

      {/* =================================================
          BODY — form (left) + sidebar (right)
      ================================================= */}
      <div className="create-body">
        <div className="create-main-col">
          {isOffline ? (
            <div className="create-box">
              <div className="form-header">
                <span className="form-header-icon">
                  <IconClipboard width={18} height={18} />
                </span>
                <div>
                  <h3>Match Details</h3>
                  <p>Fill in the details and let players join your match.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row row-stack-mobile">
                  <label className="field">
                    <span className="field-label">
                      Sport <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconBall className="field-icon" width={16} height={16} />
                      <input
                        type="text"
                        name="sport"
                        value={formData.sport}
                        placeholder="e.g. Football, Cricket, Badminton..."
                        maxLength="80"
                        autoComplete="off"
                        onChange={handleChange}
                        aria-label="Sport"
                        required
                      />
                    </span>
                  </label>

                  <label className="field">
                    <span className="field-label">
                      Location <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconMapPin
                        className="field-icon"
                        width={16}
                        height={16}
                      />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        placeholder="Enter location (e.g. Turf name)"
                        maxLength="150"
                        autoComplete="street-address"
                        onChange={handleChange}
                        aria-label="Match location"
                        required
                      />
                    </span>
                  </label>
                </div>

                <div className="row">
                  <label className="field">
                    <span className="field-label">
                      Area <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconMapPin
                        className="field-icon"
                        width={16}
                        height={16}
                      />
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        placeholder="Area"
                        maxLength="100"
                        autoComplete="address-level3"
                        onChange={handleChange}
                        aria-label="Match area"
                        required
                      />
                    </span>
                  </label>

                  <label className="field">
                    <span className="field-label">
                      City <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconMapPin
                        className="field-icon"
                        width={16}
                        height={16}
                      />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        placeholder="City"
                        maxLength="100"
                        autoComplete="address-level2"
                        onChange={handleChange}
                        aria-label="Match city"
                        required
                      />
                    </span>
                  </label>
                </div>

                <div className="row">
                  <label className="field">
                    <span className="field-label">
                      Date <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconCalendar
                        className="field-icon"
                        width={16}
                        height={16}
                      />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        min={today}
                        onChange={handleChange}
                        aria-label="Match date"
                        required
                      />
                    </span>
                  </label>

                  <label className="field">
                    <span className="field-label">
                      Time <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconClock
                        className="field-icon"
                        width={16}
                        height={16}
                      />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        aria-label="Match time"
                        required
                      />
                    </span>
                  </label>
                </div>

                <div className="row">
                  <label className="field">
                    <span className="field-label">Current Players</span>
                    <span className="field-control field-control-muted">
                      <IconUser className="field-icon" width={16} height={16} />
                      <input
                        type="number"
                        name="currentPlayers"
                        value={formData.currentPlayers}
                        placeholder="1"
                        min="1"
                        step="1"
                        inputMode="numeric"
                        onChange={handleChange}
                        aria-label="Current players"
                        required
                      />
                    </span>
                  </label>

                  <label className="field">
                    <span className="field-label">
                      Maximum Players <em>*</em>
                    </span>
                    <span className="field-control">
                      <IconUsers
                        className="field-icon"
                        width={16}
                        height={16}
                      />
                      <input
                        type="number"
                        name="maxPlayers"
                        value={formData.maxPlayers}
                        placeholder="e.g. 10"
                        min="2"
                        step="1"
                        inputMode="numeric"
                        onChange={handleChange}
                        aria-label="Maximum players"
                        required
                      />
                    </span>
                  </label>
                </div>

                <label className="field field-full">
                  <span className="field-label">
                    Description <em>*</em>
                  </span>
                  <span className="field-control field-control-textarea">
                    <IconFileText
                      className="field-icon field-icon-top"
                      width={16}
                      height={16}
                    />
                    <textarea
                      name="description"
                      value={formData.description}
                      placeholder="Add match details, ground info, what to bring, etc..."
                      onChange={handleChange}
                      aria-label="Match description"
                      required
                    />
                  </span>
                </label>

                {error && (
                  <div className="form-error" role="alert" aria-live="polite">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="create-submit-btn"
                  disabled={creatingMatch}
                  aria-busy={creatingMatch}
                >
                  {creatingMatch ? (
                    <>
                      <span className="button-spinner" />
                      Creating Match...
                    </>
                  ) : (
                    <>
                      <span className="create-submit-plus">+</span>
                      Create Match
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <OnlineCreateMatch />
          )}
        </div>

        {/* =================================================
            SIDEBAR
        ================================================= */}
        <aside className="create-side-col">
          <div className="info-panel">
            <div className="panel-header">
              <span className="panel-header-icon">
                <IconBulb width={18} height={18} />
              </span>
              <div>
                <h3>Create a Great Match</h3>
                <p>A few things to keep in mind:</p>
              </div>
            </div>

            {isOffline ? (
              <div className="suggestions">
                <div className="suggestion-card">
                  <span className="suggestion-icon">
                    <IconMapPin width={16} height={16} />
                  </span>
                  <div>
                    <strong>Be specific with location</strong>
                    <p>Mention the exact location to avoid confusion.</p>
                  </div>
                </div>

                <div className="suggestion-card">
                  <span className="suggestion-icon">
                    <IconClock width={16} height={16} />
                  </span>
                  <div>
                    <strong>Give players enough time</strong>
                    <p>Create your match at least 6 hours before it starts.</p>
                  </div>
                </div>

                <div className="suggestion-card">
                  <span className="suggestion-icon">
                    <IconFileText width={16} height={16} />
                  </span>
                  <div>
                    <strong>Describe the match clearly</strong>
                    <p>Explain the format, rules, and duration.</p>
                  </div>
                </div>

                <div className="suggestion-card">
                  <span className="suggestion-icon">
                    <IconUsers width={16} height={16} />
                  </span>
                  <div>
                    <strong>Keep team sizes realistic</strong>
                    <p>Realistic player counts get more join requests.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="suggestions">
                <div className="suggestion-card gaming-card-info">
                  <span className="suggestion-icon">
                    <IconGamepad width={16} height={16} />
                  </span>
                  <div>
                    <strong>Mention your rank</strong>
                    <p>Attract players at a similar skill level.</p>
                  </div>
                </div>

                <div className="suggestion-card gaming-card-info">
                  <span className="suggestion-icon">
                    <IconClock width={16} height={16} />
                  </span>
                  <div>
                    <strong>Give players enough time</strong>
                    <p>Create your lobby at least 3 hours before it starts.</p>
                  </div>
                </div>

                <div className="suggestion-card gaming-card-info">
                  <span className="suggestion-icon">
                    <IconFileText width={16} height={16} />
                  </span>
                  <div>
                    <strong>Describe the match clearly</strong>
                    <p>Explain the format, rules, and duration.</p>
                  </div>
                </div>

                <div className="suggestion-card gaming-card-info">
                  <span className="suggestion-icon">
                    <IconUsers width={16} height={16} />
                  </span>
                  <div>
                    <strong>Share clear room details</strong>
                    <p>Clear details reduce last-minute dropouts.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="cta-box">
              <p>
                {isOffline
                  ? "Want to join instead?"
                  : "Looking for gaming squads?"}
              </p>

              <button type="button" onClick={() => navigate("/join-group")}>
                {isOffline ? "Explore Matches" : "Explore Lobbies"}
                <IconArrowRight width={14} height={14} />
              </button>
            </div>
          </div>

          {/* Reuses the exact same setMode setter as the toggle above —
              no new state, just another trigger for it. */}
          <div className="switch-mode-card">
            <span className="switch-mode-icon">
              {isOffline ? (
                <IconGamepad width={20} height={20} />
              ) : (
                <IconBall width={20} height={20} />
              )}
            </span>

            <div className="switch-mode-text">
              <strong>
                {isOffline
                  ? "Want to play online instead?"
                  : "Want to play offline instead?"}
              </strong>
              <p>
                {isOffline
                  ? "Create a gaming match and find teammates for your favorite games."
                  : "Create a match on the field and find players nearby."}
              </p>
            </div>

            <button
              type="button"
              className="switch-mode-btn"
              onClick={() => setMode(isOffline ? "online" : "offline")}
            >
              Switch to {isOffline ? "Online" : "Offline"} Match
              <IconArrowRight width={14} height={14} />
            </button>
          </div>
        </aside>
      </div>

      {/* =================================================
          BANNER
      ================================================= */}
      <div className="create-banner">
        <div>
          <h3>
            Same Passion.
            <br />
            More People.
          </h3>
          <p>Create a match, find players and keep the game going.</p>
        </div>
        <span className="create-banner-icon" aria-hidden="true">
          <IconBall width={28} height={28} />
        </span>
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
                <div className="created-match-sport">
                  <IconBall width={18} height={18} />
                </div>

                <div className="created-match-info">
                  <strong>{createdMatch?.sport}</strong>

                  <span>
                    {formatMatchDate(createdMatch?.match_date)} •{" "}
                    {formatMatchTime(createdMatch?.match_time)}
                  </span>
                </div>
              </div>

              <div className="match-growth-tip">
                <div className="match-growth-tip-icon">
                  <IconRocket width={16} height={16} />
                </div>

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
