import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OnlineCreateMatch from "./gaming/OnlineCreateMatch";
import "./CreateGroup.css";

function CreateGroup() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("offline");
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdMatch, setCreatedMatch] = useState(null);
  const [creatingMatch, setCreatingMatch] = useState(false);

  const [formData, setFormData] = useState({
    sport: "",
    location: "",
    date: "",
    time: "",
    maxPlayers: "",
    currentPlayers: "",
    description: "",
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (creatingMatch) return;

    setCreatingMatch(true);
    try {
      const token = localStorage.getItem("token");
      {
        /*error checking*/
      }
      if (!token) {
        alert("Please login first.");
        navigate("/login");
        return;
      }

      const requiredFields = [
        formData.sport,
        formData.location,
        formData.date,
        formData.time,
        formData.maxPlayers,
        formData.description,
      ];

      if (requiredFields.some((field) => !field?.trim())) {
        setError("Please fill all required fields.");
        return;
      }
      if (Number(formData.currentPlayers) > Number(formData.maxPlayers)) {
        alert("Current players cannot exceed max players.");
        return;
      }
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        alert("Please select a future date.");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/matches/create",
        {
          sport: formData.sport,
          location: formData.location,
          match_date: formData.date,
          match_time: formData.time,
          max_players: formData.maxPlayers,
          currentPlayers: formData.currentPlayers,
          description: formData.description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 VERY IMPORTANT
          },
        },
      );

      setCreatedMatch(response.data.match);
      setShowSuccessModal(true);

      setFormData({
        sport: "",
        location: "",
        date: "",
        time: "",
        maxPlayers: "",
        currentPlayers: "",
        description: "",
      });
    } catch (error) {
      console.error(
        "Error creating match:",
        error.response?.data || error.message,
      );
      setError(error.response?.data || error.message);
    } finally {
      setCreatingMatch(false);
    }
  };

  const handleShareCreatedMatch = async () => {
    if (!createdMatch) return;

    const matchUrl = `${window.location.origin}/match/offline/${createdMatch.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${createdMatch.sport} Match`,
          text: "Join my match on SportMania",
          url: matchUrl,
        });
      } else {
        await navigator.clipboard.writeText(matchUrl);

        alert("Match link copied!");
      }
    } catch (err) {
      console.error("Failed to share match:", err);
    }
  };

  const handleViewCreatedMatch = () => {
    navigate(`/match/offline/${createdMatch.id}`);
  };

  return (
    <div className="create-page">
      <div className="create-left">
        {/* LEFT FORM */}
        <div className="info-panel">
          {mode === "offline" ? (
            <>
              <div className="panel-header">
                <span className="badge">🏆 Notes</span>
                <h3>Make Your Match Better</h3>
              </div>

              <div className="suggestions">
                <div className="suggestion-card">
                  • Matches near popular grounds usually fill up faster.
                </div>

                <div className="suggestion-card">
                  • Keep team sizes realistic to get more join requests.
                </div>

                <div className="suggestion-card">
                  • Evening and weekend matches attract the most players.
                </div>

                <div className="suggestion-card">
                  • A clear match description increases participation.
                </div>
              </div>

              <div className="cta-box">
                <p>Want to join instead?</p>

                <button onClick={() => navigate("/join-group")}>
                  Explore Matches →
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="panel-header">
                <span className="badge">🏆 Notes</span>
                <h3>Make your Squad Better</h3>
              </div>

              <div className="suggestions">
                <div className="suggestion-card gaming-card-info">
                  • Mention your rank to attract players at a similar skill
                  level.
                </div>

                <div className="suggestion-card gaming-card-info">
                  • Full squads usually form faster than random player searches.
                </div>

                <div className="suggestion-card gaming-card-info">
                  • Schedule sessions during peak evening hours for quicker
                  joins.
                </div>

                <div className="suggestion-card gaming-card-info">
                  • Clear room details reduce last-minute dropouts.
                </div>
              </div>

              <div className="cta-box">
                <p>Looking for gaming squads?</p>

                <button onClick={() => navigate("/join-group")}>
                  Explore Lobbies →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="create-right">
        {/* RIGHT PANEL */}
        <div className="create-header">
          <h1>{mode === "offline" ? "Create Match " : "Create Lobby 🎮"}</h1>

          <div className="create-toggle">
            <button
              className={mode === "offline" ? "active-toggle" : ""}
              onClick={() => setMode("offline")}
            >
              ⚽ Offline Sports
            </button>

            <button
              className={mode === "online" ? "active-toggle" : ""}
              onClick={() => setMode("online")}
            >
              🎮 Online Gaming
            </button>
          </div>
        </div>

        <div className="create-main">
          {mode === "offline" ? (
            <div className="create-box">
              <div className="form-header">
                <h3>Create Match</h3>
                <p>Fill details to find players instantly</p>
              </div>

              <form onSubmit={handleSubmit}>
                <input
                  name="sport"
                  value={formData.sport}
                  placeholder="Sport (Football, Cricket...)"
                  onChange={handleChange}
                />

                <input
                  name="location"
                  value={formData.location}
                  placeholder="Location / Turf"
                  onChange={handleChange}
                />

                <div className="row">
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>

                <div className="row">
                  <input
                    name="currentPlayers"
                    value={formData.currentPlayers}
                    placeholder="Current Players"
                    onChange={handleChange}
                  />

                  <input
                    name="maxPlayers"
                    value={formData.maxPlayers}
                    placeholder="Max Players"
                    onChange={handleChange}
                  />
                </div>

                <textarea
                  name="description"
                  value={formData.description}
                  placeholder="Match Description"
                  onChange={handleChange}
                ></textarea>
                {error && <div className="form-error">{error}</div>}

                <button type="submit" disabled={creatingMatch}>
                  {creatingMatch ? "Creating Match..." : "Create Match"}
                </button>
              </form>
            </div>
          ) : (
            <OnlineCreateMatch />
          )}
        </div>
      </div>
      {showSuccessModal && (
        <div className="match-success-overlay">
          <div className="match-success-modal">
            <div className="match-success-icon">🎉</div>

            <h2>Your Match Is Live</h2>

            <p className="match-created-name">⚽ {createdMatch?.sport}</p>

            <p className="match-created-subtitle">
              Players can now discover and join your match.
            </p>

            <div className="match-growth-tip">
              <strong>⚡ Want players quickly?</strong>

              <p>
                Matches shared within the first hour usually fill much faster
                than matches left undiscovered.
              </p>
            </div>

            <button
              className="match-share-now-btn"
              onClick={handleShareCreatedMatch}
            >
              🔗 Share Match
            </button>

            <button
              className="match-view-btn"
              onClick={handleViewCreatedMatch}
              autoFocus
            >
              View Match
            </button>

            <button
              className="match-later-btn"
              onClick={() => {
                setShowSuccessModal(false);

                navigate("/account");
              }}
            >
              I'll Share Later
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateGroup;
