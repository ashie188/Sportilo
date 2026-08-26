import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import useMatchShare from "../hooks/useMatchShare";

const initialFormData = {
  game: "",
  platform: "",
  event_date: "",
  event_time: "",
  current_players: "1",
  max_players: "",
  discord_link: "",
  room_code: "",
  description: "",
};

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
    setCreatingLobby(true);
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

      if (formData.discord_link.trim()) {
        try {
          new URL(formData.discord_link.trim());
        } catch {
          setError("Please enter a valid Discord link.");
          return;
        }
      }

      const payload = {
        game,
        platform,
        event_date: formData.event_date,
        event_time: formData.event_time,
        current_players: currentPlayers,
        max_players: maxPlayers,
        description: formData.description.trim(),
      };

      const discordLink = formData.discord_link.trim();
      const roomCode = formData.room_code.trim();

      if (discordLink) {
        payload.discord_link = discordLink;
      }

      if (roomCode) {
        payload.room_code = roomCode;
      }

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
      <div className="create-box">
        <div className="form-header">
          <h3>Create Lobby</h3>
          <p>Create online gaming squads</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            name="game"
            value={formData.game}
            placeholder="Game (BGMI, Valorant...)"
            onChange={handleChange}
            maxLength="80"
            required
          />

          <input
            name="platform"
            value={formData.platform}
            placeholder="Platform (Mobile / PC)"
            onChange={handleChange}
            maxLength="50"
            required
          />

          <div className="row">
            <input
              type="date"
              name="event_date"
              value={formData.event_date}
              min={today}
              onChange={handleChange}
              required
            />

            <input
              type="time"
              name="event_time"
              value={formData.event_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="row">
            <input
              type="number"
              name="current_players"
              value={formData.current_players}
              placeholder="Current Players"
              min="1"
              step="1"
              inputMode="numeric"
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="max_players"
              value={formData.max_players}
              placeholder="Max Players"
              min="2"
              step="1"
              inputMode="numeric"
              onChange={handleChange}
              required
            />
          </div>

          <input
            type="url"
            name="discord_link"
            value={formData.discord_link}
            placeholder="Discord Link (Optional)"
            onChange={handleChange}
          />

          <input
            name="room_code"
            value={formData.room_code}
            placeholder="Room Code (Optional)"
            maxLength="100"
            onChange={handleChange}
          />

          <textarea
            name="description"
            value={formData.description}
            placeholder="Description...."
            onChange={handleChange}
          />

          {error && (
            <div className="gaming-error" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={creatingLobby}
            aria-busy={creatingLobby}
          >
            {creatingLobby ? (
              <>
                <span className="button-spinner" />
                Creating Lobby...
              </>
            ) : (
              "Create Lobby"
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
                <div className="created-match-sport">🎮</div>

                <div className="created-match-info">
                  <strong>{createdLobby?.game}</strong>

                  <span>
                    {formatMatchDate(createdLobby?.event_date)} •{" "}
                    {formatMatchTime(createdLobby?.event_time)}
                  </span>
                </div>
              </div>

              <div className="match-growth-tip">
                <div className="match-growth-tip-icon">🚀</div>

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
