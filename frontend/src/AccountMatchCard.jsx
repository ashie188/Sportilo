import React from "react";
import { useNavigate } from "react-router-dom";

export default function AccountMatchCard({ match, onClick, isHistory }) {
  const navigate = useNavigate();

  const isCompleted = match.status === "completed";

  const isGamingMatch = match.type === "gaming";

  const date = new Date(isGamingMatch ? match.event_date : match.match_date);

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = (
    isGamingMatch ? match.event_time : match.match_time
  )?.slice(0, 5);

  const handleShare = async (e) => {
    e.stopPropagation();

    const matchUrl = `${window.location.origin}/match/${match.type}/${match.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: isGamingMatch ? `${match.game} Lobby` : `${match.sport} Match`,
          text: "Join this match on SportMania",
          url: matchUrl,
        });
      } else {
        await navigator.clipboard.writeText(matchUrl);

        alert("Match link copied!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className={`accm-card

      ${isHistory ? "history-card" : ""}

      ${isGamingMatch ? "gaming-card" : ""}
    `}
      onClick={() => {
        if (!isHistory) {
          onClick(match);
        }
      }}
    >
      {/* TOP STRIP */}

      <div className={`accm-strip ${isGamingMatch ? "gaming-strip" : ""}`} />

      {/* HEADER */}

      <div className="accm-header">
        <span className="accm-sport">
          {isGamingMatch ? "🎮 " + match.game : "⚽ " + match.sport}
        </span>

        <span className={`accm-status ${isCompleted ? "completed" : "open"}`}>
          {match.status}
        </span>
      </div>

      {/* SUBTITLE */}

      <p className="accm-location">
        {isGamingMatch ? `🕹 ${match.platform}` : `📍 ${match.location}`}
      </p>

      {/* TIME */}

      <p className="accm-time">
        {formattedDate} • {formattedTime}
      </p>

      {/* PLAYERS */}

      <p className="accm-players">
        {match.current_players}/{match.max_players}
        {isGamingMatch ? " members" : " players"}
      </p>

      {/* ADMIN */}

      <div className="accm-admin">
        <div className="accm-admin-left">
          <div className="accm-avatar">{match.admin_name?.charAt(0)}</div>

          <span>{match.admin_name}</span>
        </div>

        {!isHistory && (
          <button className="accm-share-btn" onClick={handleShare}>
            ↗ Share
          </button>
        )}
      </div>
    </div>
  );
}
