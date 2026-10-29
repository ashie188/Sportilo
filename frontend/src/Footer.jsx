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
      if (err?.name !== "AbortError") {
        console.error("Unable to share Sportilo:", err);
      }
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo-row">
            <img
              src="/images/icon_best-optimized.svg"
              alt=""
              className="footer-logo"
              width="38"
              height="38"
              loading="lazy"
              decoding="async"
            />
            <h2>Sportilo</h2>
          </div>

          <p className="footer-brand-description">
            Find players. Create matches. Build communities. From local sports
            to competitive gaming, Sportilo brings every game together.
          </p>

          <div className="footer-sports" aria-label="Sports and gaming">
            <span title="Football" aria-hidden="true">
              ⚽
            </span>
            <span title="Gaming" aria-hidden="true">
              🎮
            </span>
            <span title="Basketball" aria-hidden="true">
              🏀
            </span>
            <span title="Tennis" aria-hidden="true">
              🎾
            </span>
            <span title="More games" aria-hidden="true">
              •••
            </span>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <h3>Quick Links</h3>
          <Link to="/">
            <span className="footer-link-icon" aria-hidden="true">
              ⌂
            </span>
            <span>Home</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
          <Link to="/create-group">
            <span className="footer-link-icon" aria-hidden="true">
              ＋
            </span>
            <span>Create Match</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
          <Link to="/join-group">
            <span className="footer-link-icon" aria-hidden="true">
              ♧
            </span>
            <span>Join Matches</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
          <Link to="/player-profiles">
            <span className="footer-link-icon" aria-hidden="true">
              ♙
            </span>
            <span>Players</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
          <Link to="/account">
            <span className="footer-link-icon" aria-hidden="true">
              ◎
            </span>
            <span>Account</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
          <Link to="/legal">
            <span className="footer-link-icon" aria-hidden="true">
              ▤
            </span>
            <span>Terms &amp; Privacy</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
          <Link to="/support">
            <span className="footer-link-icon" aria-hidden="true">
              ?
            </span>
            <span>Help &amp; Feedback</span>
            <span className="footer-link-arrow" aria-hidden="true">
              ›
            </span>
          </Link>
        </nav>

        <div className="footer-community">
          <h3>Community</h3>
          <p className="community-text">
            Help Sportilo grow. Invite your teammates and make every match
            easier to fill.
          </p>

          <button
            type="button"
            className="footer-share-btn"
            onClick={handleShareSportilo}
          >
            <span className="footer-share-icon" aria-hidden="true">
              ➤
            </span>
            <span>Share Sportilo</span>
            <span className="footer-share-arrow" aria-hidden="true">
              →
            </span>
          </button>

          <div className="community-tag">
            <span className="community-tag-icon" aria-hidden="true">
              ♧
            </span>
            <p>One invite can start the next match.</p>
          </div>
        </div>

        <div className="footer-social">
          <h3>Follow Us</h3>
          <p className="footer-social-description">
            Stay updated with the latest features, events, and community
            highlights.
          </p>

          <div className="social-icons">
            <a href="https://www.instagram.com/sportilo_official/?hl=en" aria-label="Instagram">
              <span className="social-icon social-instagram" aria-hidden="true">
                <span className="instagram-camera" />
              </span>
              <span>Instagram</span>
              <span className="social-arrow" aria-hidden="true">
                →
              </span>
            </a>

            <a href="https://www.facebook.com/profile.php?id=61592739840461" aria-label="Facebook">
              <span className="social-icon social-facebook" aria-hidden="true">
                f
              </span>
              <span>Facebook</span>
              <span className="social-arrow" aria-hidden="true">
                →
              </span>
            </a>

            <a href="https://www.youtube.com/@Sportilo_official" aria-label="YouTube">
              <span className="social-icon social-youtube" aria-hidden="true">
                ▶
              </span>
              <span>YouTube</span>
              <span className="social-arrow" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Sportilo. All rights reserved.</p>
        <p className="footer-tagline">
          <span aria-hidden="true">♥</span> Play Together. Grow Together.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
