import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  const handleShareSportilo = async () => {
    const shareData = {
      title: "Sportilo",

      text: "⚽ Looking for players nearby?\n\nCreate or join sports matches and gaming lobbies on Sportilo.",

      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);

        alert("Sportilo link copied!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img
              src="/images/icon_best-optimized.svg"
              alt="Sportura"
              className="footer-logo"
            />
            <h2>Sportilo</h2>
          </div>
          <p>
            Find players. Create matches. Build communities. From local sports
            to competitive gaming, Sportura brings every game together.
          </p>
        </div>

        <div className="footer-links">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/create-group">Create Match</Link>
          <Link to="/join-group">Join Matches</Link>
          <Link to="/account">Account</Link>
          <Link to="/legal">Terms & Privacy</Link>
          <Link to="/support">Help & Feedback</Link>
        </div>

        <div className="footer-community">
          <h3>Community</h3>

          <p className="community-text">
            Help Sportilo grow. Invite your teammates and make every match
            easier to fill.
          </p>

          <button className="footer-share-btn" onClick={handleShareSportilo}>
            <span>🚀</span>
            Share Sportilo
          </button>

          <p className="community-tag">One invite can start the next match.</p>
        </div>

        <div className="footer-social">
          <h3>Follow Us</h3>

          <div className="social-icons">
            <a href="#">Instagram</a>
            <a href="#">Twitter</a>
            <a href="#">YouTube</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Sportilo. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
