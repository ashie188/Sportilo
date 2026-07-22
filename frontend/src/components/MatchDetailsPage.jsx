import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

export default function MatchDetailsPage() {
  const location = useLocation();
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [currentMatch, setCurrentMatch] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [participants, setParticipants] = useState([]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);
  const isGamingMatch = type === "gaming";

  //fech match details if not passed via state
  const fetchMatch = async () => {
    try {
      console.log("calling matchdetails fetch", type, id);

      const result = await axios.get(
        `http://localhost:3000/details/${type}/${id}`,
      );

      console.log("matchdetails fetched is", result.data);

      setCurrentMatch(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH PARTICIPANTS (INSIDE COMPONENT)
  const fetchParticipants = async () => {
    try {
      const participantsUrl = isGamingMatch
        ? `http://localhost:3000/gaming/participants/${currentMatch.id}`
        : `http://localhost:3000/joinmatch/participants/${currentMatch.id}`;

      const res = await axios.get(participantsUrl);

      setParticipants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (location.state) {
      setLoading(false);
      return;
    }
    fetchMatch();
  }, [location.state, type, id]);

  // ✅ CORRECT useEffect
  useEffect(() => {
    if (!currentMatch?.id) return;

    fetchParticipants();
  }, [currentMatch?.id, isGamingMatch]);

  if (loading) {
    return (
      <div className="mdp-page">
        <div className="mdp-empty">
          <div className="mdp-loader"></div>
          <h2>Loading Match...</h2>
        </div>
      </div>
    );
  }
  if (!currentMatch) {
    return (
      <div className="mdp-page">
        <div className="mdp-empty">
          <h2>Match not found</h2>

          <button onClick={() => navigate("/join-group")}>
            Explore Matches
          </button>
        </div>
      </div>
    );
  }

  const isFull = currentMatch.current_players >= currentMatch.max_players;
  const iscompleted = currentMatch.status === "completed";

  const percent =
    (currentMatch.current_players / currentMatch.max_players) * 100;

  // ✅ JOIN FUNCTION
  const handleJoin = async () => {
    try {
      setError("");
      setJoining(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, redirecting to login");
        setError("Please login to join the match");
        console.log("Redirecting to login page");
        setJoining(false);
        return;
      }

      const joinUrl = isGamingMatch
        ? `http://localhost:3000/gaming/join/${currentMatch.id}`
        : `http://localhost:3000/matches/join/${currentMatch.id}`;

      const res = await axios.post(
        joinUrl,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Join response:", res.data);

      setCurrentMatch(res.data.match);

      // ✅ REFRESH PARTICIPANTS
      /*fetchParticipants();*/

      alert("Joined successfully");
      setShowJoinSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error joining match");
    } finally {
      setJoining(false);
    }
  };

  const handleShare = async () => {
    const matchUrl = window.location.href;

    const title = isGamingMatch
      ? `${currentMatch.game} Lobby`
      : `${currentMatch.sport} Match`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: `I'm playing in this ${
            isGamingMatch ? "gaming lobby" : "sports match"
          }. Join me on Sportilo!`,
          url: matchUrl,
        });
      } else {
        await navigator.clipboard.writeText(matchUrl);

        alert("Match link copied to clipboard!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const date = new Date(
    isGamingMatch ? currentMatch.event_date : currentMatch.match_date,
  );

  const formattedDate = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = (
    isGamingMatch ? currentMatch.event_time : currentMatch.match_time
  )?.slice(0, 5);

  return (
    <div className="mdp-page">
      {/* HERO */}
      <div className="mdp-hero">
        <img src="/images/SportsMania_matchdetailspage9.png" alt="ground" />

        <div className="mdp-hero-overlay">
          <div className="mdp-hero-text">
            <h1>
              {isGamingMatch ? currentMatch.game : currentMatch.sport}{" "}
              <span>{isGamingMatch ? "Lobby" : "Match"}</span>
            </h1>
            <p>
              {isGamingMatch ? currentMatch.platform : currentMatch.location}
            </p>

            <div className="mdp-chip-group">
              <span className="mdp-chip">📅 {formattedDate}</span>

              <span className="mdp-chip">⏰ {formattedTime}</span>

              {isGamingMatch && (
                <span className="mdp-chip gaming-chip">
                  🎮 {currentMatch.platform}
                </span>
              )}

              <span className={`mdp-chip status ${isFull ? "full" : "open"}`}>
                {isFull ? "Full" : "Open"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mdp-container">
        {/* LEFT */}
        <div className="mdp-left">
          <div className="mdp-card-top">
            <h3>About this match</h3>
            <p>{currentMatch.description}</p>
          </div>

          <div className="mdp-card">
            <h3>{isGamingMatch ? "Lobby Details" : "Match Details"}</h3>

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">
                {isGamingMatch ? "🕹 Game" : "📍 Location"}
              </div>

              <div className="mdp-detail-value">
                {isGamingMatch ? currentMatch.game : currentMatch.location}
              </div>
            </div>

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">📅 Date</div>

              <div className="mdp-detail-value">{formattedDate}</div>
            </div>

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">⏰ Time</div>

              <div className="mdp-detail-value">{formattedTime}</div>
            </div>
            {isGamingMatch && (
              <>
                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">🎮 Platform</div>

                  <div className="mdp-detail-value">
                    {currentMatch.platform}
                  </div>
                </div>

                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">🎧 Discord</div>

                  <div className="mdp-detail-value">
                    {currentMatch.discord_link ? "Available" : "Not Added"}
                  </div>
                </div>

                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">🔐 Room Code</div>

                  <div className="mdp-detail-value">
                    {currentMatch.room_code || "Private"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="mdp-right">
          {/* JOIN CARD */}
          <div className="mdp-join-card">
            <h2>
              {iscompleted
                ? "Match Completed"
                : isFull
                  ? isGamingMatch
                    ? "Lobby Full"
                    : "Match Full"
                  : isGamingMatch
                    ? "Join Lobby"
                    : "Join Match"}
            </h2>

            <div className="mdp-player-info">
              <p>
                {currentMatch.current_players}/{currentMatch.max_players}{" "}
                players
              </p>

              <div className="mdp-progress">
                <div
                  className="mdp-progress-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            {error && (
              <p className="mdp-error">
                {error}.
                <span>
                  <Link to="/login">Login</Link>
                </span>
              </p>
            )}
            <button
              className="mdp-join-btn"
              onClick={handleJoin}
              disabled={joining || isFull || iscompleted}
            >
              {joining
                ? "Joining..."
                : iscompleted
                  ? "Match Completed"
                  : isFull
                    ? "Match Full"
                    : isGamingMatch
                      ? "Join Lobby"
                      : "Join Match"}
            </button>

            <button className="mdp-share-btn" onClick={handleShare}>
              🔗 Share Match
            </button>

            <p className="mdp-note">
              {isGamingMatch
                ? "Join the lobby and squad up with players."
                : "Join now and secure your spot in this match."}
            </p>
          </div>

          {/* ✅ PARTICIPANTS */}
          <div className="mdp-participants mdp-card">
            <h3>{isGamingMatch ? "Lobby Members" : "Players Joined"}</h3>

            {participants.length === 0 ? (
              <p>
                {isGamingMatch ? "No members joined yet" : "No players yet"}
              </p>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="mdp-player">
                  <span className="mdp-avatar">{p.name?.charAt(0) || "U"}</span>
                  <span>{p.name}</span>
                </div>
              ))
            )}
          </div>

          {/* ORGANIZER */}
          <div className="mdp-organizer">
            <h4>{isGamingMatch ? "Lobby Host" : "Organizer"}</h4>

            <div className="mdp-organizer-box">
              <div className="mdp-avatar">
                {currentMatch.admin_name?.charAt(0)}
              </div>

              <div>
                <p>{currentMatch.admin_name}</p>
                <small>{currentMatch.admin_email}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mdp-footer">
        <button onClick={() => navigate(-1)}>← Back</button>

        <button onClick={() => navigate("/join-group")}>
          Explore Matches →
        </button>
      </div>

      {showJoinSuccessModal && (
        <div className="join-success-overlay">
          <div className="join-success-modal">
            <div className="join-success-icon">⚽</div>

            <h2>You're In!</h2>

            <p className="join-success-subtitle">Welcome to the team!</p>

            <div className="join-share-tip">
              <strong>👥 Invite Your Friends</strong>

              <p>
                Know someone who'd enjoy this match? Invite your teammates and
                help complete the team. The more players join, the better the
                experience for everyone.
              </p>
            </div>

            <button
              className="join-share-btn"
              onClick={async () => {
                await handleShare();
                setShowJoinSuccessModal(false);
              }}
            >
              🔗 Share Match
            </button>

            <button
              className="join-continue-btn"
              onClick={() => setShowJoinSuccessModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
