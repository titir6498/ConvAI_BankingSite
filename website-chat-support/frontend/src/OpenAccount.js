// OpenAccount.js
import React from "react";

function OpenAccount() {
  return (
    <section className="account-page">
      <h2>Open an Account</h2>
      <p>Please fill out the form below to open a new account with SecureBank.</p>
      <form className="account-form">
        <label>
          Full Name:
          <input type="text" placeholder="Enter your full name" />
        </label>
        <label>
          Email:
          <input type="email" placeholder="Enter your email" />
        </label>
        <label>
          Phone Number:
          <input type="tel" placeholder="Enter your phone number" />
        </label>
        <label>
          Account Type:
          <select>
            <option value="savings">Savings Account</option>
            <option value="checking">Checking Account</option>
            <option value="business">Business Account</option>
          </select>
        </label>
        <label>
          Initial Deposit:
          <input type="number" placeholder="Enter initial deposit amount" />
        </label>
        <button type="submit">Submit Application</button>
      </form>
    </section>
  );
}

export default OpenAccount;