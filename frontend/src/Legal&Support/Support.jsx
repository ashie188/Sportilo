import React from "react";

export default function Support() {
  return (
    <div className="support-page">
      <div className="support-container">
        <h1>Support</h1>

        <p className="support-subtitle">
          Need help, found a bug, or have an idea to improve Sportilo? We'd love
          to hear from you.
        </p>

        <section>
          <h2>Need Help?</h2>

          <p>
            If you're having trouble creating or joining matches, accessing your
            account, or using any feature on Sportilo, feel free to contact us.
            We'll do our best to help you as quickly as possible.
          </p>
        </section>

        <section>
          <h2>Report a Bug</h2>

          <p>
            If you discover something that isn't working as expected, please
            send us a detailed email describing the issue. Including screenshots
            or steps to reproduce the problem helps us resolve it faster.
          </p>
        </section>

        <section>
          <h2>Share Feedback</h2>

          <p>
            Sportilo is built for the community, and your feedback plays an
            important role in shaping future updates. Whether it's a new
            feature, an improvement, or something that didn't feel right, we'd
            genuinely love to hear from you.
          </p>
        </section>

        <section>
          <h2>Response Time</h2>

          <p>
            We aim to respond to every email within
            <strong> 24–48 hours.</strong>
            During busy periods it may take a little longer, but we'll always do
            our best to get back to you.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>

          <div className="support-contact">
            <h3>Email</h3>

            <a href="mailto:support@sportilo.in">support@sportilo.in</a>

            <p>
              For support, bug reports, feature requests or any general
              questions.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
