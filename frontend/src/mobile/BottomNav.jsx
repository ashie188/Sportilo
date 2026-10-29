import { NavLink } from "react-router-dom";
import "./BottomNav.css";

const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const CreateIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const JoinIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="22" y2="22" />
  </svg>
);

const PlayersIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="7" r="3" />
    <circle cx="17" cy="8" r="2.5" />

    <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6" />
    <path d="M14 15c3.5-.2 6 2 6 5" />
  </svg>
);

const AccountIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const LoginIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

export default function BottomNav({ user }) {
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? "bottom-item active" : "bottom-item"
        }
      >
        <span className="bottom-icon">
          <HomeIcon />
        </span>
        <span className="bottom-label">Home</span>
      </NavLink>
      <NavLink
        to="/join-group"
        className={({ isActive }) =>
          isActive ? "bottom-item active" : "bottom-item"
        }
      >
        <span className="bottom-icon">
          <JoinIcon />
        </span>
        <span className="bottom-label">Matches</span>
      </NavLink>
      <NavLink
        to="/create-group"
        className={({ isActive }) =>
          isActive
            ? "bottom-item create-item active"
            : "bottom-item create-item"
        }
      >
        <span className="bottom-icon create-icon">
          <CreateIcon />
        </span>
        <span className="bottom-label">Create</span>
      </NavLink>

      <NavLink
        to="/player-profiles"
        className={({ isActive }) =>
          isActive ? "bottom-item active" : "bottom-item"
        }
      >
        <span className="bottom-icon">
          <PlayersIcon />
        </span>

        <span className="bottom-label">Players</span>
      </NavLink>
      <NavLink
        to={user ? "/account" : "/login"}
        className={({ isActive }) =>
          isActive ? "bottom-item active" : "bottom-item"
        }
      >
        <span className="bottom-icon">
          <AccountIcon />
        </span>
        <span className="bottom-label">{user ? "Account" : "Login"}</span>
      </NavLink>
    </nav>
  );
}
