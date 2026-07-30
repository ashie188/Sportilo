import React, { useState, useEffect } from "react";
import api from "./api/axios";
import { useNavigate } from "react-router-dom";
import HomeMatchCard from "./HomeMatchCard";
import "./Home-hero_section.css";
import "./home-sports_section.css";
import "./Home-featured_matches.css";
import "./Home-how_it_works.css";
import "./home-dual_section.css";

function Home() {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const controller = new AbortController();
    const fetchFeaturedMatches = async () => {
      try {
        const { data } = await api.get(
          "/home/featuredmatches",
          { signal: controller.signal },
        );
        setMatches(data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError")
          console.log("error at home in fetchfeaturedmatches");
      }
    };
    fetchFeaturedMatches();
    return () => controller.abort();
  }, []);

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero">
        <img
          className="hero-bg"
          src="/images/Sportmania-home-background1.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <img
              src="/images/icon_best-optimized.svg"
              alt="Sportilo"
              className="hero-badge-logo"
            />
            <span>SPORTILO</span>
            <span className="hero-divider"></span>
            <span>India's Sports & Gaming Community</span>
          </div>
          <h1>
            Find Players. <span>Play Sports.</span> Build Your Team.
          </h1>

          <div className="hero-buttons">
            <button
              className="create-btn"
              onClick={() => navigate("/create-group")}
            >
              Create Match
            </button>
            <button
              className="join-btn"
              onClick={() => navigate("/join-group")}
            >
              Join Match
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED MATCHES */}
      <section className="featured-section">
        <div className="featured-title-row">
          <h2>Live Matches</h2>

          <div className="featured-pill">🔥 Live</div>
        </div>

        <div className="scroll-background">
          <div className="matches-scroll">
            {matches.map((match) => (
              <HomeMatchCard key={`${match.type}-${match.id}`} match={match} />
            ))}
          </div>
        </div>
      </section>

      {/* SPORTS SECTION */}
      <section className="sports-section">
        <div className="sports-badge">⚡ Choose Your Game</div>
        <h2>Every Game. One Community.</h2>
        <p className="section-subtitle">
          Compete, connect and discover communities built around your favorite
          games.
        </p>

        <div className="sports-container">
          <div className="sport-card">
            <img
              src="/images/Sportmania-football_court.webp"
              alt="Football"
              loading="lazy"
              decoding="async"
              className="sport-image"
            />
            <div className="overlay">
              <h3>⚽ Football</h3>
              <p>120+ matches</p>
              <button onClick={() => navigate("/join-group")}>Explore</button>
            </div>
          </div>

          <div className="sport-card">
            <img
              src="/images/Sportmania-cricket_court.webp"
              alt="cricket"
              loading="lazy"
              decoding="async"
              className="sport-image"
            />
            <div className="overlay">
              <h3>🏏 Cricket</h3>
              <p>90+ matches</p>
              <button onClick={() => navigate("/join-group")}>Explore</button>
            </div>
          </div>

          <div className="sport-card gaming">
            <img
              src="/images/Sportmania-gaming.webp"
              alt="gaming"
              loading="lazy"
              decoding="async"
              className="sport-image"
            />
            <div className="overlay">
              <h3>🎮 Gaming</h3>
              <p>150+ lobbies</p>
              <button onClick={() => navigate("/join-group")}>Explore</button>
            </div>
          </div>

          <div className="sport-card">
            <img
              src="/images/Sportmania-tennis_court.webp"
              alt="tennis"
              loading="lazy"
              decoding="async"
              className="sport-image"
            />
            <div className="overlay">
              <h3>🎾 Tennis</h3>
              <p>40+ matches</p>
              <button onClick={() => navigate("/join-group")}>Explore</button>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL MODE BRIDGE SECTION */}
      <section className="bridge-section">
        <div className="bridge-header">
          <span className="bridge-badge">⚡ Play Anywhere</span>

          <h2>
            Sports on the field. Gaming on the screen.
            <br />
            <span>One Platform.</span>
          </h2>

          <p>
            Find teammates for local sports matches or gaming squads instantly.
          </p>
        </div>

        <div className="bridge-cards">
          <div className="bridge-card sports-card">
            <div className="card-top">
              <div className="bridge-icon">⚽</div>

              <div className="bridge-tag">Offline Sports</div>
            </div>

            <h3>Play in the real world</h3>

            <p>Join local football, cricket and tennis matches near you.</p>

            <div className="bridge-sports">
              <span>⚽ Football</span>
              <span>🏏 Cricket</span>
              <span>🎾 Tennis</span>
            </div>

            <button onClick={() => navigate("/join-group")}>
              Explore Matches →
            </button>
          </div>

          <div className="bridge-center">
            <div className="energy-ring">⚡</div>
          </div>

          <div className="bridge-card gaming-card">
            <div className="card-top">
              <div className="bridge-icon">🎮</div>

              <div className="bridge-tag gaming-tag">Online Gaming</div>
            </div>

            <h3>Find Your Squad</h3>

            <p>Join squads and compete with players at your level.</p>

            <div className="bridge-sports">
              <span>🔫 BGMI</span>
              <span>🎯 Valorant</span>
              <span>🎯 Free Fire</span>
            </div>

            <button onClick={() => navigate("/join-group")}>
              Find Squad →
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}

      <section className="how-wrapper">
        <div className="how-container">
          {/* TOP FLEX */}
          <div className="how-top">
            <div className="how-heading">
              <img src="/images/icon_best-optimized.svg" className="how-logo" />
              <h2>Play Smarter with Sportilo</h2>
            </div>

            <div className="how-info">
              <p>
                Find matches, connect with players, and organize games
                effortlessly. Everything you need to play sports — all in one
                place.
              </p>
            </div>
          </div>

          {/* IMAGE */}

          {/* BOTTOM SECTION */}
          <div className="how-bottom">
            <div className="how-box">
              <h3>Create Match</h3>
              <p>Set time, location and players.</p>
            </div>

            <div className="how-box">
              <h3>Find Players</h3>
              <p>Players discover your match.</p>
            </div>

            <div className="how-box">
              <h3>Join Match</h3>
              <p>Request and get accepted.</p>
            </div>

            <div className="how-box">
              <h3>Play & Enjoy</h3>
              <p>Meet players and play games.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
