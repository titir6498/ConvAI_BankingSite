// Home.js
import React from "react";

function Home() {
  return (
    <section className="hero">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Your Financial Security is Our Priority</h2>
            <p>Experience banking that puts your security first with 24/7 protection and dedicated support.</p>
            <div className="cta-buttons">
              <button className="cta-primary">Open an Account</button>
              <button className="cta-secondary">Apply for Loan</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="banking-card">
              <div className="card-chip">◼</div>
              <div className="card-number">•••• •••• •••• 4567</div>
              <div className="card-info">
                <span>SECUREBANK</span>
                <span>PLATINUM</span>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}

export default Home;