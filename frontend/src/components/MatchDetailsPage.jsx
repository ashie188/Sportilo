import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import "./MatchDetailsPage.css";
import Chat from "../chat/Chat.jsx";
import useMatchShare from "../hooks/useMatchShare";
import RatingModal from "./RatingModal";

const AVATAR_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#059669",
  "#ea580c",
  "#db2777",
  "#0891b2",
];

const avatarColor = (name) =>
  AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

export default function MatchDetailsPage() {
  const location = useLocation();
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { shareMatch } = useMatchShare();

  const [currentMatch, setCurrentMatch] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [participants, setParticipants] = useState([]);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [joinForm, setJoinForm] = useState({
    player_identifier: "",
    skill_level: "Beginner",
  });
  const [showJoinSuccessModal, setShowJoinSuccessModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    location: "",
    area: "",
    city: "",
    date: "",
    time: "",
    current_players: 1,
    max_players: 1,
    description: "",
  });

  const isGamingMatch = type === "gaming";

  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  const isOrganizer = user?.email === currentMatch?.admin_email;
  const [canChat, setCanChat] = useState(false);
  const [chatAuthorizationLoading, setChatAuthorizationLoading] =
    useState(true);
  const [participantToRemove, setParticipantToRemove] = useState(null);

  const [removingParticipant, setRemovingParticipant] = useState(false);

  const [removeParticipantError, setRemoveParticipantError] = useState("");

  //fech match details if not passed via state
  const fetchMatch = async () => {
    try {
      const result = await api.get(`/details/${type}/${id}`);
      setCurrentMatch(result.data);
    } catch (err) {
      console.log("error at matchdeatilpage fetchmatch");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FETCH PARTICIPANTS (INSIDE COMPONENT)
  const fetchParticipants = async () => {
    try {
      const type = isGamingMatch ? "gaming" : "offline";

      const res = await api.get(
        `/details/${type}/${currentMatch.id}/participants`,
      );

      setParticipants(res.data);
    } catch (error) {
      console.error("Error fetching match participants:", error);

      setParticipants([]);
    }
  };

  const checkChatAuthorization = async () => {
    if (!currentMatch?.id || !user?.id) {
      setCanChat(false);
      setChatAuthorizationLoading(false);
      return;
    }

    try {
      setChatAuthorizationLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setCanChat(false);
        return;
      }

      const response = await api.get(
        `/chat/access/${
          isGamingMatch ? "gaming" : "offline"
        }/${currentMatch.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCanChat(response.status === 200 && Boolean(response.data?.token));
    } catch (error) {
      if (error.response?.status === 403) {
        setCanChat(false);
      } else {
        console.error("Error checking chat authorization:", error);

        setCanChat(false);
      }
    } finally {
      setChatAuthorizationLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [type, id]);

  // ✅ CORRECT useEffect
  useEffect(() => {
    if (!currentMatch?.id) return;

    fetchParticipants();
  }, [currentMatch?.id, isGamingMatch]);

  useEffect(() => {
    if (!currentMatch?.id) {
      return;
    }

    checkChatAuthorization();
  }, [currentMatch?.id, isGamingMatch, user?.id]);

  const iscompleted = currentMatch?.status === "completed";

  const isFull =
    !iscompleted && currentMatch?.current_players >= currentMatch?.max_players;

  const matchStatus = iscompleted
    ? "completed"
    : isFull || currentMatch?.status === "full"
      ? "full"
      : "open";

  const matchStatusLabel = {
    open: "Open",
    full: "Full",
    completed: "Completed",
  }[matchStatus];

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

  const handleOpenJoinModal = () => {
    setError("");

    if (matchStatus === "completed") {
      setError("This match has already been completed.");
      return;
    }

    if (matchStatus === "full") {
      setError("This match is already full.");
      return;
    }

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
  };

  const handleOpenEditModal = () => {
    setEditError("");

    const matchDate = isGamingMatch
      ? currentMatch.event_date
      : currentMatch.match_date;

    const matchTime = isGamingMatch
      ? currentMatch.event_time
      : currentMatch.match_time;

    setEditForm({
      location: isGamingMatch ? "" : currentMatch.location || "",
      area: currentMatch.area || "",
      city: currentMatch.city || "",
      date: matchDate ? String(matchDate).split("T")[0] : "",
      time: matchTime ? String(matchTime).slice(0, 5) : "",
      current_players: currentMatch.current_players,
      max_players: currentMatch.max_players,
      description: currentMatch.description || "",
    });

    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "current_players" || name === "max_players"
          ? Number(value)
          : value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setEditError("");

      if (!editForm.date || !editForm.time) {
        setEditError("Date and time are required.");
        return;
      }

      if (
        !Number.isInteger(editForm.current_players) ||
        editForm.current_players < 1
      ) {
        setEditError("Current players must be at least 1.");
        return;
      }

      if (
        !Number.isInteger(editForm.max_players) ||
        editForm.max_players < editForm.current_players
      ) {
        setEditError("Maximum players cannot be less than current players.");
        return;
      }

      if (!isGamingMatch) {
        if (!editForm.location.trim()) {
          setEditError("Location is required.");
          return;
        }

        if (!editForm.area.trim()) {
          setEditError("Area is required.");
          return;
        }

        if (!editForm.city.trim()) {
          setEditError("City is required.");
          return;
        }
      }

      setSavingEdit(true);

      const token = localStorage.getItem("token");

      const payload = {
        current_players: editForm.current_players,
        max_players: editForm.max_players,
        description: editForm.description.trim(),
      };

      if (isGamingMatch) {
        payload.area = editForm.area.trim() || null;
        payload.city = editForm.city.trim() || null;

        payload.event_date = editForm.date;
        payload.event_time = editForm.time;
      } else {
        payload.location = editForm.location.trim();
        payload.area = editForm.area.trim();
        payload.city = editForm.city.trim();

        payload.match_date = editForm.date;
        payload.match_time = editForm.time;
      }

      const response = await api.put(
        `/details/${type}/${currentMatch.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCurrentMatch(response.data.match);

      setShowEditModal(false);

      await fetchParticipants();
    } catch (err) {
      setEditError(
        err.response?.data?.message ||
          "Unable to update the match. Please try again.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveParticipant = (participant) => {
    setRemoveParticipantError("");
    setParticipantToRemove(participant);
  };

  const confirmRemoveParticipant = async () => {
    if (!participantToRemove) return;

    try {
      setRemoveParticipantError("");
      setRemovingParticipant(true);

      const token = localStorage.getItem("token");

      const response = await api.delete(
        `/details/${type}/${currentMatch.id}/participants/${participantToRemove.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCurrentMatch(response.data.match);

      await fetchParticipants();

      setParticipantToRemove(null);
    } catch (err) {
      setRemoveParticipantError(
        err.response?.data?.message || "Unable to remove this participant.",
      );
    } finally {
      setRemovingParticipant(false);
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

  const joinButtonLabel = joining
    ? "Joining..."
    : iscompleted
      ? "Match Completed"
      : isFull
        ? "Match Full"
        : isGamingMatch
          ? "Join Lobby"
          : "Join Match";

  const joinNote = isGamingMatch
    ? "Join the lobby and squad up with players."
    : "Join now and secure your spot in this match.";

  const openSlots = Math.max(
    0,
    currentMatch.max_players - currentMatch.current_players,
  );

  const handleRatingComplete = () => {
    // The modal already removes the successfully rated player
    // from its own list. This callback is kept for future
    // match/profile refresh logic if needed.
  };

  return (
    <div className="mdp-page">
      {/* BACK */}
      <div className="mdp-wrap mdp-back-row">
        <button
          className="mdp-back-link"
          onClick={() => navigate("/join-group")}
        >
          ← Back to Matches
        </button>
      </div>

      {/* HERO */}
      <div className="mdp-wrap">
        <div className="mdp-hero">
          <img
            src="/images/matchdetails-hero.webp"
            alt="Sportilo Match"
            width="1920"
            height="400"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />

          <div className="mdp-hero-overlay">
            <div className="mdp-hero-inner">
              <div className="mdp-hero-text">
                <div className="mdp-hero-top">
                  <span className="mdp-sport-chip">
                    {isGamingMatch ? "🎮" : "⚽"}{" "}
                    {isGamingMatch ? currentMatch.game : currentMatch.sport}
                  </span>

                  <span className={`mdp-status-pill ${matchStatus}`}>
                    {matchStatusLabel}
                  </span>
                </div>

                <h1>
                  {isGamingMatch ? currentMatch.game : currentMatch.sport}{" "}
                  <span>{isGamingMatch ? "Lobby" : "Match"}</span>
                </h1>

                <p className="mdp-hero-line">
                  <span aria-hidden="true">{isGamingMatch ? "🎮" : "📍"}</span>
                  {isGamingMatch
                    ? currentMatch.platform
                    : [
                        currentMatch.location,
                        currentMatch.area,
                        currentMatch.city,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                </p>

                <p className="mdp-hero-line">
                  <span aria-hidden="true">📅</span> {formattedDate} •{" "}
                  {formattedTime}
                </p>

                <p className="mdp-hero-line">
                  <span aria-hidden="true">👥</span>{" "}
                  {currentMatch.current_players} / {currentMatch.max_players}{" "}
                  players
                </p>

                <p className="mdp-hero-organizer">
                  Organized by {currentMatch.admin_name}
                </p>
              </div>

              {/* HERO CTA — desktop only */}
              <div className="mdp-hero-cta mdp-cta-desktop">
                <div className="mdp-player-info">
                  <p>
                    {currentMatch.current_players} / {currentMatch.max_players}{" "}
                    players
                  </p>

                  <div className="mdp-progress">
                    <div
                      className="mdp-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <button
                  className="mdp-join-btn"
                  disabled={joining || isFull || iscompleted}
                  onClick={handleOpenJoinModal}
                >
                  <span aria-hidden="true">👥</span> {joinButtonLabel}
                </button>

                {iscompleted && user && (
                  <button
                    className="mdp-rate-btn"
                    onClick={() => setShowRatingModal(true)}
                  >
                    ⭐ Rate Players
                  </button>
                )}

                <p className="mdp-note">{joinNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="mdp-container">
        {/* LEFT */}
        <div className="mdp-left">
          {/* MATCH DETAILS */}
          <div className="mdp-card mdp-details-card">
            <div className="mdp-card-header">
              <h3 className="mdp-card-title">
                <span className="mdp-card-icon" aria-hidden="true">
                  📋
                </span>
                {isGamingMatch ? "Lobby Details" : "Match Details"}
              </h3>

              <button
                className="mdp-share-sm"
                onClick={() =>
                  shareMatch(currentMatch, isGamingMatch ? "gaming" : "offline")
                }
              >
                ↗ Share
              </button>
            </div>

            {isGamingMatch ? (
              <>
                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">
                    <span aria-hidden="true">🕹</span> Game
                  </div>

                  <div className="mdp-detail-value">{currentMatch.game}</div>
                </div>

                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">
                    <span aria-hidden="true">🎮</span> Platform
                  </div>

                  <div className="mdp-detail-value">
                    {currentMatch.platform}
                  </div>
                </div>

                {currentMatch.area && (
                  <div className="mdp-detail-row">
                    <div className="mdp-detail-label">
                      <span aria-hidden="true">📍</span> Area
                    </div>

                    <div className="mdp-detail-value">{currentMatch.area}</div>
                  </div>
                )}

                {currentMatch.city && (
                  <div className="mdp-detail-row">
                    <div className="mdp-detail-label">
                      <span aria-hidden="true">🏙</span> City
                    </div>

                    <div className="mdp-detail-value">{currentMatch.city}</div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">
                    <span aria-hidden="true">📍</span> Venue
                  </div>

                  <div className="mdp-detail-value">
                    {currentMatch.location}
                  </div>
                </div>

                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">
                    <span aria-hidden="true">📌</span> Area
                  </div>

                  <div className="mdp-detail-value">{currentMatch.area}</div>
                </div>

                <div className="mdp-detail-row">
                  <div className="mdp-detail-label">
                    <span aria-hidden="true">🏙</span> City
                  </div>

                  <div className="mdp-detail-value">{currentMatch.city}</div>
                </div>
              </>
            )}

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">
                <span aria-hidden="true">📅</span> Date
              </div>

              <div className="mdp-detail-value">{formattedDate}</div>
            </div>

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">
                <span aria-hidden="true">🕒</span> Time
              </div>

              <div className="mdp-detail-value">{formattedTime}</div>
            </div>

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">
                <span aria-hidden="true">👥</span> Current Players
              </div>

              <div className="mdp-detail-value">
                {currentMatch.current_players} / {currentMatch.max_players}
              </div>
            </div>

            <div className="mdp-detail-row">
              <div className="mdp-detail-label">
                <span aria-hidden="true">📄</span> Description
              </div>

              <div className="mdp-detail-value">{currentMatch.description}</div>
            </div>

            {/* DETAILS FOOTER CTA — desktop only */}
            <div className="mdp-details-footer mdp-cta-desktop">
              <button
                className="mdp-join-btn"
                disabled={joining || isFull || iscompleted}
                onClick={handleOpenJoinModal}
              >
                <span aria-hidden="true">👥</span> {joinButtonLabel}
              </button>

              <p className="mdp-note">{joinNote}</p>
            </div>
          </div>

          {/* ORGANIZER */}
          <div className="mdp-card mdp-organizer-card">
            <div className="mdp-card-header">
              <h3 className="mdp-card-title">
                <span className="mdp-card-icon" aria-hidden="true">
                  👤
                </span>
                {isGamingMatch ? "Lobby Host" : "Organizer"}
              </h3>

              {isOrganizer && (
                <button
                  className="mdp-edit-match-btn"
                  onClick={handleOpenEditModal}
                >
                  ✏ Edit
                </button>
              )}
            </div>

            <div className="mdp-organizer-box">
              <div
                className="mdp-avatar"
                style={{ background: avatarColor(currentMatch.admin_name) }}
              >
                {currentMatch.admin_name?.charAt(0)}
              </div>

              <div className="mdp-organizer-info">
                <p className="mdp-organizer-name">
                  {currentMatch.admin_name}{" "}
                  <span className="mdp-host-badge">Host</span>
                </p>

                <small className="mdp-organizer-email">
                  ✉ {currentMatch.admin_email}
                </small>
              </div>
            </div>
          </div>

          {/* PARTICIPANTS */}
          <div className="mdp-card mdp-participants">
            <div className="mdp-card-header">
              <h3 className="mdp-card-title">
                <span className="mdp-card-icon" aria-hidden="true">
                  👥
                </span>
                {isGamingMatch ? "Lobby Members" : "Participants"} (
                {currentMatch.current_players} / {currentMatch.max_players})
              </h3>

              <button
                className="mdp-share-sm mdp-cta-desktop"
                onClick={() =>
                  shareMatch(currentMatch, isGamingMatch ? "gaming" : "offline")
                }
              >
                ↗ Share
              </button>
            </div>

            {participants.length === 0 ? (
              <p className="mdp-empty-list">
                {isGamingMatch ? "No members joined yet" : "No players yet"}
              </p>
            ) : (
              participants.map((p) => (
                <div key={p.id} className="mdp-player">
                  <span
                    className="mdp-avatar"
                    style={{ background: avatarColor(p.name) }}
                  >
                    {p.name?.charAt(0) || "U"}
                  </span>

                  <div className="mdp-player-details" onClick={() => navigate(`/account/${p.id}`)}>
                    <div className="mdp-player-name">
                      {p.name}

                      {p.name === currentMatch.admin_name && (
                        <span className="mdp-host-badge">Host</span>
                      )}
                    </div>

                    {isGamingMatch && p.player_identifier && (
                      <div className="mdp-player-id">
                        🎮 {p.player_identifier}
                      </div>
                    )}
                  </div>

                  <div className="mdp-player-skill">{p.skill_level}</div>

                  {(iscompleted || isOrganizer) && (
                    <div className="mdp-player-actions">
                      {iscompleted && (
                        <button
                          className="mdp-rate-player-btn"
                          onClick={() => setShowRatingModal(true)}
                        >
                          <span aria-hidden="true">★</span>{" "}
                          <span className="mdp-btn-label-full">
                            Rate Player
                          </span>
                          <span className="mdp-btn-label-short">Rate</span>
                        </button>
                      )}

                      {isOrganizer && (
                        <button
                          className="mdp-remove-player-btn"
                          onClick={() => handleRemoveParticipant(p)}
                          aria-label={`Remove ${p.name}`}
                        >
                          <span aria-hidden="true">🗑</span>{" "}
                          <span className="mdp-btn-label-full">Remove</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {openSlots > 0 && (
              <div className="mdp-slots" aria-hidden="true">
                {Array.from({ length: Math.min(openSlots, 8) }).map((_, i) => (
                  <span key={i} className="mdp-slot">
                    +
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="mdp-right">
          {/* MATCH CHAT — component rendered as-is, untouched */}
          <div className="mdp-chat-slot">
            <Chat
              matchType={isGamingMatch ? "gaming" : "offline"}
              matchId={currentMatch.id}
            />
          </div>

          {/* PROMO */}
          <div className="mdp-promo-card">
            <img
              src="/images/sportilo-promo-card.webp"
              onError={(e) => {
                if (e.currentTarget.src.indexOf("sportilo-promo-card") !== -1) {
                  e.currentTarget.src =
                    "/images/matchdetails-bottom-promo.webp";
                }
              }}
              alt="Be part of something bigger — Sportilo"
              width="1080"
              height="1350"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* RIGHT COLUMN CTA — desktop only */}
          <div className="mdp-cta-stack mdp-cta-desktop">
            <button
              className="mdp-join-btn"
              disabled={joining || isFull || iscompleted}
              onClick={handleOpenJoinModal}
            >
              <span aria-hidden="true">👥</span> {joinButtonLabel}
            </button>

            <button
              className="mdp-share-btn"
              onClick={() =>
                shareMatch(currentMatch, isGamingMatch ? "gaming" : "offline")
              }
            >
              🔗 Invite Players
            </button>
          </div>
        </div>
      </div>

      {/* ERROR — floating toast, same state & content as before */}
      {error && (
        <p className="mdp-error" role="alert">
          {error}.
          <span>
            <Link to="/login">Login</Link>
          </span>
        </p>
      )}

      {/* MOBILE FIXED CTA BAR */}
      <div className="mdp-mobile-cta">
        <button
          className="mdp-share-btn"
          onClick={() =>
            shareMatch(currentMatch, isGamingMatch ? "gaming" : "offline")
          }
        >
          🔗 Share
        </button>

        {iscompleted && user ? (
          <button
            className="mdp-rate-btn"
            onClick={() => setShowRatingModal(true)}
          >
            ⭐ Rate Players
          </button>
        ) : (
          <button
            className="mdp-join-btn"
            disabled={joining || isFull || iscompleted}
            onClick={handleOpenJoinModal}
          >
            <span aria-hidden="true">👥</span> {joinButtonLabel}
          </button>
        )}
      </div>

      {/* ===== MODALS (unchanged) ===== */}

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
        <div
          className="join-success-overlay"
          onClick={() => setShowJoinSuccessModal(false)}
        >
          <div
            className="join-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="join-success-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="join-success-close"
              onClick={() => setShowJoinSuccessModal(false)}
              aria-label="Close success modal"
            >
              ×
            </button>

            <div className="join-success-icon" aria-hidden="true">
              ✓
            </div>

            <p className="join-success-label">JOIN CONFIRMED</p>

            <h2 id="join-success-title">You're in!</h2>

            <p className="join-success-subtitle">
              Your spot has been confirmed. You're now part of this{" "}
              {isGamingMatch ? "lobby" : "match"}.
            </p>

            <div className="join-success-match">
              <div className="join-success-match-icon">
                {isGamingMatch ? "🎮" : "⚽"}
              </div>

              <div className="join-success-match-info">
                <span>{isGamingMatch ? "Gaming Lobby" : "Sport Match"}</span>

                <strong>
                  {isGamingMatch ? currentMatch.game : currentMatch.sport}
                </strong>

                <p>
                  {formattedDate} · {formattedTime}
                </p>
              </div>
            </div>

            <div className="join-success-player-status">
              <span>Players</span>

              <strong>
                {currentMatch.current_players}/{currentMatch.max_players}
              </strong>
            </div>

            <div className="join-success-actions">
              <button
                type="button"
                className="join-share-btn"
                onClick={async () => {
                  await shareMatch(
                    currentMatch,
                    isGamingMatch ? "gaming" : "offline",
                  );

                  setShowJoinSuccessModal(false);
                }}
              >
                <span aria-hidden="true">↗</span>
                Invite Players
              </button>

              <button
                type="button"
                className="join-continue-btn"
                onClick={() => setShowJoinSuccessModal(false)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div
          className="mdp-edit-modal-overlay"
          onClick={() => {
            if (!savingEdit) {
              setShowEditModal(false);
            }
          }}
        >
          <div className="mdp-edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mdp-edit-modal-header">
              <div>
                <h2>Edit {isGamingMatch ? "Lobby" : "Match"}</h2>

                <p>
                  Update the details for your{" "}
                  {isGamingMatch ? "gaming lobby" : "match"}.
                </p>
              </div>

              <button
                className="mdp-edit-close-btn"
                onClick={() => setShowEditModal(false)}
                disabled={savingEdit}
                aria-label="Close edit modal"
              >
                ×
              </button>
            </div>

            <div className="mdp-edit-form">
              {!isGamingMatch && (
                <>
                  <div className="mdp-edit-form-group">
                    <label>Venue / Location</label>

                    <input
                      type="text"
                      name="location"
                      maxLength={150}
                      value={editForm.location}
                      onChange={handleEditChange}
                      placeholder="Example: ABC Sports Turf"
                    />
                  </div>

                  <div className="mdp-edit-form-row">
                    <div className="mdp-edit-form-group">
                      <label>Area</label>

                      <input
                        type="text"
                        name="area"
                        maxLength={100}
                        value={editForm.area}
                        onChange={handleEditChange}
                        placeholder="Example: Shivaji Nagar"
                      />
                    </div>

                    <div className="mdp-edit-form-group">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        maxLength={100}
                        value={editForm.city}
                        onChange={handleEditChange}
                        placeholder="Example: Parbhani"
                      />
                    </div>
                  </div>
                </>
              )}

              {isGamingMatch && (
                <div className="mdp-edit-form-row">
                  <div className="mdp-edit-form-group">
                    <label>
                      Area <span>(Optional)</span>
                    </label>

                    <input
                      type="text"
                      name="area"
                      maxLength={100}
                      value={editForm.area}
                      onChange={handleEditChange}
                      placeholder="Your area"
                    />
                  </div>

                  <div className="mdp-edit-form-group">
                    <label>
                      City <span>(Optional)</span>
                    </label>

                    <input
                      type="text"
                      name="city"
                      maxLength={100}
                      value={editForm.city}
                      onChange={handleEditChange}
                      placeholder="Your city"
                    />
                  </div>
                </div>
              )}

              <div className="mdp-edit-form-row">
                <div className="mdp-edit-form-group">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={editForm.date}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="mdp-edit-form-group">
                  <label>Time</label>

                  <input
                    type="time"
                    name="time"
                    value={editForm.time}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="mdp-edit-form-row">
                <div className="mdp-edit-form-group">
                  <label>Current Players</label>

                  <input
                    type="number"
                    name="current_players"
                    min="1"
                    value={editForm.current_players}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="mdp-edit-form-group">
                  <label>Maximum Players</label>

                  <input
                    type="number"
                    name="max_players"
                    min="1"
                    value={editForm.max_players}
                    onChange={handleEditChange}
                  />
                </div>
              </div>

              <div className="mdp-edit-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  placeholder="Add match details..."
                />
              </div>

              {editError && <p className="mdp-edit-error">{editError}</p>}

              <div className="mdp-edit-modal-actions">
                <button
                  className="mdp-edit-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>

                <button
                  className="mdp-edit-save-btn"
                  onClick={handleSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {participantToRemove && (
        <div
          className="mdp-modal-overlay"
          onClick={() => {
            if (!removingParticipant) {
              setParticipantToRemove(null);
              setRemoveParticipantError("");
            }
          }}
        >
          <div
            className="mdp-remove-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mdp-remove-icon">!</div>

            <h3>Remove participant?</h3>

            <p>
              Are you sure you want to remove{" "}
              <strong>{participantToRemove.name}</strong> from this{" "}
              {isGamingMatch ? "lobby" : "match"}?
            </p>

            {removeParticipantError && (
              <p className="mdp-remove-error">{removeParticipantError}</p>
            )}

            <div className="mdp-remove-actions">
              <button
                type="button"
                className="mdp-remove-cancel"
                disabled={removingParticipant}
                onClick={() => {
                  setParticipantToRemove(null);
                  setRemoveParticipantError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="mdp-remove-confirm"
                disabled={removingParticipant}
                onClick={confirmRemoveParticipant}
              >
                {removingParticipant ? "Removing..." : "Remove Player"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRatingModal && (
        <RatingModal
          matchType={isGamingMatch ? "gaming" : "offline"}
          matchId={currentMatch.id}
          onClose={() => setShowRatingModal(false)}
          onRatingComplete={handleRatingComplete}
        />
      )}
    </div>
  );
}
