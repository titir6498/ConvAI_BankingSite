// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import ChatWidget from "./ChatWidget";
import Home from "./Home";
import Contact from "./Contact";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Bar */}
        <header className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <div className="bank-logo">🏦</div>
              <h1>SecureBank</h1>
              <span className="tagline">Trusted Banking Since 1950</span>
            </div>
            {/*<div className="main-nav">*/}
              <nav className="main-nav">
                <Link to="/" className="nav-link active">Home</Link>
                <Link to="/products" className="nav-link">Products & Services</Link>
                <Link to="/about" className="nav-link">About Us</Link>
                <Link to="/login" className="login-btn">Login</Link>
              </nav>
            {/*</div>*/}
          </div>
        </header>

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

        {/* Features Section */}
        <div className="services-grid">
            <div className="service-card">
            <h3>Secure Banking</h3>
            <p>We prioritize your safety with top-notch security systems.</p>
            </div>
            <div className="service-card">
            <h3>Easy Loans</h3>
            <p>Quick approvals and flexible repayment options.</p>
            </div>
            <div className="service-card">
            <h3>24/7 Support</h3>
            <p>Our customer service team is always here to help.</p>
            </div>
        </div>
        {/* Chat Widget available everywhere */}
        <ChatWidget />

        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Contact Us</h4>
              <p>📞 1-888-SECURE-BANK</p>
              <p>📧 support@securebank.com</p>
              <p>🕒 24/7 Customer Service</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a href="/security">Security Center</a>
              <a href="/rates">Interest Rates</a>
              <a href="/locations">Branch Locator</a>
              <a href="/careers">Careers</a>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/disclosures">Disclosures</a>
              <a href="/compliance">Compliance</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 SecureBank. Member FDIC. Equal Housing Lender. All rights reserved.</p>
            <p className="security-note">🔒 Your security is our priority. We use 256-bit encryption to protect your information.</p>
          </div>
      </footer>
      </div>
    </Router>
  );
}

export default App;