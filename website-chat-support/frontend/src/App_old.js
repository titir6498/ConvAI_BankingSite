// import ChatWidget from "./ChatWidget";
// import "./App.css";

// function App() {
//   return (
//     <div className="App">
//       <h1>Company Website</h1>
//       <p>Welcome to our website.</p>
//       <ChatWidget />
//     </div>
//   );
// }

// export default App;

// App.js
import React from "react";
import "./App.css";
import ChatWidget from "./ChatWidget";

function App() {
  return (
    <div className="App">
      {/* Navigation Bar */}
      <header className="navbar">
        <h1 className="logo">MyBank</h1>
        <nav>
          <a href="#">Home</a>
          <a href="#">Accounts</a>
          <a href="#">Loans</a>
          <a href="#">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <h2>Welcome to MyBank</h2>
        <p>Your trusted partner in financial growth.</p>
        <button className="cta-btn">Open an Account</button>
      </section>

      {/* Features Section */}
      <section className="features">
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
      </section>

      {/* Chat Widget */}
      <ChatWidget />
    </div>
  );
}

export default App;