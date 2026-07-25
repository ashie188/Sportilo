import React from "react";
import { FaGamepad } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./GamingMatchCard.css";

export default function GamingMatchCard({ match }) {
  const navigate = useNavigate();

  let matchStatus = "open";

  if (match.status === "completed") {
    matchStatus = "completed";
  } else if (match.current_players >= match.max_players) {
    matchStatus = "full";
  }

  const date = new Date(match.event_date);

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = match.event_time?.slice(0, 5);

  return (
    <div
      className="gmc-card"
      onClick={() =>
        navigate(`/match/${match.type}/${match.id}`, { state: match })
      }
    >
      {/* TOP */}

      <div className="gmc-header">
        <div className="gmc-game-icon">
          <FaGamepad />
        </div>

        <span className={`gmc-status ${matchStatus}`}>
          {matchStatus.charAt(0).toUpperCase() + matchStatus.slice(1)}
        </span>
      </div>

      {/* BODY */}

      <div className="gmc-body">
        <h3>{match.game}</h3>

        <p className="gmc-platform">🎮 {match.platform}</p>

        <div className="gmc-time">
          {formattedDate} •{" "}
          <span style={{ fontWeight: "bold" }}>{formattedTime}</span>
        </div>

        <div className="gmc-players">
          {match.current_players}/{match.max_players} Players
        </div>

        {/* PLAYER BAR */}

        <div className="gmc-player-bar">
          <div
            className="gmc-player-fill"
            style={{
              width: `${(match.current_players / match.max_players) * 100}%`,
            }}
          />
        </div>

        {/* ROOM */}

        <div className="gmc-room">
          <span>🔐 Room Ready</span>

          <span>🎧 Discord</span>
        </div>

        {/* ADMIN */}

        <div className="gmc-admin">
          <div className="gmc-avatar">{match.admin_name?.charAt(0)}</div>

          <span>{match.admin_name.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}
