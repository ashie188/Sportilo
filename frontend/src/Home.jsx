import React, { useState, useEffect, useRef } from "react";
import api from "./api/axios";
import { Link, useNavigate } from "react-router-dom";
import HomeMatchCard from "./HomeMatchCard";
import "./Home-hero_section.css";
import "./Home-featured_matches.css";
import "./Home-how_it_works.css";
import HomePlayerCard from "./components/HomePlayerCard";
import "./HomePlayerSection.css";
import "./Home-sport_strip.css";
import "./Home-promo_section.css";

function Home() {
  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [matchesError, setMatchesError] = useState(false);
  const [playersError, setPlayersError] = useState(false);

  const sportsCategoryScrollRef = useRef(null);
  const sportsCategoryAutoScrollRef = useRef(null);
  const sportsCategoryResumeTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();

    const fetchFeaturedMatches = async () => {
      try {
        setMatchesLoading(true);
        setMatchesError(false);

        const { data } = await api.get("/home/featuredmatches", {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setMatches(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch featured matches:", err);
          setMatchesError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setMatchesLoading(false);
        }
      }
    };
    

    const fetchFeaturedPlayers = async () => {
      try {
        setPlayersLoading(true);
        setPlayersError(false);

        const { data } = await api.get("/home/featuredplayers", {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setPlayers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch featured players:", err);
          setPlayersError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPlayersLoading(false);
        }
      }
    };

    fetchFeaturedMatches();
    fetchFeaturedPlayers();

    return () => controller.abort();
  }, []);

  const playersScrollRef = useRef(null);

  const scrollPlayers = (direction) => {
    const scrollElement = playersScrollRef.current;

    if (!scrollElement) return;

    const firstCard = scrollElement.querySelector(".home-player-card");
    const playersRow = scrollElement.querySelector(".players-scroll");

    if (!firstCard || !playersRow) return;

    const cardWidth = firstCard.getBoundingClientRect().width;
    const gap = Number.parseFloat(window.getComputedStyle(playersRow).gap) || 0;

    scrollElement.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  const stopSportsCategoryAutoScroll = () => {
    if (sportsCategoryAutoScrollRef.current !== null) {
      window.clearInterval(sportsCategoryAutoScrollRef.current);
      sportsCategoryAutoScrollRef.current = null;
    }
  };

  const clearSportsCategoryResumeTimer = () => {
    if (sportsCategoryResumeTimerRef.current !== null) {
      window.clearTimeout(sportsCategoryResumeTimerRef.current);
      sportsCategoryResumeTimerRef.current = null;
    }
  };

  const getSportsCategoryScrollStep = (container) => {
    const firstItem = container.querySelector(".sports-category-item");

    if (!firstItem) {
      return 0;
    }

    const secondItem = firstItem.nextElementSibling;

    if (secondItem) {
      const firstLeft = firstItem.getBoundingClientRect().left;
      const secondLeft = secondItem.getBoundingClientRect().left;
      const step = secondLeft - firstLeft;

      if (step > 0) {
        return step;
      }
    }

    return firstItem.getBoundingClientRect().width;
  };

  const startSportsCategoryAutoScroll = () => {
    stopSportsCategoryAutoScroll();
    clearSportsCategoryResumeTimer();

    const container = sportsCategoryScrollRef.current;

    if (!container || window.innerWidth >= 720) {
      return;
    }

    if (container.scrollWidth <= container.clientWidth) {
      return;
    }

    sportsCategoryAutoScrollRef.current = window.setInterval(() => {
      const currentContainer = sportsCategoryScrollRef.current;

      if (!currentContainer || document.hidden) {
        return;
      }

      const maxScrollLeft =
        currentContainer.scrollWidth - currentContainer.clientWidth;

      if (maxScrollLeft <= 0) {
        stopSportsCategoryAutoScroll();
        return;
      }

      const scrollStep = getSportsCategoryScrollStep(currentContainer);

      if (scrollStep <= 0) {
        return;
      }

      const nextScrollLeft = currentContainer.scrollLeft + scrollStep;

      if (nextScrollLeft >= maxScrollLeft - 2) {
        currentContainer.scrollTo({
          left: maxScrollLeft,
          behavior: "smooth",
        });

        stopSportsCategoryAutoScroll();

        sportsCategoryResumeTimerRef.current = window.setTimeout(() => {
          const latestContainer = sportsCategoryScrollRef.current;

          if (!latestContainer || window.innerWidth >= 720) {
            return;
          }

          latestContainer.scrollTo({
            left: 0,
            behavior: "smooth",
          });

          sportsCategoryResumeTimerRef.current = window.setTimeout(() => {
            startSportsCategoryAutoScroll();
          }, 900);
        }, 900);

        return;
      }

      currentContainer.scrollTo({
        left: Math.min(nextScrollLeft, maxScrollLeft),
        behavior: "smooth",
      });
    }, 3200);
  };

  const pauseSportsCategoryAutoScroll = () => {
    stopSportsCategoryAutoScroll();
    clearSportsCategoryResumeTimer();
  };

  const resumeSportsCategoryAutoScroll = () => {
    clearSportsCategoryResumeTimer();

    sportsCategoryResumeTimerRef.current = window.setTimeout(() => {
      startSportsCategoryAutoScroll();
    }, 1800);
  };

  const handleSportsCategoryInteractionStart = () => {
    pauseSportsCategoryAutoScroll();
  };

  const handleSportsCategoryInteractionEnd = () => {
    resumeSportsCategoryAutoScroll();
  };

  useEffect(() => {
    const container = sportsCategoryScrollRef.current;

    if (!container) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(max-width: 719px)");
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const updateAutoScroll = () => {
      pauseSportsCategoryAutoScroll();

      if (
        mediaQuery.matches &&
        !prefersReducedMotion.matches &&
        !document.hidden
      ) {
        startSportsCategoryAutoScroll();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseSportsCategoryAutoScroll();
        return;
      }

      updateAutoScroll();
    };

    const handleMediaQueryChange = () => {
      updateAutoScroll();
    };

    const handleReducedMotionChange = () => {
      updateAutoScroll();
    };

    updateAutoScroll();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaQueryChange);
    } else {
      mediaQuery.addListener(handleMediaQueryChange);
    }

    if (typeof prefersReducedMotion.addEventListener === "function") {
      prefersReducedMotion.addEventListener(
        "change",
        handleReducedMotionChange,
      );
    } else {
      prefersReducedMotion.addListener(handleReducedMotionChange);
    }

    return () => {
      stopSportsCategoryAutoScroll();
      clearSportsCategoryResumeTimer();

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleMediaQueryChange);
      } else {
        mediaQuery.removeListener(handleMediaQueryChange);
      }

      if (typeof prefersReducedMotion.removeEventListener === "function") {
        prefersReducedMotion.removeEventListener(
          "change",
          handleReducedMotionChange,
        );
      } else {
        prefersReducedMotion.removeListener(handleReducedMotionChange);
      }
    };
  }, []);

  return (
    <div className="home">
      {/* HERO SECTION */}
      <section className="hero">
        <img
          className="hero-bg"
          src="/images/Sportilo-home-background.webp"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
        />

        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-badge">
            INDIA&apos;S SPORTS &amp; GAMING COMMUNITY
          </div>

          <h1 className="hero-title">
            Find Players. <span>Play Sports.</span> Build Your Team.
          </h1>

          <p className="hero-description">
            Join matches, meet players, and become part of a growing sports
            community — on and off the field.
          </p>

          <div className="hero-buttons">
            <button
              type="button"
              className="create-btn"
              onClick={() => navigate("/create-group")}
            >
              <span>Create Match</span>
              <span className="hero-button-arrow">→</span>
            </button>

            <button
              type="button"
              className="join-btn"
              onClick={() => navigate("/join-group")}
            >
              Join Match
            </button>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
              </div>

              <div>
                <strong>100+</strong>
                <span>Players</span>
              </div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 19v-2.5A3.5 3.5 0 0 1 7.5 13h9a3.5 3.5 0 0 1 3.5 3.5V19" />
                  <circle cx="12" cy="7" r="3" />
                </svg>
              </div>

              <div>
                <strong>50+</strong>
                <span>Matches</span>
              </div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7 5h10l2 4-2 10H7L5 9l2-4Z" />
                  <path d="M9 5v4m6-4v4" />
                </svg>
              </div>

              <div>
                <strong>10+</strong>
                <span>Sports</span>
              </div>
            </div>

            <div className="hero-stat">
              <div className="hero-stat-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="7" />
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>

              <div>
                <strong>5+</strong>
                <span>Cities</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SPORTS CATEGORY STRIP */}
      <section className="sports-category-section" aria-label="Browse sports">
        <div
          className="sports-category-scroll"
          ref={sportsCategoryScrollRef}
          onPointerDown={handleSportsCategoryInteractionStart}
          onPointerUp={handleSportsCategoryInteractionEnd}
          onPointerCancel={handleSportsCategoryInteractionEnd}
          onPointerLeave={handleSportsCategoryInteractionEnd}
        >
          <div className="sports-category-list">
            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--football">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M8.2 8.5 12 7l3.8 1.5 1.4 4-2.5 3.2h-5.4l-2.5-3.2 1.4-4Z" />
                  <path d="M12 7v3.2m3.2-.7-2 1.5m2.5 3.7-2.5-1.3m-3.2 0-2.5 1.3m2.5-4.5-2-1.5" />
                </svg>
              </span>
              <span className="sports-category-label">Football</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--cricket">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 17 7.8-7.8" />
                  <path d="m8.5 18.5 7.8-7.8" />
                  <path d="M6.3 15.7 4.5 17.5a1.4 1.4 0 0 0 2 2l1.8-1.8" />
                  <path d="m14.8 8.2 1.8-1.8a1.4 1.4 0 0 1 2 2l-1.8 1.8" />
                  <circle cx="17.5" cy="17.5" r="2.5" />
                </svg>
              </span>
              <span className="sports-category-label">Cricket</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--badminton">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m7 17 8.5-8.5" />
                  <path d="M5.5 18.5 4 20" />
                  <path d="m15.5 6.5 3-3" />
                  <path d="M16 8.5c2.1.1 3.8 1 5 2.8" />
                  <path d="M14.5 10c2.2.5 3.6 1.5 4.6 3.2" />
                  <path d="M13.2 11.7c1.9.7 3 1.7 3.8 3.2" />
                </svg>
              </span>
              <span className="sports-category-label">Badminton</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--basketball">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M5.5 8.5c4.3 1.2 8.7 1.2 13 0" />
                  <path d="M5.5 15.5c4.3-1.2 8.7-1.2 13 0" />
                  <path d="M9 4.2c2.2 3.2 2.2 12.4 0 15.6" />
                  <path d="M15 4.2c-2.2 3.2-2.2 12.4 0 15.6" />
                </svg>
              </span>
              <span className="sports-category-label">Basketball</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--tennis">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M6.2 6.2c2.8 1.5 4.5 4.2 4.5 7.3 0 1.7-.5 3.1-1.4 4.5" />
                  <path d="M17.8 17.8c-2.8-1.5-4.5-4.2-4.5-7.3 0-1.7.5-3.1 1.4-4.5" />
                </svg>
              </span>
              <span className="sports-category-label">Tennis</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--volleyball">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M7 5.8c3.8 1.1 6.7 3.5 8.4 7.1" />
                  <path d="M17.5 7.3c-1.1 3.7-3.6 6.3-7.2 7.8" />
                  <path d="M5.2 14.7c3.8-.1 7.3 1.2 9.9 3.6" />
                </svg>
              </span>
              <span className="sports-category-label">Volleyball</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--gaming">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M7.2 8h9.6c2 0 3.3 1.4 4 3.4l1.1 4.1c.5 1.8-.9 3.5-2.7 3.5-1 0-1.9-.5-2.4-1.3l-1.1-1.7H8.3l-1.1 1.7c-.5.8-1.4 1.3-2.4 1.3-1.8 0-3.2-1.7-2.7-3.5l1.1-4.1C3.9 9.4 5.2 8 7.2 8Z" />
                  <path d="M7 11v4m-2-2h4" />
                  <circle cx="16.5" cy="12" r=".8" />
                  <circle cx="18.5" cy="14" r=".8" />
                </svg>
              </span>
              <span className="sports-category-label">Gaming</span>
            </div>

            <div className="sports-category-item">
              <span className="sports-category-icon sports-category-icon--more">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="6" cy="6" r="1.5" />
                  <circle cx="12" cy="6" r="1.5" />
                  <circle cx="18" cy="6" r="1.5" />
                  <circle cx="6" cy="12" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="18" cy="12" r="1.5" />
                  <circle cx="6" cy="18" r="1.5" />
                  <circle cx="12" cy="18" r="1.5" />
                  <circle cx="18" cy="18" r="1.5" />
                </svg>
              </span>
              <span className="sports-category-label">More</span>
            </div>
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
          {matchesLoading ? (
            <div
              className="home-data-loader home-matches-loader"
              role="status"
              aria-label="Loading live matches"
            >
              <span className="home-data-spinner" aria-hidden="true" />
              <span className="home-data-loader-text">
                Loading live matches...
              </span>
            </div>
          ) : matchesError ? (
            <div className="home-data-message" role="status">
              Unable to load live matches right now.
            </div>
          ) : matches.length > 0 ? (
            <div className="matches-scroll">
              {[...matches, ...matches].map((match, index) => (
                <HomeMatchCard
                  key={`${match.type}-${match.id}-${index}`}
                  match={match}
                />
              ))}
            </div>
          ) : (
            <div className="home-data-message" role="status">
              No live matches available right now.
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PLAYERS */}
      <section className="featured-players-section">
        <div className="featured-players-title-row">
          <div className="featured-players-heading">
            <div className="featured-players-heading-title">
              <span className="featured-players-star" aria-hidden="true">
                ★
              </span>

              <h2>Featured Players</h2>
            </div>

            <p>Discover top-rated players from the Sportilo community.</p>
          </div>

          <span className="featured-players-view-all">View All →</span>
        </div>

        <div className="players-carousel">
          <button
            type="button"
            className="players-carousel-button players-carousel-button--left"
            onClick={() => scrollPlayers(-1)}
            aria-label="Previous players"
          >
            ‹
          </button>

          <div ref={playersScrollRef} className="players-scroll-background">
            <div className="players-scroll">
              {playersLoading ? (
                <div
                  className="home-data-loader home-players-loader"
                  role="status"
                  aria-label="Loading featured players"
                >
                  <span className="home-data-spinner" aria-hidden="true" />
                  <span className="home-data-loader-text">
                    Loading featured players...
                  </span>
                </div>
              ) : playersError ? (
                <div className="home-data-message" role="status">
                  Unable to load featured players right now.
                </div>
              ) : players.length > 0 ? (
                players.map((player) => (
                  <HomePlayerCard key={player.user_id} player={player} />
                ))
              ) : (
                <div className="featured-players-empty">
                  <span aria-hidden="true">🏆</span>
                  <p>No featured players yet.</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="players-carousel-button players-carousel-button--right"
            onClick={() => scrollPlayers(1)}
            aria-label="Next players"
          >
            ›
          </button>
        </div>
      </section>

      {/* HOME PROMO / CTA SECTION */}

      <section className="home-promo-section" aria-label="Start playing">
        <div className="home-promo-grid">
          <article className="home-create-promo">
            <div className="home-create-promo-content">
              <span className="home-promo-eyebrow">GET THE GAME STARTED</span>

              <h2>Create Your Own Match</h2>

              <p>Get players, set your venue, and start playing!</p>

              <button
                type="button"
                className="home-promo-btn home-promo-btn-light"
                onClick={() => navigate("/create-group")}
              >
                <span>Create Match</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="home-create-sports-art" aria-hidden="true">
              <span className="home-sport-ball home-sport-ball-football">
                ⚽
              </span>

              <span className="home-sport-ball home-sport-ball-basketball">
                🏀
              </span>

              <span className="home-sport-ball home-sport-ball-shuttle">
                🏸
              </span>

              <span className="home-sport-glow home-sport-glow-one" />
              <span className="home-sport-glow home-sport-glow-two" />
            </div>
          </article>

          <article className="home-join-promo">
            <div className="home-join-promo-content">
              <span className="home-promo-eyebrow">FIND YOUR GAME</span>

              <h2>Join a Match</h2>

              <p>Find and join matches near you.</p>

              <button
                type="button"
                className="home-promo-btn home-promo-btn-blue"
                onClick={() => navigate("/join-group")}
              >
                <span>Join Match</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="home-phone-art" aria-hidden="true">
              <div className="home-phone-frame">
                <div className="home-phone-notch" />

                <div className="home-phone-screen">
                  <div className="home-phone-header">
                    <span />
                    <strong>Sportilo</strong>
                    <span />
                  </div>

                  <div className="home-phone-line home-phone-line-wide" />
                  <div className="home-phone-line" />
                  <div className="home-phone-line home-phone-line-short" />

                  <div className="home-phone-card">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="home-phone-card home-phone-card-small">
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-wrapper" aria-labelledby="how-it-works-title">
        <div className="how-container">
          <header className="how-header">
            <span className="how-eyebrow">HOW SPORTILO WORKS</span>
            <h2 id="how-it-works-title">Your next game starts here.</h2>
            <p>
              From finding players to getting on the field, everything starts
              with four simple steps.
            </p>
          </header>

          <div className="how-steps">
            <Link to="/create-group" className="how-step">
              <div className="how-step-top">
                <span className="how-step-number">01</span>
                <span className="how-step-symbol" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0M19 8v6M16 11h6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <h3>Create Match</h3>
              <p>Set your time, location, and number of players.</p>
              <span className="how-step-footer">
                Get the game started <span aria-hidden="true">↗</span>
              </span>
            </Link>

            <div className="how-step-connector" aria-hidden="true">
              <span>›</span>
            </div>

            <Link to="/player-profiles" className="how-step">
              <div className="how-step-top">
                <span className="how-step-number">02</span>
                <span className="how-step-symbol" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle
                      cx="10.5"
                      cy="10.5"
                      r="6.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="m15.5 15.5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
              <h3>Find Players</h3>
              <p>Help nearby players discover your match.</p>
              <span className="how-step-footer">
                Build your team <span aria-hidden="true">↗</span>
              </span>
            </Link>

            <div className="how-step-connector" aria-hidden="true">
              <span>›</span>
            </div>

            <Link to="/join-group" className="how-step">
              <div className="how-step-top">
                <span className="how-step-number">03</span>
                <span className="how-step-symbol" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="m5 12 4 4L19 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                </span>
              </div>
              <h3>Join Match</h3>
              <p>Find a game you like and request to join.</p>
              <span className="how-step-footer">
                Find your game <span aria-hidden="true">↗</span>
              </span>
            </Link>

            <div className="how-step-connector" aria-hidden="true">
              <span>›</span>
            </div>

            <article className="how-step how-step-last">
              <div className="how-step-top">
                <span className="how-step-number">04</span>
                <span className="how-step-symbol" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="m7 12 3.5 3.5L17 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 2.8 14.7 5l3.5.1.8 3.4 2.2 2.8-1.6 3.1-.1 3.5-3.4.8-2.8 2.2-3.1-1.6-3.5-.1-.8-3.4-2.2-2.8 1.6-3.1.1-3.5 3.4-.8L12 2.8Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <h3>Play &amp; Enjoy</h3>
              <p>Meet players, play together, and grow your community.</p>
              <span className="how-step-footer">
                Make it happen <span aria-hidden="true">✓</span>
              </span>
            </article>
          </div>

          <div className="how-bottom-message">
            <span className="how-bottom-dot" aria-hidden="true" />
            <p>Find your people. Make your next game happen.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
