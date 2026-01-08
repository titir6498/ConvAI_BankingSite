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
        <header className="navbar">
          <h1 className="logo">MyBank</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/products">Products & Services</Link>
            <Link to="/about">About Us</Link>
            <Link to="/login">Login</Link>
          </nav>
        </header>

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

        {/* Features Section */}
        <div className="features">
            <div className="feature-card">
            <h3>Secure Banking</h3>
            <p>We prioritize your safety with top-notch security systems.</p>
            </div>
            <div className="feature-card">
            <h3>Easy Loans</h3>
            <p>Quick approvals and flexible repayment options.</p>
            </div>
            <div className="feature-card">
            <h3>24/7 Support</h3>
            <p>Our customer service team is always here to help.</p>
            </div>
        </div>
        {/* Chat Widget available everywhere */}
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;