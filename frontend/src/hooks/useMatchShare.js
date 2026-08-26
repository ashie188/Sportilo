import { useCallback } from "react";

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export default function useMatchShare() {
  const buildShareText = useCallback((match, isGamingMatch) => {
    const isFull = match.current_players >= match.max_players;
    const iscompleted = match.status === "completed";
    const slotsLeft = match.max_players - match.current_players;

    if (iscompleted) {
      return isGamingMatch
        ? `This ${match.game} lobby just wrapped up 🎮 Find your own squad on Sportilo before the next one fills up.`
        : `This ${match.sport} match just wrapped up 🏆 Find your own game on Sportilo before the next one fills up.`;
    }

    if (isFull || slotsLeft <= 0) {
      return isGamingMatch
        ? `This ${match.game} lobby is already full 🔥 That's how fast squads fill up on Sportilo — find an open one before it happens again.`
        : `This ${match.sport} match is already full 🔥 That's how fast matches fill up on Sportilo — find an open one before it happens again.`;
    }

    const isUrgent = slotsLeft <= 2;

    if (isGamingMatch) {
      return isUrgent
        ? `🔥 Only ${slotsLeft} slot${slotsLeft === 1 ? "" : "s"} left for ${match.game}! Squad's almost full — grab your spot now.`
        : `🎮 Players wanted for ${match.game} on ${match.platform}. Squad up in seconds on Sportilo.`;
    }

    return isUrgent
      ? `⚡ Only ${slotsLeft} spot${slotsLeft === 1 ? "" : "s"} left for ${match.sport} at ${match.location}! Don't miss this one.`
      : `⚽ ${match.sport} match at ${match.location} — players wanted. Lock in your spot on Sportilo.`;
  }, []);

  const buildFullShareMessage = useCallback(
    (match, isGamingMatch, matchUrl) => {
      const hook = buildShareText(match, isGamingMatch);
      return `${hook}\n\n👉 Join here:\n${matchUrl}`;
    },
    [buildShareText],
  );

  const generateShareCard = useCallback((match, isGamingMatch) => {
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

      const title = isGamingMatch ? match.game : match.sport;
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 40px Arial, sans-serif";
      ctx.fillText(title, 32, 150);

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "500 18px Arial, sans-serif";
      ctx.fillText(
        isGamingMatch ? `🕹 ${match.platform}` : `📍 ${match.location}`,
        32,
        182,
      );

      const isFull = match.current_players >= match.max_players;
      const iscompleted = match.status === "completed";
      const slotsLeft = match.max_players - match.current_players;
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
  }, []);

  /**
   * match: the match/lobby object (needs sport/game, location/platform,
   *        current_players, max_players, status, id)
   * matchType: "offline" | "gaming"
   */
  const shareMatch = useCallback(
    async (match, matchType) => {
      if (!match?.id) {
       console.error("shareMatch called without a valid match object");
       return;
     }
      const isGamingMatch = matchType === "gaming";
      const matchUrl = `${window.location.origin}/match/${matchType}/${match.id}`;
      const title = isGamingMatch
        ? `${match.game} Lobby`
        : `${match.sport} Match`;
      const fullMessage = buildFullShareMessage(match, isGamingMatch, matchUrl);

      try {
        const blob = await generateShareCard(match, isGamingMatch);
        const file = new File([blob], "sportilo-match.jpg", {
          type: "image/jpeg",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title, text: fullMessage, files: [file] });
          return;
        }

        if (navigator.share) {
          await navigator.share({
            title,
            text: buildShareText(match, isGamingMatch),
            url: matchUrl,
          });
          return;
        }

        await navigator.clipboard.writeText(fullMessage);
        alert("Match link copied to clipboard!");
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("shareMatch failed:", err);
        }
      }
    },
    [buildShareText, buildFullShareMessage, generateShareCard],
  );

  return { shareMatch };
}
