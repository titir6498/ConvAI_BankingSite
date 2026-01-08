// Signup.js
import React from "react";
import { Link } from "react-router-dom";

function Signup() {
  return (
    <section className="auth-page">
      <h2>Sign Up</h2>
      <form className="auth-form">
        <label>
          Name:
          <input type="text" placeholder="Enter your name" />
        </label>
        <label>
          Email:
          <input type="email" placeholder="Enter your email" />
        </label>
        <label>
          Password:
          <input type="password" placeholder="Create a password" />
        </label>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </section>
  );
}

export default Signup;