import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AccountMatchCard from "./AccountMatchCard";
import accountHeroBg from "/images/sportilo-account-background.webp";

import "./Account.css";

const INITIAL_PROFILE = {
  area: "",
  city: "",
  whatsapp_number: "",
  offline_games: [],
  online_games: [],
  availability: {},
  willing_to_play_turf: false,
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = ["Morning", "Afternoon", "Evening", "Night"];

const OFFLINE_GAMES = [
  "Football",
  "Cricket",
  "Tennis",
  "Badminton",
  "Basketball",
  "Volleyball",
  "Table Tennis",
];

const ONLINE_GAMES = [
  "BGMI",
  "Valorant",
  "Free Fire",
  "Call of Duty",
  "FIFA",
  "EA FC",
  "eFootball",
  "Counter-Strike 2",
];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];

/* =========================================================
   ICONS — inline SVG, no emoji, no external icon dependency
========================================================= */

function IconMapPin(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function IconFlag(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22V4" />
    </svg>
  );
}
function IconStar(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}
function IconTrendingUp(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </svg>
  );
}
function IconActivity(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M22 12h-4l-3 8-6-16-3 8H2" />
    </svg>
  );
}
function IconGamepad(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M6 12h4M8 10v4" />
      <circle cx="16.5" cy="10.5" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
      <path d="M7 7h10a5 5 0 0 1 5 5.2c0 2.4-1.4 3.8-3 3.8-1 0-1.6-.5-2.3-1.3l-.7-.9a2 2 0 0 0-1.6-.8h-2.8a2 2 0 0 0-1.6.8l-.7.9C8.6 15.5 8 16 7 16c-1.6 0-3-1.4-3-3.8A5 5 0 0 1 7 7z" />
    </svg>
  );
}
function IconCalendar(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}
function IconPencil(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}
function IconLogOut(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
function IconArrowRight(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconCalendarDays(props) {
  return <IconCalendar {...props} />;
}
function IconTrophy(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M7 5H4a3 3 0 0 0 3 3M17 5h3a3 3 0 0 1-3 3" />
    </svg>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getInitials(name) {
  if (!name) return "U";

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function normalizeGames(games) {
  return Array.isArray(games) ? games : [];
}

function normalizeAvailability(availability) {
  if (
    !availability ||
    typeof availability !== "object" ||
    Array.isArray(availability)
  ) {
    return {};
  }

  return availability;
}

function formatRating(value) {
  const rating = Number(value);

  if (!Number.isFinite(rating) || rating <= 0) {
    return "New";
  }

  return rating.toFixed(1);
}

function formatAvailability(availability) {
  return DAYS.filter(
    (day) => Array.isArray(availability?.[day]) && availability[day].length > 0,
  );
}

/*
 * Compact "first N + N more" summary for the overview cards.
 * Pure display helper — doesn't touch or reshape the underlying data.
 */
function summarizeList(items, max) {
  const safeItems = Array.isArray(items) ? items : [];

  return {
    shown: safeItems.slice(0, max),
    extra: Math.max(0, safeItems.length - max),
  };
}

/* =========================================================
   COMPONENT
========================================================= */

export default function Account({ user, setUser }) {
  const navigate = useNavigate();
  const { id } = useParams();

  /*
   * /account
   * → own account
   *
   * /account/:id
   * → requested player's account
   */
  const profileUserId = id ? Number(id) : Number(user?.id);

  const isOwner =
    !id ||
    (Number.isInteger(profileUserId) && profileUserId === Number(user?.id));

  const [profile, setProfile] = useState(null);

  const [activeMatches, setActiveMatches] = useState([]);
  const [historyMatches, setHistoryMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);

  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");

  const [activeTab, setActiveTab] = useState("active");

  const activeSectionRef = useRef(null);
  const historySectionRef = useRef(null);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);

  const [saveError, setSaveError] = useState("");

  const [editForm, setEditForm] = useState(INITIAL_PROFILE);

  /* =======================================================
     AUTH HANDLER
  ======================================================= */

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);

    navigate("/login", {
      replace: true,
      state: {
        message: "Your session has expired. Please login again.",
      },
    });
  }, [navigate, setUser]);

  /* =======================================================
     FETCH PROFILE
  ======================================================= */

  const fetchProfile = useCallback(async () => {
    if (!profileUserId) {
      setProfileError("Invalid player profile.");
      setProfileLoading(false);
      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");

      const url = import.meta.env.VITE_API_URL;

      const endpoint = isOwner
        ? `${url}/account/profile`
        : `${url}/account/${profileUserId}`;

      const headers = {};

      /*
       * Only the owner endpoint requires authentication.
       */
      if (isOwner) {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        headers,
      });

      if (response.status === 401 && isOwner) {
        handleUnauthorized();
        return;
      }

      if (response.status === 404) {
        setProfileError("Player profile not found.");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch profile");
      }

      const data = await response.json();

      setProfile(data);
    } catch (err) {
      console.error("Error fetching account profile:", err);

      setProfileError("Unable to load this player profile.");
    } finally {
      setProfileLoading(false);
    }
  }, [profileUserId, isOwner, navigate, handleUnauthorized]);

  /* =======================================================
     FETCH MATCHES
  ======================================================= */

  const fetchMatches = useCallback(async () => {
    if (!profileUserId) {
      setError("Invalid player ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const url = import.meta.env.VITE_API_URL;

      const endpoint = isOwner
        ? `${url}/account/accountpagematches`
        : `${url}/account/accountpagematches/${profileUserId}`;

      const headers = {};

      if (isOwner) {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        headers,
      });

      if (response.status === 401 && isOwner) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to fetch matches");
      }

      const data = await response.json();

      setActiveMatches(
        Array.isArray(data.activeMatches) ? data.activeMatches : [],
      );

      setHistoryMatches(
        Array.isArray(data.historyMatches) ? data.historyMatches : [],
      );
    } catch (err) {
      console.error("Error fetching account matches:", err);

      setError("Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, [profileUserId, isOwner, navigate, handleUnauthorized]);

  /* =======================================================
     INITIAL FETCH
  ======================================================= */

  useEffect(() => {
    if (!id && !user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    fetchProfile();
    fetchMatches();
  }, [id, user, navigate, fetchProfile, fetchMatches]);

  /* =======================================================
     EDIT FORM
  ======================================================= */

  const openEditModal = useCallback(() => {
    if (!profile || !isOwner) return;

    setEditForm({
      area: profile.area || "",
      city: profile.city || "",
      whatsapp_number: profile.whatsapp_number || "",
      offline_games: normalizeGames(profile.offline_games).map((game) => ({
        ...game,
      })),
      online_games: normalizeGames(profile.online_games).map((game) => ({
        ...game,
      })),
      availability: normalizeAvailability(profile.availability),
      willing_to_play_turf: Boolean(profile.willing_to_play_turf),
    });

    setSaveError("");
    setShowEditModal(true);
  }, [profile, isOwner]);

  const closeEditModal = useCallback(() => {
    if (savingProfile) return;

    setShowEditModal(false);
    setSaveError("");
  }, [savingProfile]);

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const toggleGame = useCallback((type, game) => {
    setEditForm((current) => {
      const field = type === "offline" ? "offline_games" : "online_games";

      const existing = current[field];

      const alreadySelected = existing.some((item) => item.game === game);

      if (alreadySelected) {
        return {
          ...current,
          [field]: existing.filter((item) => item.game !== game),
        };
      }

      return {
        ...current,
        [field]: [
          ...existing,
          {
            game,
            skill_level: "Beginner",
          },
        ],
      };
    });
  }, []);

  const updateGameSkill = useCallback((type, game, skillLevel) => {
    setEditForm((current) => {
      const field = type === "offline" ? "offline_games" : "online_games";

      return {
        ...current,
        [field]: current[field].map((item) =>
          item.game === game
            ? {
                ...item,
                skill_level: skillLevel,
              }
            : item,
        ),
      };
    });
  }, []);

  const toggleAvailability = useCallback((day, slot) => {
    setEditForm((current) => {
      const currentDaySlots = Array.isArray(current.availability?.[day])
        ? current.availability[day]
        : [];

      const selected = currentDaySlots.includes(slot);

      const updatedSlots = selected
        ? currentDaySlots.filter((item) => item !== slot)
        : [...currentDaySlots, slot];

      return {
        ...current,
        availability: {
          ...current.availability,
          [day]: updatedSlots,
        },
      };
    });
  }, []);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    if (!isOwner || savingProfile) return;

    try {
      setSavingProfile(true);
      setSaveError("");

      const token = localStorage.getItem("token");

      if (!token) {
        handleUnauthorized();
        return;
      }

      const url = import.meta.env.VITE_API_URL;

      const response = await fetch(`${url}/account/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          area: editForm.area.trim(),
          city: editForm.city.trim(),
          whatsappNumber: editForm.whatsapp_number.trim() || null,
          offlineGames: editForm.offline_games,
          onlineGames: editForm.online_games,
          availability: editForm.availability,
          willingToPlayTurf: editForm.willing_to_play_turf,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update profile");
      }

      /*
       * Profile endpoint returns updated profile data.
       * Preserve existing name/email when the backend doesn't
       * return them from the UPDATE query.
       */
      setProfile((current) => ({
        ...current,
        ...data.profile,
      }));

      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating profile:", err);

      setSaveError(
        err.message || "Unable to update profile. Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setShowLogoutModal(false);

    navigate("/", {
      replace: true,
    });
  }, [navigate, setUser]);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  /*
   * Tabs no longer hide/show a section — both Active Matches and
   * Match History render together, in that order. Clicking a tab
   * just smooth-scrolls to its section and updates which tab is
   * highlighted.
   */
  const scrollToSection = useCallback((ref, tab) => {
    setActiveTab(tab);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const offlineGames = useMemo(
    () => normalizeGames(profile?.offline_games),
    [profile?.offline_games],
  );

  const onlineGames = useMemo(
    () => normalizeGames(profile?.online_games),
    [profile?.online_games],
  );

  const availability = useMemo(
    () => normalizeAvailability(profile?.availability),
    [profile?.availability],
  );

  const availableDays = useMemo(
    () => formatAvailability(availability),
    [availability],
  );

  const availableSlots = useMemo(() => {
    const all = availableDays.flatMap((day) => availability[day] || []);
    return Array.from(new Set(all));
  }, [availableDays, availability]);

  const offlineSummary = useMemo(
    () =>
      summarizeList(
        offlineGames.map((item) => item),
        3,
      ),
    [offlineGames],
  );

  const onlineSummary = useMemo(
    () =>
      summarizeList(
        onlineGames.map((item) => item),
        3,
      ),
    [onlineGames],
  );

  const dayInitialsSummary = useMemo(
    () =>
      summarizeList(
        availableDays.map((day) => day.slice(0, 3)),
        3,
      ),
    [availableDays],
  );

  const slotsSummary = useMemo(
    () => summarizeList(availableSlots, 2),
    [availableSlots],
  );

  /*
   * Shared card-grid renderer for both match sections below —
   * keeps the "Active Matches" and "Match History" blocks from
   * duplicating the same empty-state/card-mapping JSX twice.
   */
  const renderMatchesGrid = (matches, isHistory) => {
    if (matches.length === 0) {
      return (
        <div className="acc-empty-modern">
          <div className="acc-empty-icon">
            {isHistory ? (
              <IconTrophy width={26} height={26} />
            ) : (
              <IconCalendarDays width={26} height={26} />
            )}
          </div>

          <h3>Nothing Here Yet</h3>

          <p>
            {isHistory
              ? isOwner
                ? "Complete a match to see your history here."
                : "This player has no completed matches yet."
              : isOwner
                ? "You're not part of any upcoming matches yet."
                : "This player isn't part of any upcoming matches."}
          </p>

          {!isHistory && isOwner && (
            <Link to="/join-group" className="acc-empty-btn">
              Explore Matches
            </Link>
          )}
        </div>
      );
    }

    return matches.map((match) => (
      <AccountMatchCard
        key={`${match.type}-${match.id}`}
        match={match}
        isHistory={isHistory}
        onClick={(selectedMatch) => {
          const isActive = selectedMatch.current_players;
          selectedMatch.max_players;

          if (isActive) {
            navigate(`/match/${selectedMatch.type}/${selectedMatch.id}`, {
              state: selectedMatch,
            });
          }
        }}
      />
    ));
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (profileLoading || loading) {
    return (
      <div className="acc-loader">
        <div className="acc-spinner" />
        <p>
          {isOwner
            ? "Loading your Sportilo profile..."
            : "Loading player profile..."}
        </p>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (profileError || !profile) {
    return (
      <div className="acc-page">
        <div className="acc-profile-error">
          <div className="acc-profile-error-icon">!</div>

          <h2>Profile unavailable</h2>

          <p>{profileError || "This player profile could not be loaded."}</p>

          <button
            type="button"
            onClick={() => {
              fetchProfile();
              fetchMatches();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="acc-page">
      {/* ===================================================
          HERO — background artwork behind the identity card.
          Full 1920×450 asset, never vertically cropped; only
          horizontal cropping (via object-fit: cover) happens
          on narrower viewports. Decorative only — all real
          profile info below is plain JSX/HTML, not baked into
          the image.
      =================================================== */}

      <div className="acc-hero">
        <img
          className="acc-hero-bg"
          src={accountHeroBg}
          alt=""
          aria-hidden="true"
          width={1920}
          height={450}
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />

        {/*
         * Legibility safety net for mobile only (see Account.css —
         * hidden by default, switched on under the mobile
         * breakpoint). Desktop needs nothing extra: the artwork's
         * own light zone already carries the text. On mobile the
         * crop is much narrower, so a light gradient guarantees
         * the overlay text stays readable regardless of exactly
         * where the crop lands.
         */}
        <div className="acc-hero-scrim" aria-hidden="true" />

        {/* =================================================
            IDENTITY — overlaid directly on the hero artwork's
            light zone at every breakpoint. Desktop splits into
            two columns (identity info left, Edit/Logout pinned
            to the far right); mobile stacks everything into one
            column since there's no room for a second column.
        ================================================= */}

        <div className="acc-hero-inner">
          <section className="acc-identity-card">
            <div className="acc-identity-top">
              <div className="acc-avatar">{getInitials(profile.name)}</div>

              <div className="acc-user-info">
                <div className="acc-name-row">
                  <h1>{profile.name}</h1>

                  {isOwner && (
                    <button
                      type="button"
                      className="acc-inline-edit"
                      onClick={openEditModal}
                      aria-label="Edit profile"
                    >
                      <IconPencil width={14} height={14} />
                    </button>
                  )}
                </div>

                <div className="acc-user-meta">
                  <span>
                    <IconMapPin width={14} height={14} />
                    {profile.area}, {profile.city}
                  </span>
                </div>
              </div>
            </div>

            {/* RATINGS */}
            <div className="acc-rating-strip">
              <div className="acc-rating-pill acc-rating-pill-primary">
                <span className="acc-rating-icon acc-rating-icon-amber">
                  <IconStar width={14} height={14} />
                </span>
                <div>
                  <strong>{formatRating(profile.overall_rating)}</strong>
                  <span>Overall</span>
                </div>
              </div>

              <div className="acc-rating-pill">
                <span className="acc-rating-icon acc-rating-icon-blue">
                  <IconTrendingUp width={14} height={14} />
                </span>
                <div>
                  <strong>{formatRating(profile.show_up_rating)}</strong>
                  <span>Show-up</span>
                </div>
              </div>
            </div>
          </section>

          {/* OWNER ACTIONS — separate column, pinned to the far
              right of the page on desktop; drops below the
              identity block on mobile (see Account.css). */}
          {isOwner && (
            <div className="acc-owner-actions">
              <button
                type="button"
                className="acc-edit-btn"
                onClick={openEditModal}
              >
                <IconPencil width={14} height={14} />
                Edit Profile
              </button>

              <button
                type="button"
                className="acc-logout-btn"
                onClick={() => setShowLogoutModal(true)}
              >
                <IconLogOut width={14} height={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="acc-shell">
        {/* =================================================
            SUMMARY ROW — offline / online / availability / turf
        ================================================= */}

        <div className="acc-summary-row">
          <div className="acc-summary-card acc-accent-blue">
            <div className="acc-summary-icon acc-icon-blue">
              <IconActivity width={18} height={18} />
            </div>
            <div className="acc-summary-text">
              <span className="acc-summary-kicker">Offline Sports</span>
              {offlineGames.length > 0 ? (
                <>
                  <p>
                    {offlineSummary.shown.map((item, index) => (
                      <span key={item.game} title={`${item.skill_level} level`}>
                        {item.game}
                        {index < offlineSummary.shown.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  {offlineSummary.extra > 0 && (
                    <span className="acc-summary-more">
                      +{offlineSummary.extra} more
                    </span>
                  )}
                </>
              ) : (
                <p className="acc-summary-empty">Not added yet</p>
              )}
            </div>
          </div>

          <div className="acc-summary-card acc-accent-violet">
            <div className="acc-summary-icon acc-icon-violet">
              <IconGamepad width={18} height={18} />
            </div>
            <div className="acc-summary-text">
              <span className="acc-summary-kicker">Online Games</span>
              {onlineGames.length > 0 ? (
                <>
                  <p>
                    {onlineSummary.shown.map((item, index) => (
                      <span key={item.game} title={`${item.skill_level} level`}>
                        {item.game}
                        {index < onlineSummary.shown.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                  {onlineSummary.extra > 0 && (
                    <span className="acc-summary-more">
                      +{onlineSummary.extra} more
                    </span>
                  )}
                </>
              ) : (
                <p className="acc-summary-empty">Not added yet</p>
              )}
            </div>
          </div>

          <div className="acc-summary-card acc-accent-blue">
            <div className="acc-summary-icon acc-icon-blue">
              <IconCalendarDays width={18} height={18} />
            </div>
            <div className="acc-summary-text">
              <span className="acc-summary-kicker">Availability</span>
              {availableDays.length > 0 ? (
                <>
                  <p>{dayInitialsSummary.shown.join(", ")}</p>
                  {slotsSummary.shown.length > 0 && (
                    <p className="acc-summary-sub">
                      {slotsSummary.shown.join(", ")}
                    </p>
                  )}
                  {(dayInitialsSummary.extra > 0 || slotsSummary.extra > 0) && (
                    <span className="acc-summary-more">
                      +{dayInitialsSummary.extra + slotsSummary.extra} more
                    </span>
                  )}
                </>
              ) : (
                <p className="acc-summary-empty">Not added yet</p>
              )}
            </div>
          </div>

          <div className="acc-summary-card acc-accent-green">
            <div className="acc-summary-icon acc-icon-green">
              <IconFlag width={18} height={18} />
            </div>
            <div className="acc-summary-text">
              <span className="acc-summary-kicker">Plays at Turf</span>
              <p>{profile.willing_to_play_turf ? "Yes" : "No"}</p>
              {profile.willing_to_play_turf && (
                <span className="acc-summary-pill">Available for turf</span>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="acc-tabs">
          <button
            type="button"
            className={activeTab === "active" ? "tab-active" : ""}
            onClick={() => scrollToSection(activeSectionRef, "active")}
          >
            My Matches
          </button>

          <button
            type="button"
            className={activeTab === "history" ? "tab-active" : ""}
            onClick={() => scrollToSection(historySectionRef, "history")}
          >
            Match History
          </button>
        </div>

        {/* =================================================
            ACTIVE MATCHES
        ================================================= */}

        <section className="acc-main" ref={activeSectionRef}>
          <div className="acc-section-head">
            <div>
              <h2>Active Matches</h2>
              <p>Matches you've created or joined</p>
            </div>

            {activeMatches.length > 0 && (
              <span className="acc-count-pill">
                {activeMatches.length} Matches
              </span>
            )}
          </div>

          <div className="acc-grid">
            {renderMatchesGrid(activeMatches, false)}
          </div>
        </section>

        {/* =================================================
            MATCH HISTORY — rendered below Active Matches
        ================================================= */}

        <section className="acc-main acc-main-history" ref={historySectionRef}>
          <div className="acc-section-head">
            <div>
              <h2>Match History</h2>
              <p>Your past matches</p>
            </div>

            {historyMatches.length > 0 && (
              <span className="acc-count-pill">
                {historyMatches.length} Matches
              </span>
            )}
          </div>

          <div className="acc-grid">
            {renderMatchesGrid(historyMatches, true)}
          </div>
        </section>

        {error && <p className="acc-error">{error}</p>}

        {/* =================================================
            CTA BANNER
        ================================================= */}

        {isOwner && (
          <div className="acc-cta-banner">
            <div className="acc-cta-text">
              <h3>Ready for Another Game?</h3>
              <p>Join a match or create your own and keep the game going.</p>
            </div>

            <div className="acc-cta-actions">
              <Link to="/join-group" className="acc-cta-btn acc-cta-btn-ghost">
                Join Matches
                <IconArrowRight width={14} height={14} />
              </Link>

              <Link
                to="/create-match"
                className="acc-cta-btn acc-cta-btn-solid"
              >
                Create Match
                <IconArrowRight width={14} height={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ===================================================
          LOGOUT MODAL
      =================================================== */}

      {isOwner && showLogoutModal && (
        <div
          className="acc-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowLogoutModal(false);
            }
          }}
        >
          <div
            className="acc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
          >
            <h3 id="logout-title">Logout from Sportilo?</h3>

            <p>You can log in again anytime.</p>

            <div className="acc-modal-actions">
              <button type="button" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>

              <button type="button" className="danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          EDIT PROFILE MODAL
      =================================================== */}

      {isOwner && showEditModal && (
        <div className="acc-modal-overlay acc-edit-overlay" role="presentation">
          <form
            className="acc-edit-modal"
            onSubmit={handleSaveProfile}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
          >
            <div className="acc-edit-header">
              <div>
                <span className="acc-section-kicker">YOUR PROFILE</span>

                <h2 id="edit-profile-title">Edit Profile</h2>
              </div>

              <button
                type="button"
                className="acc-modal-close"
                onClick={closeEditModal}
                disabled={savingProfile}
                aria-label="Close edit profile"
              >
                ×
              </button>
            </div>

            <div className="acc-edit-body">
              {/* LOCATION */}

              <div className="acc-form-section">
                <h3>Location</h3>

                <div className="acc-form-grid">
                  <label>
                    <span>Area</span>

                    <input
                      type="text"
                      value={editForm.area}
                      maxLength={100}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          area: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>

                  <label>
                    <span>City</span>

                    <input
                      type="text"
                      value={editForm.city}
                      maxLength={100}
                      onChange={(event) =>
                        setEditForm((current) => ({
                          ...current,
                          city: event.target.value,
                        }))
                      }
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>
                    WhatsApp Number <small>(optional)</small>
                  </span>

                  <input
                    type="tel"
                    value={editForm.whatsapp_number}
                    maxLength={20}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        whatsapp_number: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              {/* OFFLINE GAMES */}

              <div className="acc-form-section">
                <h3>Offline Sports</h3>

                <div className="acc-game-picker">
                  {OFFLINE_GAMES.map((game) => {
                    const selected = editForm.offline_games.some(
                      (item) => item.game === game,
                    );

                    return (
                      <button
                        key={game}
                        type="button"
                        className={
                          selected
                            ? "acc-game-option selected"
                            : "acc-game-option"
                        }
                        onClick={() => toggleGame("offline", game)}
                      >
                        {game}
                      </button>
                    );
                  })}
                </div>

                {editForm.offline_games.map((item) => (
                  <div
                    className="acc-selected-game"
                    key={`offline-edit-${item.game}`}
                  >
                    <strong>{item.game}</strong>

                    <select
                      value={item.skill_level}
                      onChange={(event) =>
                        updateGameSkill(
                          "offline",
                          item.game,
                          event.target.value,
                        )
                      }
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* ONLINE GAMES */}

              <div className="acc-form-section">
                <h3>Online Gaming</h3>

                <div className="acc-game-picker">
                  {ONLINE_GAMES.map((game) => {
                    const selected = editForm.online_games.some(
                      (item) => item.game === game,
                    );

                    return (
                      <button
                        key={game}
                        type="button"
                        className={
                          selected
                            ? "acc-game-option selected"
                            : "acc-game-option"
                        }
                        onClick={() => toggleGame("online", game)}
                      >
                        {game}
                      </button>
                    );
                  })}
                </div>

                {editForm.online_games.map((item) => (
                  <div
                    className="acc-selected-game"
                    key={`online-edit-${item.game}`}
                  >
                    <strong>{item.game}</strong>

                    <select
                      value={item.skill_level}
                      onChange={(event) =>
                        updateGameSkill("online", item.game, event.target.value)
                      }
                    >
                      {SKILL_LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* AVAILABILITY */}

              <div className="acc-form-section">
                <h3>Availability</h3>

                <div className="acc-availability-editor">
                  {DAYS.map((day) => (
                    <div className="acc-day-editor" key={day}>
                      <strong>{day}</strong>

                      <div>
                        {TIME_SLOTS.map((slot) => {
                          const selected =
                            Array.isArray(editForm.availability?.[day]) &&
                            editForm.availability[day].includes(slot);

                          return (
                            <button
                              key={slot}
                              type="button"
                              className={
                                selected
                                  ? "acc-time-option selected"
                                  : "acc-time-option"
                              }
                              onClick={() => toggleAvailability(day, slot)}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TURF */}

              <div className="acc-form-section">
                <div className="acc-turf-toggle">
                  <div>
                    <h3>Play at turf?</h3>

                    <p>
                      Are you willing to play at turf and pay the required fee?
                    </p>
                  </div>

                  <button
                    type="button"
                    className={
                      editForm.willing_to_play_turf
                        ? "acc-switch active"
                        : "acc-switch"
                    }
                    onClick={() =>
                      setEditForm((current) => ({
                        ...current,
                        willing_to_play_turf: !current.willing_to_play_turf,
                      }))
                    }
                    aria-pressed={editForm.willing_to_play_turf}
                  >
                    <span />
                  </button>
                </div>
              </div>

              {saveError && (
                <div className="acc-edit-error" role="alert">
                  {saveError}
                </div>
              )}
            </div>

            <div className="acc-edit-footer">
              <button
                type="button"
                className="acc-edit-cancel"
                onClick={closeEditModal}
                disabled={savingProfile}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="acc-edit-save"
                disabled={savingProfile}
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
