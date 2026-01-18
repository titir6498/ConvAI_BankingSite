// Login.js
import React from "react";
import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="auth-page">
      <h2>Login</h2>
      <form className="auth-form">
        <label>
          Email:
          <input type="email" placeholder="Enter your email" />
        </label>
        <label>
          Password:
          <input type="password" placeholder="Enter your password" />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Sign up here</Link>
      </p>
      <p>
        <Link to="/forgotpassword">Forgot your password?</Link>
      </p>
    </section>
  );
}

export default Login;