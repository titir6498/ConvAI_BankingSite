// Contact.js
import React from "react";

function Contact() {
  return (
    <section className="contact">
      <h2>Contact Us</h2>
      <p>We’d love to hear from you! Please fill out the form below.</p>
      <form className="contact-form">
        <label>
          Name:
          <input type="text" placeholder="Your Name" />
        </label>
        <label>
          Email:
          <input type="email" placeholder="Your Email" />
        </label>
        <label>
          Message:
          <textarea placeholder="Your Message"></textarea>
        </label>
        <button type="submit">Submit</button>
      </form>
    </section>
  );
}

export default Contact;