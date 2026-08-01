import React from "react";
import "./Legal.css";

export default function Legal() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms & Privacy</h1>

        <p className="legal-updated">Last Updated: July 2026</p>

        <section>
          <h2>Welcome</h2>

          <p>
            Welcome to <strong>Sportilo</strong>. Sportilo is a platform that
            allows users to create, discover and join offline sports matches and
            online gaming lobbies.
          </p>

          <p>
            By creating an account or using Sportilo, you agree to the Terms &
            Privacy described on this page.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>

          <p>To provide our services, we may collect:</p>

          <ul>
            <li>Your name and email address.</li>
            <li>Account information.</li>
            <li>Matches or gaming lobbies you create or join.</li>
            <li>
              Basic technical information such as device, browser and IP
              address.
            </li>
          </ul>

          <p>
            We only collect information necessary to operate and improve
            Sportilo.
          </p>
        </section>

        <section>
          <h2>How We Use Your Information</h2>

          <ul>
            <li>Create and manage your account.</li>
            <li>Display your matches and gaming lobbies.</li>
            <li>Allow users to connect with each other.</li>
            <li>Improve platform performance and security.</li>
            <li>Respond to support and feedback requests.</li>
          </ul>
        </section>

        <section>
          <h2>Your Privacy</h2>

          <p>
            We do not sell your personal information. We take reasonable steps
            to protect your data, but no online platform can guarantee complete
            security.
          </p>

          <p>
            You may request the deletion of your account by contacting our
            support email.
          </p>
        </section>

        <section className="legal-disclaimer">
          <h2>Platform Disclaimer</h2>

          <p>
            Sportilo only provides a platform for users to create and discover
            sports matches and gaming lobbies.
          </p>

          <p>
            Match organizers (admins) and participants are fully responsible for
            conducting activities fairly, respectfully and in accordance with
            applicable laws.
          </p>

          <p>
            Sportilo is <strong>not responsible</strong> for any disputes,
            injuries, misconduct, financial transactions, cancellations or any
            events that occur before, during or after activities created by
            users.
          </p>
        </section>

        <section>
          <h2>User Responsibilities</h2>

          <p>By using Sportilo, you agree to:</p>

          <ul>
            <li>Provide accurate information.</li>
            <li>Respect other users.</li>
            <li>Not misuse or attempt to damage the platform.</li>
            <li>Not post illegal, abusive or harmful content.</li>
            <li>Follow all applicable laws while using Sportilo.</li>
          </ul>
        </section>

        <section>
          <h2>Our Rights</h2>

          <p>
            We may update, modify or remove features at any time to improve
            Sportilo.
          </p>

          <p>
            We reserve the right to suspend or remove accounts that violate
            these Terms & Privacy or misuse the platform.
          </p>

          <p>
            Continued use of Sportilo after updates means you accept the revised
            Terms & Privacy.
          </p>
        </section>

        <section>
          <h2>Contact</h2>

          <div className="legal-contact">
            <p>Questions, feedback or privacy concerns?</p>

            <p>sportilo151@gmail.com</p>

            <p>We usually respond within 24–48 hours.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
