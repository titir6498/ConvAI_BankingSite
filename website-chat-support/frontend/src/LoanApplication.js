// LoanApplication.js
import React from "react";

function LoanApplication() {
  return (
    <section className="loan-page">
      <h2>Loan Application</h2>
      <p>Please fill out the form below to apply for a loan.</p>
      <form className="loan-form">
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
          Loan Amount:
          <input type="number" placeholder="Enter desired loan amount" />
        </label>
        <label>
          Loan Type:
          <select>
            <option value="personal">Personal Loan</option>
            <option value="home">Home Loan</option>
            <option value="auto">Auto Loan</option>
            <option value="education">Education Loan</option>
          </select>
        </label>
        <label>
          Message:
          <textarea placeholder="Additional details..."></textarea>
        </label>
        <button type="submit">Submit Application</button>
      </form>
    </section>
  );
}

export default LoanApplication;