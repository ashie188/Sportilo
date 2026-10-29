import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import useMatchShare from "../hooks/useMatchShare";

const initialFormData = {
  game: "",
  platform: "",
  area: "",
  city: "",
  event_date: "",
  event_time: "",
  current_players: "1",
  max_players: "",
  description: "",
};

/* =========================================================
   ICONS — inline SVG, no emoji
========================================================= */

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

function IconMonitor(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect x="2" y="4" width="20" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
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

function OnlineCreateMatch() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLobby, setCreatedLobby] = useState(null);
  const [creatingLobby, setCreatingLobby] = useState(false);
  const closeButtonRef = useRef(null);
  const [formData, setFormData] = useState(initialFormData);
  const { shareMatch } = useMatchShare();

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

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/account");
  };

  useEffect(() => {
    if (!showSuccessModal) return;

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleCloseSuccessModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showSuccessModal]);

  const handleViewCreatedLobby = () => {
    if (!createdLobby?.id) return;

    navigate(`/match/gaming/${createdLobby.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creatingLobby) return;

    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        navigate("/login");

        return;
      }

      const game = formData.game.trim();
      const platform = formData.platform.trim();
      const area = formData.area.trim();
      const city = formData.city.trim();
      const currentPlayers = Number(formData.current_players);
      const maxPlayers = Number(formData.max_players);

      if (
        !game ||
        !platform ||
        !formData.event_date ||
        !formData.event_time ||
        !formData.max_players
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

      const selectedDateTime = new Date(
        `${formData.event_date}T${formData.event_time}`,
      );

      if (Number.isNaN(selectedDateTime.getTime())) {
        setError("Please select a valid date and time.");
        return;
      }

      if (selectedDateTime <= new Date()) {
        setError("Please select a future date and time.");
        return;
      }

      const payload = {
        game,
        platform,
        area,
        city,
        event_date: formData.event_date,
        event_time: formData.event_time,
        current_players: currentPlayers,
        max_players: maxPlayers,
        description: formData.description.trim(),
      };

      setCreatingLobby(true);

      const response = await api.post("/gaming/create", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const lobby = response.data?.gamingMatch;
      if (!lobby?.id) {
        throw new Error(
          "Lobby was created, but the server returned an invalid response.",
        );
      }

      setCreatedLobby(lobby);
      setShowSuccessModal(true);
      setFormData(initialFormData);
    } catch (error) {
      console.log("Error creating gaming match");

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setCreatingLobby(false);
    }
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
    <>
      {creatingLobby && !showSuccessModal && (
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

      <div className="create-box">
        <div className="form-header">
          <span className="form-header-icon">
            <IconGamepad width={18} height={18} />
          </span>
          <div>
            <h3>Create Lobby</h3>
            <p>Create online gaming squads</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row row-stack-mobile">
            <label className="field">
              <span className="field-label">
                Game <em>*</em>
              </span>
              <span className="field-control">
                <IconGamepad className="field-icon" width={16} height={16} />
                <input
                  type="text"
                  name="game"
                  value={formData.game}
                  placeholder="e.g. BGMI, Valorant..."
                  onChange={handleChange}
                  maxLength="80"
                  aria-label="Game"
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">
                Platform <em>*</em>
              </span>
              <span className="field-control">
                <IconMonitor className="field-icon" width={16} height={16} />
                <input
                  type="text"
                  name="platform"
                  value={formData.platform}
                  placeholder="e.g. Mobile, PC..."
                  onChange={handleChange}
                  maxLength="50"
                  aria-label="Platform"
                  required
                />
              </span>
            </label>
          </div>

          <div className="row">
            <label className="field">
              <span className="field-label">
                Area <small>(Optional)</small>
              </span>
              <span className="field-control">
                <IconMapPin className="field-icon" width={16} height={16} />
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  placeholder="Area"
                  maxLength="100"
                  autoComplete="address-level3"
                  onChange={handleChange}
                  aria-label="Area (optional)"
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">
                City <small>(Optional)</small>
              </span>
              <span className="field-control">
                <IconMapPin className="field-icon" width={16} height={16} />
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  placeholder="City"
                  maxLength="100"
                  autoComplete="address-level2"
                  onChange={handleChange}
                  aria-label="City (optional)"
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
                <IconCalendar className="field-icon" width={16} height={16} />
                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  min={today}
                  onChange={handleChange}
                  aria-label="Event date"
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">
                Time <em>*</em>
              </span>
              <span className="field-control">
                <IconClock className="field-icon" width={16} height={16} />
                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                  aria-label="Event time"
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
                  name="current_players"
                  value={formData.current_players}
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
                Max Players <em>*</em>
              </span>
              <span className="field-control">
                <IconUsers className="field-icon" width={16} height={16} />
                <input
                  type="number"
                  name="max_players"
                  value={formData.max_players}
                  placeholder="e.g. 4"
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
              Description <small>(Optional)</small>
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
                aria-label="Lobby description"
              />
            </span>
          </label>

          {error && (
            <div className="gaming-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="create-submit-btn"
            disabled={creatingLobby}
            aria-busy={creatingLobby}
          >
            {creatingLobby ? (
              <>
                <span className="button-spinner" />
                Creating Lobby...
              </>
            ) : (
              <>
                <span className="create-submit-plus">+</span>
                Create Lobby
              </>
            )}
          </button>
        </form>
      </div>
      {showSuccessModal && (
        <div className="match-success-overlay">
          <div
            className="match-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gaming-success-title"
          >
            <div className="match-success-top">
              <div className="match-success-icon">✓</div>

              <button
                ref={closeButtonRef}
                type="button"
                className="match-success-close"
                onClick={handleCloseSuccessModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="match-success-content">
              <span className="match-success-label">LOBBY CREATED</span>

              <h2 id="gaming-success-title">Your lobby is live!</h2>

              <p className="match-success-description">
                Your lobby is now visible to players looking for a squad.
              </p>

              <div className="created-match-card">
                <div className="created-match-sport">
                  <IconGamepad width={18} height={18} />
                </div>

                <div className="created-match-info">
                  <strong>{createdLobby?.game}</strong>

                  <span>
                    {formatMatchDate(createdLobby?.event_date)} •{" "}
                    {formatMatchTime(createdLobby?.event_time)}
                  </span>
                </div>
              </div>

              <div className="match-growth-tip">
                <div className="match-growth-tip-icon">
                  <IconRocket width={16} height={16} />
                </div>

                <div>
                  <strong>Find players faster</strong>

                  <p>
                    Share your lobby with friends and gaming communities to fill
                    your squad faster.
                  </p>
                </div>
              </div>

              <div className="match-success-actions">
                <button
                  type="button"
                  className="match-share-now-btn"
                  onClick={() => shareMatch(createdLobby, "gaming")}
                >
                  Share Lobby
                </button>

                <button
                  type="button"
                  className="match-view-btn"
                  onClick={handleViewCreatedLobby}
                >
                  View Lobby
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
    </>
  );
}
export default OnlineCreateMatch;
