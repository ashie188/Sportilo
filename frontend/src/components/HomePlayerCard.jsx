import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePlayerCard.css";

import footballImage from "/images/cardimages/match-football.webp";
import cricketImage from "/images/cardimages/match-cricket.webp";
import badmintonImage from "/images/cardimages/match-badminton.webp";
import gamingImage from "/images/cardimages/match-gaming.webp";
import bgmiImage from "/images/cardimages/match-bgmi.webp";
import allSportsImage from "/images/cardimages/match-allsports.webp";

function HomePlayerCard({ player }) {
  const navigate = useNavigate();

  const offlineGames = Array.isArray(player.offline_games)
    ? player.offline_games
    : [];

  const onlineGames = Array.isArray(player.online_games)
    ? player.online_games
    : [];

  const games = [...offlineGames, ...onlineGames]
    .map((game) => {
      if (typeof game === "string") {
        return game.trim();
      }

      if (game && typeof game === "object") {
        return game.name || game.game || game.sport || null;
      }

      return null;
    })
    .filter(Boolean);

  const primaryGame = games[0] || "Sportilo Player";

  const visibleGames = games.slice(0, 2);
  const extraGames = Math.max(0, games.length - visibleGames.length);

  const ratingValue = Number(player.overall_rating || 0);
  const rating = ratingValue.toFixed(1);

  const getSportTheme = (game) => {
    const value = String(game || "")
      .trim()
      .toLowerCase();

    if (value === "football") return "football";
    if (value === "cricket") return "cricket";
    if (value === "badminton") return "badminton";
    if (value === "basketball") return "basketball";
    if (value === "volleyball") return "volleyball";
    if (value === "tennis") return "tennis";

    if (
      value === "bgmi" ||
      value === "valorant" ||
      value === "free fire" ||
      value === "gaming"
    ) {
      return "gaming";
    }

    return "default";
  };

  const getPlayerImage = (game) => {
    const value = String(game || "")
      .trim()
      .toLowerCase();

    if (value === "football") {
      return footballImage;
    }

    if (value === "cricket") {
      return cricketImage;
    }

    if (value === "badminton") {
      return badmintonImage;
    }

    if (value === "bgmi" || value.includes("battlegrounds mobile india")) {
      return bgmiImage;
    }

    if (value === "valorant" || value === "free fire" || value === "gaming") {
      return gamingImage;
    }

    return allSportsImage;
  };

  const getInitials = () => {
    const name = String(player.name || "Sportilo Player")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (name.length === 0) {
      return "SP";
    }

    if (name.length === 1) {
      return name[0].charAt(0).toUpperCase();
    }

    return `${name[0].charAt(0)}${name[name.length - 1].charAt(
      0,
    )}`.toUpperCase();
  };

  /*
    Supports common existing profile image field names
    without requiring any backend changes.
  */
  const avatarSrc =
    player.profile_picture ||
    player.profile_image ||
    player.profile_photo ||
    player.avatar ||
    player.image ||
    null;

  const sportTheme = getSportTheme(primaryGame);
  const playerImage = getPlayerImage(primaryGame);
  const initials = getInitials();

  const playerName = player.name || "Sportilo Player";

  const location = [player.area || null, player.city || null]
    .filter(Boolean)
    .join(", ");

  const handleCardClick = () => {
    navigate(`/account/${player.user_id}`);
  };

  return (
    <article
      className="home-player-card"
      data-sport={sportTheme}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* SPORTS BANNER */}
      <div
        className="home-player-card__banner"
        style={{
          backgroundImage: `url(${playerImage})`,
        }}
      >
        <div className="home-player-card__banner-overlay" />

        <div className="home-player-card__rating">
          <span>★</span>
          {rating}
        </div>
      </div>

      {/* PLAYER AVATAR */}
      <div className="home-player-card__avatar">
        <span className="home-player-card__avatar-initials">{initials}</span>

        {avatarSrc && (
          <img
            src={avatarSrc}
            alt={playerName}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      {/* PLAYER CONTENT */}
      <div className="home-player-card__content">
        <h3 title={playerName}>{playerName}</h3>

        <p
          className="home-player-card__location"
          title={location || "Location not added"}
        >
          <span className="home-player-card__location-icon">📍</span>
          {location || "Location not added"}
        </p>

        {/* SPORTS */}
        <div className="home-player-card__tags">
          {visibleGames.length > 0 ? (
            visibleGames.map((game, index) => (
              <span
                key={`${game}-${index}`}
                className="home-player-card__tag"
                title={game}
              >
                {game}
              </span>
            ))
          ) : (
            <span className="home-player-card__tag">Player</span>
          )}

          {extraGames > 0 && (
            <span className="home-player-card__tag home-player-card__tag--extra">
              +{extraGames}
            </span>
          )}
        </div>

        {/* RATING COUNT */}
        <div className="home-player-card__footer">
          <span className="home-player-card__footer-star">★</span>
          <span>
            {player.rating_count || 0}{" "}
            {Number(player.rating_count || 0) === 1 ? "rating" : "ratings"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default HomePlayerCard;
