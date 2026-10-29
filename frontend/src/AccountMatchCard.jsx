import { memo } from "react";
import "./AccountMatchCard.css";

/* =========================================================
   SPORT / GAME → ACCENT COLOR
   Keyed by the exact strings Account.jsx's OFFLINE_GAMES /
   ONLINE_GAMES lists already use. Unmapped values (a sport or
   game added later without a matching code change) fall back
   to the default blue rather than breaking.
========================================================= */

const SPORT_ACCENTS = {
  football: "#2563eb",
  cricket: "#d97706",
  tennis: "#16a34a",
  badminton: "#7c3aed",
  basketball: "#ea580c",
  volleyball: "#0ea5e9",
  "table tennis": "#db2777",
  bgmi: "#7c3aed",
  valorant: "#e11d48",
  "free fire": "#ea580c",
  "call of duty": "#475569",
  fifa: "#16a34a",
  "ea fc": "#16a34a",
  efootball: "#16a34a",
  "counter-strike 2": "#d97706",
};

const DEFAULT_ACCENT = "#2563eb";

function getAccentColor(name) {
  if (!name) return DEFAULT_ACCENT;
  return SPORT_ACCENTS[name.toLowerCase()] || DEFAULT_ACCENT;
}

/*
 * Soft tinted background for the sport icon chip, derived from
 * the same accent color. Done in JS rather than CSS color-mix()
 * for reliable cross-browser support.
 */
function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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

function IconShare(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M7 17L17 7M9 7h8v8" />
    </svg>
  );
}

function AccountMatchCard({ match, onClick, isHistory }) {
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
          text: "Join this match on Sportilo",
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

  const handleCardActivate = () => {
    if (!isHistory) {
      onClick(match);
    }
  };

  const sportOrGame = isGamingMatch ? match.game : match.sport;
  const accentColor = getAccentColor(sportOrGame);
  const accentSoft = hexToRgba(accentColor, 0.12);

  const totalSlots = Number(match.max_players) || 0;
  const filledSlots = Number(match.current_players) || 0;
  const progressPercent =
    totalSlots > 0 ? Math.min(100, (filledSlots / totalSlots) * 100) : 0;

  return (
    <article
      className={`accm-card ${isHistory ? "history-card" : ""}`}
      style={{ "--accm-accent": accentColor, "--accm-accent-soft": accentSoft }}
      onClick={handleCardActivate}
      role={isHistory ? undefined : "button"}
      tabIndex={isHistory ? undefined : 0}
      onKeyDown={
        isHistory
          ? undefined
          : (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardActivate();
              }
            }
      }
    >
      {/* TOP STRIP */}
      <div className="accm-strip" />

      {/* HEADER */}
      <div className="accm-header">
        <div className="accm-sport-chip">
          <span className="accm-sport-icon">
            {isGamingMatch ? (
              <IconGamepad width={14} height={14} />
            ) : (
              <IconBall width={14} height={14} />
            )}
          </span>
          <span className="accm-sport">{sportOrGame}</span>
        </div>

        <span className={`accm-status ${isCompleted ? "completed" : "open"}`}>
          {match.status}
        </span>
      </div>

      {/* SUBTITLE */}
      <p className="accm-location">
        <IconMapPin width={13} height={13} />
        {isGamingMatch ? match.platform : match.location}
      </p>

      {/* TIME */}
      <p className="accm-time">
        <IconCalendar width={13} height={13} />
        {formattedDate} • {formattedTime}
      </p>

      {/* PLAYERS */}
      <p className="accm-players">
        <IconUsers width={13} height={13} />
        {match.current_players}/{match.max_players}
        {isGamingMatch ? " members" : " players"}
      </p>

      {/* PROGRESS */}
      <div className="accm-progress-track">
        <div
          className="accm-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ADMIN */}
      <div className="accm-admin">
        <div className="accm-admin-left">
          <div className="accm-avatar">{match.admin_name?.charAt(0)}</div>
          <span>{match.admin_name}</span>
        </div>

        {!isHistory && (
          <button
            type="button"
            className="accm-share-btn"
            onClick={handleShare}
            aria-label="Share this match"
          >
            <IconShare width={14} height={14} />
          </button>
        )}
      </div>
    </article>
  );
}

export default memo(AccountMatchCard);
