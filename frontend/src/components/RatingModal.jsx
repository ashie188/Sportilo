import { useEffect, useState } from "react";
import api from "../api/axios";
import "./RatingModal.css";

const RATING_FIELDS = [
  {
    key: "showUpRating",
    label: "Show-up",
    description: "Did the player show up and participate as expected?",
  },
  {
    key: "behaviorRating",
    label: "Behavior",
    description: "How was the player's attitude and behavior?",
  },
  {
    key: "skillsRating",
    label: "Skills",
    description: "How was the player's performance?",
  },
];

const getInitials = (name) => {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export default function RatingModal({
  matchType,
  matchId,
  onClose,
  onRatingComplete,
}) {
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState("");

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [ratings, setRatings] = useState({
    showUpRating: 0,
    behaviorRating: 0,
    skillsRating: 0,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlayersToRate = async () => {
      try {
        setLoadingPlayers(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await api.get(
          `/rating/${matchType}/${matchId}/players`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPlayers(response.data?.players || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load players for rating.",
        );
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayersToRate();
  }, [matchType, matchId]);

  const handleSelectPlayer = (player) => {
    setSelectedPlayer(player);

    setRatings({
      showUpRating: 0,
      behaviorRating: 0,
      skillsRating: 0,
    });

    setError("");
  };

  const handleRatingChange = (field, value) => {
    setRatings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmitRating = async () => {
    if (!selectedPlayer || submitting) return;

    const { showUpRating, behaviorRating, skillsRating } = ratings;

    if (showUpRating < 1 || behaviorRating < 1 || skillsRating < 1) {
      setError("Please give a rating for all three categories.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      await api.post(
        `/rating/${matchType}/${matchId}`,
        {
          playerId: selectedPlayer.user_id,
          showUpRating,
          behaviorRating,
          skillsRating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const remainingPlayers = players.filter(
        (player) => Number(player.user_id) !== Number(selectedPlayer.user_id),
      );

      setPlayers(remainingPlayers);

      setSelectedPlayer(null);

      setRatings({
        showUpRating: 0,
        behaviorRating: 0,
        skillsRating: 0,
      });

      if (typeof onRatingComplete === "function") {
        onRatingComplete();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit the rating. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="rating-modal-overlay"
      onClick={() => {
        if (!submitting) {
          onClose();
        }
      }}
    >
      <div
        className="rating-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rating-modal-header">
          <div>
            <h2>Rate Players</h2>

            <p>
              Your ratings help build a trusted and better Sportilo community.
            </p>
          </div>

          <button
            type="button"
            className="rating-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close rating modal"
          >
            ×
          </button>
        </div>

        {loadingPlayers && (
          <div className="rating-loading">
            <div className="rating-spinner" />
            <p>Loading players...</p>
          </div>
        )}

        {!loadingPlayers && error && !selectedPlayer && (
          <div className="rating-error-state">
            <p>{error}</p>
          </div>
        )}

        {!loadingPlayers &&
          !error &&
          !selectedPlayer &&
          players.length === 0 && (
            <div className="rating-complete-state">
              <div className="rating-complete-icon">✓</div>

              <h3>All Done!</h3>

              <p>You have rated all the available players from this match.</p>
            </div>
          )}

        {!loadingPlayers && !selectedPlayer && players.length > 0 && (
          <div className="rating-player-list">
            <div className="rating-list-info">
              <span>
                {players.length} {players.length === 1 ? "player" : "players"}{" "}
                remaining
              </span>
            </div>

            {players.map((player) => (
              <button
                type="button"
                key={player.user_id}
                className="rating-player-card"
                onClick={() => handleSelectPlayer(player)}
              >
                <div className="rating-player-avatar">
                  {getInitials(player.name)}
                </div>

                <div className="rating-player-info">
                  <h3>{player.name}</h3>

                  <p>Rate this player's match experience</p>
                </div>

                <span className="rating-arrow">›</span>
              </button>
            ))}
          </div>
        )}

        {!loadingPlayers && selectedPlayer && (
          <div className="rating-form">
            <button
              type="button"
              className="rating-back-btn"
              onClick={() => {
                if (!submitting) {
                  setSelectedPlayer(null);
                  setError("");
                }
              }}
              disabled={submitting}
            >
              ← Back to players
            </button>

            <div className="rating-selected-player">
              <div className="rating-selected-avatar">
                {getInitials(selectedPlayer.name)}
              </div>

              <div>
                <h3>{selectedPlayer.name}</h3>
                <p>Rate your experience with this player</p>
              </div>
            </div>

            <div className="rating-fields">
              {RATING_FIELDS.map((field) => (
                <div className="rating-field" key={field.key}>
                  <div className="rating-field-text">
                    <h4>{field.label}</h4>
                    <p>{field.description}</p>
                  </div>

                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={
                          value <= ratings[field.key]
                            ? "rating-star active"
                            : "rating-star"
                        }
                        onClick={() => handleRatingChange(field.key, value)}
                        disabled={submitting}
                        aria-label={`${value} star rating`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="rating-form-error">{error}</p>}

            <button
              type="button"
              className="rating-submit-btn"
              onClick={handleSubmitRating}
              disabled={submitting}
            >
              {submitting ? "Submitting Rating..." : "Submit Rating"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
