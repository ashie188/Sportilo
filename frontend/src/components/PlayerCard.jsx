import { memo } from "react";
import { useNavigate } from "react-router-dom";
import "./PlayerCard.css";

/* Deterministic pastel palettes so each player keeps a stable
   avatar color without needing any extra backend field. */
const AVATAR_PALETTES = [
  ["#bbf7d0", "#4ade80"],
  ["#ddd6fe", "#a78bfa"],
  ["#fbcfe8", "#f472b6"],
  ["#bae6fd", "#38bdf8"],
  ["#fde68a", "#fbbf24"],
  ["#fecaca", "#f87171"],
  ["#a5f3fc", "#22d3ee"],
  ["#e9d5ff", "#c084fc"],
];

/* Existing optimized player-card artwork. */
const CARD_IMAGES = [
  "/images/player-cards/player-card-cricket.webp",
  "/images/player-cards/player-card-football.webp",
  "/images/player-cards/player-card-court-sports.webp",
  "/images/player-cards/player-card-racket-sports.webp",
  "/images/player-cards/player-card-gaming.webp",
];

function getCardTheme(userId) {
  const key = String(userId ?? "");
  let hash = 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return {
    image: CARD_IMAGES[hash % CARD_IMAGES.length],
    palette: AVATAR_PALETTES[hash % AVATAR_PALETTES.length],
  };
}

function PlayerCard({ player }) {
  const navigate = useNavigate();

  const initials = player.name
    ? player.name
        .trim()
        .split(/\s+/)
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const overallRating = Number(player.overall_rating) || 0;
  const showUpRating = Number(player.show_up_rating) || 0;

  const { image, palette } = getCardTheme(player.user_id);

  const openProfile = () => {
    navigate(`/account/${player.user_id}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openProfile();
    }
  };

  return (
    <div
      className="pc-card"
      role="link"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={handleKeyDown}
      aria-label={`View ${player.name}'s profile`}
    >
      <div className="pc-banner">
        <img
          className="pc-banner-img"
          src={image}
          alt=""
          width={460}
          height={170}
          loading="lazy"
          decoding="async"
        />

        <div className="pc-rating-badge">
          <span aria-hidden="true">★</span>
          <span>{overallRating > 0 ? overallRating.toFixed(1) : "New"}</span>
        </div>
      </div>

      <div
        className="pc-avatar"
        style={{
          background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
        }}
        aria-hidden="true"
      >
        {initials}
      </div>

      <div className="pc-body">
        <div className="pc-identity">
          <h3 className="pc-name">{player.name}</h3>

          <p className="pc-location">
            <span aria-hidden="true">📍</span>
            {player.area}, {player.city}
          </p>
        </div>

        <div className="pc-meta">
          {showUpRating > 0 && (
            <span className="pc-meta-pill">
              Show-up {showUpRating.toFixed(1)}
            </span>
          )}

          {player.willing_to_play_turf && (
            <span className="pc-meta-pill pc-meta-pill--turf">✓ Turf</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(PlayerCard);
