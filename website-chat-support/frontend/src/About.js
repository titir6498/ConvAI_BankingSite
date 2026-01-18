// About.js
import React from "react";

function About() {
  return (
    <section className="about-page">
      <h2>About Us</h2>
      <p>
        At <strong>SecureBank</strong>, we believe in building lasting relationships
        with our customers by offering secure, innovative, and customer‑centric
        financial solutions.
      </p>

      <div className="about-section">
        <h3>Our Mission</h3>
        <p>
          To empower individuals and businesses with accessible banking services
          that foster financial growth and stability.
        </p>
      </div>

      <div className="about-section">
        <h3>Our Values</h3>
        <ul>
          <li>Integrity – We uphold the highest standards of honesty.</li>
          <li>Innovation – We embrace technology to serve you better.</li>
          <li>Customer Focus – Your needs are at the heart of everything we do.</li>
          <li>Trust – We safeguard your financial future with care.</li>
        </ul>
      </div>

      <div className="about-section">
        <h3>Our History</h3>
        <p>
          Founded in 1990, SecureBank has grown from a small community bank into a
          trusted national institution serving millions of customers worldwide.
        </p>
      </div>

      <div className="about-section">
        <h3>Why Choose Us?</h3>
        <p>
          With 24/7 customer support, secure digital banking, and a wide range
          of products, SecureBank is your reliable partner in every financial journey.
        </p>
      </div>
    </section>
  );
}

export default About;