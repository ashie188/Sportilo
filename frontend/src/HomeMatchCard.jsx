import React from "react";
import { useNavigate } from "react-router-dom";

function HomeMatchCard({ match }) {
  const navigate = useNavigate();
  const isGaming = match.type === "gaming";

  const handleCardClick = () => {
    navigate(`/match/${match.type}/${match.id}`, { state: match });
  };

  const title = isGaming ? match.game?.toUpperCase() : match.sport;

  const location = match.location?.split(",")[0];

  return (
    <div
      className={`match-card ${isGaming ? "gaming-card-featured" : "offline-card-featured"}`}
      onClick={handleCardClick}
    >
      <div className="match-header">
        <div className="match-type">{isGaming ? "🎮 Gaming" : "⚽ Sports"}</div>

        <div className={`match-status ${match.status}`}>{match.status}</div>
      </div>

      <h3>{title}</h3>

      {isGaming ? (
        <>
          <p>📱 {match.platform}</p>

          <p>
            👥 {match.current_players}/{match.max_players}
          </p>

          <p>📅 {new Date(match.event_date).toLocaleDateString()}</p>
        </>
      ) : (
        <>
          <p>📍 {location}</p>

          <p>
            👥 {match.current_players}/{match.max_players}
          </p>

          <p>📅 {new Date(match.match_date).toLocaleDateString()}</p>
        </>
      )}

      <button type="button">
        {match.status === "full"
          ? "View Details"
          : isGaming
            ? "Join Squad"
            : "Join Match"}
      </button>
    </div>
  );
}

export default HomeMatchCard;
