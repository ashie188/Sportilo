import { useEffect, useState } from "react";
import axios from "axios";
import MatchCard from "./components/MatchCard";
import GamingMatchCard from "./gaming/GamingMatchCard";

export default function JoinMatch({ token }) {
  const [matches, setMatches] = useState([]);
  const [mode, setMode] = useState("offline");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 28;

  useEffect(() => {
    setMatches([]);

    setOffset(0);

    setHasMore(true);

    fetchMatches(0);
  }, [mode]);

  const fetchMatches = async (newOffset) => {
    try {
      setLoading(true);

      const url =
        mode === "offline"
          ? `http://localhost:3000/joinmatch?limit=${LIMIT}&offset=${newOffset}`
          : `http://localhost:3000/gaming?limit=${LIMIT}&offset=${newOffset}`;

      const res = await axios.get(url);

      if (res.data.length < LIMIT) {
        setHasMore(false);
      }

      if (newOffset === 0) {
        setMatches(res.data);
      } else {
        setMatches((prev) => [...prev, ...res.data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMoreMatches = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchMatches(newOffset);
  };

  const handleJoin = async (id) => {
    alert("Joined match " + id);
  };

  // 🔍 FILTER
  const filteredMatches = matches.filter((m) =>
    mode === "offline"
      ? m.location?.toLowerCase().includes(search.toLowerCase())
      : m.game?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="jm-wrapper">
      {!loading && filteredMatches.length === 0 && (
        <p className="jm-empty">No matches found</p>
      )}
      {/* HERO stays same */}

      <section className="jm-hero">
        <div className="jm-container">
          <div className="jm-hero-content">
            <h1>
              Play More. <span>Connect Faster.</span>
            </h1>
            <p>
              Join local matches, meet players, and turn every game into an
              experience.
            </p>
          </div>

          <div className="jm-hero-image">
            <img src="../images/SportMania-join_match.jpg" alt="sports" />
          </div>
        </div>
      </section>

      {/* MATCH SECTION */}
      <section className="jm-matches">
        <div className="jm-container">
          <h2 className="jm-heading">Available Matches</h2>

          <div className="jm-toggle-wrapper">
            <div className="create-toggle">
              <button
                disabled={loading}
                className={mode === "offline" ? "active-toggle" : ""}
                onClick={() => setMode("offline")}
              >
                ⚽ Offline Sports
              </button>

              <button
                disabled={loading}
                className={mode === "online" ? "active-toggle" : ""}
                onClick={() => setMode("online")}
              >
                🎮 Online Gaming
              </button>
            </div>
          </div>

          {/* 🔍 SEARCH */}
          <div className="jm-search">
            <input
              type="text"
              placeholder={
                mode === "offline"
                  ? "Search by location..."
                  : "Search by game..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <div className="jm-loading">Loading matches...</div>}

          <div className="jm-grid">
            {filteredMatches.map((match) =>
              mode === "offline" ? (
                <MatchCard key={match.id} match={match} />
              ) : (
                <GamingMatchCard key={match.id} match={match} />
              ),
            )}
          </div>
        </div>
      </section>

      <div className="jm-load-section">
        {hasMore ? (
          <button className="jm-load-btn" onClick={handleLoadMoreMatches}>
            Load More Matches
          </button>
        ) : (
          <div className="jm-no-more">
            <p>No more matches available</p>
            <button onClick={() => (window.location.href = "/create-group")}>
              Create Match
            </button>
          </div>
        )}
      </div>

      <section className="jm-bottom-cta">
        <div className="jm-container jm-bottom-flex">
          {/* LEFT */}
          <div className="jm-bottom-left">
            <h2>Create Your Own Match</h2>
            <button onClick={() => (window.location.href = "/create-group")}>
              Create Match
            </button>
          </div>

          {/* RIGHT */}
          <div className="jm-bottom-right">
            <h3>Craft the Game. Shape the Experience.</h3>

            <p>
              Take the lead. Set the pace. Bring players together and turn every
              match into something worth remembering.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
