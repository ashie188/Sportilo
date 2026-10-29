import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomeMatchCard.css";

import footballImage from "/images/cardimages/match-football.webp";
import cricketImage from "/images/cardimages/match-cricket.webp";
import badmintonImage from "/images/cardimages/match-badminton.webp";
import gamingImage from "/images/cardimages/match-gaming.webp";
import bgmiImage from "/images/cardimages/match-bgmi.webp";
import allSportsImage from "/images/cardimages/match-allsports.webp";

function HomeMatchCard({ match }) {
  const navigate = useNavigate();

  const isGaming = match.type === "gaming";

  const currentPlayers = Number(match.current_players) || 0;
  const maxPlayers = Number(match.max_players) || 1;

  const playerPercentage = Math.min((currentPlayers / maxPlayers) * 100, 100);

  const isCompleted = match.status === "completed";
  const isFull = currentPlayers >= maxPlayers;

  const displayStatus = isCompleted ? "Completed" : isFull ? "Full" : "Live";

  const title = isGaming
    ? match.game || "Gaming Match"
    : match.sport || "Sports Match";

  const location = isGaming
    ? match.platform || "Online"
    : [match.area, match.city].filter(Boolean).join(", ") ||
      match.location ||
      "Location not specified";

  const getMatchImage = () => {
    if (isGaming) {
      const gameName = (match.game || "").trim().toLowerCase();

      if (
        gameName === "bgmi" ||
        gameName.includes("battlegrounds mobile india")
      ) {
        return bgmiImage;
      }

      return gamingImage;
    }

    const sportName = (match.sport || "").trim().toLowerCase();

    if (sportName === "football") {
      return footballImage;
    }

    if (sportName === "cricket") {
      return cricketImage;
    }

    if (sportName === "badminton") {
      return badmintonImage;
    }

    return allSportsImage;
  };

  const matchImage = getMatchImage();

  const handleCardClick = () => {
    navigate(`/match/${match.type}/${match.id}`, {
      state: match,
    });
  };

  const handleButtonClick = (event) => {
    event.stopPropagation();

    handleCardClick();
  };

  return (
    <article
      className={`home-match-card ${
        isGaming ? "home-match-gaming" : "home-match-sports"
      }`}
      onClick={handleCardClick}
    >
      {/* BACKGROUND IMAGE */}
      <div
        className="home-match-visual"
        style={{
          backgroundImage: `url(${matchImage})`,
        }}
      >
        <div className="home-match-overlay" />
      </div>

      {/* TOP BADGES */}
      <div className="home-match-top">
        <span
          className={`home-match-status ${
            isCompleted ? "completed" : isFull ? "full" : "live"
          }`}
        >
          {displayStatus}
        </span>

        <span className="home-match-category">
          {isGaming ? "🎮 Gaming" : `📍 ${match.sport || "Sports"}`}
        </span>
      </div>

      {/* CONTENT */}
      <div className="home-match-content">
        <div className="home-match-main">
          <h3>{title}</h3>

          <p className="home-match-location">
            {isGaming ? "🕹️" : "📍"} {location}
          </p>
        </div>

        <div className="home-match-bottom">
          <div className="home-match-player-info">
            <span>
              {currentPlayers}/{maxPlayers} Players
            </span>

            <div className="home-match-progress">
              <div
                className="home-match-progress-fill"
                style={{
                  width: `${playerPercentage}%`,
                }}
              />
            </div>
          </div>

          <button
            type="button"
            className="home-match-join-btn"
            onClick={handleButtonClick}
          >
            {isCompleted || isFull ? "View Match" : "Join Now"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default HomeMatchCard;
