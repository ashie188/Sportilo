import React from "react";

export default function ShareSportiloCard({
  icon = "🚀",
  title,
  description,
  shareTitle = "Sportilo",
  shareText,
  buttonText = "Share Sportilo",
  className = "",
}) {
  const handleShareSportilo = async () => {
    const shareData = {
      title: shareTitle,

      text: shareText,

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
    <div className={`share-sportilo-card ${className}`}>
      <div className="share-sportilo-content">
        <div className="share-sportilo-icon">{icon}</div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <button className="share-sportilo-btn" onClick={handleShareSportilo}>
        {buttonText}
      </button>
    </div>
  );
}
