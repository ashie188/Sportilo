import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./MatchDetailsPage.css";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function MatchDetailsPage() {
  const location = useLocation();
  const { type, id } = useParams();
  const navigate = useNavigate();

  const [currentMatch, setCurrentMatch] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [participants, setParticipants] = useState([]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [joinForm, setJoinForm] = useState({
    player_identifier: "",
    skill_level: "Beginner",
  });
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);
  //new states for update note
  const [updateNote, setUpdateNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateError, setUpdateError] = useState(false);

  const isGamingMatch = type === "gaming";

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isOrganizer = user?.email === currentMatch?.admin_email;

  //fech match details if not passed via state
  const fetchMatch = async () => {
    try {
      const result = await api.get(`/details/${type}/${id}`);

      setCurrentMatch(result.data);
      setUpdateNote(result.data.update_note || "");
    } catch (err) {
      console.log("error at matchdeatilpage fetchmatch");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH PARTICIPANTS (INSIDE COMPONENT)
  const fetchParticipants = async () => {
    try {
      const participantsUrl = isGamingMatch
        ? `/gaming/participants/${currentMatch.id}`
        : `/joinmatch/participants/${currentMatch.id}`;

      const res = await api.get(participantsUrl);

      setParticipants(res.data);
    } catch (err) {
      console.log("error at matchdetailspage fetchparticipants");
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

  const isFull = currentMatch
      ? currentMatch.current_players >= currentMatch.max_players
     : false;
  const iscompleted = currentMatch?.status === "completed";

  const buildShareText = useCallback(() => {
    const slotsLeft = currentMatch.max_players - currentMatch.current_players;

    if (iscompleted) {
      return isGamingMatch
        ? `This ${currentMatch.game} lobby just wrapped up 🎮 Find your own squad on Sportilo before the next one fills up.`
        : `This ${currentMatch.sport} match just wrapped up 🏆 Find your own game on Sportilo before the next one fills up.`;
    }

    if (isFull || slotsLeft <= 0) {
      return isGamingMatch
        ? `This ${currentMatch.game} lobby is already full 🔥 That's how fast squads fill up on Sportilo — find an open one before it happens again.`
        : `This ${currentMatch.sport} match is already full 🔥 That's how fast matches fill up on Sportilo — find an open one before it happens again.`;
    }

    const isUrgent = slotsLeft <= 2;

    if (isGamingMatch) {
      return isUrgent
        ? `🔥 Only ${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left for ${currentMatch.game}! Squad's almost full — grab your spot now.`
        : `🎮 Players wanted for ${currentMatch.game} on ${currentMatch.platform}. Squad up in seconds on Sportilo.`;
    }

    return isUrgent
      ? `⚡ Only ${slotsLeft} spot${slotsLeft === 1 ? "" : "s"} left for ${currentMatch.sport} at ${currentMatch.location}! Don't miss this one.`
      : `⚽ ${currentMatch.sport} match at ${currentMatch.location} — players wanted. Lock in your spot on Sportilo.`;
  }, [currentMatch, isGamingMatch, isFull, iscompleted]);

  // hook, blank line, labeled CTA, then the link on its own line —
  // renders directly beneath the attached image in the native share sheet
  const buildFullShareMessage = useCallback(() => {
    const hook = buildShareText();
    const matchUrl = window.location.href;
    return `${hook}\n\n👉 Join here:\n${matchUrl}`;
  }, [buildShareText]);

  const generateShareCard = useCallback(() => {
    return new Promise((resolve) => {
      const width = 600;
      const height = 315;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { alpha: false });

      const bg = ctx.createLinearGradient(0, 0, width, height);
      if (isGamingMatch) {
        bg.addColorStop(0, "#2e1065");
        bg.addColorStop(1, "#7c3aed");
      } else {
        bg.addColorStop(0, "#172554");
        bg.addColorStop(1, "#2563eb");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(
        width - 80,
        60,
        10,
        width - 80,
        60,
        220,
      );
      glow.addColorStop(
        0,
        isGamingMatch ? "rgba(245,158,11,0.35)" : "rgba(56,189,248,0.35)",
      );
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "700 20px Arial, sans-serif";
      ctx.fillText("SPORTILO", 32, 44);

      const pillLabel = isGamingMatch ? "🎮 GAMING" : "⚽ SPORTS";
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      roundRect(ctx, 32, 64, isGamingMatch ? 118 : 106, 30, 15);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 13px Arial, sans-serif";
      ctx.fillText(pillLabel, 46, 84);

      const title = isGamingMatch ? currentMatch.game : currentMatch.sport;
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 40px Arial, sans-serif";
      ctx.fillText(title, 32, 150);

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "500 18px Arial, sans-serif";
      ctx.fillText(
        isGamingMatch
          ? `🕹 ${currentMatch.platform}`
          : `📍 ${currentMatch.location}`,
        32,
        182,
      );

      const slotsLeft = currentMatch.max_players - currentMatch.current_players;
      const ctaText =
        iscompleted || isFull || slotsLeft <= 0
          ? "See more matches on Sportilo →"
          : `${slotsLeft <= 2 ? "🔥 Only " : ""}${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left — Join now!`;

      ctx.fillStyle = "rgba(255,255,255,0.95)";
      roundRect(ctx, 32, height - 76, width - 64, 48, 14);
      ctx.fill();
      ctx.fillStyle = isGamingMatch ? "#5b21b6" : "#1d4ed8";
      ctx.font = "700 20px Arial, sans-serif";
      ctx.fillText(ctaText, 50, height - 44);

      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
    });
  }, [currentMatch, isGamingMatch, isFull, iscompleted]);

  const handleShare = useCallback(async () => {
    const title = isGamingMatch
      ? `${currentMatch.game} Lobby`
      : `${currentMatch.sport} Match`;
    const matchUrl = window.location.href;
    const fullMessage = buildFullShareMessage();

    try {
      const blob = await generateShareCard();
      const file = new File([blob], "sportilo-match.jpg", {
        type: "image/jpeg",
      });

      // image + text together — share sheet renders the image first,
      // fullMessage (hook + link) directly beneath it
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          text: fullMessage,
          files: [file],
        });
        return;
      }

      // no file-share support — text + url as separate fields, the
      // native share UI still lays them out title/text/link in order
      if (navigator.share) {
        await navigator.share({ title, text: buildShareText(), url: matchUrl });
        return;
      }

      // no native share at all — clipboard fallback keeps the same
      // hook + link structure
      await navigator.clipboard.writeText(fullMessage);
      alert("Match link copied to clipboard!");
    } catch (err) {
      // user closing the share sheet without picking anything is normal,
      // not a real error — don't log it as one
      if (err.name !== "AbortError") {
        console.error("handleShare failed:", err);
      }
    }
  }, [
    currentMatch,
    isGamingMatch,
    buildShareText,
    buildFullShareMessage,
    generateShareCard,
  ]);

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

  const percent =
    (currentMatch.current_players / currentMatch.max_players) * 100;

  // ✅ JOIN FUNCTION
  const handleJoin = async () => {
    try {
      setError("");
      setJoining(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login to join the match");
        return;
      }

      if (isGamingMatch && !joinForm.player_identifier.trim()) {
        setError("Game Username / ID is required.");
        return;
      }

      const joinUrl = isGamingMatch
        ? `/gaming/join/${currentMatch.id}`
        : `/matches/join/${currentMatch.id}`;

      const payload = {
        skill_level: joinForm.skill_level,
      };

      if (isGamingMatch) {
        payload.player_identifier = joinForm.player_identifier.trim();
      }

      const res = await api.post(joinUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentMatch(res.data.match);

      await fetchParticipants();

      setShowJoinModal(false);

      setShowJoinSuccessModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error joining match");
    } finally {
      setJoining(false);
    }
  };

  const handleUpdateNote = async () => {
    try {
      setSavingNote(true);
      setUpdateMessage("");

      const token = localStorage.getItem("token");

      const res = await api.patch(
        `/admin_final_update/${type}/${currentMatch.id}`,
        {
          Update_Note: updateNote,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedMatch = res.data.match;

      setCurrentMatch(res.data.match);
      setUpdateNote(updatedMatch.update_note || "");

      setUpdateError(false);
      setUpdateMessage(res.data.message);
    } catch (err) {
      setUpdateError(true);
      setUpdateMessage(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSavingNote(false);
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
        <img
          src="/images/SportsMania_matchdetailspage.webp"
          alt="Sportilo Match"
          width="1600"
          height="360"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

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
          <div className="mdp-card-top glow-blue">
            <h3>About this match</h3>
            <p>{currentMatch.description}</p>
          </div>

          {(isOrganizer || currentMatch.update_note) && (
            <div className="mdp-card glow-blue">
              <h3>📢 Match Update</h3>

              {isOrganizer && !currentMatch.update_note ? (
                <>
                  <textarea
                    className="mdp-update-note"
                    placeholder="Write any important announcement for participants..."
                    value={updateNote}
                    onChange={(e) => {
                      setUpdateNote(e.target.value);

                      setUpdateMessage("");

                      setUpdateError(false);
                    }}
                  />

                  {updateMessage && (
                    <p
                      className={
                        updateError ? "mdp-update-error" : "mdp-update-success"
                      }
                    >
                      {updateMessage}
                    </p>
                  )}

                  <button
                    className="mdp-save-update-btn"
                    onClick={handleUpdateNote}
                    disabled={savingNote}
                  >
                    {savingNote ? "Saving..." : "Save Update"}
                  </button>
                </>
              ) : (
                <>
                  <p>{currentMatch.update_note}</p>

                  {currentMatch.update_note_updated_at && (
                    <small
                      style={{
                        display: "block",
                        marginTop: "8px",
                        color: "#555",
                      }}
                    >
                      Updated{" "}
                      {new Date(
                        currentMatch.update_note_updated_at,
                      ).toLocaleString()}
                    </small>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mdp-card glow-blue">
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
          <div
            className={`mdp-join-card glow-violet ${iscompleted ? "is-completed" : isFull ? "is-full" : ""}`}
          >
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
              disabled={joining || isFull || iscompleted}
              onClick={() => {
                setError("");

                const token = localStorage.getItem("token");

                if (!token) {
                  setError("Please login to join the match");
                  return;
                }

                setJoinForm({
                  player_identifier: "",
                  skill_level: "Beginner",
                });

                setShowJoinModal(true);
              }}
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
              🔗 Invite Players
            </button>

            <p className="mdp-note">
              {isGamingMatch
                ? "Join the lobby and squad up with players."
                : "Join now and secure your spot in this match."}
            </p>
          </div>

          {/* ✅ PARTICIPANTS */}
          <div className="mdp-participants mdp-card glow-violet">
            <h3>{isGamingMatch ? "Lobby Members" : "Players Joined"}</h3>

            {participants.length === 0 ? (
              <p>
                {isGamingMatch ? "No members joined yet" : "No players yet"}
              </p>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="mdp-player">
                  <span className="mdp-avatar">{p.name?.charAt(0) || "U"}</span>

                  <div className="mdp-player-details">
                    <div className="mdp-player-name">{p.name}</div>

                    {isGamingMatch && p.player_identifier && (
                      <div className="mdp-player-id">
                        🎮 {p.player_identifier}
                      </div>
                    )}

                    <div className="mdp-player-skill">⭐ {p.skill_level}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ORGANIZER */}
          <div className="mdp-organizer glow-violet">
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
      {showJoinModal && (
        <div
          className="join-modal-overlay"
          onClick={() => {
            if (!joining) {
              setShowJoinModal(false);
            }
          }}
        >
          <div className="join-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{isGamingMatch ? "Join Gaming Lobby" : "Join Match"}</h2>

            <p className="join-modal-subtitle">
              {isGamingMatch
                ? "Complete your gaming profile before joining."
                : "Tell other players your experience level."}
            </p>

            {isGamingMatch && (
              <div className="join-form-group">
                <label>Game Username / ID</label>

                <input
                  type="text"
                  maxLength={100}
                  placeholder="Example: Ash#1234"
                  value={joinForm.player_identifier}
                  onChange={(e) =>
                    setJoinForm((prev) => ({
                      ...prev,
                      player_identifier: e.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="join-form-group">
              <label>Skill Level</label>

              <select
                value={joinForm.skill_level}
                onChange={(e) =>
                  setJoinForm((prev) => ({
                    ...prev,
                    skill_level: e.target.value,
                  }))
                }
              >
                <option value="Beginner">Beginner</option>

                <option value="Intermediate">Intermediate</option>

                <option value="Advanced">Advanced</option>

                <option value="Professional">Professional</option>
              </select>
            </div>

            <div className="join-modal-actions">
              <button
                className="join-cancel-btn"
                disabled={joining}
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>

              <button
                className="join-confirm-btn"
                disabled={joining}
                onClick={handleJoin}
              >
                {joining ? "Joining..." : "Join"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showJoinSuccessModal && (
        <div className="join-success-overlay">
          <div className="join-success-modal">
            <div className="join-success-icon">⚽</div>

            <h2>You're In!</h2>

            <p className="join-success-subtitle">
              You're all set for the match.
            </p>

            <div className="join-share-tip">
              <strong>👥 Invite More Players</strong>

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
