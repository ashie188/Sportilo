import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserFriends,
  FaLayerGroup,
  FaGamepad,
  FaArrowRight,
  FaChevronDown,
} from "react-icons/fa";
import api from "./api/axios";
import MatchCard from "./components/MatchCard";
import GamingMatchCard from "./gaming/GamingMatchCard";
import "./joinMatch.css";

const HERO_FEATURES = [
  { icon: FaUserFriends, title: "Real Players", sub: "Local & Online" },
  { icon: FaLayerGroup, title: "All Skill Levels", sub: "Everyone's Welcome" },
  { icon: FaGamepad, title: "More Games", sub: "Sports & Gaming" },
];

// ⚠️ Confirm this route exists for the "Find Players" CTA
const FIND_PLAYERS_PATH = "/players";

const LIMIT = 16;

export default function JoinMatch({ token }) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [mode, setMode] = useState("offline");
  const [search, setSearch] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    setMatches([]);
    setOffset(0);
    setHasMore(true);
    setInitialLoading(true);

    const fetchInitialMatches = async () => {
      try {
        const url =
          mode === "offline"
            ? `/joinmatch?limit=${LIMIT}&offset=0`
            : `/gaming?limit=${LIMIT}&offset=0`;

        const res = await api.get(url, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const data = Array.isArray(res.data) ? res.data : [];

        setMatches(data);
        setHasMore(data.length === LIMIT);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Failed to fetch matches:", err);
          setMatches([]);
          setHasMore(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
        }
      }
    };

    fetchInitialMatches();

    return () => controller.abort();
  }, [mode]);

  const fetchMatches = async (newOffset) => {
    if (initialLoading || loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const url =
        mode === "offline"
          ? `/joinmatch?limit=${LIMIT}&offset=${newOffset}`
          : `/gaming?limit=${LIMIT}&offset=${newOffset}`;

      const res = await api.get(url);

      const data = Array.isArray(res.data) ? res.data : [];

      setMatches((prev) => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
      setOffset(newOffset);
    } catch (err) {
      console.error("Failed to load more matches:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMoreMatches = () => {
    if (!initialLoading && !loadingMore && hasMore) {
      fetchMatches(offset + LIMIT);
    }
  };

  // 🔍 FILTER
  const filteredMatches = matches.filter((m) =>
    mode === "offline"
      ? m.location?.toLowerCase().includes(search.toLowerCase())
      : m.game?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="jm-wrapper">
      {/* HERO */}
      {/* HERO */}
      <section className="jm-hero">
        <img
          className="jm-hero-bg"
          src="/images/Sportilo-join_match.webp"
          alt=""
          width="1920"
          height="450"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        <div className="jm-container">
          <div className="jm-hero-content">
            <span className="jm-hero-label">FIND LOCAL PLAYERS</span>
            <h1>
              Play More. <span>Connect Faster.</span>
            </h1>
            <p>
              Join local matches, meet players, and turn every game into an
              experience.
            </p>

            <div className="jm-hero-features">
              {HERO_FEATURES.map(({ icon: Icon, title, sub }) => (
                <div className="jm-hero-feature" key={title}>
                  <span className="jm-hero-feature-icon">
                    <Icon />
                  </span>
                  <div className="jm-hero-feature-text">
                    <strong>{title}</strong>
                    <small>{sub}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MATCH SECTION */}
      <section className="jm-matches">
        <div className="jm-container">
          <div className="jm-matches-head">
            <div className="jm-matches-title">
              <h2 className="jm-heading">Available Matches</h2>
              <p className="jm-subheading">
                Find and join matches happening near you.
              </p>
            </div>

            <div className="jm-toggle-wrapper">
              <div className="create-toggle">
                <button
                  disabled={initialLoading || loadingMore}
                  className={mode === "offline" ? "active-toggle" : ""}
                  onClick={() => setMode("offline")}
                >
                  ⚽ Offline Sports
                </button>

                <button
                  type="button"
                  className={`mode-switch ${mode === "online" ? "online" : ""}`}
                  role="switch"
                  aria-checked={mode === "online"}
                  aria-label="Switch between offline sports and online gaming"
                  disabled={initialLoading || loadingMore}
                  onClick={() =>
                    setMode((current) =>
                      current === "offline" ? "online" : "offline",
                    )
                  }
                >
                  <span className="mode-switch-thumb" />
                </button>

                <button
                  disabled={initialLoading || loadingMore}
                  className={mode === "online" ? "active-toggle" : ""}
                  onClick={() => setMode("online")}
                >
                  🎮 Online Gaming
                </button>
              </div>
            </div>
          </div>

          <div className="jm-results">
            {initialLoading ? (
              <div
                className="jm-loading jm-loading--spinner"
                role="status"
                aria-live="polite"
              >
                <span className="jm-loading-spinner" aria-hidden="true" />
                <span>
                  {mode === "offline"
                    ? "Loading offline matches..."
                    : "Loading online gaming matches..."}
                </span>
              </div>
            ) : (
              <div className="jm-grid">
                {filteredMatches.map((match, index) =>
                  mode === "offline" ? (
                    <MatchCard
                      key={match.id}
                      match={match}
                      imagePriority={index === 0}
                    />
                  ) : (
                    <GamingMatchCard
                      key={match.id}
                      match={match}
                      imagePriority={index === 0}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="jm-container">
        <div className="jm-load-section">
          {hasMore ? (
            <button
              className="jm-load-btn"
              onClick={handleLoadMoreMatches}
              disabled={initialLoading || loadingMore || !hasMore}
            >
              {loadingMore ? "Loading..." : "Load More Matches"}
              {!loadingMore && <FaChevronDown />}
            </button>
          ) : (
            <div className="jm-no-more">
              <p>No more matches available</p>
              <button onClick={() => navigate("/create-group")}>
                Create Match
              </button>
            </div>
          )}

          {!initialLoading && matches.length > 0 && (
            <p className="jm-load-caption" aria-live="polite">
              Showing {filteredMatches.length} matches
            </p>
          )}
        </div>
      </div>

      <section className="jm-bottom-cta">
        <div className="jm-container">
          <div className="jm-cta-card">
            <div className="jm-cta-text">
              <h2>Can't find a match? Create your own or find players!</h2>
              <p>
                Be the one to bring players together.{" "}
                <span>
                  Whether it's a casual game in your locality or a squad for
                  your favourite online game — it starts here.
                </span>
              </p>
            </div>

            <div className="jm-cta-actions">
              <button
                className="jm-cta-primary"
                onClick={() => navigate("/create-group")}
              >
                Create Match <FaArrowRight />
              </button>
              <button
                className="jm-cta-secondary"
                onClick={() => navigate(FIND_PLAYERS_PATH)}
              >
                Find Players <FaArrowRight />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
