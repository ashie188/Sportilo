import React from "react";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./MatchCard.css";

const CARD_IMAGES = "/images/cardimages";

const SPORT_IMAGE = {
  football: `${CARD_IMAGES}/match-football.webp`,
  soccer: `${CARD_IMAGES}/match-football.webp`,
  cricket: `${CARD_IMAGES}/match-cricket.webp`,
  badminton: `${CARD_IMAGES}/match-badminton.webp`,
  bgmi: `${CARD_IMAGES}/match-bgmi.webp`,
};

const FALLBACK_IMAGE = `${CARD_IMAGES}/match-allsports.webp`;

const SPORT_EMOJI = {
  football: "⚽",
  soccer: "⚽",
  cricket: "🏏",
  badminton: "🏸",
  basketball: "🏀",
  tennis: "🎾",
  volleyball: "🏐",
  "table tennis": "🏓",
  hockey: "🏑",
};

const getSportImage = (sport) =>
  SPORT_IMAGE[sport?.toLowerCase()] ?? FALLBACK_IMAGE;

const getSportEmoji = (sport) => SPORT_EMOJI[sport?.toLowerCase()] ?? "🏅";

const getStatus = ({ status, current_players, max_players }) => {
  if (status === "completed") return "completed";
  if (current_players >= max_players) return "full";
  if (current_players / max_players >= 0.7) return "filling";
  return "open";
};

const STATUS_LABEL = {
  open: "Open",
  filling: "Filling Fast",
  full: "Full",
  completed: "Completed",
};

export default function MatchCard({ match, onClick, imagePriority = false }) {
  const navigate = useNavigate();

  const matchStatus = getStatus(match);

  const date = new Date(match.match_date);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = match.match_time?.slice(0, 5);

  const playersPercent = Math.min(
    100,
    Math.round((match.current_players / match.max_players) * 100),
  );

  const handleOpen = () =>
    navigate(`/match/${match.type}/${match.id}`, { state: match });

  return (
    <div
      className="mc-card"
      role="button"
      tabIndex={0}
      aria-label={`${match.sport} match at ${match.location}`}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleOpen();
        if (e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
    >
      {/* TOP — sport photo with icon badge + status pill */}
      <div className="mc-media">
        <img
          className="mc-media-img"
          src={getSportImage(match.sport)}
          alt=""
          loading={imagePriority ? "eager" : "lazy"}
          fetchPriority={imagePriority ? "high" : "auto"}
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <span className="mc-sport-badge" aria-hidden="true">
          {getSportEmoji(match.sport)}
        </span>
        <span className={`mc-status mc-status--${matchStatus}`}>
          {STATUS_LABEL[matchStatus]}
        </span>
      </div>

      {/* BODY */}
      <div className="mc-body">
        <h3 className="mc-title" title={match.sport}>
          {match.sport}
        </h3>

        <p className="mc-meta">
          <FaMapMarkerAlt className="mc-meta-icon" />
          <span>{match.location}</span>
        </p>

        <p className="mc-meta">
          <FaCalendarAlt className="mc-meta-icon" />
          <span>
            {formattedDate} • <b>{formattedTime}</b>
          </span>
        </p>

        <div className="mc-players">
          <div className="mc-players-row">
            <FaUsers className="mc-meta-icon" />
            <span>
              {match.current_players}/{match.max_players} Players
            </span>
          </div>
          <div
            className="mc-player-bar"
            role="progressbar"
            aria-valuenow={playersPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="mc-player-fill"
              style={{ width: `${playersPercent}%` }}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="mc-footer">
          <div className="mc-admin">
            <FaUserCircle className="mc-user-icon" />
            <span>{match.admin_name.split(" ")[0]}</span>
          </div>
          <span className="mc-arrow" aria-hidden="true">
            <FaArrowRight />
          </span>
        </div>
      </div>
    </div>
  );
}
