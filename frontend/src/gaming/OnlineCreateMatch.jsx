import { useState } from "react";
import { memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function OnlineCreateMatch() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLobby, setCreatedLobby] = useState(null);

  const [formData, setFormData] = useState({
    game: "",
    platform: "",
    event_date: "",
    event_time: "",
    current_players: "",
    max_players: "",
    discord_link: "",
    room_code: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleShareCreatedLobby = async () => {
    if (!createdLobby) return;

    const lobbyUrl = `${window.location.origin}/match/gaming/${createdLobby.id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${createdLobby.game} Lobby`,
          text: "Join my gaming lobby on SportMania",
          url: lobbyUrl,
        });
      } else {
        await navigator.clipboard.writeText(lobbyUrl);

        alert("Lobby link copied!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleViewCreatedLobby = () => {
    navigate(`/match/gaming/${createdLobby.id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first");

        navigate("/login");

        return;
      }

      if (
        !formData.game ||
        !formData.platform ||
        !formData.event_date ||
        !formData.event_time ||
        !formData.max_players
      ) {
        setError("Please fill all required fields");

        return;
      }

      const response = await axios.post(
        "http://localhost:3000/gaming/create",

        {
          game: formData.game,
          platform: formData.platform,
          event_date: formData.event_date,
          event_time: formData.event_time,
          current_players: formData.current_players,
          max_players: formData.max_players,
          discord_link: formData.discord_link,
          room_code: formData.room_code,
          description: formData.description,
        },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Gaming Match Created");

      setCreatedLobby(response.data.gamingMatch);

      setShowSuccessModal(true);

      setFormData({
        game: "",
        platform: "",
        event_date: "",
        event_time: "",
        current_players: "",
        max_players: "",
        discord_link: "",
        room_code: "",
        description: "",
      });
    } catch (error) {
      console.error(
        "Error creating gaming match:",
        error.response?.data || error.message,
      );

      setError(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="create-box">
      <div className="form-header">
        <h3>Create Lobby</h3>
        <p>Create online gaming squads</p>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          name="game"
          value={formData.game}
          placeholder="Game (BGMI, Valorant...)"
          onChange={handleChange}
        />

        <input
          name="platform"
          value={formData.platform}
          placeholder="Platform (Mobile / PC)"
          onChange={handleChange}
        />

        <div className="row">
          <input
            type="date"
            name="event_date"
            value={formData.event_date}
            onChange={handleChange}
          />

          <input
            type="time"
            name="event_time"
            value={formData.event_time}
            onChange={handleChange}
          />
        </div>

        <div className="row">
          <input
            name="current_players"
            value={formData.current_players}
            placeholder="Current Players"
            onChange={handleChange}
          />

          <input
            name="max_players"
            value={formData.max_players}
            placeholder="Max Players"
            onChange={handleChange}
          />
        </div>

        <input
          name="discord_link"
          value={formData.discord_link}
          placeholder="Discord Link"
          onChange={handleChange}
        />

        <input
          name="room_code"
          value={formData.room_code}
          placeholder="Room Code"
          onChange={handleChange}
        />

        <textarea
          name="description"
          value={formData.description}
          placeholder="Gaming Lobby Description"
          onChange={handleChange}
        ></textarea>

        {error && <p className="gaming-error">{error}</p>}

        <button type="submit">Create Gaming Lobby</button>
      </form>

      {showSuccessModal && (
        <div className="match-success-overlay">
          <div className="match-success-modal">
            <div className="match-success-icon">🎮</div>

            <h2>Your Gaming Lobby Is Live</h2>

            <p className="match-created-name">🎮 {createdLobby?.game}</p>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                marginTop: "-6px",
                marginBottom: "18px",
              }}
            >
              {createdLobby?.platform}
            </p>

            <p className="match-created-subtitle">
              Players can now discover and join your lobby.
            </p>

            <div className="match-growth-tip">
              <strong>Want squad members quickly?</strong>

              <p>
                Share this lobby in Discord servers, WhatsApp groups, gaming
                communities and among your friends. Most successful gaming
                lobbies fill up through sharing before players discover them
                organically.
              </p>
            </div>

            <button
              className="match-share-now-btn"
              onClick={handleShareCreatedLobby}
            >
              🔗 Share Lobby
            </button>

            <button
              className="match-view-btn"
              onClick={handleViewCreatedLobby}
              autoFocus
            >
              View Lobby
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
export default memo(OnlineCreateMatch);
