import React from "react";
import {
  FaGamepad,
  FaCalendarAlt,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./GamingMatchCard.css";

const CARD_IMAGES = "/images/cardimages";

const GAME_IMAGE = {
  bgmi: `${CARD_IMAGES}/match-bgmi.webp`,
};

const FALLBACK_IMAGE = `${CARD_IMAGES}/match-gaming.webp`;

const GAME_EMOJI = {
  default: "🎮",
};

const getGameImage = (game) =>
  GAME_IMAGE[game?.toLowerCase()] ?? FALLBACK_IMAGE;

const getGameEmoji = () => GAME_EMOJI.default;

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

export default function GamingMatchCard({ match, imagePriority = false }) {
  const navigate = useNavigate();

  const matchStatus = getStatus(match);

  const date = new Date(match.event_date);
  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = match.event_time?.slice(0, 5);

  const playersPercent = Math.min(
    100,
    Math.round((match.current_players / match.max_players) * 100),
  );

  const handleOpen = () =>
    navigate(`/match/${match.type}/${match.id}`, { state: match });

  return (
    <div
      className="gmc-card"
      role="button"
      tabIndex={0}
      aria-label={`${match.game} match on ${match.platform}`}
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleOpen();
        if (e.key === " ") {
          e.preventDefault();
          handleOpen();
        }
      }}
    >
      {/* TOP — game photo with icon badge + status pill */}
      <div className="gmc-media">
        <img
          className="gmc-media-img"
          src={getGameImage(match.game)}
          alt=""
          loading={imagePriority ? "eager" : "lazy"}
          fetchPriority={imagePriority ? "high" : "auto"}
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <span className="gmc-sport-badge" aria-hidden="true">
          {getGameEmoji()}
        </span>
        <span className={`gmc-status gmc-status--${matchStatus}`}>
          {STATUS_LABEL[matchStatus]}
        </span>
      </div>

      {/* BODY */}
      <div className="gmc-body">
        <h3 className="gmc-title" title={match.game}>
          {match.game}
        </h3>

        <p className="gmc-meta">
          <FaGamepad className="gmc-meta-icon" />
          <span>{match.platform}</span>
        </p>

        <p className="gmc-meta">
          <FaCalendarAlt className="gmc-meta-icon" />
          <span>
            {formattedDate} • <b>{formattedTime}</b>
          </span>
        </p>

        <div className="gmc-players">
          <div className="gmc-players-row">
            <FaUsers className="gmc-meta-icon" />
            <span>
              {match.current_players}/{match.max_players} Players
            </span>
          </div>
          <div
            className="gmc-player-bar"
            role="progressbar"
            aria-valuenow={playersPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="gmc-player-fill"
              style={{ width: `${playersPercent}%` }}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="gmc-footer">
          <div className="gmc-admin">
            <div className="gmc-avatar" aria-hidden="true">
              {match.admin_name?.charAt(0)}
            </div>
            <span>{match.admin_name.split(" ")[0]}</span>
          </div>
          <span className="gmc-arrow" aria-hidden="true">
            <FaArrowRight />
          </span>
        </div>
      </div>
    </div>
  );
}
