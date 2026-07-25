import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./MatchCard.css";

export default function MatchCard({ match, onClick }) {
  const navigate = useNavigate();

  let matchStatus = "open";

  if (match.status === "completed") {
    matchStatus = "completed";
  } else if (match.current_players >= match.max_players) {
    matchStatus = "full";
  }

  // Convert date → day
  const date = new Date(match.match_date);

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = match.match_time?.slice(0, 5);

  return (
    <div
      className="mc-card"
      onClick={() =>
        navigate(`/match/${match.type}/${match.id}`, { state: match })
      }
    >
      {/* TOP */}
      <div className="mc-header">
        <span className="mc-sport-icon">⚽</span>
        <span className={`mc-status ${matchStatus}`}>
          {matchStatus.charAt(0).toUpperCase() + matchStatus.slice(1)}
        </span>
      </div>

      {/* BODY */}
      <div className="mc-body">
        <h3>{match.sport}</h3>
        <p className="mc-location">{match.location}</p>

        <div className="mc-time">
          {formattedDate} •
          <span style={{ fontWeight: "bold" }}>{formattedTime}</span>
        </div>

        <div className="mc-players">
          {match.current_players}/{match.max_players} Players
          <div className="mc-player-bar">
            <div
              className="mc-player-fill"
              style={{
                width: `${(match.current_players / match.max_players) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* ADMIN */}

        <div className="mc-admin">
          <FaUserCircle className="mc-user-icon" />
          <span>{match.admin_name.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}

/* top level match card content */
